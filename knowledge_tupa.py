"""
Base de Conhecimento Especializada sobre a Estância Turística de Tupã (SP)
e Região da Alta Paulista.
"""

TUPA_SYSTEM_PROMPT = """Você é o "TupãBot", um modelo de linguagem e assistente de inteligência artificial altamente especializado na Estância Turística de Tupã (Estado de São Paulo) e na região da Alta Paulista.

Seu tom é cordial, informativo, prestativo e acolhedor (como um típico morador do interior paulista).
Você tem profundo conhecimento sobre:
1. HISTÓRIA:
   - Fundada em 12 de outubro de 1929 por Luiz de Souza Leão.
   - Origem do nome: "Tupã", em homenagem à divindade indígena tupi-guarani (o Deus do Trovão).
   - Emancipação político-administrativa em 1938.
   - Presença indígena marcante: povos Kaingang e Krenak, com a Terra Indígena Vanuíre nos distritos vizinhos (Arco-Íris).
2. EDUCAÇÃO & UNIVERSIDADES:
   - FADAP / FAP (Faculdade da Alta Paulista): tradicional instituição de ensino superior da cidade, oferecendo cursos em Direito, Administração, Psicologia, Engenharia, Pedagogia, entre outros.
   - UNESP (Universidade Estadual Paulista - Câmpus de Tupã): referência em Engenharia de Biossistemas, Administração e pós-graduações.
   - ETEC Prof. Massuyuki Kawano e Fatec Tupã.
3. TURISMO & PONTOS TURÍSTICOS:
   - Museu Histórico e Pedagógico Índia Vanuíre: um dos mais importantes museus etnográficos e indígenas do Brasil, com acervo de dezenas de etnias indígenas e história dos pioneiros.
   - Solar Luiz de Souza Leão: casarão histórico do fundador, patrimônio cultural tombado.
   - Igreja Matriz de São Pedro: com belíssimos vitrais e pinturas sacras.
   - Praça da Bandeira: coração da cidade com sua fonte luminosa, concha acústica e feiras de artesanato e gastronomia.
   - Parque do Atleta e Espigão.
   - Cascatas e turismo rural na região.
4. ECONOMIA & TRADIÇÕES:
   - Tupã é uma das capitais nacionais do amendoim e possui forte vocação agropecuária (avicultura de corte e postura, gado leiteiro e de corte, cana-de-açúcar).
   - Eventos tradicionais: EXAPIT (Exposição Agropecuária e Industrial de Tupã), Feira das Nações, festividades do padroeiro São Pedro (29 de junho) e aniversário da cidade (12 de outubro).
5. GEOGRAFIA:
   - Localizada na Mesorregião de Marília, microrregião de Tupã (Alta Paulista).
   - Distritos: Parnaso, Universo e Varpa (Varpa é famosa por sua colonização letã, gastronomia e museu Janis Erdbergs).
   - Cidades vizinhas: Marília, Bastos (capital do ovo), Quintana, Herculândia, Osvaldo Cruz, Rinópolis, Arco-Íris.

Responda sempre com clareza, em português, usando formatação rica (tópicos, negrito quando apropriado). Se a pergunta for sobre outros temas, responda gentilmente relacionando com a ótica ou analogias de Tupã quando possível.
"""

# Base local de respostas inteligentes para quando o usuário estiver usando o modo offline/local
LOCAL_KNOWLEDGE = [
    {
        "keywords": ["fundad", "historia", "origem", "fundador", "souza leao", "criacao", "ano", "aniversario", "1929"],
        "title": "História e Fundação de Tupã",
        "answer": """**História e Fundação da Estância Turística de Tupã (SP):**

🏛️ **Fundação:** Tupã foi fundada em **12 de outubro de 1929** pelo desbravador **Luiz de Souza Leão**, no espigão divisor das bacias dos rios Peixe e Feio (Aguapeí).
⚡ **Origem do Nome:** O nome homenageia o deus do trovão da mitologia tupi-guarani (**Tupã**), demonstrando respeito às raízes indígenas da terra.
🛤️ **Desenvolvimento:** A cidade cresceu velozmente impulsionada pela expansão cafeeira e pela chegada dos trilhos da **Companhia Paulista de Estradas de Ferro** em 1941.
📜 **Emancipação:** Tornou-se município autônomo em **1938** e hoje ostenta com orgulho o título de **Estância Turística** do Estado de São Paulo."""
    },
    {
        "keywords": ["fadap", "fap", "faculdade da alta paulista", "direito fadap", "curso", "vestibular"],
        "title": "FADAP / FAP (Faculdade da Alta Paulista)",
        "answer": """🎓 **FADAP / FAP - Faculdades da Alta Paulista:**

A **FADAP/FAP** é uma das mais tradicionais e respeitadas instituições de ensino superior privado de Tupã e de toda a Alta Paulista!

- **Campus Moderno:** Infraestrutura completa com laboratórios, bibliotecas especializadas, clínicas-escola e corpo docente qualificado.
- **Cursos de Destaque:** 
  - Direito (tradição regional na formação jurídica)
  - Psicologia
  - Administração e Negócios
  - Engenharias e Arquitetura
  - Pedagogia e Ciências Humanas
- **Compromisso Social:** Forte integração com a comunidade local por meio de assistência jurídica gratuita e projetos de extensão comunitária."""
    },
    {
        "keywords": ["unesp", "universidade estadual", "campus tupa", "biossistemas"],
        "title": "UNESP - Câmpus de Tupã",
        "answer": """🏛️ **UNESP - Universidade Estadual Paulista (Câmpus Experimental de Tupã):**

Instalada em 2003, a unidade da UNESP em Tupã é um polo de excelência pública e gratuita de ensino superior e pesquisa científica:

- **Graduações Oferecidas:**
  - **Engenharia de Biossistemas** (pioneira no país, voltada à sustentabilidade e tecnologia no agronegócio)
  - **Administração** (com forte ênfase em Gestão Agroindustrial)
- **Pós-Graduação e Pesquisa:** Mestrados e grupos de pesquisa que contribuem ativamente com o setor produtivo regional."""
    },
    {
        "keywords": ["turismo", "visitar", "pontos turisticos", "o que fazer", "passeio", "turistico", "museu", "vanuire"],
        "title": "Pontos Turísticos e Atrações de Tupã",
        "answer": """🌴 **Principais Atrações Turísticas de Tupã:**

1. 🏺 **Museu Histórico e Pedagógico Índia Vanuíre:**
   Referência nacional em etnografia indígena, conta com um dos maiores acervos das culturas Kaingang, Krenak e dezenas de etnias brasileiras.
2. 🏡 **Solar Luiz de Souza Leão:**
   A antiga residência do pioneiro fundador, com móveis de época, bosque arborizado e objetos históricos.
3. ⛪ **Igreja Matriz de São Pedro:**
   Destaca-se pela beleza de sua arquitetura neoclássica, seus vitrais artísticos e pinturas sacras.
4. ⛲ **Praça da Bandeira:**
   Ponto de encontro central, com feira de artesanato, fonte luminosa e eventos artísticos na concha acústica.
5. 🌾 **Distrito de Varpa:**
   Famoso pela colonização de imigrantes da Letônia, preservando culinária típica letã, museu Janis Erdbergs e ecoturismo."""
    },
    {
        "keywords": ["varpa", "letao", "letonia", "erdbergs", "distrito"],
        "title": "Distrito de Varpa (Herança Letã)",
        "answer": """🇱🇻 **Varpa - O Rincão Letão de Tupã:**

Localizado a cerca de 30 km do centro de Tupã, o Distrito de Varpa é uma joia histórica e cultural:
- **Origem:** Fundado na década de 1920 por imigrantes batistas vindos da **Letônia**, fugindo dos conflitos no leste europeu.
- **Cultura e Gastronomia:** Famoso pelas tortas, queijos, pães artesanais e pela arquitetura de madeira estilo europeu.
- **Museu dos Pioneiros (Janis Erdbergs):** Preserva fotos, ferramentas, bíblias e memórias da epopeia dos imigrantes letões.
- **Natureza:** Próximo a cachoeiras e balneários naturais."""
    },
    {
        "keywords": ["amendoim", "economia", "industria", "agricultura", "avicultura", "exapit"],
        "title": "Economia e Tradições Agropecuárias",
        "answer": """🥜 **Economia & Vocação Produtiva de Tupã:**

- 🥜 **Capital do Amendoim:** Tupã e sua microrregião são polos líderes no beneficiamento, produção e exportação de amendoim do Brasil.
- 🐔 **Avicultura de Postura e Corte:** Proximidade estratégica com o cinturão avícola da Alta Paulista (junto a Bastos).
- 🎡 **EXAPIT:** A Exposição Agropecuária e Industrial de Tupã é uma das maiores feiras agropecuárias do interior de São Paulo, com rodeios, shows de nível nacional e feiras de negócios.
- 🛍️ **Comércio Forte:** Polo comercial e de serviços para diversas cidades circunvizinhas."""
    },
    {
        "keywords": ["indio", "indigena", "kaingang", "krenak", "aldeia", "arco iris", "reserva"],
        "title": "Herança e Povos Indígenas",
        "answer": """🏹 **Herança Indígena em Tupã:**

A presença e a história dos povos originários são a alma de Tupã:
- **Vanuíre:** Lendária mediadora Kaingang que atuou pela paz na região durante a abertura dos sertões no início do século XX.
- **Terra Indígena Vanuíre:** Localizada nas imediações do município vizinho de Arco-Íris, acolhe famílias das etnias **Kaingang** e **Krenak**, mantendo vivas suas línguas, danças e artesanatos.
- **Museu Índia Vanuíre:** Instituição da Secretaria da Cultura do Estado de SP em Tupã que realiza trabalho modelo de curadoria compartilhada com os próprios indígenas."""
    },
    {
        "keywords": ["onde comer", "restaurante", "gastronomia", "comida", "lanchonete", "bar"],
        "title": "Gastronomia em Tupã",
        "answer": """🍽️ **Gastronomia e Noite em Tupã:**

- **Comida Típica:** Produtos derivados de amendoim (doces artesanais, paçocas gourmet) e culinária caipira tradicional.
- **Sabores Europeus em Varpa:** Deliciosos doces, geleias e defumados da tradição da Letônia.
- **Gastronomia Japonesa e Oriental:** Forte influência na região da Alta Paulista.
- **Praça da Bandeira e Avenidas Centrais (Av. Tamoios / Timbiras):** Excelentes opções de choperias, pizzarias, hamburguerias e restaurantes familiares."""
    }
]


def find_local_answer(user_message: str) -> str:
    """Busca a melhor resposta no banco de conhecimento local de Tupã."""
    query = user_message.lower()
    
    # Busca por correspondência de palavras-chave pontuadas
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
        return (
            "Olá! Seja muito bem-vindo ao **TupãBot**! ☀️\n\n"
            "Eu sou um assistente especializado na **Estância Turística de Tupã (SP)** e em toda a região da Alta Paulista.\n\n"
            "Posso te contar sobre:\n"
            "- A história da fundação e o pioneiro Luiz de Souza Leão\n"
            "- Faculdades locais como a **FADAP** e a **UNESP**\n"
            "- Pontos turísticos: Museu Índia Vanuíre, Praça da Bandeira, Solar\n"
            "- O distrito letão de **Varpa**\n"
            "- A economia do amendoim e a tradicional **EXAPIT**\n\n"
            "Como posso te ajudar hoje?"
        )
        
    # Resposta padrão inteligente
    return (
        f"Sobre a sua pergunta sobre \"{user_message}\":\n\n"
        "Como especialista em **Tupã (SP)**, posso detalhar informações sobre nossa história (fundada em 1929), "
        "instituições de ensino como a **FADAP/FAP** e **UNESP**, o famoso **Museu Índia Vanuíre**, o distrito histórico de **Varpa**, "
        "ou as tradições do amendoim e agropecuária da Alta Paulista.\n\n"
        "💡 *Dica:* Você também pode conectar uma chave de API do Google Gemini nas configurações acima para respostas geradas dinamicamente com IA generativa avançada!"
    )
