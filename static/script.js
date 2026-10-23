document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chatForm");
  const userInput = document.getElementById("userInput");
  const messagesContainer = document.getElementById("messagesContainer");
  const typingIndicator = document.getElementById("typingIndicator");
  const newChatBtn = document.getElementById("newChatBtn");
  const currentEngineBadge = document.getElementById("currentEngineBadge");
  const newsStats = document.getElementById("newsStats");
  const syncNewsBtn = document.getElementById("syncNewsBtn");
  
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
    currentEngineBadge.textContent = "Gemini 2.5 Flash + TupãCity";
  }

  // Carrega status das notícias
  async function loadNewsStatus() {
    try {
      const resp = await fetch("/api/info");
      const data = await resp.json();
      if (newsStats) {
        newsStats.innerHTML = `<strong>${data.news_count || 0}</strong> notícias do TupãCity indexadas no conhecimento.`;
      }
    } catch (e) {
      if (newsStats) newsStats.textContent = "Feed do TupãCity ativo.";
    }
  }
  loadNewsStatus();

  // Botão de atualizar notícias do TupãCity
  if (syncNewsBtn) {
    syncNewsBtn.addEventListener("click", async () => {
      syncNewsBtn.disabled = true;
      syncNewsBtn.textContent = "⏳ Raspando TupãCity...";
      try {
        const resp = await fetch("/api/sync-news", { method: "POST" });
        const resData = await resp.json();
        alert(resData.message || "Notícias sincronizadas com sucesso!");
        loadNewsStatus();
      } catch (err) {
        alert("Erro ao conectar com o serviço de raspagem.");
      } finally {
        syncNewsBtn.disabled = false;
        syncNewsBtn.textContent = "🔄 Atualizar Notícias Agora";
      }
    });
  }

  // Ajusta altura do textarea dinamicamente
  userInput.addEventListener("input", function () {
    this.style.height = "auto";
    this.style.height = Math.min(this.scrollHeight, 120) + "px";
  });

  // Enviar com 'Enter' (e quebrar linha com 'Shift+Enter')
  userInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });

  // Mobile menu toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  // Modal open / close
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
      currentEngineBadge.textContent = "Gemini 2.5 Flash + TupãCity";
      alert("Chave salva com sucesso! O modelo agora usará a inteligência do Gemini.");
    } else {
      localStorage.removeItem("tupa_gemini_api_key");
      currentEngineBadge.textContent = "Motor Tupã + Notícias";
      alert("Chave removida. Usando a base local de Tupã + TupãCity.");
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

  // Nova conversa
  newChatBtn.addEventListener("click", () => {
    chatHistory = [];
    messagesContainer.innerHTML = `
      <div class="welcome-banner">
        <div class="welcome-icon">⚡</div>
        <h2>Olá! Eu sou o TupãBot</h2>
        <p>Seu assistente inteligente especializado em <strong>Tupã (SP)</strong>, agora com as notícias mais recentes raspadas do <strong>TupãCity</strong>!</p>
        <div class="suggestions-grid">
          <button class="suggestion-chip" data-prompt="Quais são as últimas notícias de Tupã no TupãCity?">
            <span>📰 Últimas notícias da cidade</span>
          </button>
          <button class="suggestion-chip" data-prompt="Fale sobre a faculdade FADAP em Tupã.">
            <span>🎓 Sobre a FADAP</span>
          </button>
          <button class="suggestion-chip" data-prompt="Quais cursos profissionalizantes estão com inscrições abertas em Tupã?">
            <span>💼 Cursos e capacitação</span>
          </button>
          <button class="suggestion-chip" data-prompt="Quais os principais pontos turísticos de Tupã?">
            <span>🌴 Turismo e Museu Índia Vanuíre</span>
          </button>
        </div>
      </div>
    `;
    bindTopicChips();
  });

  // Submit do formulário de chat
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
