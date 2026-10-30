import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "online",
        "app": "OrçaZap Pro",
        "version": "1.0.0"
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"\n⚡ Servidor OrçaZap Pro iniciado em: http://127.0.0.1:{port}\n")
    app.run(host="0.0.0.0", port=port, debug=True)
