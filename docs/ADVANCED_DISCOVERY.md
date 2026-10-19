# Advanced vocabulary discovery — EnglishByDevotion / Esra

## Kapsam ve veri kaynakları

Continuous Study varsayılan olarak kişisel kütüphaneden değil, ayrı NGSL keşif havuzundan yeni kelime seçer. My Saved Words mevcut kişisel çalışma akışını, Flashcard Drill mevcut tekrar sistemini korur. Tasarım/palet/fontlar değiştirilmedi.

`public/datasets/ngsl/ngsl.csv`: 2.809 core kaydı. `ngsl_sfi_31k.csv`: 31.239 extended kaydı. İkisi de orijinal yazım/büyük harf ve sıralarıyla saklanır. Extended dosyanın SHA256 değeri gönderilen Downloads dosyasıyla birebir aynıdır. Core ve extended sıraları farklı listelerdir; filtre küçük harfe/NFC'ye normalize edilmiş kelime üyeliğine göre uygulanır. Core listedeki bir kelime extended dosyada bulunmadığından kesişim 2.808'dir; bağımsız core deposunun 2.809 kaydı yine korunur.

Kaynak: https://github.com/kami-mura/ngsl-wordlists — Charles Browne, Brent Culligan ve Joseph Phillips / New General Service List; CSV paketleme kami-mura. Dataset CC BY-SA 4.0 lisansı ve atıf bilgisi aynı klasörde bulunur. Extended sıralar bu dağıtımın SFI'ye göre sıraladığı frequency ranks'tir; resmi CEFR seviyeleri veya doğrulanmış kelime zorluğu değildir.

## Seçim

| Extended SFI sırası | Başlangıç ağırlığı |
| --- | --- |
| 2810–5000 | %15 |
| 5001–10000 | %35 |
| 10001–20000 | %40 |
| 20001–31239 | %10 |

Önce core üyeliği, zaten karşılaşılan kelimeler, kişisel kayıtlı kelimeler, geçersiz lookup biçimleri ve seçilen sağlayıcıda kullanılamayan kayıtlar elenir. Uygun bandın içinde eşit olasılıklı seçim yapılır. Boşalan bantların ağırlıkları kalan bantlara normalize edilir. Bu yüzden son gösterilen kelime dağılımı sözlük bulunabilirliği ve havuzun tükenmesinden etkilenebilir; %15/%35/%40/%10 sonuç garantisi değildir.

Seçilen kelime gerçek dictionary adapter'ından kullanılabilir İngilizce tanım almadıkça gösterilmez. Aktif kaynak Wiktionary'dir. Timeout veren Free Dictionary API kaldırıldı; eski sağlayıcı tercihi kayıtları silinmeden okuma sırasında Wiktionary olarak yorumlanır. Bilinmeyen/geçersiz sözlük kaydı sadece ilgili sağlayıcı için elenir. 429/5xx/timeout/bağlantı hatası karşılaşma veya kalıcı kullanılamaz işareti üretmez. Bir tıklamada en fazla 16 adayın sözlük doğrulaması denenir; bu günlük/kelime kotası değil, ağ işini sınırlayan batch'tir. Retry yeni adaylarla devam eder.

Başarılı sözlük verisi mevcut contentCache'e yazılır. Son atomic transaction, iki sekmenin aynı kelimeyi yeni keşif olarak kabul etmesini engeller. Kelime seçimi karşılaşma kaydı oluşturur; kişisel kütüphane veya öğrenilmiş durum oluşturmaz. Sayfa yenilendiğinde yeni-word mode önceki karşılaşmaları tekrarlamaz. Başlangıç/rütbe bilgisi kendi alanlarında tutulur; CEFR uydurulmaz.

## Üç eylem

- **Already Know:** kişisel aşinalık beyanı; mastery, SRS veya kişisel kelime kaydı oluşturmaz.
- **Learn This Word:** gerçek sözlük verisini kişisel kütüphaneye `learning` durumuyla ekler; frequencyRank ve frequencySource korunur. `dateLearned` veya mastery verilmez. Aynı kelime başka sekmede kaydedildiyse mevcut not/SRS/ilerleme değiştirilmez ve mükerrer oluşturulmaz.
- **Next Word:** `skipped` geri bildirimini kaydeder; öğrenilmiş saymaz veya kütüphaneye eklemez.

Tekrarlanan gönderim idempotent'tir. Bir karşılaşmaya kaydedilen geri bildirim sonraki yanlışlıkla gönderilen tıklamayla ezilmez. Core kelimeler sadece bu yeni keşif modundan hariçtir; kişisel kayıtları silinmez, sözlük araması ve normal imports/flashcards kullanılabilir.

## Performansa dayalı uyarlama

Frequency preference: Balanced, More frequent, Less frequent. Tercih kalıcıdır ve sonraki seçime uygulanır. Ağırlıklar 1.18 tabanlı küçük bir eğimle kaydırılır; adaptif düzey -2..2 arasında tutulur. Nadirlik bir zorluk ölçümü olarak sunulmaz.

Typed Recall'ın hedef headword sorusunda Submit Answer, ayrı recallAttempts kaydı üretir. Doğru/yanlış: NFC, case, baş/son boşluk ve art arda boşluk farklarına toleranslı tam hedef eşleştirmesidir. Bu serbest yazı grammar değerlendirmesi değildir. Manuel self-rating veya sonradan “kabul et” seçeneği bu objektif submission sonucunu değiştirmez. Aynı submission iki kere sayılmaz.

Adaptasyon yalnız NGSL'den aktif öğrenmeye seçilmiş kelimelerin verisini kullanır. Son pencerede en az 3 farklı çalışma günü, son değerlendirmeden sonra en az 20 yeni objektif hatırlama denemesi ve en az 10 review kaydı gerekir. Son 40 recall/review değerlendirilir. Recall ≥%85 ve olumlu review ≥%80 ise bir basamak yukarı; recall <%60 veya olumlu review <%50 ise bir basamak aşağı. Diğer durumda düzey korunur. Review ratings kişinin değerlendirmesidir; objektif recall sonucu ile birlikte kullanılır, ayrı doğrulanmış mastery iddiası değildir. Tek doğru cevap veya Already Know düzeyi artırmaz.

## Depolama ve güvenlik

Dexie `LexoraDB` adı ve bütün mevcut tablolar/anahtarlar korunur. v5 dört ayrı discovery/recall deposunu, v6 bağımsız core deposunu yalnız ekler; migration delete/reset/clear yapmaz.

- `discoveryCore`: core kelimeler ve kendi sıraları.
- `discoveryPool`: extended kelimeler, orijinal rank, eşleşen coreRank, sağlayıcı bulunabilirliği.
- `discoveryEncounters`: karşılaşma tarihi, rank, geri bildirim, kişisel vocabularyId bağlantısı.
- `discoveryPreferences`: kullanıcı tercihi, kaynak, adaptif düzey ve değerlendirilmiş deneme sayısı.
- `recallAttempts`: doğru/yanlış hedef hatırlama denemeleri.

Kişisel vocabulary/reviewLogs/dailySessions/settings/grammar tabloları ayrı kalır. Tam JSON export ve disk auto-backup yeni encounter/preferences/recall kayıtlarını içerir. Static pool/core CSV'lerden tekrar oluşturulur, her yedeğe 31k statik kayıt çoğaltılmaz. Cache temizliği karşılaşma/öğrenme/recall geçmişini silmez. Yeni mağazaları atlayan eski bir istemcinin disk yedeğini ezmesi sunucuda 409 ile reddedilir.

Boş profile restore bütün kişisel discovery bilgilerini getirir. Dolu profile merge mevcut tercihi/geri bildirimi korur, eksik kayıtları ekler; hatalı kayıt tüm transaction'ı geri alır. Aynı kimlikte farklı recall doğruluğu hata verir. Bu bir canlı cloud sync/otomatik çakışma çözümü değildir.

Yerel veri havuzu internet olmadan saklanır; uygulama zaten yüklüyse kişisel kaydedilmiş kelimeler ve cache'deki tanımlar kullanılabilir. İlk kez tanım edinilecek kelime için internet gerekir; tam offline startup iddiası yoktur.

## Dosyalar / çalıştırma

Ana kod: `src/services/advancedDiscovery.ts`, `src/types/discovery.ts`, `src/components/daily/OpenEndedLearningView.tsx`. Güvenli migration ve JSON yedekleri `db.ts`; gerçek typed recall kaydı mevcut `FlashcardView.tsx` içindedir.

Yeni test: `EBD_TEST_URL=http://127.0.0.1:5180 node tests/advanced-discovery.cjs`. Ayrı test sunucusu ve geçici EBD_STORAGE_DIR kullanır. Bu test 30 gerçek online Wiktionary kelimesi gerektirir; kaynak erişilemezse live kısmı başarılı göstermez. Sonuçlar `docs/reports/NGSL_TEST_RESULTS_2026-10-10.json`; render'lar `docs/screenshots/ngsl-discovery-2026-10-10/`.
