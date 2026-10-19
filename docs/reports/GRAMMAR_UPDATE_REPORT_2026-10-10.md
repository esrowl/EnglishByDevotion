# EnglishByDevotion — Grammar güncellemesi ve doğrulama

Esra · 10 Ekim 2026 · Artımlı güncelleme

Ana proje: `/Users/esra/Desktop/MyProjects/EnglishByDevotion`.
İstekteki eski `lexora` klasör adı yerine önceki taşıma sırasında verilen ürün
adı korunmuştur. Yeni uygulama veya yeni kullanıcı veritabanı oluşturulmadı.

## Tamamlanan kapsam

### 1. Grammar içeriği

13 tamamlanmış ders; her birinde giriş, kullanım amacı, üç yapı/formül, üç
açıklamalı örnek, iki yanlış/doğru karşılaştırması, özet/istisnalar, beş pratik
sorusu, cevap açıklamaları ve kaynak bağlantıları bulunur. Bölümler:
Learn → Understand → Observe → Common mistakes → Practice → Summary → Review.

| Öğretim grubu | Dersler |
| --- | --- |
| Foundations | Articles; Subject–verb agreement |
| Intermediate | Present simple vs continuous; Past simple vs continuous; Perfect forms; Future forms; Modal verbs; Passive voice; Relative clauses; Gerunds and infinitives |
| Upper Intermediate | Conditionals; Reported speech |
| Advanced | Inversion |

Gruplar resmî CEFR sınıflaması değildir. Henüz yazılmamış konular mevcut ders
gibi gösterilmez. İçerik özgün açıklama ve örneklerden oluşur; ticari dersler
kopyalanmadı. Referanslar derslerin sonunda görünür. Başlıca danışılan kaynaklar:
[British Council articles](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2-grammar/articles-a-an-the),
[British Council inversion](https://learnenglish.britishcouncil.org/free-resources/grammar/c1/inversion-after-negative-adverbials),
[Cambridge infinitives](https://dictionary.cambridge.org/grammar/british-grammar/infinitives).

### 2. Gerçek cevap değerlendirmesi

65 sabit, konuya bağlı soru; her ders bir multiple-choice, fill-in-the-blank,
error-identification, sentence-ordering ve structure-recognition sorusu içerir.
Her soru açık doğru cevap, varsa alternatif, gerekçe ve gerektiğinde düzeltilmiş
cümle içerir. Yanlış cevapta yalnız “Incorrect” değil kural ve doğru cevap da gösterilir.

Normalizasyon Unicode NFC, büyük/küçük harf, boşluk, sıradan noktalama ve kıvrık
apostrof farklılıklarını giderir. Anlamlı apostrof ve tire korunur. Cümle sıralama
soruları başlangıç kelimesini ve hedef yapıyı belirtir; kullanıcı kelimelere
tıklayabilir veya cevabı yazabilir. Serbest yazının doğruluğu bu yöntemle
değerlendirilmez. Boş cevap ve tanımlanmamış seçenek kayıt edilmez.

### 3. İlerleme, resume ve review

Dexie sürüm 4 yalnız iki depo ekler: `grammarProgress` ve `grammarAttempts`.
Önceki altı depo, anahtarlar, notlar ve kelime SRS kayıtları değiştirilmez.
Açılma, okuma tamamlanması, son çalışma, bölüm ve aktif oturum saklanır;
cevaplardan toplam/başarılı/başarısız deneme, son performans ve tekrar tarihi türetilir.
Yenilemede aynı bölüm ve ilk cevaplanmamış sorudan devam edilir. Oturumu tekrar
etmek geçmişi silmez. Aynı oturumdaki aynı sorunun ilk cevabı transaction ile korunur.

Durumlar: Not Started, In Progress, Practicing, Needs Review, Mastered.
Mastered için tamamlanmış okuma, en az %80 başarılı tam oturum, en az 24 saat
sonra en az %80 başarılı tam **review** ve son 10 cevapta en az %80 gerekir.
Okumak veya aynı gün kusursuz tekrar yapmak tek başına mastery sağlamaz.
Zayıf/gecikmiş konular filtrelenebilir. Bu ölçüt öğrenme sezgiseldir, sınav sertifikası değildir.

Tam JSON export/import, disk yedeği ve cache temizleme Grammar verisini korur.
Eski yedekler uyumludur. Çelişen Grammar deneme kimliği tüm import'u geri alır.
Grammar verisini içermeyen eski istemcinin yeni disk snapshot'ını ezmesi engellenir.

### 4. Practice Lab temizliği

Continuous Study içindeki Write a Sentence / Sentence Studio girişleri kaldırıldı:
mevcut uygulama yalnız kelimenin metinde geçtiğini buluyordu, grammar kontrol etmiyordu.
Kişisel yazı özelliği **Writing Notes** olarak korundu; değerlendirilmediği açıkça
yazıyor. Hedef kelime ve collocation eşleşmesi sadece metin eşleşmesi olarak etiketlendi.
Mevcut örnek kaydetme, notlar ve kelime verileri korunur.

Flashcards'ın altı modu, Review Center, Continuous Study Discover/Flashcard,
Vocabulary Library ve kelime SRS korunur. Hedef kelimeyi yazma kontrolü, anlamca
her yerde eşdeğer olmayan rastgele eş anlamlıları artık doğru saymaz. Diğer
self-assessment modları açıkça kişisel değerlendirmedir. Yeni vocabulary soru
üretim motoru veya AI checker eklenmedi.

### 5. Tipografi ve görsel iyileştirme

Uygulama kaynakları yalnız üç font ailesi kullanır:

| Font | Kullanım |
| --- | --- |
| Pixelify Sans | ürün adı, sayfa/bölüm/Grammar başlıkları |
| Handjet | İngilizce kelimeler, flashcard kelimeleri, önemli etkileşim etiketleri |
| VT323 | tanım, Türkçe, örnek, Grammar, okuma, yardımcı metin ve kontroller |

Fontlar yerel ve lisans dosyalarıyla paketlidir. Pixelify Sans/Handjet değişken
font dosyaları Google Fonts deposundan alınmıştır. Türkçe küçük/büyük karakterler
üç fontta ayrı ayrı doğrulandı. Ortak CSS token'ları, responsive ölçüler ve
word wrapping kullanılır. Kelime 36–44 px, flashcard 40–48 px, liste 26–32 px,
açıklama 22–25 px, grammar/okuma 23–26 px hedeflenir.

Eski aktif font referansları kaldırıldı. Kullanılmayan eski font dosyaları
silinmeden `/private/tmp/ebd-retired-font.y8Eze2/` klasörüne taşındı (geçici
arşiv kalıcı yedek değildir). Tarihli eski raporlar geçmişte kullanılan fontları
belgelemeye devam eder; bu raporlar aktif uygulama stilini tanımlamaz.

Referanslardan krem/mavi renk blokları ve devre/wireframe dili alındı. Koyu temel,
baykuşlar, kar ve düzen korunur. Daha yumuşak turkuaz, bilgisayar mavisi, muted
coral/yellow/orange token'ları seçili durumlarda kullanılır. Grammar girişinde
düşük opaklıklı ince SVG devre deseni, Dashboard'da küçük statik SVG wireframe
küre vardır. Ağır 3D/animasyon bağımlılığı yoktur. Reduced-motion CSS ile
desteklenir; kar efekti tercih çalışma sırasında değiştiğinde de durur.

### 6. Dosyalar

Yeni:

- `src/types/grammar.ts`
- `src/data/grammarLessons.ts`, `src/data/grammarExercises.ts`
- `src/services/grammarService.ts`, `src/services/grammarValidation.ts`
- `src/components/grammar/GrammarView.tsx`
- `src/components/common/WireframeGlobe.tsx`
- `public/assets/circuit-pattern.svg`
- `public/fonts/PixelifySans-Variable.ttf`, `Handjet-Variable.ttf` ve iki OFL lisansı
- `tests/grammar.cjs`
- bu rapor

Değişen:

- `src/services/db.ts`, `scripts/server/localServer.mjs`
- `src/App.tsx`, `src/index.css`, `index.html`
- `src/components/layout/Sidebar.tsx`, `Header.tsx`
- `src/components/daily/OpenEndedLearningView.tsx`
- `src/components/writing/WritingPracticeView.tsx`
- `src/components/flashcards/FlashcardView.tsx`
- `src/components/dashboard/DashboardView.tsx`
- `src/components/common/RetroComputerOwl.tsx`, `Snowfall.tsx`
- `package.json` (yalnız test:grammar script'i; bağımlılık eklenmedi)
- `tests/font-validation.cjs`, `content-integration.cjs`, `workflows.cjs`, `local-persistence.cjs`
- `README.md`, `docs/TECHNICAL_GUIDE.md`, `docs/DATA_PORTABILITY.md`

## Gerçekten çalıştırılan doğrulama

| Komut / suite | Sonuç |
| --- | --- |
| npm run test:grammar | 37/37 |
| npm run test:workflows | 35/35 |
| npm run test:content | 29/29 |
| npm run test:regression | 9/9 |
| npm run test:api | 24/24 |
| npm run test:storage | 16/16 |
| npm run test:fonts | üç fontun Türkçe glifleri başarılı |
| npm run lint | başarılı, uyarı yok |
| npm run build | başarılı |

Toplam **150 adlandırılmış otomatik kontrol**; font/build/lint ayrı doğrulamalardır.
Grammar testi tüm 65 sorunun anahtarlarını ve açık alternatiflerini, yanlış/boş
cevapları, beş türün gerçek UI grading'ini, yanlış cevap açıklamasını, refresh
resume, zayıf konu review, completion≠mastery, gecikmiş mastery koşulunu,
mükerrer gönderimi, v3→v4 kayıt korumasını, JSON taşımayı ve atomik import
rollback'i kapsar. Yüklenmiş uygulamada offline Grammar cevaplama da test edildi.
Depolama testi Grammar'ın disk yedeğini, cache temizliğinde korunmasını ve eski
istemcinin alanları atlayarak yedek ezmesini reddetmeyi kapsar.

Headless Microsoft Edge, ayrı geçici profiller ve ayrı 5180 test sunucusu
kullanıldı; kişisel browser IndexedDB veya disk yedekleri testlere verilmedi.
1440 ve 390 px ekranlarda overflow ve computed font kontrolü yapıldı;
ekran görüntüleri görsel olarak incelendi. Uncaught UI exception görülmedi.
İlk Grammar test koşularındaki yükleme zamanlaması ve yanlış DOM seçicileri
düzeltildi; son koşu 37/37 geçti. Bunun tüm tarayıcı/ekranlarda kusursuzluk
garantisi olduğu iddia edilmez.

Grammar ekranı ayrı lazy chunk'tır: son build yaklaşık 51.94 kB (gzip 16.96 kB).
Ana JS yaklaşık 323.94 kB (gzip 95.88 kB). Yeni runtime bağımlılığı yoktur.

## Sınırlar ve sonraya bırakılanlar

- Önerilen tüm Grammar konuları değil, 13 tamamlanmış ders sunulur. Konu başına
  beş sabit soru başlangıç kapsamıdır; geniş soru bankası ve uzman eğitimci
  denetimi ileride yapılabilir. Otomatik kontroller dil uzmanı incelemesinin yerine geçmez.
- 24 saatlik mastery şartı kontrollü test tarihleriyle sınandı; gerçek zamanda
  24 saat beklenerek test edilmedi. Okuma tamamlandı işareti kullanıcı beyanıdır.
- Serbest yazı otomatik grammar/usage notu almaz; açık form taslakları Save all
  tarafından sessizce kaydedilmez.
- Grammar yerel içeriktir; uygulama yüklenmişken internet gerekmez. Tam offline
  başlangıç/PWA, kapalı sunucuyla çalışma veya tüm browser'lar doğrulanmadı.
- Bu turda yeni dış API, büyük dataset, vocabulary generator, adaptive vocabulary
  motoru veya AI writing değerlendirmesi eklenmedi. API suite deterministik
  hata/edge-case testidir; canlı sağlayıcı erişimi bu turda yeniden ölçülmedi.
- Kullanıcının gerçek verisi test edilmedi; migrasyon ve koruma ayrı profillerde
  temsili eski kayıtlar ile doğrulandı. Harici JSON yedeği tutmak yine önemlidir.
