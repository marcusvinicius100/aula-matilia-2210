import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from knowledge_tupa import build_system_prompt, find_local_answer, load_tupacity_news, reload_news
from scraper_tupacity import scrape_tupacity

app = Flask(__name__)

GEMINI_API_KEY_ENV = os.environ.get("GEMINI_API_KEY", "")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/info", methods=["GET"])
def info():
    news = load_tupacity_news()
    return jsonify({
        "name": "TupãBot",
        "description": "Modelo Especializado em Tupã (SP) e Alta Paulista",
        "version": "1.1.0",
        "has_env_key": bool(GEMINI_API_KEY_ENV),
        "news_count": len(news)
    })

@app.route("/api/news", methods=["GET"])
def get_news():
    """Retorna as notícias mais recentes do TupãCity."""
    news = load_tupacity_news()
    return jsonify({
        "total": len(news),
        "news": news[:12]
    })

@app.route("/api/sync-news", methods=["POST"])
def sync_news():
    """Aciona a raspagem do portal TupãCity para atualizar as notícias."""
    try:
        updated = scrape_tupacity(max_pages=3)
        reload_news()
        return jsonify({
            "status": "success",
            "message": f"Base de notícias atualizada com sucesso! Total: {len(updated)} matérias.",
            "total": len(updated)
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

    # Se houver chave Gemini, tenta chamar a IA generativa com o prompt alimentado pelo TupãCity
    if user_api_key:
        try:
            gemini_response = call_gemini(user_message, user_api_key, history)
            if gemini_response:
                return jsonify({
                    "response": gemini_response,
                    "engine": "Gemini 2.5 Flash + Feed TupãCity (Online)",
                    "status": "success"
                })
        except Exception as e:
            print(f"[Aviso] Falha ao consultar Gemini: {e}")

    # Fallback ou motor nativo inteligente com acervo do TupãCity
    local_reply = find_local_answer(user_message)
    return jsonify({
        "response": local_reply,
        "engine": "Base Nativa Tupã + TupãCity",
        "status": "success"
    })

def call_gemini(user_message: str, api_key: str, history: list) -> str:
    """Envia requisição para a API do Google Gemini com prompt enriquecido pelo TupãCity."""
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
            "maxOutputTokens": 1200
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
    print(f"\n⚡ Servidor TupãBot + TupãCity iniciado em: http://127.0.0.1:{port}\n")
    app.run(host="127.0.0.1", port=port, debug=True)
