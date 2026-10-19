# EnglishByDevotion — görünür retro computing güncellemesi

Esra · 10 Ekim 2026

Mevcut proje `/Users/esra/Desktop/MyProjects/EnglishByDevotion` altında düzenlendi.
İstekteki eski `lexora` yolu artık mevcut değil. Yeni uygulama kurulmadı.

## Önceki değişiklik neden yeterince görünmüyordu?

- Root token'ları hâlâ `#11133D` / `#181A4E` lacivertti; body de doğrudan lacivert kullanıyordu.
- App, Header, Sidebar ve Dashboard kendi sabit Tailwind HEX sınıflarını taşıyordu.
- Vocabulary/Flashcards/Review/Settings gibi ekranlarda ayrı mor-kahverengi palet,
  büyük radius ve bulanık gölgeler vardı. Token değişikliği bunları etkilemiyordu.
- Dashboard dağ görseli ve lacivert gradient kaplamalarından oluşuyordu.
- Wireframe yalnız 96 px, düşük opaklıklı statik SVG idi; circuit sadece Grammar
  girişinde %9 opaklıkla görünüyordu.
- `src/main.tsx` doğru `index.css` dosyasını yüklüyor. Eski `App.css` aktif ekran
  stilini yönetmiyor. Doğrulanan sorun cache değil, kaynakta kalan bağımsız stillerdi.

## Gerçek palet

| Rol | HEX |
| --- | --- |
| Ana zemin | `#08090B` |
| Opak panel | `#111217` |
| Yükseltilmiş/hover yüzey | `#1C1E23` |
| Ana krem metin | `#F4D5A3` |
| Uzun metin/ivory | `#F5E8CE` |
| İkincil metin | `#C1B59F` |
| İnce panel çerçevesi | `#6D6658` |
| Commodore blue | `#2386B3` |
| Koyu zeminde mavi metin | `#67BCE2` |
| Olive/lime başarı | `#A0B52B` |
| Golden yellow | `#F5B51B` |
| Tangerine orange | `#EF741C` |
| Koyu zeminde turuncu metin | `#FFA865` |
| Retro pink | `#D83B70` |
| Koyu zeminde pembe metin | `#F18AAD` |
| Cyber blue / mesh taban grid | `#3048DB` |
| Cyber green / mesh | `#58C96E` |

İlk referansın siyah/krem temeli ve mavi–olive–sarı–turuncu–pembe blokları
doğrudan ana yön olarak kullanıldı. İkinci referansın teknik mesh/grid ve devre
dili kullanıldı; collage veya Japonca dekoratif yazı kopyalanmadı.

Renkli dolgu düğmeleri koyu metin kullanır; mavi metnin koyu zemindeki karşılığı
daha açık ayrı token'dır. Learning metinleri için render üzerinden 4.5:1 minimum
kontrast kontrolü yapıldı. Bu, tüm arayüz için kapsamlı WCAG sertifikası değildir.

## Bileşenler ve görünür değişiklikler

- Header/brand: krem Pixelify başlık, teknik kod, devre detayları, siyah ayırıcılar
  içeren beş renkli düz bant; mevcut baykuş korunur.
- Navigation: siyah yüzey, köşeli mavi selected blok, sarı sol işaret, açık mavi
  ikonlar, krem metin. Menü sırası ve davranışı aynı.
- Buttons: düz blue/yellow/orange/pink dolgu, koyu metin, keskin siyah gölge;
  secondary krem çerçeve. Blur/glass ve düğme gradient'i yok.
- Dashboard: lacivert kaplamalar kaldırıldı; mevcut dağ görseli %10 gri ikincil
  atmosferdir. Büyük mesh terminali, devre yüzeyi, golden sistem şeridi ve dört
  farklı renkli metric titlebar görünür. Winter/snow ve baykuş korunur.
- Vocabulary: opak charcoal kartlar, mavi üst çizgi, düz çerçeveler, krem kelime
  ve açıklama. Form/filter/modal/detail ve sözlük sonuçları aynı palete taşındı.
- Continuous Study/Writing Notes/Flashcards/Review: opak paneller, okunaklı input,
  köşeli kontroller. Recall rating renkleri pink/orange/yellow/green; deterministic
  doğru/yanlış feedback green/pink. Davranış ve değerlendirme mantığı değişmedi.
- Grammar: kategori çizgileri olive/blue/yellow/pink; siyah/krem opak ders yüzeyi,
  sarı formüller, mavi selected tab/choice, green/pink feedback. Ders ve anahtarlar aynı.
- Reading, Import, Statistics ve Settings de aynı ortak palet ve framing'i kullanır.

İlk görsel incelemede koyulaşan yüzeylerde eski `text-black` sınıfları görüldü ve
krem metinle değiştirildi. Şeffaf panel dolguları opaklaştırıldı; devreler uzun
tanımların arkasından görünmez. Eski palette göre büyük yuvarlatmalar ve blur
gölgeler aktif UI bileşenlerinden kaldırıldı; küçük durum noktaları/rozetler korunur.

## Circuit uygulaması

`public/assets/circuit-pattern.svg`: gerçek bağlı yatay/dikey yollar, paralel
traces, 90° dönüşler, dairesel temas noktaları ve koordinat detayı. Blue/green/cream
stroke kullanır. Main ve Header daha seyrek/düşük yoğunluklu background; Dashboard
%38, Grammar intro %28 katman kullanır. Ders/okuma/vocabulary metin panelleri
opak ve patternsizdir. Yeni grafik kütüphanesi yok.

## Wireframe uygulaması

`WireframeGlobe.tsx` artık native Canvas kullanır. Küre noktaları enlem/boylamdan
3D koordinata çevrilir; yaw dönüşü, tilt ve perspective projection ile çizilir.
Ön mesh green, arka mesh translucent blue; altındaki perspective grid cyber blue.
Teknik köşe işaretleri ve display labels vardır. Genel bir gradient disk değildir.

320×280 mantıksal canvas; device-pixel ratio en çok 2. Çizim en çok yaklaşık
20 fps, yavaş dönüş; gizli sekmede durur. Reduced-motion başlangıçta ve çalışma
sırasında değiştiğinde statik görünüm; unmount'ta animation/listener temizlenir.
WebGL, Three.js veya başka dependency yok. Canvas olmayan ortamlarda dekorasyon
çizilmeyebilir; öğrenme işlevi buna bağlı değildir. Ayrıntılı CPU/FPS benchmark yapılmadı.

## Fontlar

Yalnız Pixelify Sans (başlık), Handjet (kelime/önemli etiket), VT323
(tanım/çeviri/grammar/okuma/yardımcı metin/kontrol). Yerel dosyalar ve mevcut lisanslar
korundu; yeni font veya harici font isteği eklenmedi. Türkçe küçük/büyük glif testleri geçti.

## Dosyalar

Stil/bileşen değişiklikleri:

- `src/index.css`, `src/App.tsx`
- `src/components/common/WireframeGlobe.tsx`, `Modal.tsx`, `Badge.tsx`, `AudioButton.tsx`, `EmptyState.tsx`
- `src/components/layout/Header.tsx`, `Sidebar.tsx`, `StorageControls.tsx`
- `src/components/dashboard/DashboardView.tsx`
- `src/components/library/LibraryView.tsx`, `VocabularyDetailModal.tsx`, `VocabularyEditModal.tsx`,
  `DictionaryLookup.tsx`, `DictionaryContent.tsx`, `ExternalWordContent.tsx`, `WordDiscovery.tsx`
- `src/components/daily/OpenEndedLearningView.tsx`
- `src/components/flashcards/FlashcardView.tsx`, `review/ReviewCenterView.tsx`, `writing/WritingPracticeView.tsx`
- `src/components/reading/ReadingView.tsx`, `ReadingTools.tsx`
- `src/components/import/ImportView.tsx`, `statistics/StatisticsView.tsx`, `settings/SettingsView.tsx`
- `public/assets/circuit-pattern.svg`

Doğrulama/doküman:

- Yeni `tests/visual-identity.cjs`; mevcut `tests/grammar.cjs` dekorasyon kontrolünün
  opaklık eşiği yeni görünür pattern'a göre güncellendi.
- Bu rapor, README/teknik rehber güncellemesi ve `docs/screenshots/retro-computing-2026-10-10/` PNG'leri.
- `dist/` üretim çıktısı yeniden üretildi. `package.json` ve bağımlılıklar değiştirilmedi.

DB/service/SRS/lesson/answer-key/data kaynakları değiştirilmedi. IndexedDB reset,
localStorage temizleme veya kişisel yedek silme yapılmadı.

## Ekran görüntüleri ve gerçek görsel doğrulama

Uygulama çalıştırıldı; ayrı headless Edge profilinde 1440 px ve 390 px ekranlar
yakalandı ve görsel olarak incelendi. Testler ayrı 5180 sunucusundaki geçici disk
deposuna yazdı, kişisel uygulama verisine değil. Visual suite uygulamanın gerçek
yerel başlangıç kelimelerini kullanır; sahte kaynak başarısı simüle edilmez.

[Önce](../screenshots/retro-computing-2026-10-10/before-dashboard.png) ·
[Yeni Dashboard aynı viewport](../screenshots/retro-computing-2026-10-10/dashboard-viewport.png) ·
[Tam Dashboard](../screenshots/retro-computing-2026-10-10/dashboard-1440.png) ·
[Vocabulary](../screenshots/retro-computing-2026-10-10/vocabulary-1440.png) ·
[Continuous Study](../screenshots/retro-computing-2026-10-10/continuous-study-1440.png) ·
[Grammar Library](../screenshots/retro-computing-2026-10-10/grammar-library-1440.png) ·
[Grammar lesson](../screenshots/retro-computing-2026-10-10/grammar-lesson-1440.png) ·
[Incorrect feedback](../screenshots/retro-computing-2026-10-10/grammar-incorrect-1440.png) ·
[Correct feedback](../screenshots/retro-computing-2026-10-10/grammar-correct-1440.png) ·
[Writing Notes](../screenshots/retro-computing-2026-10-10/practice-notes-1440.png) ·
[Review](../screenshots/retro-computing-2026-10-10/review-1440.png) ·
[Flashcards](../screenshots/retro-computing-2026-10-10/flashcards-1440.png) ·
[Reading](../screenshots/retro-computing-2026-10-10/reading-1440.png) ·
[Statistics](../screenshots/retro-computing-2026-10-10/statistics-1440.png) ·
[Import](../screenshots/retro-computing-2026-10-10/import-1440.png) ·
[Settings](../screenshots/retro-computing-2026-10-10/settings-1440.png) ·
[Mobil Dashboard](../screenshots/retro-computing-2026-10-10/dashboard-390.png) ·
[Mobil Vocabulary](../screenshots/retro-computing-2026-10-10/vocabulary-390.png) ·
[Mobil Grammar](../screenshots/retro-computing-2026-10-10/grammar-390.png).

1440×1000 önce/sonra screenshot karşılaştırmasında piksellerin yaklaşık **%69.5**'i
belirgin değişti (RGB toplam farkı >60). Yeni görüntünün **%82.5**'i siyaha yakın
(R<36, G<36, B<40). Bu bir estetik puanı değildir; renk değişiminin render edilmiş
görüntüde gerçekten var olduğuna ilişkin ölçümdür.

## Doğrulama sonuçları

| Çalıştırılan komut | Sonuç |
| --- | --- |
| node tests/visual-identity.cjs | 22/22 |
| npm run test:grammar | 37/37 |
| npm run test:workflows | 35/35 |
| npm run test:regression | 9/9 |
| npm run test:content | 29/29 |
| npm run test:fonts | başarılı; üç font Türkçe glifleri |
| npm run lint | başarılı, uyarı yok |
| npm run build | başarılı |

Toplam 132 adlandırılmış kontrol; font/build/lint ayrı. İlk visual koşularındaki
Reading/Grammar yanlış hazır-ekran seçicileri düzeltildi. Kontrast testi ayrıca
tarayıcının CSS Color 4 `color(srgb ...)` çıktısını Canvas ile doğru çözecek şekilde
düzeltildi; son sonuçlar gerçek render renklerine dayanır.

Visual suite near-black yüzeyleri, tüm paleti, üç font kuralını, learning text
kontrastını, köşeli formları, overflow'u, gerçekten çizilmiş/dönen mesh'i,
reduced-motion'da durmasını, feedback renklerini, navigasyonda kelime/not/SRS
kayıtlarının aynen kalmasını ve uncaught browser hatalarını kontrol eder.
Workflows tüm mevcut bölümlerin masaüstü/mobil navigasyonunu ayrıca kapsar.

Son build CSS yaklaşık 62.10 kB / gzip 11.12 kB, ana JS 330.66 kB / gzip 96.44 kB.
Grammar lazy chunk içeriği önceki sürümle aynı: 51.94 kB / gzip 16.96 kB.

Tekrar: 5180 izole sunucuyu `EBD_STORAGE_DIR` geçici klasörle başlat, ardından
`EBD_TEST_URL=http://127.0.0.1:5180 node tests/visual-identity.cjs` çalıştır.
Regresyonların eski `LEXORA_TEST_URL` değişkenini aynı adrese yönlendir.

## Sınırlar

İstenen görsel kapsam uygulanıp render edildi; mesh hand/çoklu 3D obje özellikle
eklenmedi, tek küre tercih edildi. Testler Edge/macOS ve iki viewport içindir;
tüm tarayıcı, ekran okuyucu veya tüm metinlerde formal erişilebilirlik audit'i
yapılmadı. Fotoğraf referanslarının tüm renkleri bir anda her panelde kullanılmaz;
siyah/krem temel, kontrollü düz accent dağılımı tercih edildi. Canvas dekorasyon
olduğundan öğrenme içeriği veya kişisel veri üzerinde etkisi yoktur.
