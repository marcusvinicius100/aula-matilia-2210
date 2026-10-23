"""
Base de Conhecimento Especializada sobre a Estância Turística de Tupã (SP)
e Região da Alta Paulista, integrada com notícias em tempo real do TupãCity.
"""

import os
import json
import re

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "tupa_news.json")

def parse_date_key(item):
    """Auxiliar para ordenar matérias pela data mais recente."""
    d_str = item.get("date", "")
    try:
        from datetime import datetime
        return datetime.strptime(d_str, "%d/%m/%Y")
    except Exception:
        from datetime import datetime
        return datetime.min

def load_tupacity_news():
    """Carrega as notícias raspadas do TupãCity ordenadas por data decrescente."""
    if os.path.exists(DATA_PATH):
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                news = json.load(f)
                news.sort(key=parse_date_key, reverse=True)
                return news
        except Exception as e:
            print(f"[Aviso] Falha ao carregar tupa_news.json: {e}")
    return []

# Base de notícias atual
NEWS_CACHE = load_tupacity_news()

def reload_news():
    global NEWS_CACHE
    NEWS_CACHE = load_tupacity_news()
    return len(NEWS_CACHE)

def get_recent_news_context(limit=10):
    """Gera resumo das notícias recentes para alimentar o prompt do modelo."""
    news = load_tupacity_news()
    if not news:
        return "Nenhuma notícia recente arquivada no momento."
    
    lines = []
    for item in news[:limit]:
        title = item.get("title", "")
        date = item.get("date", "")
        summary = item.get("summary", "")
        url = item.get("url", "")
        lines.append(f"- [{date}] **{title}**\n  Resumo: {summary}\n  Fonte: {url}")
    return "\n\n".join(lines)


TUPA_BASE_PROMPT = """Você é o "TupãBot", um modelo de linguagem e assistente de IA altamente especializado na Estância Turística de Tupã (Estado de São Paulo) e na região da Alta Paulista.

Você possui conhecimento enciclopédico sobre a história, educação (como a FADAP e UNESP), cultura, pontos turísticos (Museu Índia Vanuíre, Varpa, Solar Luiz de Souza Leão), economia do amendoim e tradições da cidade.

Além disso, você tem acesso às NOTÍCIAS E ACONTECIMENTOS RECENTES do portal TupãCity (https://tupacity.com/). Sempre que o usuário perguntar sobre fatos recentes, notícias, previsão do tempo, obras, eventos ou cotidiano da cidade, utilize os dados do TupãCity e cite as datas e os links das matérias quando relevante.

Seu tom é cordial, informativo, confiável e prestativo."""


def build_system_prompt():
    """Monta o prompt de sistema completo combinando conhecimento histórico com o feed do TupãCity."""
    news_context = get_recent_news_context(limit=12)
    return f"""{TUPA_BASE_PROMPT}

---
### 📰 NOTÍCIAS RECENTES DO PORTAL TUPÃCITY (Feed ao Vivo):
{news_context}
---
"""

# Base local de respostas inteligentes
LOCAL_KNOWLEDGE = [
    {
        "keywords": ["fundad", "historia", "origem", "fundador", "souza leao", "criacao", "ano", "aniversario", "1929"],
        "title": "História e Fundação de Tupã",
        "answer": """**História e Fundação da Estância Turística de Tupã (SP):**

🏛️ **Fundação:** Tupã foi fundada em **12 de outubro de 1929** pelo pioneiro **Luiz de Souza Leão**, no espigão divisor das bacias dos rios Peixe e Feio (Aguapeí).
⚡ **Origem do Nome:** Homenageia o deus do trovão da mitologia tupi-guarani (**Tupã**), demonstrando respeito às raízes e povos originários.
🛤️ **Desenvolvimento:** A cidade cresceu velozmente impulsionada pela expansão cafeeira e pela chegada da **Companhia Paulista de Estradas de Ferro** em 1941.
📜 **Emancipação:** Tornou-se município autônomo em **1938** e hoje ostenta o título de **Estância Turística** do Estado de São Paulo."""
    },
    {
        "keywords": ["fadap", "fap", "faculdade da alta paulista", "direito fadap", "curso", "vestibular"],
        "title": "FADAP / FAP (Faculdade da Alta Paulista)",
        "answer": """🎓 **FADAP / FAP - Faculdades da Alta Paulista:**

A **FADAP/FAP** é uma das mais tradicionais e renomadas instituições de ensino superior de Tupã e da Alta Paulista!

- **Campus Moderno:** Infraestrutura completa com bibliotecas, clínicas-escola, laboratórios especializados e corpo docente experiente.
- **Cursos de Destaque:** 
  - Direito (tradição regional na formação jurídica)
  - Psicologia
  - Administração e Negócios
  - Engenharias e Arquitetura
  - Pedagogia e Ciências Humanas
- **Compromisso Social:** Forte integração com a comunidade local por meio de assistência jurídica e projetos sociais."""
    },
    {
        "keywords": ["unesp", "universidade estadual", "campus tupa", "biossistemas"],
        "title": "UNESP - Câmpus de Tupã",
        "answer": """🏛️ **UNESP - Universidade Estadual Paulista (Câmpus Experimental de Tupã):**

Instalada em 2003, a unidade da UNESP em Tupã é um polo público e gratuito de excelência:
- **Graduações Oferecidas:**
  - **Engenharia de Biossistemas** (pioneira no país, integrando tecnologia, sustentabilidade e agronegócio)
  - **Administração** (ênfase em Gestão Agroindustrial)
- **Pós-Graduação e Pesquisa:** Programas de mestrado e pesquisas aplicadas ao desenvolvimento da Alta Paulista."""
    },
    {
        "keywords": ["turismo", "visitar", "pontos turisticos", "o que fazer", "passeio", "turistico", "museu", "vanuire"],
        "title": "Pontos Turísticos e Atrações de Tupã",
        "answer": """🌴 **Principais Atrações Turísticas de Tupã:**

1. 🏺 **Museu Histórico e Pedagógico Índia Vanuíre:**
   Referência nacional em etnografia indígena, conta com um rico acervo das culturas Kaingang, Krenak e outras etnias brasileiras.
2. 🏡 **Solar Luiz de Souza Leão:**
   A residência histórica do fundador, tombada pelo Condephaat, preservada em bosque arborizado.
3. ⛪ **Igreja Matriz de São Pedro:**
   Arquitetura imponente, belos vitrais artísticos e pinturas sacras.
4. ⛲ **Praça da Bandeira:**
   Ponto de encontro da cidade com fonte luminosa, concha acústica e feiras de artesanato e gastronomia.
5. 🌾 **Distrito de Varpa:**
   Famoso pela colonização de imigrantes da Letônia, culinária típica letã e o Museu Janis Erdbergs."""
    },
    {
        "keywords": ["varpa", "letao", "letonia", "erdbergs", "distrito"],
        "title": "Distrito de Varpa (Herança Letã)",
        "answer": """🇱🇻 **Varpa - O Rincão Letão de Tupã:**

Localizado a cerca de 30 km do centro de Tupã:
- **Origem:** Fundado na década de 1920 por imigrantes batistas da **Letônia**.
- **Cultura e Gastronomia:** Famoso pelas tortas, queijos, pães artesanais e pela arquitetura singular de madeira.
- **Museu dos Pioneiros (Janis Erdbergs):** Preserva fotos, ferramentas e histórias da imigração letã."""
    },
    {
        "keywords": ["amendoim", "economia", "industria", "agricultura", "avicultura", "exapit"],
        "title": "Economia e Tradições Agropecuárias",
        "answer": """🥜 **Economia & Vocação Produtiva de Tupã:**

- 🥜 **Capital do Amendoim:** Líder no processamento, produção e exportação de amendoim no Brasil.
- 🐔 **Avicultura:** Forte ligação com o polo avícola da Alta Paulista.
- 🎡 **EXAPIT:** Exposição Agropecuária e Industrial de Tupã, reunindo leilões, feira comercial e grandes shows."""
    }
]


def search_news_database(query: str, max_results=3):
    """Busca matérias relevantes no acervo de notícias do TupãCity."""
    news = load_tupacity_news()
    if not news:
        return []
        
    q_words = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
    if not q_words:
        return []
        
    scored = []
    for item in news:
        title = item.get("title", "").lower()
        content = item.get("content", "").lower()
        score = 0
        for w in q_words:
            if w in title:
                score += 5
            elif w in content:
                score += 1
        if score > 0:
            scored.append((score, item))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item for _, item in scored[:max_results]]


def find_local_answer(user_message: str) -> str:
    """
    Busca resposta inteligente integrando o acervo do TupãCity com o conhecimento local.
    """
    query = user_message.lower()
    
    # Se o usuário perguntou sobre notícias ou acontecimentos recentes
    if any(k in query for k in ["noticia", "notícia", "noticias", "acontec", "tupacity", "hoje", "recente", "ultim", "últim"]):
        news = load_tupacity_news()
        if news:
            matched = search_news_database(query, max_results=3)
            # Se não achou busca específica, pega as 4 mais recentes
            selected = matched if matched else news[:4]
            
            output = ["📰 **Últimas Notícias de Tupã e Região (Fonte: TupãCity):**\n"]
            for item in selected:
                title = item.get("title")
                date = item.get("date")
                summary = item.get("summary")
                url = item.get("url")
                output.append(f"🔹 **{title}** ({date})\n{summary}\n🔗 [Ler matéria completa no TupãCity]({url})\n")
                
            output.append("💡 *Você pode me perguntar detalhes sobre qualquer uma dessas matérias!*")
            return "\n".join(output)

    # Verifica se há notícias específicas sobre o assunto perguntado (ex: "drone", "produtores rurais", "outubro rosa", "alok")
    matched_news = search_news_database(query, max_results=2)
    if matched_news:
        item = matched_news[0]
        return (
            f"📰 **Notícia encontrada no TupãCity:**\n\n"
            f"### {item.get('title')}\n"
            f"📅 *Publicado em: {item.get('date')}*\n\n"
            f"{item.get('content')[:900]}...\n\n"
            f"🔗 [Confira a matéria completa no TupãCity]({item.get('url')})"
        )

    # Busca nas categorias históricas/turísticas locais
    best_match = None
    max_score = 0
    for item in LOCAL_KNOWLEDGE:
        score = 0
        for kw in item["keywords"]:
            if kw in query:
                score += len(kw)
        if score > max_score:
            max_score = score
            best_match = item
            
    if best_match and max_score >= 3:
        return best_match["answer"]
        
    # Cumprimentos
    if any(greet in query for greet in ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "tudo bem"]):
        news = load_tupacity_news()
        news_count = len(news)
        return (
            f"Olá! Seja muito bem-vindo ao **TupãBot**! ☀️\n\n"
            f"Eu sou um assistente especializado na **Estância Turística de Tupã (SP)** e região, "
            f"agora integrado com a cobertura de notícias do portal **TupãCity** ({news_count} matérias catalogadas)!\n\n"
            "Você pode me perguntar sobre:\n"
            "- 📰 **Últimas notícias e eventos** em Tupã hoje\n"
            "- 🏛️ **História da fundação** e o desbravador Luiz de Souza Leão\n"
            "- 🎓 Faculdades locais: **FADAP / FAP** e **UNESP**\n"
            "- 🏺 Turismo: **Museu Índia Vanuíre**, **Solar** e o Distrito de **Varpa**\n"
            "- 🥜 A economia do amendoim e a tradicional **EXAPIT**\n\n"
            "Qual assunto você gostaria de explorar?"
        )
        
    # Resposta genérica com sugestões
    return (
        f"Sobre a sua pergunta \"{user_message}\":\n\n"
        "Posso fornecer informações históricas sobre **Tupã (SP)**, detalhes da faculdade **FADAP**, "
        "turismo, cultura indígena, ou buscar os fatos e acontecimentos mais recentes noticiados no **TupãCity**.\n\n"
        "💡 Experimente perguntar: *\"Quais as últimas notícias de Tupã?\"* ou *\"Fale sobre os produtores rurais de Tupã\"*."
    )
