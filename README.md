# ⚡ TupãBot - Chatbot Especialista na Estância Turística de Tupã (SP)

Aplicação web completa com interface moderna e modelo de linguagem inteligente especializado na história, cultura, turismo, educação e tradições da cidade de **Tupã (SP)** e da região da **Alta Paulista**.

---

## 🌟 Funcionalidades

- **Interface Conversacional Moderna:** Design responsivo no estilo ChatGPT/Claude, com suporte para computadores e celulares.
- **Modelo Híbrido (Dual Engine):**
  - **Modo Nativo Offline:** Base de conhecimento rica e categorizada cobrindo:
    - 🏛️ História e fundação (Luiz de Souza Leão, 1929)
    - 🎓 Ensino Superior e Faculdades (**FADAP / FAP**, UNESP Câmpus de Tupã)
    - 🏺 Museus e Patrimônio (Museu Índia Vanuíre, Solar Luiz de Souza Leão)
    - 🇱🇻 Distrito de Varpa (Herança e cultura dos pioneiros da Letônia)
    - 🥜 Economia & Tradições (Capital do Amendoim, EXAPIT, agropecuária)
    - 🌴 Turismo (Praça da Bandeira, Igreja Matriz São Pedro, cascatas)
  - **Modo Online com IA Generativa (Google Gemini):** Integração direta com o modelo Gemini turbinado pelo prompt de sistema especializado em Tupã.
- **Configurações no Navegador:** Permite inserir ou remover uma chave de API facilmente pela interface sem mexer no código.
- **Markdown Completo:** Respostas com formatação rica (tópicos, negrito, links e destaques).

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Python 3.10 ou superior instalado.

### 2. Instalar dependências
No terminal do projeto, execute:
```powershell
python -m pip install -r requirements.txt
```

### 3. Iniciar o servidor web
Execute o comando:
```powershell
python app.py
```

### 4. Acessar a aplicação
Abra o seu navegador de internet e acesse:
👉 **http://127.0.0.1:5000**

---

## 📁 Estrutura de Arquivos

```
aula matilia,2210/
├── app.py                 # Servidor Flask e rotas da API
├── knowledge_tupa.py      # Base de conhecimento especializada e prompts sobre Tupã
├── requirements.txt       # Dependências Python (Flask, requests)
├── .gitignore             # Arquivos ignorados pelo controle de versão
├── README.md              # Documentação do projeto
├── templates/
│   └── index.html         # Página principal da interface web
└── static/
    ├── style.css          # Estilização moderna e responsiva
    └── script.js          # Lógica frontend e conexão com o chatbot
```

---

## 🌐 Sincronização com o GitHub

Para sincronizar suas alterações com o repositório remoto:

```powershell
git add .
git commit -m "feat: site e chatbot especializado em Tupa"
git push
```
