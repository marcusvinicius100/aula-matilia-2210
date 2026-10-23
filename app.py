import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from knowledge_tupa import (
    build_system_prompt,
    find_local_answer,
    load_tupacity_news,
    load_prefeitura_news,
    load_unifadap_data,
    load_ibge_data
)
from scraper_multi import scrape_all
from scraper_tupacity import scrape_tupacity

app = Flask(__name__)

GEMINI_API_KEY_ENV = os.environ.get("GEMINI_API_KEY", "")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/info", methods=["GET"])
def info():
    tupacity = load_tupacity_news()
    prefeitura = load_prefeitura_news()
    unifadap = load_unifadap_data()
    ibge = load_ibge_data()

    return jsonify({
        "name": "TupãBot Multi-Fontes",
        "description": "Modelo Especializado em Tupã (SP) integrado com Prefeitura, UNIFADAP, IBGE e TupãCity",
        "version": "2.0.0",
        "has_env_key": bool(GEMINI_API_KEY_ENV),
        "sources": {
            "tupacity_news": len(tupacity),
            "prefeitura_news": len(prefeitura),
            "unifadap_courses": len(unifadap.get("cursos_graduacao", [])),
            "ibge_population": ibge.get("populacao", {}).get("populacao_projetada", 65447)
        }
    })

@app.route("/api/sync-all", methods=["POST"])
def sync_all_sources():
    """Executa a raspagem completa de todas as fontes."""
    try:
        res = scrape_all()
        return jsonify({
            "status": "success",
            "message": "Todas as bases (Prefeitura, UNIFADAP e IBGE) foram atualizadas!",
            "details": res
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    user_message = data.get("message", "").strip()
    user_api_key = data.get("apiKey", "").strip() or GEMINI_API_KEY_ENV
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Mensagem vazia."}), 400

    # Chamada para IA generativa com o super prompt multi-fontes se tiver chave
    if user_api_key:
        try:
            gemini_response = call_gemini(user_message, user_api_key, history)
            if gemini_response:
                return jsonify({
                    "response": gemini_response,
                    "engine": "Gemini 2.5 Flash (Prefeitura + FADAP + IBGE + TupãCity)",
                    "status": "success"
                })
        except Exception as e:
            print(f"[Aviso] Falha ao consultar Gemini: {e}")

    # Fallback / Motor nativo inteligente
    local_reply = find_local_answer(user_message)
    return jsonify({
        "response": local_reply,
        "engine": "Base Multi-Fontes (Nativa Tupã)",
        "status": "success"
    })

def call_gemini(user_message: str, api_key: str, history: list) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    contents = []
    for msg in history[-6:]:
        role = "user" if msg.get("role") == "user" else "model"
        text = msg.get("content", "")
        if text:
            contents.append({
                "role": role,
                "parts": [{"text": text}]
            })
            
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })
    
    system_instruction = build_system_prompt()
    
    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.6,
            "maxOutputTokens": 1400
        }
    }
    
    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json=payload, timeout=20)
    
    if resp.status_code == 200:
        res_json = resp.json()
        candidates = res_json.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "")
    else:
        raise RuntimeError(f"HTTP {resp.status_code}: {resp.text}")
        
    return ""

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n⚡ Servidor TupãBot Multi-Fontes iniciado em: http://127.0.0.1:{port}\n")
    app.run(host="127.0.0.1", port=port, debug=True)
