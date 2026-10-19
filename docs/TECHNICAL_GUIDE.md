# EnglishByDevotion — proje tanıtımı ve teknik yapı

Yapan: **Esra**. Güncelleme: 10 Ekim 2026.
Ana klasör: `/Users/esra/Desktop/MyProjects/EnglishByDevotion`.

## Amaç ve kapsam

Kişisel İngilizce kelime, okuma ve tekrar çalışma masası. Kış gecesi, cybernetic grafikler,
pixel-art kontroller ve retro bilgisayar hissi korunur. Bu çalışma mevcut React
uygulamasına artımlı bakım yapar; uygulama veya kullanıcı veritabanı yeniden kurulmaz.

Temel bölümler: Dashboard, Vocabulary Library, Flashcards, Review Center,
Open-ended Learning / Practice Lab, Reading Library, Grammar, Writing Notes, Import,
Statistics ve Settings. Kelime kayıtları kullanıcı notlarını, kullanım örneklerini,
öğrenme durumunu, favori/zorluk işaretlerini ve SRS takvimini birlikte taşır.

## Teknoloji

React 19 + TypeScript, Vite 8, Tailwind CSS 4, Dexie 4 / IndexedDB.
Vite eklentisiyle yerel Node.js yedekleme hizmeti; ücretli servis, hesap veya
özel API anahtarı yoktur. macOS başlatıcısı Node üzerinden çalışır.
Kesin bağımlılık sürümleri `package-lock.json` içinde kayıtlıdır.

## Dosya haritası

```text
EnglishByDevotion/
├── EnglishByDevotion.command      macOS çift tıklama başlangıcı
├── README.md                      hızlı başlangıç
├── package.json / package-lock.json
├── vite.config.ts                 derleme ve yerel yedekleme eklentisi
├── src/
│   ├── App.tsx                    bölüm seçimi, lazy yükleme, başlangıç
│   ├── index.css / App.css        ortak tipografi, mevcut tema ve efektler
│   ├── components/
│   │   ├── common/                modal, hata sınırı, kaynak bilgisi, cybernetic SVG/Canvas
│   │   ├── layout/                gezinme ve StorageControls
│   │   ├── library/               kayıtlar, arama, detay, kaynaklar, keşif
│   │   ├── reading/               pasajlar, kataloglar, kişisel okuma
│   │   ├── grammar/               ders kütüphanesi ve cevaplı pratik
│   │   └── ...                    mevcut öğrenme/ayar/istatistik bölümleri
│   ├── services/
│   │   ├── db.ts                  Dexie, işlemler, tüm veri export/import
│   │   ├── grammarService.ts      değerlendirme, oturum ve tekrar durumları
│   │   ├── grammarValidation.ts   taşınabilir grammar kayıt doğrulaması
│   │   ├── localPersistence.ts    disk yedekleme istemcisi ve cache temizleme
│   │   ├── dictionaryService.ts   Wiktionary lookup, kayıt ve zenginleştirme
│   │   ├── tatoebaService.ts      cümleler, lisans filtresi, sayfalama
│   │   ├── readingService.ts      paketli Gutenberg pasajları
│   │   ├── discoveryService.ts    Wiktionary, Datamuse, katalog adaptörleri
│   │   ├── advancedDiscovery.ts   NGSL üyelik filtresi, ağırlıklı seçim ve adaptasyon
│   │   ├── contentHttp.ts         timeout, HTTP hata mesajları, güvenli URL
│   │   ├── contentValidation.ts   kayıtlı/ithal sözlük verisi doğrulama
│   │   ├── vocabularyValidation.ts eski kayıtları okumada uyumluluk
│   │   └── srs.ts / importer.ts / speech.ts / textMatching.ts
│   ├── data/                      kelimeler, cümleler, grammarLessons/grammarExercises
│   └── types/                     kelime, dış kaynak ve grammar sözleşmeleri
├── scripts/
│   ├── start.mjs                  retro karşılama, port ve başlangıç kontrolü
│   └── server/localServer.mjs     yerel güvenli yedekleme uçları
├── public/
│   ├── assets/branding/           mevcut tanıtım görselleri
│   ├── fonts/                     font dosyaları ve lisansları
│   ├── datasets/ngsl/             orijinal core/31k CSV, lisans ve kaynak bilgisi
│   ├── licenses/                  paketli okuma lisansı (metin readingService'te)
│   └── sample-englishbydevotion-import.json
├── tests/                         regresyon, iş akışı, API, depolama, UI testleri
├── docs/                          mimari, kaynaklar, taşınabilirlik
│   └── reports/                   tarihli test ve eski bakım raporları
└── storage/                       özel yerel kullanıcı yedekleri; Git dışında
```

`node_modules` yeniden kurulabilir bağımlılıklar; `dist` derleme çıktısıdır.
`storage/backups` kişisel veridir: dağıtım paketine veya herkese açık repoya eklenmemelidir.
Tarihsel raporlardaki eski klasör/isimler geçmiş durumu belgeler.

## Veri modeli ve uyumluluk

Tarayıcı veritabanının **LexoraDB** adı bilerek değiştirilmedi: ad değişikliği
mevcut IndexedDB kayıtlarını başka bir veritabanında görünmez hale getirirdi.
Bu eski iç isim ürün markası değildir.

| Dexie deposu | Anahtar | İçerik |
| --- | --- | --- |
| vocabulary | id | kelime, tanım, Türkçe anlam, örnekler, notlar, kaynak, SRS |
| reviewLogs | id | kelime kimliği, tarih, puan, tekrar modu |
| dailySessions | date | planlanan/tamamlanan kelime kimlikleri |
| settings | id | user_settings ve çalışma tercihleri |
| contentCache | key | kaynağa göre başarılı yanıtlar ve alınma tarihi |
| readings | id | kullanıcının eklediği izinli pasajlar ve hak bilgisi |
| grammarProgress | lessonId | açılma, okuma tamamlanması, bölüm, aktif oturum, son çalışma |
| grammarAttempts | id | konu/soru/oturum, cevap, doğruluk, çalışma veya tekrar, tarih |
| discoveryPool | key | extended NGSL kelimesi, orijinal SFI sırası, core üyeliği |
| discoveryCore | key | bağımsız NGSL core listesi ve orijinal core sırası |
| discoveryEncounters | word | karşılaşma, aşinalık/öğrenme/skip geri bildirimi |
| discoveryPreferences | id | frequency/source tercihi ve adaptif seçim durumu |
| recallAttempts | id | objektif Typed Recall submission doğruluğu ve tarihi |

Sürüm 1 mevcut dört depoyu korur. Sürüm 2 yalnız contentCache, sürüm 3 yalnız
readings ekler. Sürüm 4 yalnız grammarProgress ve grammarAttempts ekler.
Sürüm 5 ayrı discovery/recall depolarını, sürüm 6 bağımsız core deposunu ekler.
Silme veya birincil anahtar değiştirme migrasyonu yoktur.
Okuma normalizasyonu eksik eski alanları arayüz için tamamlar; saklı kayıtların
notlarını ve SRS tarihlerini topluca yeniden yazmaz.

## Kelime arama akışı

Yeni Continuous Study NGSL keşif akışı, adaptasyon ve yeni depoların taşınması:
[ADVANCED_DISCOVERY.md](ADVANCED_DISCOVERY.md). Kişisel sözlük araması bu filtreden
bağımsızdır; core kelimeleri aramayı veya normal imports/flashcards kullanımını engellemez.

1. İngilizce giriş doğrulanır, normalize edilir.
2. Yerel kelime varsa mevcut kayıt açılır; ağ sorgusu veya yeni kayıt oluşmaz.
3. Seçilen sözlük kaynağının cache kaydı kontrol edilir.
4. Gerekirse gerçek HTTPS isteği yapılır; varsayılan timeout 12 saniyedir.
5. Birden fazla anlam/kelime türü korunur, olmayan alanlar uydurulmaz.
6. **Save** yalnız açık kullanıcı isteğiyle yeni kelime ekler. Durumu `new` olur.

Aynı Wiktionary kelimesine eşzamanlı istekler tek Promise paylaşır.
Kaydetme Dexie transaction içinde tekrar mükerrer kontrolü yapar.
Zenginleştirme, kullanıcı tanımının üstüne yazmak yerine `dictionaryData` ekler.
Kaynak değiştirme görünür bir seçimdir; sessiz sağlayıcı değişimi yoktur.

## Cümleler ve okumalar

Tatoeba lisanslı cümleler kaynak kimliği/yazar/lisansla gösterilir.
Onaysız, aşırı uzun, aynı veya hedef sözcüğü içermeyen kayıtlar filtrelenir.
Türkçe çeviri metadatası eski kayıtlarda korunur ama arayüzde gösterilmez. Daha fazla
cümle resmi cursor ile gelir; sınırsız veri icat edilmez. Kaydedilmiş cümleler
mevcut kelime örnekleri ve uygun Practice Lab alıştırmaları tarafından kullanılır.

Gutenberg'den iki gerçek pasaj paketlidir. Katalog aramaları yalnız
Open Library metadatası getirir; katalog sonucu otomatik tam metin ithali değildir. Free Dictionary API ve Gutendex aktif adaptörleri kaldırılmıştır. Reading dosya ithali `readingImport.ts` üzerinden yereldir; PDF.js yalnız PDF ithalinde yüklenir. Türkçe alanlar arayüzden kaldırılmış, eski kişisel kayıtlar saklanmıştır.
Kullanıcı haklarına sahip olduğu kendi pasajını ekleyebilir. Pasajdaki sözcükler
mevcut sözlük ve kelime kaydetme akışına bağlanır.

## Kalıcılık ve sunucu güvenliği

IndexedDB canlı veri kaynağıdır. Yerel sunucu kullanılabilirken Dexie liveQuery
değişimleri yaklaşık 1,8 saniye bekleyerek tek tam JSON disk snapshot'ına dönüştürür.
İstemci ve sunucu yazmaları sıraya alır. `Save all` tamamlanmış kayıtları hemen
aktarır; açık form ve yazı taslaklarını otomatik kaydetmez.

Sunucu uçları: GET `/__local/status`, GET/PUT `/__local/backup`,
POST `/__local/shutdown`. Yalnız loopback ve aynı origin kabul edilir.
Yazmalarda oturum token'ı, JSON content-type ve revision karşılaştırması
zorunludur. Eski revision 409 döner; eski tarayıcı yeni snapshot'ı sessizce ezmez.
Dosya temp + rename ile atomik yazılır; önceki snapshot history'ye alınır.
UTF-8 tampon birleştirme Türkçe karakterlerin parça sınırında bozulmasını önler.
64 MB istek güvenlik sınırı vardır; bu on kelimelik öğrenme kotası değildir.

Yedekler şifreli değildir. Hesap, bulut senkronizasyonu veya uzaktan erişim yoktur.
Boş tarayıcı profili disk snapshot'ını başlangıç verisi eklenmeden önce alır;
dolu profil otomatik sıfırlanmaz. Detaylar DATA_PORTABILITY.md içindedir.

## Tipografi ve erişilebilirlik

Yalnız üç yerel font kullanılır: Pixelify Sans başlıklar, Handjet kelimeler ve
önemli etkileşim etiketleri, VT323 açıklama/çeviri/örnek/grammar/okuma ve genel
kontroller. Ortak CSS token'ları bunları yönetir; eski sınıf adları da bu üç
fonta eşlenir. Google Fonts kaynaklı dosyalar ve lisanslar public/fonts içindedir.
Her fontun Türkçe küçük/büyük karakter glifleri otomatik olarak doğrulandı.

Kelime 36–44 px, flashcard 40–48 px, liste kelimesi 26–32 px; açıklamalar
22–25 px, grammar/okuma 23–26 px. Responsive ölçüler, satır aralığı ve kelime
kırılması kullanılır. Modal focus trap, Escape, önceki odak ve gövde scroll geri
yükleme vardır. Focus-visible ve devre dışı buton geri bildirimi eklendi.
390 px mobil görünümde yeni kontroller ayrıca taşma testinden geçti.

Güncel dominant görsel temel near-black `#08090B` / charcoal `#111217`, krem
`#F4D5A3` ve Commodore accent paletidir. Bağımsız component HEX sınıfları ortak
CSS token'larına taşındı; opak, köşeli paneller ve düz renk blokları kullanılır.
Dashboard native Canvas perspektif mesh küresi içerir; düşük hızlı animasyon
reduced-motion/gizli sekmede durur. SVG devre deseni boşluk/header/hero alanlarında
görünür; uzun öğrenme metni panelleri patternsizdir. Detay ve önce/sonra PNG'leri:
`reports/VISUAL_IDENTITY_REPORT_2026-10-10.md`.

## Performans ve test yaklaşımı

Ekranlar lazy yüklenir; mevcut görünmeyen bölümler başlangıç yükünü artırmaz.
Kaynak cache'i ve istek birleştirme tekrar ağ trafiğini azaltır. Görünüm grupları
ve API sayfa boyutları toplam kelime kotası değildir. Ağ sorguları kullanıcı
isteğine bağlıdır; otomatik toplu scraping yapılmaz.

Testler ayrı headless tarayıcı profillerinde ve `EBD_STORAGE_DIR` geçici klasörü
ile yürütülmelidir. İş akışı testleri 500 kayıt, on bölüm, flashcard ve mobil
gezintiyi kapsar. Grammar testi ayrıca beş soru türünü, veri migrasyonunu,
taşınabilirliği, tekrar kriterlerini ve iki ekran genişliğini denetler.
Deterministik hata testleri fixture/mocks kullanır; canlı API erişilebilirliği
ayrı raporlanır. Bu güncelleme: `reports/GRAMMAR_UPDATE_REPORT_2026-10-10.md`.

## Grammar ve dürüst pratik

13 ders ve 65 sabit soru yerel TypeScript verileridir; kullanıcı ilerlemesi ayrı
Dexie tablolarındadır. Grammar ekranı lazy yüklenir. Beş soru türü açık cevap
anahtarına göre değerlendirilir; büyük/küçük harf, boşluk, sıradan noktalama ve
tipografik apostrof normalleştirilir. Anlamlı apostrof/tire korunur. Yalnız
tanımlanmış alternatifler kabul edilir; serbest metin dilbilgisi kontrolü yapılmaz.

Okuma tamamlanması ustalık değildir. Mastered için tamamlanmış okuma, en az
%80 başarılı tam oturum, en az 24 saat sonra %80 başarılı tam review oturumu
ve son 10 cevapta en az %80 gerekir. Düşük skor veya tekrar tarihi geçmişse
Needs Review gösterilir. Başarısız oturumdan sonra 1, başarılıdan sonra 3,
mastery sonrasında 7 günlük tekrar tarihi hesaplanır. Bu eğitsel bir sezgiseldir,
resmî seviye ölçümü değildir. Aynı oturum/soru tekrar gönderilince ilk kayıt korunur.

Continuous Study içindeki değerlendirmesiz Write a Sentence girişleri kaldırıldı;
Writing Notes kişisel yazı ve mevcut örnek kaydetme özelliğini korur, notların
grammar açısından kontrol edilmediğini açıkça belirtir. Flashcard hedef kelime
hatırlaması rastgele eş anlamlı kabul etmez; diğer self-assessment modları korunur.

## Geliştirme kuralları

- Veri migrasyonlarını sürümlü ve eklemeli yap; reset/delete kullanma.
- Yeni kaynağı ayrı normalizasyon, kaynak/lisans ve hata kontrolü ile ekle.
- Bir katalog bağlantısını uygulamaya alınmış okuma metni gibi sunma.
- Kullanıcı notlarını sözlük çıktısıyla ezme; aramayı öğrenilmiş olarak işaretleme.
- Düzenlemeden sonra build, lint, ilgili veri ve tarayıcı testlerini çalıştır.
- Tam offline başlangıç/PWA, tüm tarayıcılar veya çatışmasız bulut sync iddiası yapma.
