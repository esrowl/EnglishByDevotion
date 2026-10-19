# Reading kelime paneli ve header güncellemesi

## Tamamlananlar

- Reading içinde tek seçili kelime paneli: yeni seçim önceki anlamı, bağlamı ve örnekleri değiştirir. Otomatik aşağı kaydırma kaldırıldı.
- Panel masaüstünde sağda, küçük ekranlarda altta; yüksekliği sınırlı ve içerisi kaydırılabilir. Kapatılabilir; okuma metni etkileşimli kalır.
- `Add to Learn` yeni kelimeyi mevcut IndexedDB öğrenme listesine ekler. Önceden yalnızca kaydedilmiş `new` kayıtlar `learning` durumuna alınır. Öğrenilmiş tarihi atanmaz; review/learned durumları, notlar ve tekrar planları değişmez. İşlem transaction içinde tekrar kontrolüyle mükerrer kaydı engeller.
- Örneklerin sonraki sayfası mevcut sayfayı değiştirir; sonuçlar aşağıya sınırsız eklenmez.
- DictionaryLookup ve ReadingExamples kardeşlerinde aynı React key kullanılması kaydetme sonrasında mükerrer panel oluşturuyordu. İç bileşenlerdeki çakışan key kaldırıldı; kelime değişiminde yalnızca kapsayıcı panel yeniden oluşturulur.
- Ana sayfa header'ı masaüstünde en az 340px, mobilde 270px olacak şekilde büyütüldü. Mevcut küre, portre ve SVG arka planı tekrar kullanıldı. Başlık boyutunu bastıran genel h1 kuralı için scoped düzeltme yapıldı. Mobil başlık anlamlı noktadan satır kırar.
- Ana sayfa tek Practice Now düğmesiyle sade kalır. Baykuş geri eklenmedi. Renk paleti ve üç font sistemi korundu.

## Değişen dosyalar

- src/services/dictionaryService.ts
- src/components/library/DictionaryLookup.tsx
- src/components/reading/ReadingView.tsx
- src/components/reading/ReadingExamples.tsx
- src/components/dashboard/DashboardView.tsx
- src/index.css
- tests/reading-inspector.cjs (yeni)
- tests/reading-polish.cjs
- tests/grammar.cjs
- tests/visual-identity.cjs

Veritabanı şeması ve package.json değiştirilmedi. Yeni bağımlılık eklenmedi. Kullanıcı verileri silinmedi veya sıfırlanmadı.

## Çalıştırılan doğrulamalar

İzole Edge tarayıcı bağlamlarında, 5180 test sunucusunda:

| Test | Sonuç |
| --- | --- |
| reading-inspector.cjs | 13/13 |
| reading-polish.cjs | 29/29 |
| grammar.cjs | 37/37 |
| visual-identity.cjs | 22/22 |
| regression.cjs | 9/9 |

Toplam 110 kontrol başarılı. `npm run build` ve `npm run lint` başarılı.

Yeni kontroller: iki kelime arasında geçiş, kayıt sonrasında tek panel, geciken eski yanıtın güncel kelimeyi değiştirmemesi, öğrenme durumu, mükerrer kaydın engellenmesi, not/tekrar planının korunması, yenileme sonrası kalıcılık, 1440/900/390px panel sınırları ve yatay taşma. Mevcut Reading testleri gerçek Wiktionary/Tatoeba verisi, PDF/TXT içe aktarma, offline kayıtlar ve başka profile export/import akışlarını da doğruladı.

Ekran görüntüleri: `docs/screenshots/reading-inspector-2026-10-10/` ve `docs/screenshots/header-restored-2026-10-10/`. Masaüstü ve mobil header/Reading görüntüleri ayrıca görsel olarak incelendi.

## Sınırlar

İlk kez sorgulanan kelimeler ve yüklenmemiş kullanım örnekleri internet gerektirir. Küçük ekran paneli ekranın en fazla %48'ini kullanır; × ile kapatılabilir. Harici sözlükte örnek bulunmaması durumunda uydurulmuş örnek eklenmez. Testler kişisel tarayıcı verisine dokunmayan ayrı bağlamlarda çalıştırıldı.
