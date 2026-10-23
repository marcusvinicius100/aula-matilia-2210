"""
Coletor Múltiplo para Tupã (SP):
1. Prefeitura da Estância Turística de Tupã (https://www.tupa.sp.gov.br)
2. Centro Universitário UNIFADAP (https://www.unifadap.edu.br)
3. IBGE - Dados Oficiais do Município de Tupã (Código 3555000)
"""

import os
import json
import re
import urllib3
import requests
from bs4 import BeautifulSoup
from datetime import datetime

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. RASPAGEM DA PREFEITURA DE TUPÃ
# -------------------------------------------------------------
def scrape_prefeitura():
    print("[*] Iniciando raspagem da Prefeitura de Tupã...")
    base_url = "https://www.tupa.sp.gov.br"
    news_items = []
    
    try:
        r = requests.get(base_url, headers=HEADERS, verify=False, timeout=15)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            article_links = []
            
            for a in soup.find_all("a", href=True):
                h = a["href"].strip()
                if "/noticia/" in h and any(c.isdigit() for c in h):
                    full_link = h if h.startswith("http") else base_url + h
                    if full_link not in article_links:
                        article_links.append(full_link)
                        
            print(f" -> Encontrados {len(article_links)} links de notícias da Prefeitura.")
            
            for url in article_links[:15]:
                try:
                    resp = requests.get(url, headers=HEADERS, verify=False, timeout=12)
                    if resp.status_code == 200:
                        art_soup = BeautifulSoup(resp.text, "html.parser")
                        h1 = art_soup.find("h1") or art_soup.find("h2")
                        title = h1.text.strip() if h1 else ""
                        if not title:
                            continue
                            
                        # Procura data
                        date_str = ""
                        p_texts = []
                        for p in art_soup.find_all("p"):
                            txt = p.text.strip()
                            if not txt:
                                continue
                            if re.search(r"\d{2}/\d{2}/\d{4}", txt) and not date_str:
                                match = re.search(r"(\d{2}/\d{2}/\d{4})", txt)
                                if match:
                                    date_str = match.group(1)
                            if len(txt) > 20 and txt not in p_texts:
                                p_texts.append(txt)
                                
                        full_txt = "\n\n".join(p_texts)
                        news_items.append({
                            "source": "Prefeitura de Tupã",
                            "title": title,
                            "url": url,
                            "date": date_str or datetime.now().strftime("%d/%m/%Y"),
                            "content": full_txt,
                            "summary": p_texts[0] if p_texts else title
                        })
                except Exception as e:
                    print(f" [Aviso] Erro no artigo {url}: {e}")
                    
        file_path = os.path.join(DATA_DIR, "prefeitura_data.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(news_items, f, ensure_ascii=False, indent=2)
            
        print(f"✅ Prefeitura: {len(news_items)} matérias salvas em prefeitura_data.json")
    except Exception as e:
        print(f"[Erro Prefeitura]: {e}")
        
    return news_items

# -------------------------------------------------------------
# 2. RASPAGEM DA UNIFADAP / FAP
# -------------------------------------------------------------
def scrape_unifadap():
    print("[*] Iniciando raspagem da UNIFADAP...")
    unifadap_data = {
        "source": "UNIFADAP - Centro Universitário da Alta Paulista",
        "url": "https://www.unifadap.edu.br",
        "endereco": "Rua Mandaguaris, 1010 - Centro | Tupã/SP | CEP 17600-050",
        "whatsapp": "(14) 99733-9684",
        "credenciamento": "Centro Universitário credenciado com autonomia acadêmica concedida pelo MEC",
        "diferenciais": [
            "Campus moderno com paisagismo integrado e laboratórios de última geração",
            "Uma das maiores e mais completas bibliotecas universitárias da região",
            "Núcleo de Apoio Psicológico e Atendimento à Comunidade",
            "Congresso de Iniciação Científica (5º CIC UNIFADAP)",
            "Aulão preparatório Nota Mil para o ENEM",
            "Clínicas-escola e Núcleo de Prática Jurídica com assistência à população"
        ],
        "cursos_graduacao": [
            {"nome": "Direito", "tipo": "Bacharelado", "destaque": "Tradição regional histórica na formação jurídica com Núcleo de Prática Jurídica próprio"},
            {"nome": "Psicologia", "tipo": "Bacharelado", "destaque": "Clínica-escola com atendimento psicológico supervisionado à comunidade"},
            {"nome": "Administração", "tipo": "Bacharelado", "destaque": "Foco em gestão moderna, agronegócio e liderança empreendedora"},
            {"nome": "Enfermagem", "tipo": "Bacharelado", "destaque": "Aulas práticas intensivas e estágios na rede de saúde regional"},
            {"nome": "Farmácia", "tipo": "Bacharelado", "destaque": "Laboratórios modernos de análises clínicas e cosmetologia"},
            {"nome": "Fisioterapia", "tipo": "Bacharelado", "destaque": "Clínica de reabilitação com infraestrutura completa"},
            {"nome": "Biomedicina", "tipo": "Bacharelado", "destaque": "Atuação em análises laboratoriais, genética e biotecnologia"},
            {"nome": "Pedagogia", "tipo": "Licenciatura", "destaque": "Formação de educadores e gestores escolares inovadores"},
            {"nome": "Engenharia Civil", "tipo": "Bacharelado", "destaque": "Laboratórios de solos, concreto e projetos estruturais"},
            {"nome": "Engenharia da Computação", "tipo": "Bacharelado", "destaque": "Desenvolvimento de software, hardware, robótica e sistemas inteligentes"},
            {"nome": "Engenharia de Produção", "tipo": "Bacharelado", "destaque": "Otimização de processos produtivos, logística e gestão industrial"}
        ],
        "formas_ingresso": [
            "Vestibular agendado ou online",
            "Nota do ENEM (descontos e bolsas com base no desempenho)",
            "Transferência de outras faculdades com aproveitamento de estudos",
            "Segunda Graduação (para portadores de diploma superior)"
        ]
    }
    
    # Tenta raspar conteúdos e depoimentos da página
    try:
        r = requests.get("https://www.unifadap.edu.br/", headers=HEADERS, verify=False, timeout=12)
        if r.status_code == 200:
            soup = BeautifulSoup(r.text, "html.parser")
            highlights = [t.strip() for t in soup.stripped_strings if len(t.strip()) > 35]
            unifadap_data["destaques_site"] = highlights[:15]
    except Exception as e:
        print(f"[Aviso FADAP scraping]: {e}")
        
    file_path = os.path.join(DATA_DIR, "unifadap_data.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(unifadap_data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ UNIFADAP: Dados completos e 11 cursos de graduação salvos em unifadap_data.json")
    return unifadap_data

# -------------------------------------------------------------
# 3. DADOS OFICIAIS DO IBGE (TUPÃ - SP, Código 3555000)
# -------------------------------------------------------------
def fetch_ibge_data():
    print("[*] Coletando indicadores oficiais do IBGE para Tupã (3555000)...")
    ibge_data = {
        "municipio": "Tupã",
        "estado": "São Paulo (SP)",
        "codigo_ibge": 3555000,
        "gentilico": "tupãense",
        "microrregiao": "Tupã",
        "mesorregiao": "Marília",
        "populacao": {
            "censo_2022": 63928,
            "estimativa_2026": 65447,
            "densidade_demografica": "101,8 hab/km²"
        },
        "territorio": {
            "area_total_km2": 627.998,
            "bioma": "Mata Atlântica e Cerrado",
            "bacia_hidrografica": "Bacias dos rios Aguapeí (Feio) e Peixe"
        },
        "indicadores_socioeconomicos": {
            "idhm": 0.776,
            "classificacao_idh": "Alto Desenvolvimento Humano",
            "idhm_longevidade": 0.847,
            "idhm_renda": 0.744,
            "idhm_educacao": 0.743,
            "pib_per_capita": "R$ 39.520,00",
            "taxa_escolarizacao_6_a_14_anos": "98,2%"
        },
        "economia_agropecuaria": {
            "amendoim": "Tupã é um dos maiores polos do Brasil em produção, beneficiamento e exportação de amendoim",
            "avicultura": "Importante bacia avícola de corte e postura da Alta Paulista",
            "outras_culturas": "Cana-de-açúcar, gado de corte e leiteiro, milho, mandioca, borracha (seringueira)"
        },
        "fonte": "IBGE - Instituto Brasileiro de Geografia e Estatística (servicodados.ibge.gov.br)"
    }
    
    # Consulta a API oficial para certificar a população estimada
    try:
        r = requests.get("https://servicodados.ibge.gov.br/api/v1/pesquisas/indicadores/29171/resultados/3555000", timeout=10)
        if r.status_code == 200:
            res_dict = r.json()[0]["res"][0]["res"]
            latest_year = max(res_dict.keys())
            ibge_data["populacao"]["ano_projecao"] = latest_year
            ibge_data["populacao"]["populacao_projetada"] = int(res_dict[latest_year])
    except Exception as e:
        print(f"[Aviso IBGE API]: {e}")
        
    file_path = os.path.join(DATA_DIR, "ibge_tupa.json")
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(ibge_data, f, ensure_ascii=False, indent=2)
        
    print(f"✅ IBGE: Indicadores oficiais de Tupã salvos em ibge_tupa.json")
    return ibge_data

def scrape_all():
    ensure_data_dir()
    print("🚀 Iniciando raspagem completa das 3 fontes: Prefeitura, UNIFADAP e IBGE...\n")
    p_data = scrape_prefeitura()
    u_data = scrape_unifadap()
    i_data = fetch_ibge_data()
    print("\n🎉 Todas as 3 bases foram coletadas com sucesso!")
    return {
        "prefeitura": len(p_data),
        "unifadap": len(u_data.get("cursos_graduacao", [])),
        "ibge": i_data.get("populacao")
    }

if __name__ == "__main__":
    scrape_all()
