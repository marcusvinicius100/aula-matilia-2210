"""
Scraper do TupãCity (https://tupacity.com/)
Coleta as notícias mais recentes e enriquece a base de conhecimento do TupãBot.
"""

import os
import re
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime

BASE_URL = "https://tupacity.com"
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
NEWS_FILE = os.path.join(DATA_DIR, "tupa_news.json")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}

def ensure_data_dir():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)

def extract_article(url):
    """Extrai título, data e conteúdo de uma matéria do TupãCity."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=12)
        if resp.status_code != 200:
            return None
            
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Título
        h1 = soup.find("h1")
        title = h1.text.strip() if h1 else ""
        if not title:
            return None
            
        # Busca parágrafos de texto
        paragraphs = []
        date_str = ""
        
        for p in soup.find_all("p"):
            text = p.text.strip()
            if not text:
                continue
                
            # Identifica linha de data/fonte (ex: "21/10/2026 Fonte: Redação...")
            if re.search(r"\d{2}/\d{2}/\d{4}", text) and not date_str:
                match = re.search(r"(\d{2}/\d{2}/\d{4})", text)
                if match:
                    date_str = match.group(1)
                continue
                
            # Ignora rodapés e termos comuns de cookies/navegação
            if any(term in text.lower() for term in ["todos os direitos reservados", "desenvolvido por", "política de privacidade"]):
                continue
                
            if len(text) > 25 and text not in paragraphs:
                paragraphs.append(text)
                
        if not paragraphs:
            return None
            
        full_content = "\n\n".join(paragraphs)
        summary = paragraphs[0] if paragraphs else ""
        
        return {
            "title": title,
            "url": url,
            "date": date_str or datetime.now().strftime("%d/%m/%Y"),
            "content": full_content,
            "summary": summary[:400] + "..." if len(summary) > 400 else summary,
            "scraped_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"[Erro ao raspar artigo {url}]: {e}")
        return None

def scrape_tupacity(max_pages=5, delay=0.5):
    """
    Varre páginas de notícias do TupãCity e salva notícias em JSON.
    """
    ensure_data_dir()
    print(f"[*] Iniciando raspagem de notícias do TupãCity ({max_pages} páginas)...")
    
    found_urls = []
    
    # Coleta URLs da página inicial e das páginas de notícias
    pages_to_check = [f"{BASE_URL}/", f"{BASE_URL}/noticias"] + [f"{BASE_URL}/noticias?page={i}" for i in range(2, max_pages + 1)]
    
    for page_url in pages_to_check:
        try:
            print(f" -> Acessando: {page_url}")
            r = requests.get(page_url, headers=HEADERS, timeout=10)
            if r.status_code != 200:
                continue
                
            soup = BeautifulSoup(r.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if "/noticia/" in href:
                    full_link = href if href.startswith("http") else BASE_URL + href
                    if full_link not in found_urls:
                        found_urls.append(full_link)
        except Exception as e:
            print(f"[Aviso] Falha ao ler página {page_url}: {e}")
            
    print(f"[*] Total de notícias únicas encontradas: {len(found_urls)}")
    
    # Carrega notícias já salvas para evitar duplicação
    existing_news = []
    existing_urls = set()
    if os.path.exists(NEWS_FILE):
        try:
            with open(NEWS_FILE, "r", encoding="utf-8") as f:
                existing_news = json.load(f)
                existing_urls = {n["url"] for n in existing_news}
        except Exception:
            existing_news = []
            
    scraped_news = []
    for idx, url in enumerate(found_urls, 1):
        if url in existing_urls:
            # Já temos esta notícia
            continue
            
        print(f" [{idx}/{len(found_urls)}] Raspando notícia: {url}")
        art = extract_article(url)
        if art:
            scraped_news.append(art)
        time.sleep(delay)
        
    all_news = scraped_news + existing_news
    
    # Salva no arquivo JSON
    with open(NEWS_FILE, "w", encoding="utf-8") as f:
        json.dump(all_news, f, ensure_ascii=False, indent=2)
        
    print(f"\n✅ Raspagem concluída! {len(scraped_news)} novas notícias adicionadas. Total na base: {len(all_news)}.")
    return all_news

if __name__ == "__main__":
    scrape_tupacity(max_pages=5)
