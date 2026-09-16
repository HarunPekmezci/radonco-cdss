import os
import json
import requests
from pypdf import PdfReader
from download_guidelines import run as download_all_guidelines

PDF_DIR = "guidelines_pdf"
OUTPUT_INDEX = "src/data/guidelines_rag.json"
OLLAMA_EMBED_URL = os.getenv("OLLAMA_API_BASE", "http://localhost:11434") + "/api/embeddings"
EMBED_MODEL = "nomic-embed-text"

def check_ollama():
    try:
        r = requests.get(os.getenv("OLLAMA_API_BASE", "http://localhost:11434"), timeout=3)
        if r.status_code == 200:
            print("✓ Ollama servisi aktif.")
            return True
    except Exception:
        print("❌ HATA: Ollama servisi çalışmıyor! Lütfen Ollama'yı başlatın.")
        return False

def get_embedding(text: str):
    try:
        res = requests.post(OLLAMA_EMBED_URL, json={"model": EMBED_MODEL, "prompt": text}, timeout=20)
        if res.status_code == 200:
            return res.json().get("embedding")
        return None
    except Exception:
        return None

def get_module_tag(filename: str):
    f = filename.lower()
    if "prostate" in f: return "prostate"
    if "breast" in f: return "breast"
    if "lung" in f or "nscl" in f or "sclc" in f: return "lung"
    if "rectal" in f or "colon" in f: return "gis"
    if "head" in f or "neck" in f: return "head-neck"
    if "cns" in f or "brain" in f: return "cns"
    if "cervic" in f or "uterine" in f: return "gyn"
    return "general"

def render_page_bar(current, total, prefix=""):
    pct = int(100 * (current / float(total))) if total > 0 else 0
    filled = pct // 4
    bar = "█" * filled + "░" * (25 - filled)
    print(f"\r{prefix} |{bar}| %{pct} (Sayfa: {current}/{total})", end="", flush=True)

def index_pdfs():
    if not check_ollama():
        return

    if not os.path.exists(PDF_DIR):
        os.makedirs(PDF_DIR)

    chunks = []
    pdf_files = [f for f in os.listdir(PDF_DIR) if f.endswith(".pdf")]

    if not pdf_files:
        print(f"'{PDF_DIR}' klasöründe taranacak PDF bulunamadı.")
        return

    for file_name in pdf_files:
        file_path = os.path.join(PDF_DIR, file_name)
        module_tag = get_module_tag(file_name)
        print(f"\n📂 [{module_tag.upper()}] Taranıyor: {file_name}")
        
        try:
            reader = PdfReader(file_path)
            total_pages = len(reader.pages)

            for page_idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                text = " ".join(text.split())
                
                if len(text) >= 100:
                    step = 800
                    for i in range(0, len(text), step):
                        chunk_text = text[i:i + 1000]
                        emb = get_embedding(chunk_text)
                        if emb:
                            chunks.append({
                                "source": file_name,
                                "module": module_tag,
                                "page": page_idx + 1,
                                "content": chunk_text,
                                "embedding": emb
                            })
                
                # Her sayfada çubuğu güncelle
                render_page_bar(page_idx + 1, total_pages, "   İşleniyor:")

            print() # Satır başı
        except Exception as e:
            print(f"\n⚠️ Hata ({file_name}): {e}")

    os.makedirs(os.path.dirname(OUTPUT_INDEX), exist_ok=True)
    with open(OUTPUT_INDEX, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False)
    
    print(f"\n🎉 Vektör indeksleme tamamlandı! Toplam {len(chunks)} pasaj '{OUTPUT_INDEX}' içine aktarıldı.")

if __name__ == "__main__":
    download_all_guidelines()
    index_pdfs()
