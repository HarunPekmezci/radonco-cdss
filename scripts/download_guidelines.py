import os
import time
import requests
from playwright.sync_api import sync_playwright

DOWNLOAD_DIR = os.path.abspath("guidelines_pdf")
USER_DATA_DIR = os.path.abspath(".browser_session")
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

TARGETS = [
    {
        "name": "NCCN_Prostate_Cancer.pdf",
        "module": "prostate",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/prostate.pdf"
    },
    {
        "name": "ASTRO_Prostate_Hypofractionation.pdf",
        "module": "prostate",
        "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6400508/pdf/main.pdf"
    },
    {
        "name": "NCCN_Breast_Cancer.pdf",
        "module": "breast",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/breast.pdf"
    },
    {
        
        "name": "ASTRO_Breast_Whole_Radiation.pdf",
        "module": "breast",
        "url": "https://www.astro.org/ASTRO/media/ASTRO/Clinical%20Practice%20Statements/PDFs/WholeBreastRadTherapyExecSummary.pdf"

    },
    {
        "name": "NCCN_Non_Small_Cell_Lung_Cancer.pdf",
        "module": "lung",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/nscl.pdf"
    },
    {
        "name": "NCCN_Rectal_Cancer.pdf",
        "module": "rectum",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/rectal.pdf"
    },
    {
        "name": "NCCN_Head_and_Neck_Cancers.pdf",
        "module": "head-neck",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/head-and-neck.pdf"
    },
    {
        "name": "NCCN_Central_Nervous_System.pdf",
        "module": "cns",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/cns.pdf"
    },
    {
        "name": "NCCN_Cervical_Cancer.pdf",
        "module": "cervix",
        "url": "https://www.nccn.org/professionals/physician_gls/pdf/cervical.pdf"
    }
]

def render_bar(current, total, prefix=""):
    pct = int(100 * (current / float(total))) if total > 0 else 0
    filled = pct // 4
    bar = "█" * filled + "░" * (25 - filled)
    cur_mb = current / (1024 * 1024)
    tot_mb = total / (1024 * 1024) if total > 0 else 0
    print(f"\r{prefix} |{bar}| %{pct} ({cur_mb:.1f}/{tot_mb:.1f} MB)", end="", flush=True)

def run():
    print("\n--- Çoklu Modül Kılavuz İndirici Başlatılıyor ---")
    with sync_playwright() as p:
        context = p.chromium.launch_persistent_context(
            user_data_dir=USER_DATA_DIR,
            headless=True,
            args=["--disable-blink-features=AutomationControlled"]
        )

        # Oturum çerezlerini requests oturumuna aktar
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/pdf,*/*"
        })
        for cookie in context.cookies():
            session.cookies.set(cookie["name"], cookie["value"], domain=cookie.get("domain", ""))

        for target in TARGETS:
            file_path = os.path.join(DOWNLOAD_DIR, target["name"])
            if os.path.exists(file_path) and os.path.getsize(file_path) > 50000:
                print(f"⏩ Zaten mevcut, atlandı: {target['name']}")
                continue

            print(f"\n📥 İndiriliyor [{target['module'].upper()}]: {target['name']}")
            try:
                res = session.get(target["url"], stream=True, timeout=60)
                if res.status_code == 200:
                    total_size = int(res.headers.get("content-length", 0))
                    downloaded = 0
                    with open(file_path, "wb") as f:
                        for chunk in res.iter_content(chunk_size=131072): # 128 KB parçalar
                            if chunk:
                                f.write(chunk)
                                downloaded += len(chunk)
                                if total_size > 0:
                                    render_bar(downloaded, total_size, "   İlerleme:")
                    print(f"\n✓ Başarıyla tamamlandı: {target['name']}")
                else:
                    print(f"⚠️ Sunucu yanıtı ({res.status_code}): {target['name']}")
            except Exception as e:
                print(f"\n❌ İndirme hatası ({target['name']}): {e}")

        context.close()
    print("\n--- Tüm Modüllerin İndirmesi Tamamlandı ---\n")

if __name__ == "__main__":
    run()