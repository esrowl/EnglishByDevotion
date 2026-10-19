# EnglishByDevotion — bakım, API ve test raporu

10 Ekim 2026 · Yapan: Esra

## Sonuç

Mevcut uygulama üzerine artımlı değişiklikler yapıldı. Veri reset/silme yapılmadı.
Son başarılı çalıştırmalarda **122 otomatik kontrol** geçti: 24 API/edge-case,
29 içerik, 35 iş akışı, 9 regresyon, 15 yerel kalıcılık, 10 canlı kaynak UI kontrolü.
Font glif doğrulaması, TypeScript/Vite build ve lint ayrıca başarılıdır.
Bu sayılar bütün olası hataların yokluğu veya tüm tarayıcıların desteği değildir.

## Çalıştırılan testler

| Komut / test | Son sonuç | Kapsam |
| --- | --- | --- |
| npm run build | geçti | TypeScript ve production Vite derlemesi |
| npm run lint | geçti, uyarı yok | oxlint |
| tests/regression.cjs | 9/9 | kart ilerleme, çok sözcüklü cevap, CSV, SRS, eski kayıt |
| tests/workflows.cjs | 35/35 | altı drill modu, review, notlar, import, 500 kayıt, 10 bölüm |
| tests/content-integration.cjs | 29/29 | Dexie v1→v3, gerçek yanıt fixture'ı, Tatoeba/Gutenberg, offline veri |
| tests/api-edgecases.cjs | 24/24 | HTTP hataları, timeout, malformed JSON/cache, import rollback/çatışma |
| tests/local-persistence.cjs | 15/15 | origin/token/CORS, CAS, UTF-8, disk geçmişi, tarayıcı restore, kapama |
| tests/source-ui.cjs | 10/10 | canlı Wiki/Tatoeba/Datamuse/Open Library, pasaj, modal, mobil |
| tests/font-validation.cjs | geçti | Special Elite / VT323 ç ğ ı İ ö ş ü glifleri |
| tests/live-api.cjs | 4/6 sağlayıcı erişilebilir | iki kaynak timeout; ayrı canlı teşhis |

Ortam: macOS, Microsoft Edge headless, mevcut Playwright runtime; uygulama
test adresi `http://127.0.0.1:5180`. Kullanıcının tarayıcı profili kullanılmadı.
Disk yedekleri ayrı geçici EBD_STORAGE_DIR klasörlerine yazıldı. 1440 ve 390 px
ekranlar kontrol edildi. Mobil kaynak ekranı screenshot'ı ayrıca görsel incelendi.

İlk paralel son turda içerik testi yenileme sonrası textbox beklerken timeout,
workflow testi review başlangıç düğmesini beklerken timeout verdi. Bu sırada
dosyalar da değişiyordu; kesin sebep doğrulanmadı. Değişiklik yapılmayan izole
tekrarlar 29/29 ve 35/35 geçti. Başarısız ilk denemeler gizlenmemiştir; flakiness
şüphesinde geliştirme sunucusundaki HMR ve eşzamanlı test yükü dikkate alınmalıdır.

## Canlı API gerçekleri

- Tatoeba: 19 ve 20 uygun örnek içeren iki gerçek sayfa; next cursor, özgün ID,
  yazar ve lisans, gerçek Türkçe çeviri erişildi. UI'de 10'dan fazla cümle açıldı.
- Wiktionary: winter için 7 gerçek tanım, giriş/CC BY-SA atfı; UI ve kayıt geçti.
- Datamuse: quiet için 498 gerçek öneri; UI'de 30'dan fazlası açıldı, otomatik
  kişisel kelime kaydı oluşmadı.
- Open Library: alice için 20 gerçek kitap metadata kaydı ve sonraki sayfa;
  uygulama içinde katalog gösterimi geçti. Bu fulltext entegrasyonu değildir.
- Free Dictionary API: daha önce gerçek hello yanıtı alındı; fixture çoklu
  anlam/audio normalizasyonunu test eder. Son canlı browser probu 12 sn timeout
  verdi; son probun başarılı olduğu iddia edilmez.
- Gutendex: browser 12 sn ve curl 15 sn timeout; adaptör/hata yönetimi mevcut,
  bu ortamda canlı hizmet başarıyla doğrulanmadı.

Fixture ve mock testleri dış hizmetin o an erişilebilirliğini ispatlamaz.
Timeout/404/429/500/503/400, offline, invalid JSON, eksik alan, HTML temizleme,
yanlış pagination host/path, duplicate/concurrent save ve bozulan cache test edildi.

## Uygulanan bakım ve performans iyileştirmeleri

- Flashcard/review ilerlemesi ve biten seansın son kartını tekrar puanlama
  korumaları; çok sözcüklü cevap ve noktalama uyumluluğu.
- Legacy kayıtların okumada normalizasyonu, booleans/difficult filtre uyumu,
  yerel İstanbul gün hesabı ve kayıtlı practice tercihlerinin kullanımı.
- Kelime ekleme/JSON/CSV için doğrulama; işlem bütünlüğü ve mükerrer koruması.
- Kullanıcı tanımı/not/SRS üzerine yazmadan dış sözlük zenginleştirmesi.
- Sekmeler lazy-load; 500 kayıt testiyle kütüphane 60'lık görünüm gruplarıyla
  genişler. Görüntüleme grubu öğrenme kotası değildir.
- Dictionary API eşzamanlı aynı kelime istekleri birleştirilir; başarılı dış
  veriler cache edilir. Ses preload=none; cache tekrar sorguları azaltır.
- Speech iptalinde native end olayı gelmese de bekleyen Promise tamamlanır.
- Hata sınırı, anlamlı kaynak/network mesajları, focus trap/Escape/focus-visible,
  güvenli kaynak bağlantıları, mobil satır kırılması ve buton geri bildirimi.
- Ayrı Save/Export/Cache/Close; autosave disk katmanı, revision çatışması,
  önceki yedeklerin korunması ve tarayıcı/PC taşınabilirlik seçeneği.

Son ölçülen production derlemesinde ana JS yaklaşık 322.63 kB (gzip 95.42 kB),
ortak JSX/veri chunk'ı 133.37 kB (gzip 44.04 kB), CSS 53.60 kB (gzip 10.19 kB).
Bunlar dosya ölçüleridir; önce/sonra Lighthouse veya FPS hızlanma yüzdesi
ölçülmedi ve iddia edilmez. Baykuş/kar efektleri kaldırılmadı.

## Oluşturulan / değiştirilen dosyalar

Yeni servisler: `src/services/localPersistence.ts`, `discoveryService.ts`,
`contentValidation.ts`, `scripts/server/localServer.mjs`.
Yeni kontroller: `StorageControls.tsx`, `WordDiscovery.tsx`, `ReadingTools.tsx`.
Yeni testler: `api-edgecases.cjs`, `live-api.cjs`, `local-persistence.cjs`,
`source-ui.cjs`. Yeni belgeler: README, TECHNICAL_GUIDE, DATA_PORTABILITY,
SOURCES, bu rapor ve storage/README.

Değiştirilen çekirdek dosyalar: `App.tsx`, `services/db.ts`, `contentHttp.ts`,
`dictionaryService.ts`, `tatoebaService.ts`, `types/contentSources.ts`,
`DictionaryLookup.tsx`, `DictionaryContent.tsx`, `ExternalWordContent.tsx`,
`LibraryView.tsx`, `ReadingView.tsx`, `SettingsView.tsx`, `ImportView.tsx`,
`Modal.tsx`, `SourceAttribution.tsx`, `index.css`, `vite.config.ts`,
`scripts/start.mjs`, package.json/lock, .gitignore ve içerik testinin v3 beklentisi.
Önceki bakımda değişen Flashcard/SRS/import/validation/speech/layout dosyaları
da mevcut önceki raporlarla birlikte korunur.

Eski raporlar docs/reports'e, tanıtım GIF/WebP public/assets/branding'e,
örnek import dosyası public/sample-englishbydevotion-import.json'a düzenlendi.
Proje adı/author pakette EnglishByDevotion / Esra; eski DB adı veri koruması
için bilerek LexoraDB kaldı. Root .command çalıştırılabilir ve konuma göre çalışır.

## Kapsam / açık sınırlamalar

Tamamlanan: yerel veri koruma/yedekleme, tam JSON aktarımı, ayrı kontroller,
artımlı UI polishing, kaynaklı sözlük/cümle/paketli okuma, alternatif kaynak
seçimleri, sayfalı keşif ve teknik belgeler.

Kısmi/koşullu: dış hizmetlerin sürekliliği; Gutendex canlı erişimi; Gutenberg
yeni tam metin ithali; Tatoeba kayıtlarının topluluk doğruluğu; tüm tarayıcılar.
Open Library metadata ve Wikisource linki fulltext sağlayıcı entegrasyonu değildir.
Datamuse'un 2027 anahtar geçişi ek değerlendirme ister; paid/key hizmet kurulmadı.

Offline yalnız uygulama yüklenmişken kayıtlı/cached içerik için doğrulandı;
sunucusuz tam offline başlangıç/PWA yok. Kaydedilmemiş form/yazı taslakları
yedeğe dahil değil. Disk backup history otomatik temizlenmez, şifreleme/bulut
sync yok. Çoklu tarayıcı çatışmaları güvenle reddedilir, otomatik canlı sync değil.
Başka PC'ye JSON aktarım yolu test edildi; fiziksel ikinci PC testi yapılmadı.
Yeni kaynak/metin kullanırken ülke ve bireysel kayıt lisansı ayrıca incelenmelidir.

## Son klasör / başlatıcı kontrolü

Klasör `/Users/esra/Desktop/MyProjects/EnglishByDevotion` olarak taşındı;
mevcut storage ve bütün dosyalar korundu. Taşımadan sonra build ve lint tekrar
başarılı çalıştı. `./EnglishByDevotion.command --check` yeni konumu ve retro
karşılamayı doğruladı. Eski konumdaki doğrulanmış Vite süreci durduruldu;
uygulama yeni konumdan aynı `http://localhost:5173` adresinde başarıyla başladı.
