# EnglishByDevotion — Son polish ve kişisel Reading

Tarih: 10 Ekim 2026. Proje: `/Users/esra/Desktop/MyProjects/EnglishByDevotion`.
Geliştirici: Esra. Mevcut uygulamaya artımlı değişiklik; veri tabanı şeması değişmedi.

## Kullanım

1. Home Desk → büyük **Practice Now** düğmesi mevcut Continuous Study'yi açar.
2. Reading Library → **Upload or paste your writing**.
3. TXT, MD/Markdown, metin tabanlı PDF, HTML veya CSV seç; çıkarılan metni gözden geçir.
4. Başlık/yazar ve yeniden kullanım iznini onayla; **Save reading passage**.
5. Metindeki sözcüğe tıkla veya **Words in this text** listesinden seç.
6. Kişisel kayıt varsa önce onu gör; yoksa Wiktionary anlamlarını incele.
7. **Find usage examples · Tatoeba** gerçek, lisanslı İngilizce cümleleri getirir.
8. **Save to vocabulary library** ile açıkça kaydet. Arama öğrenilmiş sayılmaz.

Kelime listesi tekrarları birleştirir, kullanım sayısını ve metin bağlamını çıkarır.
Metin bağlamı, doğrulanmış sözlük örneği gibi sunulmaz. Anlamlar kullanıcı seçimi
üzerine getirilir; bütün dosya otomatik olarak binlerce API isteğine dönüştürülmez.
Reading arama kutusunda başka kelime aranırsa örnek paneli de yeni kelimeyle eşleşir.
Kelime listesinde 40'lık görüntüleme sayfaları vardır; toplam kelime kotası değildir.
Uzun metinlerin tamamı saklanır, yaklaşık 6.000 karakterlik okuma sayfaları gösterilir.

## Kaldırılan ve korunan özellikler

- Turkish Meaning, örnek çevirileri, collocation çevirileri ve Türkçe Grammar
  destek notları artık arayüzde gösterilmez. Yeni kelimeler İngilizce çalışılır.
- Flashcards'ın ilk iki modu Word → Definition ve Definition → Word oldu.
  Altı mod, Typed Recall, Review/SRS ve mevcut alıştırmalar korunuyor.
- Eski `en_to_tr` / `tr_to_en` kimlikleri geçmiş kayıt/ayar uyumluluğu için tutuldu;
  kullanıcıya Türkçe modu gibi sunulmuyor.
- Önceki kişisel Türkçe değerler, kaynak/çeviri lisans metadatası ve backup alanları
  silinmedi. Kelime düzenleme eski Türkçe değeri değiştirmeden korur.
- Free Dictionary API'nin HTTP adaptörü ve kaynak seçicileri kaldırıldı.
  Gutendex HTTP adaptörü ve katalog seçeneği de kaldırıldı. `src/` içinde bu iki
  API'nin istek endpoint'i kalmadığı doğrulandı; mevcut eski kaynak kimlikleri ve
  atıflar yalnız geçmiş veri uyumluluğu için tutuluyor.
- Eski dictionaryapi tercihi silinmeden, okuma sırasında aktif Wiktionary tercihi
  olarak yorumlanır. NGSL havuzu, frekans sıraları, feedback ve adaptive mantık korundu.
- Home Desk'in büyük poster/canvas, metrik kartları ve tekrar eden kısayolları aktif
  görünümden çıkarıldı. İstatistikler, kütüphane ve diğer işlevler sekmelerde duruyor.
  Renk paleti ve Pixelify Sans / Handjet / VT323 sistemi değiştirilmedi.

## Aktif kaynaklar ve hata davranışı

Wiktionary, Tatoeba, Datamuse ve Open Library'nin gerçek tarayıcı erişimi başarılıydı.
Wiktionary: winter için 7 tanım. Tatoeba: iki sayfada 19 ve 20 uygun cümle.
Datamuse: quiet için 498 öneri. Open Library: alice için 20 kitap metadatası.
Bunlar test anındaki erişimdir; gelecekte kesintisiz hizmet garantisi değildir.

Free Dictionary API önceki gerçek kontrollerde HTTP 522 / timeout;
Gutendex önceki browser 12 saniye ve curl 15 saniye kontrollerinde timeout verdi.
Kaldırılma gerekçeleri önceki test raporlarında kayıtlıdır.

Kalan kaynaklarda unknown word, 429, 5xx, timeout, offline ve geçersiz yanıtlar
hala güvenli biçimde işlenir; hata kayıt üretmez veya uygulamayı çökertmez.
Aynı Wiktionary kelimesine eşzamanlı istekler tek Promise paylaşır.
Kaydedilmiş kelime/dictionary cache tekrar sorgulanmaz.

## Yerel depolama, güvenlik ve PDF

Kişisel metnin çıkarılmış hali mevcut Dexie `readings` tablosuna kaydedilir;
orijinal PDF/HTML dosyasının binary kopyası saklanmaz. `origin`, başlık, yazar,
izin bilgisi ve tarih korunur. Duplicate metin kontrolü ve kaydetme tek transaction'dadır.
Kelime kayıtları `vocabulary`, kaynak yanıtları `contentCache` tablosundadır.
Mevcut Save all / otomatik disk backup / tam JSON export-import akışı kullanılır.
Kişisel veriler temizlenmedi; IndexedDB/localStorage resetlenmedi.

Dosya işleme tarayıcıda yapılır. HTML, inert template içinde metne çevrilir;
script çalışmaz, resim/iframe yüklenmez. API'ye dosya değil seçilen kelime gönderilir.
PDF, yerel worker ile okunur. [Mozilla PDF.js belgeleri](https://mozilla.github.io/pdf.js/getting_started/)
esas alındı; `pdfjs-dist@6.4.299` gerekli tek doğrudan yeni bağımlılıktır.
PDF kodu/worker yalnız PDF ithalinde yüklenir. Üretim çıktısı: PDF modülü yaklaşık
429 KB (gzip 129 KB), worker 2,23 MB. Bu maliyet ilk uygulama yüküne eklenmez.
Apache 2.0 lisansı `public/licenses/PDFJS-LICENSE.txt` içinde tutulur.

Yerel sunucu açıkken saklanmış metinler ve önceden kaydedilmiş/cache'lenmiş anlamlar
ağ erişimi olmadan kullanılabilir. İlk dış kaynak sorguları internet ister.
Uygulamanın tamamı için bağımsız offline/PWA desteği iddia edilmez.

## Sınırlar

- Taranmış/resim PDF'lerde OCR yok; password-protected PDF için kilitsiz kopya gerekir.
- DOCX/EPUB/RTF importu yok: bu dosyaları TXT veya metin tabanlı PDF'ye aktar.
- Dosya başına 20 MB, PDF başına 500 sayfa, çıkarılmış metinde 2 milyon karakter
  teknik güvenlik sınırı vardır. Bunlar öğrenme/daily/new-word kotası değildir.
- PDF metin sırası kaynak belgedeki text layer'a bağlıdır; çok sütunlu belge
  düzeni özgün PDF gibi yeniden oluşturulmaz. Kaydetmeden önce önizleme yapılabilir.
- Markdown/CSV metin olarak okunur; tam Markdown sayfa renderer'ı değildir.
- Her kelimede ses veya kullanım örneği bulunmayabilir; eksik bilgi üretilmez.
- Wiktionary CC BY-SA ve Tatoeba kayıt bazlı lisans/atıfları gösterilir.
  Kendi metni için hak onayı kullanıcı beyanıdır, hukuki doğrulama değildir.

## Çalıştırılan doğrulamalar

Testler ayrı tarayıcı profillerinde, 5180/5181 ve üretim preview 5182 üzerinde
izole geçici disk depolarıyla çalıştırıldı. Kullanıcının 5173 oturumu kapatılmadı.
Kaldırılan sağlayıcılara bağımlı eski testler aktif Wiktionary şemasına;
poster zorunluluğu olan testler sakin Home Desk beklentisine güncellendi.

| Test | Sonuç |
|---|---:|
| workflows | 35/35 |
| regression | 9/9 |
| api-edgecases | 24/24 |
| grammar | 37/37 |
| local-persistence | 18/18 |
| source-ui | 10/10 |
| advanced-discovery | 15/15; 30 gerçek ardışık farklı kelime |
| reading-polish | 29/29 |
| content-integration | 29/29 |
| visual-identity | 22/22 |

Toplam: 228 kontrol başarılı. Ek olarak dört aktif kaynak canlı erişim testi,
font karakter kapsamı kontrolü, `npm run build` ve `npm run lint` başarılı.
HTTP edge-case testleri açıkça fixture/mocks kullanır; canlı kaynak erişimi ve
30 discovery kelimesi gerçek yanıtlarla ayrı kontrol edildi.

[Mozilla'nın gerçek örnek PDF'si](https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf)
geliştirme sürümünde ve derlenmiş preview'da yüklendi: 84.622 karakter çıkarıldı;
üretim tarayıcısında uncaught hata yok. Test PDF'si kişisel kitaplığa seed edilmedi.
TXT/MD/CSV/HTML, boş/binary/bozuk/unsupported/oversized dosyalar, rights onayı,
refresh, cache/offline, başka profil importu ve 1440/390px görünüm kontrol edildi.

Ekran görüntüleri gerçekten render edilip masaüstü/mobil görüntüler incelendi:
`docs/screenshots/reading-polish-2026-10-10/` ve
`docs/screenshots/quiet-home-validation-2026-10-10/`.
Yeni test ayrıntıları: `READING_POLISH_TEST_RESULTS_2026-10-10.json`.

## Oluşturulan / değiştirilen dosyalar

Yeni: `src/services/readingImport.ts`, `src/components/reading/ReadingVocabulary.tsx`,
`ReadingExamples.tsx`, `tests/reading-polish.cjs`, Wiktionary test fixture/atıf dosyaları,
PDF.js lisansı, bu rapor, test sonucu ve ekran görüntüleri.

Değişen uygulama dosyaları:

- `src/components/reading/{ReadingTools,ReadingView}.tsx`
- `src/components/dashboard/DashboardView.tsx`, `src/components/layout/Header.tsx`, `src/index.css`
- `src/components/library/{DictionaryLookup,DictionaryContent,ExternalWordContent,LibraryView,VocabularyDetailModal,VocabularyEditModal}.tsx`
- `src/components/daily/OpenEndedLearningView.tsx`, `src/components/flashcards/FlashcardView.tsx`
- `src/components/{review/ReviewCenterView,writing/WritingPracticeView,settings/SettingsView,import/ImportView,grammar/GrammarView}.tsx`
- `src/services/{dictionaryService,discoveryService,advancedDiscovery}.ts`
- `package.json`, `package-lock.json`

Test/doküman güncellemeleri:
`tests/{api-edgecases,content-integration,source-ui,live-api,grammar,advanced-discovery,visual-identity}.cjs`,
`README.md`, `docs/ADVANCED_DISCOVERY.md`, `docs/TECHNICAL_GUIDE.md`.
