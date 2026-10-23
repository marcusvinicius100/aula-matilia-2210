document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const messagesContainer = document.getElementById("messagesContainer");
  const typingIndicator = document.getElementById("typingIndicator");
  const newChatBtn = document.getElementById("newChatBtn");
  const currentEngineBadge = document.getElementById("currentEngineBadge");
  const sourcesSummary = document.getElementById("sourcesSummary");
  const syncAllBtn = document.getElementById("syncAllBtn");
  
  // Modal elements
  const configModal = document.getElementById("configModal");
  const openConfigBtn = document.getElementById("openConfigBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const saveConfigBtn = document.getElementById("saveConfigBtn");
  const apiKeyInput = document.getElementById("apiKeyInput");

  // Mobile drawer
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const sidebar = document.querySelector(".sidebar");

  let chatHistory = [];
  let savedApiKey = localStorage.getItem("tupa_gemini_api_key") || "";

  if (savedApiKey) {
    apiKeyInput.value = savedApiKey;
    currentEngineBadge.textContent = "Gemini 2.5 Flash + Multi-Fontes";
  }

  // Carrega status de todas as fontes
  async function loadSourcesStatus() {
    try {
      const resp = await fetch("/api/info");
      const data = await resp.json();
      if (sourcesSummary && data.sources) {
        sourcesSummary.innerHTML = `
          <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.78rem; line-height: 1.6; color: #cbd5e1;">
            <li>🏛️ <strong>Prefeitura:</strong> ${data.sources.prefeitura_news} matérias/editais</li>
            <li>🎓 <strong>UNIFADAP:</strong> ${data.sources.unifadap_courses} cursos de graduação</li>
            <li>📊 <strong>IBGE:</strong> ${Number(data.sources.ibge_population).toLocaleString("pt-BR")} habitantes</li>
            <li>📰 <strong>TupãCity:</strong> ${data.sources.tupacity_news} notícias ativas</li>
          </ul>
        `;
      }
    } catch (e) {
      if (sourcesSummary) sourcesSummary.textContent = "Fontes ativas no servidor.";
    }
  }
  loadSourcesStatus();

  // Botão de sincronizar tudo
  if (syncAllBtn) {
    syncAllBtn.addEventListener("click", async () => {
      syncAllBtn.disabled = true;
      syncAllBtn.textContent = "⏳ Raspando Prefeitura, FADAP e IBGE...";
      try {
        const resp = await fetch("/api/sync-all", { method: "POST" });
        const resData = await resp.json();
        alert(resData.message || "Bases sincronizadas com sucesso!");
        loadSourcesStatus();
      } catch (err) {
        alert("Erro ao acionar a sincronização múltipla.");
      } finally {
        syncAllBtn.disabled = false;
        syncAllBtn.textContent = "🔄 Sincronizar Todas as Fontes";
      }
    });
  }

  // Ajusta altura do textarea
  userInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  openConfigBtn.addEventListener("click", () => {
    configModal.style.display = "flex";
  });

  closeModalBtn.addEventListener("click", () => {
    configModal.style.display = "none";
  });

  saveConfigBtn.addEventListener("click", () => {
    savedApiKey = apiKeyInput.value.trim();
    if (savedApiKey) {
      localStorage.setItem("tupa_gemini_api_key", savedApiKey);
      currentEngineBadge.textContent = "Gemini 2.5 Flash + Multi-Fontes";
      alert("Chave salva com sucesso!");
    } else {
      localStorage.removeItem("tupa_gemini_api_key");
      currentEngineBadge.textContent = "Prefeitura • UNIFADAP • IBGE • TupãCity";
      alert("Chave removida. Usando a base multi-fontes interna.");
    }
    configModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === configModal) {
      configModal.style.display = "none";
    }
  });

  function bindTopicChips() {
    document.querySelectorAll("[data-prompt]").forEach((el) => {
      el.onclick = () => {
        const prompt = el.getAttribute("data-prompt");
        if (sidebar.classList.contains("open")) {
          sidebar.classList.remove("open");
        }
        sendMessage(prompt);
      };
    });
  }
  bindTopicChips();

  newChatBtn.addEventListener("click", () => {
    chatHistory = [];
    messagesContainer.innerHTML = `
      <div class="welcome-banner">
        <div class="welcome-icon">⚡</div>
        <h2>TupãBot Especialista</h2>
        <p>Seu assistente virtual abastecido com raspagem completa da <strong>Prefeitura de Tupã</strong>, <strong>UNIFADAP</strong>, dados oficiais do <strong>IBGE</strong> e notícias do <strong>TupãCity</strong>.</p>
        <div class="suggestions-grid">
          <button class="suggestion-chip" data-prompt="Quais são os cursos e diferenciais da UNIFADAP em Tupã?">
            <span>🎓 Cursos e Vestibular UNIFADAP</span>
          </button>
          <button class="suggestion-chip" data-prompt="Qual a população atualizada e o IDH de Tupã no IBGE?">
            <span>📊 População & Indicadores do IBGE</span>
          </button>
          <button class="suggestion-chip" data-prompt="Quais as vagas de emprego do PAT divulgadas pela Prefeitura?">
            <span>💼 Vagas de Emprego da Prefeitura</span>
          </button>
          <button class="suggestion-chip" data-prompt="Quais são as principais notícias de hoje no portal TupãCity?">
            <span>📰 Notícias Recentes do TupãCity</span>
          </button>
        </div>
      </div>
    `;
    bindTopicChips();
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    sendMessage(text);
    userInput.value = "";
    userInput.style.height = "auto";
  });

  async function sendMessage(text) {
    const banner = document.querySelector(".welcome-banner");
    if (banner) {
      banner.remove();
    }

    appendMessage("user", text);
    chatHistory.push({ role: "user", content: text });

    typingIndicator.style.display = "flex";
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          apiKey: savedApiKey,
          history: chatHistory
        })
      });

      const data = await response.json();
      typingIndicator.style.display = "none";

      if (data.response) {
        appendMessage("bot", data.response, data.engine);
        chatHistory.push({ role: "model", content: data.response });
      } else {
        appendMessage("bot", "Desculpe, ocorreu um erro ao gerar a resposta. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      typingIndicator.style.display = "none";
      appendMessage("bot", "⚠️ Erro de conexão com o servidor do chatbot.");
    }
  }

  function appendMessage(sender, text, engineLabel = "") {
    const row = document.createElement("div");
    row.classList.add("message-row", sender);

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.textContent = sender === "user" ? "👤" : "⚡";

    const bubble = document.createElement("div");
    bubble.classList.add("message-bubble");

    if (sender === "bot") {
      if (window.marked && typeof marked.parse === "function") {
        bubble.innerHTML = marked.parse(text);
      } else {
        bubble.textContent = text;
      }

      if (engineLabel) {
        const meta = document.createElement("div");
        meta.style.fontSize = "0.72rem";
        meta.style.color = "#94a3b8";
        meta.style.marginTop = "8px";
        meta.textContent = `Origem: ${engineLabel}`;
        bubble.appendChild(meta);
      }
    } else {
      bubble.textContent = text;
    }

    row.appendChild(avatar);
    row.appendChild(bubble);
    messagesContainer.appendChild(row);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
});
