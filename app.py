import os
import json
import requests
from flask import Flask, render_template, request, jsonify
from knowledge_tupa import TUPA_SYSTEM_PROMPT, find_local_answer

app = Flask(__name__)

# Permite configurar via variável de ambiente opcional
GEMINI_API_KEY_ENV = os.environ.get("GEMINI_API_KEY", "")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/info", methods=["GET"])
def info():
    return jsonify({
        "name": "TupãBot",
        "description": "Modelo de Linguagem Especializado em Tupã (SP) e Alta Paulista",
        "version": "1.0.0",
        "has_env_key": bool(GEMINI_API_KEY_ENV)
    })

@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(force=True, silent=True) or {}
    user_message = data.get("message", "").strip()
    user_api_key = data.get("apiKey", "").strip() or GEMINI_API_KEY_ENV
    history = data.get("history", [])

    if not user_message:
        return jsonify({"error": "Mensagem vazia."}), 400

    # Se houver chave Gemini, tenta chamar a IA generativa do Google
    if user_api_key:
        try:
            gemini_response = call_gemini(user_message, user_api_key, history)
            if gemini_response:
                return jsonify({
                    "response": gemini_response,
                    "engine": "Gemini 2.5 Flash (Online)",
                    "status": "success"
                })
        except Exception as e:
            # Em caso de falha de conexão/chave inválida, faz fallback elegante para o motor local
            print(f"[Aviso] Falha ao consultar Gemini: {e}")

    # Fallback ou motor nativo especializado em Tupã
    local_reply = find_local_answer(user_message)
    return jsonify({
        "response": local_reply,
        "engine": "Base de Conhecimento Tupã (Nativa)",
        "status": "success"
    })

def call_gemini(user_message: str, api_key: str, history: list) -> str:
    """Envia requisição para a API do Google Gemini com prompt de sistema de Tupã."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    contents = []
    
    # Adiciona histórico recente (últimas 6 mensagens para manter contexto)
    for msg in history[-6:]:
        role = "user" if msg.get("role") == "user" else "model"
        text = msg.get("content", "")
        if text:
            contents.append({
                "role": role,
                "parts": [{"text": text}]
            })
            
    # Adiciona a mensagem atual
    contents.append({
        "role": "user",
        "parts": [{"text": user_message}]
    })
    
    payload = {
        "system_instruction": {
            "parts": [{"text": TUPA_SYSTEM_PROMPT}]
        },
        "contents": contents,
        "generationConfig": {
            "temperature": 0.7,
            "maxOutputTokens": 1024
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
    print(f"\n⚡ Servidor TupãBot iniciado em: http://127.0.0.1:{port}\n")
    app.run(host="127.0.0.1", port=port, debug=True)
