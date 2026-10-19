# Veri güvenliği, kayıt ve PC / tarayıcı taşıma

EnglishByDevotion · Esra · 10 Ekim 2026

## Dört ayrı kontrol

| Kontrol | Etki |
| --- | --- |
| Save all | Veritabanına kaydedilmiş tüm içeriği disk yedeğine yazar |
| Export everything | Tüm depoları taşınabilir JSON olarak indirir |
| Clear cache | Yalnız dış kaynak cache'ini siler; kelime/not/SRS/okuma silmez |
| Close app | Önce kayıt, ardından kısayolun başlattığı yerel sunucuyu durdurma |

Açık düzenleme formunu önce kendi Save düğmesiyle tamamla. Kaydedilmemiş yazı
taslağı tam yedeğin parçası değildir. Normal `npm run dev` ile açılan sunucu
uygulamadan kapatılmaz: Terminal'de Ctrl+C ve ardından tarayıcı sekmesini kapat.
Tarayıcı güvenliği nedeniyle pencereyi zorla kapatma garantisi yoktur.

## Aynı PC'de farklı tarayıcı

1. Eski tarayıcıda formları tamamla, Save all ve ayrıca Export everything yap.
2. Save all başarılı mesajını gör; hata varsa sekmeyi kapatmadan JSON indir.
3. Aynı proje sunucusunu yeni tarayıcıda aynı localhost adresiyle aç.
4. Tamamen boş profil, disk yedeğini başlangıç kelimelerinden önce otomatik alır.
5. Zaten dolu profil için Settings'ten yerel snapshot veya JSON içeri aktar.

IndexedDB tarayıcı/profil/origin'e özeldir. `localhost` ve `127.0.0.1`, farklı
portlar ve private mod ayrı veri alanlarıdır. Disk yedeği bu ayrımı köprüler;
mevcut dolu profili izinsiz sıfırlamaz. Aynı anda açık tarayıcılar canlı senkron
değildir: revision çatışmasında güncel yedeği alıp kontrollü birleştirme gerekir.

## Başka PC'ye taşıma

1. Export everything ile `.json` indir ve güvenli bir yerde ikinci kopya tut.
2. Proje klasörünü taşı; `node_modules`/`dist` taşımak zorunlu değildir.
3. Yeni PC'de Node.js kur, proje klasöründe `npm install` çalıştır.
4. macOS'ta .command; diğer sistemlerde `npm run dev` ve localhost:5173 aç.
5. Settings'te JSON geri yükleme için **Include preferences and keep conflicting
   records** seçeneğini etkinleştirip tam JSON dosyasını seç.
6. Kelimeleri, notları, tekrar geçmişini, SRS tarihlerini, okumaları ve tercihleri
   ve Grammar ilerleme/cevaplarını kontrol et; ardından yeni PC'de Save all / Export everything yap.

CSV yalnız kelime aktarımıdır: tam PC taşıması için JSON kullan.
Proje ile `storage/backups/current.json` da taşınırsa boş profil otomatik alabilir;
manuel JSON yedeğini yine de tut. Diske doğrudan dosya kopyalama uygulama kapalıyken yapılmalıdır.

## Çatışma davranışı

Varsayılan merge aynı kelimenin mevcut notlarını/ayarlarını korur; eksikleri ekler.
Taşınabilir seçenek tercihleri de alır. Aynı kimlikte farklı kelime notu/SRS
bulunursa mevcut kaydı silmez; gelen sürümü ayrı kimlikle korur ve tekrar
bağlantılarını eşler. Farklı kişisel okuma metinleri de ayrı kayıtla korunur.
Bu nedenle çatışmalarda aynı başlık/kelime iki kez görünebilir: veri kaybını
önlemek için bilinçli davranıştır, normal sözlük Save işlemi mükerrer üretmez.
Aynı taşınabilir dosyayı tekrar yüklemek mevcut kopyayı tekrar üretmez.
Cache anahtarı çakışmasında mevcut cache tutulur; cache kişisel öğrenme kaydı değildir.

Sürüm 4 tam JSON, grammarProgress ve grammarAttempts depolarını da içerir.
Eski sürüm JSON'ları kabul edilir; olmayan Grammar alanları mevcut kayıtları silmez.
Grammar cevaplarında aynı kimlikte farklı içerik varsa içeri aktarma işlemi tamamen
geri alınır ve hata verilir; hiçbir depo kısmen yazılmaz. Varsayılan birleştirme
mevcut Grammar oturumunu korur; taşınabilir seçenek daha yeni son çalışma kaydını
seçer. Grammar verisi bulunan disk yedeğini bu alanları göndermeyen eski istemci
üzerinden ezme girişimi sunucuda 409 ile reddedilir.

## Yedeklerin konumu ve gizliliği

Sürüm 6 tam JSON keşif karşılaşmalarını, geri bildirimleri, difficulty/frequency
tercihini ve objektif Typed Recall denemelerini de taşır. 31k statik kelime havuzu
ve core liste, projeyle birlikte gelen `public/datasets/ngsl/` dosyalarından tekrar
oluşturulur; kişisel kelime deposuna topluca eklenmez. Cache temizliği yeni kişisel
keşif kayıtlarını silmez. Eski istemcinin bu dolu depoları atlayarak disk snapshot'ını
ezmesi 409 ile engellenir. Ayrıntılar: `ADVANCED_DISCOVERY.md`.

`storage/backups/current.json` son başarılı tam snapshot'tır.
`storage/backups/history/` önceki snapshot'ları tutar. Otomatik silme yoktur;
boyut zamanla büyür. Dosyalar kişisel not/ilerleme içerir ve şifreli değildir:
paylaşmadan önce çıkar, repo/cloud herkese açık alanına koyma.

Cache temizliği aktif cache ve current snapshot'a yansır, geçmiş yedeklerdeki
cache'i silmez. Cache butonu tarayıcının HTTP/font cache'ini temizlemez.
Yerel sunucu kullanılmıyorsa disk yedeği/otomatik tarayıcı taşıma çalışmaz;
IndexedDB ve JSON export yine temel veri koruma yöntemidir.

## Offline sınırı

Kaydedilmiş kelime, not, SRS, geçmiş, kişisel pasaj ve daha önce cache'lenen
içerik ve yerel Grammar ders/pratikleri, uygulama yüklenmişken internet olmadan
kullanılabilir. Yeni dış sorgular
internet ister. Yerel fontlar internet gerektirmez. Service worker/PWA yoktur;
yerel sunucu kapalıyken veya bütün cihaz/cache silinmişken tam offline başlangıç
garanti edilmez. Disk arızasına karşı harici ikinci JSON kopyası gerekir.
