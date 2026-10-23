"""
Base de Conhecimento Multi-Fontes Especializada sobre Tupã (SP)
Integrando:
1. Portal TupãCity (Notícias ao vivo da cidade)
2. Prefeitura da Estância Turística de Tupã (Notícias oficiais, PAT, obras)
3. Centro Universitário UNIFADAP (Cursos, vestibular, estrutura)
4. IBGE Oficial (População, IDHM, PIB, território, agropecuária)
"""

import os
import json
import re
from datetime import datetime

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

def _load_json(filename, default=None):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[Aviso] Falha ao ler {filename}: {e}")
    return default if default is not None else []

def parse_date_key(item):
    d_str = item.get("date", "")
    try:
        return datetime.strptime(d_str, "%d/%m/%Y")
    except Exception:
        return datetime.min

def load_tupacity_news():
    news = _load_json("tupa_news.json", [])
    news.sort(key=parse_date_key, reverse=True)
    return news

def load_prefeitura_news():
    return _load_json("prefeitura_data.json", [])

def load_unifadap_data():
    return _load_json("unifadap_data.json", {})

def load_ibge_data():
    return _load_json("ibge_tupa.json", {})

# -------------------------------------------------------------
# CONSTRUÇÃO DO PROMPT DE SISTEMA PARA A IA GENERATIVA (GEMINI)
# -------------------------------------------------------------
def build_system_prompt():
    ibge = load_ibge_data()
    unifadap = load_unifadap_data()
    tupacity = load_tupacity_news()
    prefeitura = load_prefeitura_news()

    # Resumo das notícias recentes do TupãCity
    news_lines = []
    for item in tupacity[:6]:
        news_lines.append(f"- [{item.get('date')}] {item.get('title')}: {item.get('summary')}")
    news_context = "\n".join(news_lines)

    # Resumo de atos oficiais da Prefeitura
    pref_lines = []
    for item in prefeitura[:4]:
        pref_lines.append(f"- [{item.get('date')}] {item.get('title')}: {item.get('summary')}")
    pref_context = "\n".join(pref_lines)

    # Cursos UNIFADAP
    cursos = [c.get("nome") for c in unifadap.get("cursos_graduacao", [])]
    cursos_str = ", ".join(cursos) if cursos else "Direito, Psicologia, Administração, Enfermagem, etc."

    return f"""Você é o "TupãBot", um modelo de linguagem e assistente virtual especialista de alta precisão na Estância Turística de Tupã (SP) e na região da Alta Paulista.

Você foi treinado e abastecido com 4 bases oficiais de conhecimento raspadas em tempo real:

1. DADOS OFICIAIS DO IBGE (Código 3555000):
   - População Estimada (2026): {ibge.get('populacao', {}).get('populacao_projetada', '65.447')} habitantes (Censo 2022: 63.928)
   - IDHM: 0,776 (Alto Desenvolvimento Humano | Longevidade: 0,847)
   - Área: 627,998 km² | Densidade: 101,8 hab/km² | Bioma: Mata Atlântica e Cerrado
   - Economia: Capital nacional do amendoim, polo avícola e agropecuário.

2. CENTRO UNIVERSITÁRIO UNIFADAP / FAP:
   - Endereço: {unifadap.get('endereco', 'Rua Mandaguaris, 1010 - Centro, Tupã/SP')} | WhatsApp: {unifadap.get('whatsapp', '(14) 99733-9684')}
   - Status: Centro Universitário com autonomia acadêmica concedida pelo MEC.
   - Cursos de Graduação: {cursos_str}
   - Estrutura: Laboratórios modernos, grande biblioteca, clínicas-escola, Núcleo de Prática Jurídica, Congresso de Iniciação Científica (CIC).

3. PREFEITURA MUNICIPAL DE TUPÃ (Atos oficiais e serviços):
{pref_context}

4. NOTÍCIAS AO VIVO DO PORTAL TUPÃCITY:
{news_context}

Responda sempre com tom cortês, empolgado e preciso. Use formatação markdown rica (listas, negritos e links). Cite as fontes oficiais quando responder a dados estatísticos, acadêmicos ou notícias.
"""

TUPA_SYSTEM_PROMPT = build_system_prompt()

# -------------------------------------------------------------
# MOTOR DE BUSCA E RESPOSTA NATIVA MULTI-FONTES
# -------------------------------------------------------------
def find_local_answer(user_message: str) -> str:
    query = user_message.lower()

    # 1. PERGUNTAS SOBRE O IBGE / POPULAÇÃO / ESTATÍSTICAS
    if any(k in query for k in ["ibge", "populacao", "população", "habitantes", "quantas pessoas", "censo", "idhm", "idh", "pib", "area", "área", "tamanho da cidade"]):
        ibge = load_ibge_data()
        pop = ibge.get("populacao", {})
        ind = ibge.get("indicadores_socioeconomicos", {})
        terr = ibge.get("territorio", {})
        return (
            "📊 **Dados Oficiais de Tupã (Fonte: IBGE - Instituto Brasileiro de Geografia e Estatística):**\n\n"
            f"- 👥 **População:** **{pop.get('populacao_projetada', '65.447'):,}** habitantes (estimativa oficial) e **63.928** no Censo Demográfico.\n"
            f"- 🗺️ **Área Territorial:** **{terr.get('area_total_km2', 627.998)} km²**\n"
            f"- 📍 **Densidade Demográfica:** **{pop.get('densidade_demografica', '101,8 hab/km²')}**\n"
            f"- 📈 **IDHM (Desenvolvimento Humano):** **{ind.get('idhm', '0,776')}** (*{ind.get('classificacao_idh', 'Alto Desenvolvimento Humano')}*)\n"
            f"  - Longevidade: {ind.get('idhm_longevidade', '0,847')}\n"
            f"  - Renda: {ind.get('idhm_renda', '0,744')}\n"
            f"  - Educação: {ind.get('idhm_educacao', '0,743')}\n"
            f"- 💰 **PIB per capita:** {ind.get('pib_per_capita', 'R$ 39.520,00')}\n"
            f"- 🎒 **Taxa de Escolarização (6 a 14 anos):** {ind.get('taxa_escolarizacao_6_a_14_anos', '98,2%')}\n"
            f"- 🌿 **Bioma:** {terr.get('bioma', 'Mata Atlântica e Cerrado')}\n\n"
            "🔗 *Fonte direta da API de dados do IBGE para o município 3555000 (Tupã/SP).*"
        )

    # 2. PERGUNTAS SOBRE A UNIFADAP / FADAP / FAP / CURSOS SUPERIORES
    if any(k in query for k in ["fadap", "unifadap", "fap", "vestibular", "faculdade", "graduacao", "graduação", "curso"]):
        u = load_unifadap_data()
        cursos = u.get("cursos_graduacao", [])
        
        # Se perguntou sobre um curso específico
        for c in cursos:
            if c["nome"].lower() in query:
                return (
                    f"🎓 **Curso de {c['nome']} na UNIFADAP:**\n\n"
                    f"- **Grau:** {c['tipo']}\n"
                    f"- **Diferencial:** {c['destaque']}\n"
                    f"- **Instituição:** {u.get('source')}\n"
                    f"- **Endereço do Câmpus:** {u.get('endereco')}\n"
                    f"- **WhatsApp para Inscrições:** {u.get('whatsapp')}\n\n"
                    "💡 *Você pode ingressar pelo Vestibular agendado, com a nota do ENEM, por transferência ou como segunda graduação!*"
                )
                
        # Resumo geral da UNIFADAP
        cursos_list = "\n".join([f"  - **{c['nome']}** ({c['tipo']}): {c['destaque']}" for c in cursos])
        return (
            f"🎓 **{u.get('source', 'Centro Universitário UNIFADAP')} - Informações Oficiais:**\n\n"
            f"A UniFadap conquistou a **autonomia acadêmica conferida pelo MEC**, elevando o ensino superior de Tupã ao patamar de Centro Universitário!\n\n"
            f"📍 **Endereço:** {u.get('endereco')}\n"
            f"📱 **WhatsApp / Atendimento:** {u.get('whatsapp')}\n\n"
            f"📚 **Cursos de Graduação Oferecidos:**\n{cursos_list}\n\n"
            "🏛️ **Diferenciais da Infraestrutura:**\n"
            "- Laboratórios modernos e uma das maiores bibliotecas do interior paulista\n"
            "- Clínicas-escola de Psicologia, Fisioterapia, Enfermagem e Biomedicina\n"
            "- Núcleo de Prática Jurídica com atendimento comunitário gratuito\n"
            "- Congresso de Iniciação Científica (CIC UNIFADAP) e eventos acadêmicos\n\n"
            "🔗 [Acesse o Portal da UNIFADAP](https://www.unifadap.edu.br)"
        )

    # 3. PERGUNTAS SOBRE A PREFEITURA / PAT / VAGAS / OBRAS / ATOS PÚBLICOS
    if any(k in query for k in ["prefeitura", "pat", "vaga", "vagas", "emprego", "obra", "obras", "cmei", "secretaria", "prefeito"]):
        pref = load_prefeitura_news()
        if pref:
            # Se procurou por vaga/emprego
            pat_news = [item for item in pref if "pat" in item.get("title", "").lower() or "vaga" in item.get("title", "").lower()]
            selected = pat_news if pat_news and any(k in query for k in ["vaga", "pat", "emprego"]) else pref[:4]
            
            output = ["🏛️ **Informativo Oficial da Prefeitura da Estância Turística de Tupã:**\n"]
            for item in selected:
                title = item.get("title")
                date = item.get("date")
                summary = item.get("summary")
                url = item.get("url")
                output.append(f"🔹 **{title}** ({date})\n{summary}\n🔗 [Ver no Portal da Prefeitura]({url})\n")
            return "\n".join(output)

    # 4. PERGUNTAS SOBRE NOTÍCIAS GERAIS / TUPÃCITY
    if any(k in query for k in ["noticia", "notícia", "noticias", "acontec", "tupacity", "hoje", "recente", "ultim", "últim"]):
        news = load_tupacity_news()
        if news:
            output = ["📰 **Últimas Notícias de Tupã (Fonte: Portal TupãCity):**\n"]
            for item in news[:4]:
                title = item.get("title")
                date = item.get("date")
                summary = item.get("summary")
                url = item.get("url")
                output.append(f"🔹 **{title}** ({date})\n{summary}\n🔗 [Ler no TupãCity]({url})\n")
            return "\n".join(output)

    # 5. HISTÓRIA, PONTOS TURÍSTICOS E VARPA
    if any(k in query for k in ["historia", "fundad", "origem", "souza leao", "1929", "aniversario"]):
        return (
            "🏛️ **História e Fundação da Estância Turística de Tupã (SP):**\n\n"
            "- **Fundação:** **12 de outubro de 1929**, fundada pelo pioneiro **Luiz de Souza Leão**.\n"
            "- **Origem do Nome:** Homenagem ao deus do trovão da mitologia tupi-guarani (**Tupã**).\n"
            "- **Desenvolvimento:** Impulsionada pela cultura do café e a chegada da Ferrovia Paulista em 1941.\n"
            "- **Emancipação:** Município instalado em 1938, hoje consolidado como Estância Turística."
        )

    if any(k in query for k in ["turismo", "museu", "vanuire", "visitar", "pontos turisticos", "praca"]):
        return (
            "🌴 **Principais Atrações Turísticas de Tupã:**\n\n"
            "1. 🏺 **Museu Histórico e Pedagógico Índia Vanuíre:** Um dos principais acervos indígenas e etnográficos do Brasil.\n"
            "2. 🏡 **Solar Luiz de Souza Leão:** Casarão histórico tombado do fundador da cidade.\n"
            "3. ⛪ **Igreja Matriz de São Pedro:** Famosa por seus vitrais e arquitetura neoclássica.\n"
            "4. ⛲ **Praça da Bandeira:** Coração da cidade com fonte luminosa e concha acústica.\n"
            "5. 🌾 **Distrito de Varpa:** Famoso pela colonização de imigrantes da **Letônia**, museu dos pioneiros e culinária típica."
        )

    # Cumprimentos
    if any(greet in query for greet in ["oi", "ola", "olá", "bom dia", "boa tarde", "boa noite", "tudo bem"]):
        ibge = load_ibge_data()
        pop_num = ibge.get("populacao", {}).get("populacao_projetada", "65.447")
        return (
            f"Olá! Seja muito bem-vindo ao **TupãBot Multi-Fontes**! ☀️\n\n"
            f"Eu sou o assistente oficial de **Tupã (SP)** (população: {pop_num:,} hab.), abastecido com dados integrados de:\n"
            "- 🏛️ **Prefeitura Municipal:** Atos oficiais, PAT e vagas de emprego\n"
            "- 🎓 **UNIFADAP:** Todos os 11 cursos de graduação, bolsas e vestibular\n"
            "- 📊 **IBGE:** Estatísticas oficiais, IDHM, PIB e território\n"
            "- 📰 **TupãCity:** Notícias em tempo real sobre a cidade\n\n"
            "Como posso te ajudar hoje?"
        )

    # Resposta padrão inteligente
    return (
        f"Sobre \"{user_message}\":\n\n"
        "Tenho acesso a 4 bases completas sobre **Tupã (SP)**:\n"
        "1. 📊 **IBGE:** População, IDHM, PIB e geografia\n"
        "2. 🎓 **UNIFADAP:** Cursos (Direito, Psicologia, Enfermagem, Engenharias), vestibular e estrutura\n"
        "3. 🏛️ **Prefeitura de Tupã:** Vagas do PAT, obras e notícias municipais\n"
        "4. 📰 **TupãCity:** Acontecimentos do dia a dia da cidade\n\n"
        "Experimente perguntar, por exemplo:\n"
        "- *\"Qual a população e o IDH de Tupã no IBGE?\"*\n"
        "- *\"Quais os cursos da UNIFADAP e formas de ingresso?\"*\n"
        "- *\"Quais as vagas de emprego do PAT na prefeitura?\"*\n"
        "- *\"Quais as últimas notícias no TupãCity?\"*"
    )

def reload_news():
    return len(load_tupacity_news())
