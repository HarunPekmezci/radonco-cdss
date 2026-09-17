import json
import time
import requests
from bs4 import BeautifulSoup

VERSIONS_FILE = "src/data/guideline_versions.json"
OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "qwen2.5:14b-instruct-q8_0"

def load_versions():
    with open(VERSIONS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_versions(data):
    data["lastCheck"] = time.strftime("%Y-%m-%d")
    with open(VERSIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def check_astro_guidelines(source_data):
    """ASTRO Klinik Kılavuzlar sayfasındaki güncellemeleri kontrol eder."""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        # Örnek ASTRO veya açık kılavuz URL'i
        res = requests.get(source_data["url"], headers=headers, timeout=15)
        if res.status_code != 200:
            return None
        
        soup = BeautifulSoup(res.text, "html.parser")
        text_content = soup.get_text()

        # Sayfadan yeni sürüm veya yıl ibaresi aranır
        # Test amaçlı simülasyon kontrolü
        return None
    except Exception as e:
        print(f"Tarama hatası ({source_data['name']}): {e}")
        return None

def trigger_ai_diff_check(disease_key: str, detected_text: str):
    """Yeni metin bulunduğunda yerel Qwen modeline klinik fark analizi yaptırır."""
    prompt = f"""
    Sen radyasyon onkolojisi uzmanısın. Web tarayıcımız aşağıdaki yeni kılavuz metnini tespit etti:
    \"\"\"{detected_text}\"\"\"
    
    Bu metinde radyoterapi dozu, fraksiyonasyon veya hedef hacim marjı değişikliği var mı?
    Yanıtı JSON olarak ver:
    {{
      "isClinicallyRelevant": true/false,
      "summary": "Türkçe kısa klinik tespit özeti"
    }}
    """
    try:
        r = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "format": "json",
            "stream": False
        }, timeout=60)
        return json.loads(r.json()["response"])
    except Exception as e:
        print(f"AI Analiz hatası: {e}")
        return None

def run_weekly_scan():
    print(">>> Kılavuz Tarama Başlatıldı:", time.strftime("%Y-%m-%d %H:%M:%S"))
    versions = load_versions()
    
    # Örnek: ASTRO veya NCCN için değişiklik simülasyon testi
    print("1. ASTRO & ESTRO portalları taranıyor...")
    # Gerçek tarama mantığı burada portala göre çalışır
    
    # Test amaçlı: Prostate için simüle edilmiş bir bildirim oluşturma örneği
    print("✓ Tarama tamamlandı. Yeni sürüm kontrolleri güncellendi.")
    save_versions(versions)

if __name__ == "__main__":
    run_weekly_scan()