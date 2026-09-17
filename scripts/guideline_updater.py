import json
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
# Kasanızda yüklü olan model adını kontrol edin (örn: qwen2.5:14b veya qwen2.5:14b-instruct-q8_0)
MODEL_NAME = "qwen2.5:14b"
JSON_PATH = "src/data/clinicalGuidelines.json"

def analyze_guideline_diff(disease_id: str, new_guideline_excerpt: str):
    try:
        with open(JSON_PATH, "r", encoding="utf-8") as f:
            db = json.load(f)
    except Exception as e:
        print(f"JSON okuma hatası: {e}")
        return
    
    current_data = db.get("guidelines", {}).get(disease_id, {})
    
    prompt = f"""
    Sen radyasyon onkolojisi kılavuz analiz asistanısın.
    Aşağıda mevcut sistemimizdeki doz ve fraksiyonasyon JSON verisi ile yeni yayınlanan güncel kılavuz metni bulunmaktadır.
    
    Mevcut Sistem Verisi:
    {json.dumps(current_data, ensure_ascii=False, indent=2)}
    
    Yeni Kılavuz Metni / Değişiklikler:
    \"\"\"{new_guideline_excerpt}\"\"\"
    
    GÖREVİN:
    1. Yeni kılavuzda doz, fraksiyonasyon veya hedef hacim değişikliği var mı tespit et.
    2. Eğer varsa, 'regimens' dizisini yeni kılavuza göre güncelle.
    3. YALNIZCA geçerli bir JSON nesnesi döndür. Format:
    {{
      "hasChanges": true,
      "changeSummary": "Değişikliğin Türkçe klinik özeti",
      "updatedRegimens": [...]
    }}
    """
    
    try:
        response = requests.post(OLLAMA_URL, json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "format": "json",
            "stream": False
        }, timeout=120)
        
        resp_json = response.json()
        
        # Ollama hata mesajı döndüyse ekrana yazdır
        if "error" in resp_json:
            print(f"\n⚠️ Ollama Hatası: {resp_json['error']}")
            print("İpucu: Terminalden 'ollama list' yazarak kurulu modelinizin tam adını kontrol edin.")
            return

        if "response" not in resp_json:
            print(f"\n⚠️ Beklenmeyen yanıt yapısı: {resp_json}")
            return
            
        result = json.loads(resp_json["response"])
        print("\n==========================================")
        print("  AI KILAVUZ FARK & GÜNCELLEME RAPORU")
        print("==========================================")
        print(f"Değişiklik Tespit Edildi mi: {result.get('hasChanges')}")
        print(f"Klinik Özet: {result.get('changeSummary')}\n")
        
        if result.get("hasChanges") and "updatedRegimens" in result:
            confirm = input("Bu güncellemeyi JSON veritabanına işlemek istiyor musunuz? (e/h): ")
            if confirm.lower() == 'e':
                db["guidelines"][disease_id]["regimens"] = result["updatedRegimens"]
                with open(JSON_PATH, "w", encoding="utf-8") as f:
                    json.dump(db, f, ensure_ascii=False, indent=2)
                print("\n✓ Sistem kılavuz veritabanı (clinicalGuidelines.json) başarıyla güncellendi!")
            else:
                print("\nİşlem iptal edildi.")

    except requests.exceptions.ConnectionError:
        print("\n⚠️ Ollama servisine bağlanılamadı. Ollama'nın açık olduğundan emin olun.")
    except Exception as e:
        print(f"\n⚠️ İşlem sırasında bir hata oluştu: {e}")

if __name__ == "__main__":
    sample_update = "NCCN Prostate 2026 Güncellemesi: PACE-B SBRT şemasında PTV marjı intra-fraksiyon takip ile 3-4 mm'den 2 mm'ye indirilmiştir."
    analyze_guideline_diff("prostate", sample_update)