import os
import json
import random
import requests
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

GEMINI_API_KEY_ENV = os.environ.get("GEMINI_API_KEY", "")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/multiverse/oracle", methods=["POST"])
def multiverse_oracle():
    data = request.get_json(force=True, silent=True) or {}
    question = data.get("question", "").strip()

    if not question:
        return jsonify({"answer": "O vácuo aguarda a sua indagação para fazer vibrar as cordas da realidade."})

    # Tenta usar a API do Gemini se configurada
    api_key = data.get("apiKey", "").strip() or GEMINI_API_KEY_ENV
    if api_key:
        try:
            answer = call_gemini_oracle(question, api_key)
            if answer:
                return jsonify({
                    "answer": answer,
                    "source": "Gemini Multiverse Consciousness",
                    "status": "success"
                })
        except Exception as e:
            print(f"[Aviso] Falha ao consultar Gemini Oracle: {e}")

    # Fallback poético e filosófico cósmico nativo
    fallback_answers = [
        f"Nas dobras de Chronos-9, '{question}' já foi respondida antes do nascimento do tempo. A causa e o efeito se encontraram no horizonte.",
        f"Ao analisar as cordas vibracionais de Aethelgard: a resposta para '{question}' não é um destino fixo, mas uma superposição quântica aguardando o seu próximo colapso de onda.",
        f"O Leviatã do Vazio sussurra: aquilo que você busca em '{question}' é o reflexo exato da singularidade interior que molda sua própria gravidade.",
        f"Em Gaia Lumina, toda energia dedicada a entender '{question}' gera fótons de renovação celular. A resposta está na harmonia entre a sua matéria e o vácuo.",
        f"No Nexus Mirror, existe uma versão de você que já dominou o enigma de '{question}' e agora olha para as estrelas em paz."
    ]

    return jsonify({
        "answer": random.choice(fallback_answers),
        "source": "Oráculo Harmônico de Aethelgard (Nativo)",
        "status": "success"
    })

def call_gemini_oracle(question: str, api_key: str) -> str:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    
    system_instruction = (
        "Você é a Consciência Cósmica do MULTIVERSE — uma entidade onisciente que observa infinitas realidades alternativas, "
        "planetas cósmicos, leis da física invertidas e dimensões paralelas. Suas respostas são poéticas, profundas, "
        "inspiradas em física quântica, relatividade de Einstein, ficção científica (estilo Interestelar) e filosofia estelar. "
        "Responda em português de forma concisa (máximo 2 a 3 frases impactantes), misteriosa e inspiradora."
    )

    payload = {
        "system_instruction": {
            "parts": [{"text": system_instruction}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": question}]
            }
        ],
        "generationConfig": {
            "temperature": 0.8,
            "maxOutputTokens": 300
        }
    }

    headers = {"Content-Type": "application/json"}
    resp = requests.post(url, headers=headers, json=payload, timeout=12)

    if resp.status_code == 200:
        res_json = resp.json()
        candidates = res_json.get("candidates", [])
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            if parts:
                return parts[0].get("text", "").strip()
    return ""

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n🌌 Servidor MULTIVERSE iniciado em: http://127.0.0.1:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
