# NGSL Advanced Discovery — uygulama ve test raporu

EnglishByDevotion · Esra · 10 Ekim 2026

## Tamamlananlar

- İki gerçek CSV yerel dosyalara ve ayrı IndexedDB depolarına alındı: core 2.809, extended 31.239 kayıt. Gönderilen `ngsl_sfi_31k.csv` ile extended download SHA256 değerleri aynı.
- Core üyeliği kelimeye göre elenir; core ve extended ranks birbirine eşit varsayılmaz. Orijinal yazım/ranks korunur. Core kayıtları ve kişisel kelimeler silinmez.
- Yeni keşif, istenen dört frequency bandını %15/%35/%40/%10 başlangıç ağırlıklarıyla kullanır; uygun bandın içinde rastgele seçer. Tekrarsızlık, lexical validity ve gerçek sözlük doğrulaması uygulanır. İlk filtre sonrası, sözlük bulunabilirliği kontrolünden önce 28.298 uygun aday vardır: 2.076 / 4.996 / 9.991 / 11.235.
- Daha önce karşılaşılan veya kişisel kaydedilmiş kelimeler yeni-word mode'a dönmez. Kalıcılık refresh ve farklı tarayıcıya JSON restore ile doğrulandı.
- Already Know / Learn This Word / Next Word ayrı geri bildirimlerdir. Yalnız Learn This Word kişisel kütüphaneye aktif öğrenme kaydı ekler. Arama/keşif/aşinalık beyanı mastery üretmez.
- Kullanıcı frequency tercihi kalıcıdır. Küçük adaptif ağırlık değişimleri 20 yeni objektif recall, en az 3 gün ve 10 review kanıtı gerektirir. Tek doğru cevap düzeyi artırmaz. Review self-rating, objektif Typed Recall'dan ayrı tutulur.
- My Saved Words ve mevcut Flashcard Drill korunur. Yeni serbest yazı/AI/otomatik cümle üretme motoru yoktur. Tasarım/palet/fontlar değiştirilmedi; yeni kontroller mevcut stilleri kullanır.
- Yeni depo/anahtarlar v5/v6 ile yalnız eklenir. Eski notlar, SRS ve Grammar kayıtları korunur. Tam JSON, otomatik disk yedeği ve yeni browser restore yeni kişisel discovery/recall verilerini içerir.
- Cache temizliği karşılaşma/geri bildirim/progress'i silmez. Ekrandaki gerçek tanım cache temizlenmiş olsa da offline kaydedilebilir. Eski istemcinin discovery alanlarını atlayıp güncel disk yedeğini ezmesi 409 ile engellenir.

## Kaynak erişimi: gerçek durum

Free Dictionary API kontrolünde infrastructure isteği HTTP 522, echo isteği 15 saniye timeout verdi. Bu kaynaktan 30 başarılı canlı yanıt alındığı iddia edilmiyor.

Uygulamada zaten bulunan Wiktionary adapter'ı kullanıcı tarafından açıkça seçilebilir hale getirildi; yeni provider/API bağımlılığı eklenmedi, otomatik sessiz substitution yoktur. Nihai testte **30 ardışık farklı kelime gerçek online Wiktionary verisiyle** doğrulandı. Hepsi core dışında, orijinal ranks ile ve CEFR `Unspecified` durumunda kaldı. Sentetik tanımlar uygulamaya veya teste başarılı kaynak cevabı olarak yerleştirilmedi.

Nihai 30'lu örnek band sayıları: 2 / 11 / 12 / 5. Küçük örnekler ağırlıkları birebir tutmak zorunda değildir. Ayrı 10.000 örnekli, seeded sampler testi başlangıç olasılıklarını tolerans içinde doğruladı. Dict availability, biten bantlar ve kullanıcı/adaptive tercihler sonuç dağılımını değiştirebilir. Nadirlik kelime zorluğu veya CEFR olarak sunulmaz.

## Gerçekte çalıştırılan testler

| Komut | Nihai sonuç |
| --- | --- |
| `node tests/advanced-discovery.cjs` | 15/15; 30 gerçek canlı seçim + üç UI eylemi + offline/cache edge-case |
| `npm run test:grammar` | 37/37 |
| `npm run test:workflows` | 35/35; retained My Saved Words / flashcards / review / imports |
| `npm run test:regression` | 9/9 |
| `npm run test:api` | 24/24; deterministic HTTP/timeout/invalid-response/backup cases |
| `node tests/visual-identity.cjs` | 24/24; retained appearance/navigation/typography |
| `npm run test:storage` | 18/18; disk save, another browser restore, older-client guards, true/false Typed Recall |
| `npm run build` | Başarılı |
| `npm run lint` | Başarılı, uyarı yok |

Toplam **162 kontrol geçti**. Testler geçici browser profilleri ve ayrı temporary disk storage kullandı. Kişisel IndexedDB veya gerçek kullanıcı yedekleri resetlenmedi. Masaüstü 1440px ve mobil 390px Continuous Study render'ları görsel olarak incelendi; yatay sayfa taşması yok.

[Makine tarafından kaydedilen 30 kelime/rank/feedback ve test sonuçları](NGSL_TEST_RESULTS_2026-10-10.json)

[Continuous Study desktop](../screenshots/ngsl-discovery-2026-10-10/continuous-1440.png)

[Continuous Study mobile](../screenshots/ngsl-discovery-2026-10-10/continuous-390.png)

## Dosyalar

Yeni:

- `public/datasets/ngsl/ngsl.csv`
- `public/datasets/ngsl/ngsl_sfi_31k.csv`
- `public/datasets/ngsl/LICENSE` ve `README.md`
- `src/types/discovery.ts`
- `src/services/advancedDiscovery.ts`
- `tests/advanced-discovery.cjs`
- `docs/ADVANCED_DISCOVERY.md`
- Bu rapor, test JSON'u ve yeni screenshot klasörleri.

Güncellenen:

- `src/services/db.ts`: additive migrations ve güvenli export/import.
- `src/types/vocabulary.ts`: optional frequencyRank/frequencySource.
- `src/components/daily/OpenEndedLearningView.tsx`: NGSL keşfi, üç eylem, tercih/kaynak seçimi; mevcut kişisel çalışma görünümü korunur.
- `src/components/flashcards/FlashcardView.tsx`: mevcut deterministik Typed Recall submission sonucunun kalıcı kaydı; grading kuralı/visual design değişmedi.
- `scripts/server/localServer.mjs`: yeni depolar için disk snapshot omission guard.
- `tests/grammar.cjs`: yeni şema/backup sürümü beklentileri.
- `tests/workflows.cjs`, `tests/visual-identity.cjs`: eski kişisel çalışmanın My Saved Words üzerinden test edilmesi.
- `tests/local-persistence.cjs`: yeni disk/restore/recall korumaları.
- `README.md`, `docs/TECHNICAL_GUIDE.md`, `docs/DATA_PORTABILITY.md`.

Package.json/package-lock/dependencies, global palette, fontlar, Grammar içeriği ve answer keys değiştirilmedi.

## Lisans ve sınırlar

Dataset: Browne, Culligan & Phillips / New General Service List; CSV packaging kami-mura/ngsl-wordlists. CC BY-SA 4.0; atıf ve lisans `public/datasets/ngsl/` içinde. Wiktionary credits/license her sözlük kaydında ve detaylarda korunur. Repo: https://github.com/kami-mura/ngsl-wordlists

Finite 31k pool'a günlük veya 10-word quota eklenmedi. Tek kullanıcı isteğinde 16 candidate validation sınırı yalnız kontrolsüz ağ işini önleyen batch'tir; Retry havuza devam eder. İlk dictionary retrieval internet ister, tüm uygulama offline-startup veya bütün fiziksel cihaz/browser uyumluluğu iddiası yoktur. Frequency adaptation bir eğitim heuristiğidir, bilimsel difficulty/CEFR ölçümü değildir.

Statik pool/core her JSON yedeğine çoğaltılmaz; proje dosyalarından tekrar kurulur. Karşılaşmalar, aktif öğrenilen kelimeler, tercihler, recall/progress ise kişisel yedeklere dahildir. Çok cihazlı canlı cloud sync ve otomatik çatışma çözümü yoktur. Teknik ayrıntılar: [ADVANCED_DISCOVERY.md](../ADVANCED_DISCOVERY.md).
