# ⚡ TupãBot 2.0 - Chatbot Multi-Fontes Especialista em Tupã (SP)

Aplicação web completa com modelo de linguagem inteligente e base de conhecimento multi-fontes integrada, cobrindo história, indicadores demográficos, ensino superior e notícias da **Estância Turística de Tupã (SP)** e da **Alta Paulista**.

---

## 🌐 Repositório Oficial no GitHub
- **URL:** [https://github.com/marcusvinicius100/aula-matilia-2210](https://github.com/marcusvinicius100/aula-matilia-2210)
- **Branch:** `main`

---

## 📡 Bases de Conhecimento e Portais Raspados

O TupãBot opera com 4 bases oficiais de conhecimento consolidadas:

| Fonte | Tipo de Dado | Arquivo de Dados |
| :--- | :--- | :--- |
| **Prefeitura de Tupã** (`tupa.sp.gov.br`) | Vagas do PAT, obras municipais, comunicados e editais | `data/prefeitura_data.json` |
| **UNIFADAP** (`unifadap.edu.br`) | 11 cursos de graduação, bolsas, vestibular, infraestrutura | `data/unifadap_data.json` |
| **IBGE Oficial** (`ibge.gov.br` / API 3555000) | População (65.447 hab.), IDHM (0,776), PIB per capita, área | `data/ibge_tupa.json` |
| **TupãCity** (`tupacity.com`) | 31 reportagens recentes completas com datas e links originais | `data/tupa_news.json` |

---

## 🌟 Funcionalidades do Sistema

- **Arquitetura Híbrida (Dual Engine):**
  - **Motor Nativo (Offline):** Responde instantaneamente sobre todas as 4 bases mesmo sem conexão externa ou custos de API.
  - **Motor IA Generativa (Google Gemini):** Conecta ao modelo Gemini 2.5 Flash, alimentado via prompt de sistema com os dados das 4 fontes.
- **Interface Conversacional Moderna:** Design no estilo ChatGPT/Claude com cards de sugestões rápidas, histórico e suporte para desktop e mobile.
- **Sincronização em 1 Clique:** Botão na barra lateral para atualizar a raspagem de notícias e bases oficiais diretamente pelo navegador (`/api/sync-all`).

---

## 🚀 Como Executar o Projeto

### 1. Clonar ou Acessar a Pasta
```powershell
git clone https://github.com/marcusvinicius100/aula-matilia-2210.git
cd "aula matilia,2210"
```

### 2. Instalar Dependências
```powershell
python -m pip install -r requirements.txt
```

### 3. Iniciar o Servidor Web
```powershell
python app.py
```

### 4. Acessar no Navegador
Abra: 👉 **http://127.0.0.1:5000**

---

## 📁 Estrutura de Arquivos

```
aula matilia,2210/
├── app.py                 # Servidor Flask com rotas /api/chat, /api/info e /api/sync-all
├── knowledge_tupa.py      # Motor de busca semântica e prompt multi-fontes
├── scraper_multi.py       # Scraper da Prefeitura, UNIFADAP e API do IBGE
├── scraper_tupacity.py    # Scraper do portal de notícias TupãCity
├── requirements.txt       # Dependências (Flask, requests, beautifulsoup4)
├── .gitignore             # Arquivos ignorados pelo git
├── README.md              # Documentação completa
├── data/                  # Bases de conhecimento estruturadas em JSON
│   ├── ibge_tupa.json
│   ├── prefeitura_data.json
│   ├── tupa_news.json
│   └── unifadap_data.json
├── templates/
│   └── index.html         # Interface HTML responsiva
└── static/
    ├── script.js          # Lógica frontend e chamadas assíncronas
    └── style.css          # Estilização visual moderna
```
