# EnglishByDevotion — Test ve hata düzeltme raporu

Tarih: 10 Ekim 2026. Proje: `/Users/esra/Desktop/MyProjects/lexora`.

## Sonuç

Mevcut uygulama üzerinde artımlı düzeltmeler yapıldı; yeniden tasarlanmadı.
Kişisel tarayıcınızın IndexedDB verilerine dokunulmadı. Testler ayrı, geçici
Microsoft Edge profillerinde çalıştırıldı. Veritabanı şeması değiştirilmedi.

## Düzeltilen hatalar

- Flashcard değerlendirmesi sonrasında veri yenilenirken kartın tekrar başa dönmesi.
- Review Queue listesinin küçülmesinin aktif oturumun sırasını bozması.
- Son kartın tekrar tekrar değerlendirilmesi; artık bitiş ekranı gösteriliyor.
- Noktalama içeren kelimelerin (`c++` gibi) hem cümle hem collocation alıştırmalarında regex çökmesi.
- Yazma doğrulamasında `wintertime` gibi alt dizilerin `winter` kabul edilmesi; kelime sınırları kontrol ediliyor.
- Typed Recall doğrulamasında anlamlı noktalamanın silinmesi.
- Boş ipucu durumunda tamamen boş alıştırma ön yüzü.
- Eksik eski kayıtların yüklemeyi durdurması: güvenli varsayılanlar yalnızca okuma sırasında uygulanıyor; ham kayıtlar yeniden yazılmıyor.
- Var olmayan veritabanı indeksini kullanan zor kelime sorgusu.
- CSV virgül, çift tırnak, çok satırlı alan ve başlık eşleme hataları.
- JSON içe aktarmada sözlük ve cümle kaynak metadata bilgilerinin kaybolması.
- Aynı dosyadaki tekrarların önizlemede tespit edilmemesi.
- Geçersiz dosyanın hata mesajının ekrana ulaşmaması; sürükle-bırak işleminin uygulanmamış olması.
- İçe aktarmanın kayıt kimliğini, notları ve öğrenme geçmişini değiştirebilmesi.
- Yedek geri yüklemesinin mevcut verileri ezmesi veya yarım kalabilmesi: eklemeli ve atomik işlem yapılıyor.
- Kayıt başarısızken düzenleme formunun kapanması; artık taslak korunup hata gösteriliyor.
- Türkçe anlamı henüz olmayan kelimenin düzenleme formunda kaydedilememesi.
- Favori değiştirirken henüz kaydedilmemiş kişisel notların sıfırlanması.
- Continuous Study listesindeki çift kayıtlar ve bitince ilk kelimeyi tekrar gösterme.
- Kaydedilmiş varsayılan flashcard modunun yok sayılması.
- İstanbul'da gece yarısından sonra çalışma gününün UTC nedeniyle önceki gün görünmesi.
- Yeni eklenen ama çalışılmayan kelimenin günlük öğrenilen sayısına dahil edilmesi. Yeni çalışma olayları `dateLearned` ile kaydediliyor; geçmiş kayıtlara tahmini çalışma tarihi yazılmıyor.
- Ses iptal edildiğinde önceki düğmenin bekleyen işleminin sonlanmaması.
- Başlangıçta depolama hatasının sonsuz yükleme ekranına dönüşmesi.

Ekran düzeyi hata sınırı eklendi; bir ekranın render hatası bütün uygulamayı
boşaltmıyor. Depolama/kaydetme hataları temel öğrenme, not, düzenleme ve içe
aktarma akışlarında kullanıcıya gösteriliyor.

## Veri koruma davranışı

- Kelime ekleme varsayılan olarak tekrarları reddeder; aynı kimlik üzerine `put` yapmaz.
- Kelime güncellemesi birincil anahtarı değiştiremez; ad değişikliğinde tekrar kontrolü yapılır.
- Review kaydı ve SRS güncellemesi tek transaction içinde tutulur.
- Dosya içe aktarma tek transaction içinde yapılır. “Fill missing content” mevcut notları, SRS durumunu ve mevcut dolu alanları korur. “Import as new entries” yalnızca kullanıcının açıkça seçtiği tekrarlı içe aktarma seçeneğidir.
- Yedek geri yükleme mevcut kelimeleri ve tercihleri korur; eksik kelimeleri, logları ve günlük oturumları ekler. İlişkiler korunan kelime kimliklerine eşlenir.
- “Reset with Sample Vocabulary” yerine **Add Missing Sample Vocabulary** kullanılır. Artık kütüphane, notlar, loglar ve oturumlar silinmez.
- Kullanıcının bilerek boş bıraktığı, daha önce başlatılmış kütüphane yeniden açılınca otomatik doldurulmaz.

## Performans

- Ekranlar `React.lazy` ile gerektiğinde yüklenir. Önceki yaklaşık 529 kB tek JavaScript paketi yerine giriş paketi yaklaşık 310 kB; ilk yüklemede ayrıca yaklaşık 131 kB ortak paket bulunur. İlk JavaScript toplamı yaklaşık 441 kB'dır. Bu bir paket boyutu ölçümüdür, gerçek cihaz hızlanma yüzdesi değildir.
- Yenileme sırasında kelime tablosunun ikinci kez okunması kaldırıldı.
- Günlük loglar, timestamp indeksinden o günün aralığıyla alınır.
- İstatistikler tüm logları belleğe yükleyip sıralamak yerine indeksli sayımlar ve son 20 kayıt üzerinden çalışır.
- Kütüphane ilk 60 kartı gösterir; “Show more words” ile 60'ar kart yüklenir. Filtreleme tüm kayıtlar üzerinde devam eder.
- Kar animasyonu sekme gizliyken yeni animasyon frame'leri planlamaz; mevcut görünüm ve baykuşlar korundu.
- Mobil flashcard iç boşlukları dar ekrana uygun hâle getirildi. Special Elite, VT323 ve mevcut pixel fontları korundu.

## Başlatma kısayolu

Proje klasöründeki **EnglishByDevotion.command** dosyasına Finder'da çift tıklayın.
Terminal açılır, yerel sunucu başlar ve `http://localhost:5173` tarayıcıda açılır.
Terminali açık tutun; kapatmak için Ctrl+C kullanın.

Başlatıcı çalışan EnglishByDevotion sunucusunu yeniden kullanır. Port başka bir
uygulama tarafından kullanılıyorsa durur; başka porta sessizce geçmez.
Node.js ve kurulmuş proje bağımlılıkları gerekir. Bağımlılıklar eksikse açıklama
gösterir; otomatik hesap açma veya ücretli servis kullanımı yoktur.

Veriler tarayıcıya ve adrese bağlıdır. Öncekiyle aynı tarayıcıyı ve
`http://localhost:5173` adresini kullanın. Daha önce `127.0.0.1` kullandıysanız o
adresin IndexedDB alanı ayrıdır; bu, verilerin silindiği anlamına gelmez.

## Çalıştırılan testler

| Komut / kontrol | Sonuç |
| --- | --- |
| `npm run build` | TypeScript ve Vite üretim derlemesi başarılı |
| `npm run lint` | Başarılı; uyarı yok |
| `node tests/regression.cjs` | 9/9 kontrol başarılı |
| `node tests/workflows.cjs` | 35/35 kontrol başarılı |
| `node tests/content-integration.cjs` | 29/29 kontrol başarılı |
| `node tests/font-validation.cjs` | Special Elite ve VT323 Türkçe karakter kapsamı başarılı |
| `zsh -n EnglishByDevotion.command` | Betik sözdizimi başarılı |
| `zsh EnglishByDevotion.command --check` | Gerçek kısayol betiğinin hazırlık kontrolü başarılı |
| `node scripts/start.mjs --smoke --port 5174` | Ayrı test portunda açılış, HTTP erişimi ve kapanış başarılı |
| `node scripts/start.mjs --no-browser` | Mevcut sunucuyu tekrar açmadan kullanma başarılı |

Toplam 73 tarayıcı/entegrasyon kontrolü başarılı. Son başarılı turlarda yakalanmamış
tarayıcı hatası yok. Altı flashcard modu, review ilerlemesi, oluşturma, tekrar
engelleme, notlar, writing, CSV yükleme, bozuk dosya, yedek veri koruması,
Continuous Study bitişi, boş kütüphane, 500 ek kayıt ve 10 ekranın hem 1440 px hem
390 px görünümü kontrol edildi. Mobil ekran görüntüsü de görsel olarak incelendi.

Testleri yeniden çalıştırmak için geliştirme sunucusunu açın. Tarayıcı testleri
bu makinedeki Playwright çalışma ortamını ve Microsoft Edge'i kullanır. Başka
makinede `LEXORA_PLAYWRIGHT_MODULE`, `LEXORA_BROWSER` ve gerekirse
`LEXORA_TEST_URL` ortam değişkenlerini ayarlamak gerekir.

## Eklenen dosyalar

- `EnglishByDevotion.command`
- `scripts/start.mjs`
- `src/components/common/ErrorBoundary.tsx`
- `src/services/vocabularyValidation.ts`
- `src/services/textMatching.ts`
- `tests/regression.cjs`
- `tests/workflows.cjs`
- `BUGFIX_REPORT.md`

## Değiştirilen dosyalar

- `src/App.tsx`, `src/types/vocabulary.ts`
- `src/services/db.ts`, `srs.ts`, `importer.ts`, `dictionaryService.ts`, `speech.ts`
- `src/components/common/AudioButton.tsx`, `EmptyState.tsx`, `Modal.tsx`, `Snowfall.tsx`
- `src/components/flashcards/FlashcardView.tsx`
- `src/components/review/ReviewCenterView.tsx`
- `src/components/daily/OpenEndedLearningView.tsx`
- `src/components/writing/WritingPracticeView.tsx`
- `src/components/library/LibraryView.tsx`, `VocabularyDetailModal.tsx`, `VocabularyEditModal.tsx`
- `src/components/statistics/StatisticsView.tsx`
- `src/components/import/ImportView.tsx`
- `src/components/settings/SettingsView.tsx`
- `package.json`, `README.md`
- `dist/`: üretim derlemesi tarafından yeniden oluşturuldu.

## Sınırlar

- Safari ve Firefox ayrıca test edilmedi. Finder'daki fiziksel çift tıklama ve duyulabilir ses çıktısı otomasyonla denenmedi; başlatıcı betiği ve sunucu yaşam döngüsü test edildi.
- Dictionary API entegrasyon testleri gerçek kaydedilmiş yanıt fixture'ı kullanır; dış servisin sürekli erişilebilir olduğu iddia edilmez. Mevcut API kesintisi/timeout sınırlamaları sürer.
- Tam çevrimdışı uygulama açılışı garanti edilmez; service worker yok. Uygulama yüklüyken kaydedilmiş içerik ve cache yerel olarak erişilebilir.
- Günlük ilk öğrenme tarihi olmayan eski kayıtlara tarih uydurulmadı. Geçmiş SRS/loglar korundu; yeni çalışmalar tarih kaydeder.
- Bu testler kapsanan akışları doğrular; her olası cihaz/veri kombinasyonunda hata bulunmadığı garantisi değildir.
