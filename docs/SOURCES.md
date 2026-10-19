# Kaynaklar, gerçek erişim ve lisanslar

Esra · 10 Ekim 2026. Ücretli servis, AI üretimi ve API anahtarı eklenmedi.

| Kaynak | Erişim | Uygulamadaki kullanım |
| --- | --- | --- |
| Free Dictionary API | canlı API + yerel cache | varsayılan sözlük, çoklu anlam/IPA/audio |
| Wiktionary | canlı resmi REST + cache | açık seçilen alternatif tanım/örnek kaynağı |
| Tatoeba | resmi canlı API + seçili yerel veri | cümleler, varsa Türkçe, daha fazla sayfa |
| Project Gutenberg | iki paketli gerçek pasaj | Reading Library; lisans ve kaynak gösterimi |
| Datamuse | canlı API + cache | ilişkili kelime önerileri, tanım doğrulaması değil |
| Open Library | canlı katalog API + cache | kitap metadata/bağlantıları; tam metin değil |
| Gutendex | isteğe bağlı katalog API + cache | Gutenberg metadata; tam metin değil |
| Wikisource | yalnız görünür web bağlantısı | uygulamaya entegre veri kaynağı değildir |

## Sözlük

[Free Dictionary API](https://dictionaryapi.dev/):
`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`.
Yanıttaki sourceUrls, license ve ses sourceUrl/license alanları korunur.
Eksik ses/Türkçe/örnek üretilmez. Her kelimenin telif kaynağı ayrıca önemlidir;
servisin ücretsiz olması bütün verinin lisanssız olduğu anlamına gelmez.

[Resmi Wiktionary REST](https://en.wiktionary.org/api/rest_v1/):
`https://en.wiktionary.org/api/rest_v1/page/definition/{word}`.
Yalnız İngilizce tanımlar alınır; HTML düz metne çevrilir. Topluluk katkısıdır,
bağımsız doğruluk garantisi değildir. Katkıcı atfı, giriş bağlantısı ve CC BY-SA
4.0 bilgisi korunur. Yeniden dağıtım/türev içerik için share-alike ve atıf
yükümlülüklerini [Wiktionary telif koşullarından](https://en.wiktionary.org/wiki/Wiktionary:Copyrights)
kontrol et; giriş tarihçesi farklı eski lisansları da gösterebilir.

## Cümle

[Resmi Tatoeba API](https://api.tatoeba.org/) ve
[OpenAPI şeması](https://api.tatoeba.org/openapi.json):
`https://api.tatoeba.org/v1/sentences` belgelenmiş parametreler ve cursor ile.
Undocumented endpoint veya scraping kullanılmaz. Yerel seçili cümleler
`src/data/tatoebaCurated.json`; canlı sayfalar ayrı cache'de saklanır.
Kimlik, kaynak, kullanıcı/katkıcı, lisans ve varsa Türkçe çeviri korunur.
Uygulama desteklenmeyen lisansları filtreler; uygun CC BY 2.0 FR ve CC0 kayıtlar
alınır. Türkçe çeviri aynı kaynaktaki gerçek bağlantılı kayıt olmalıdır.
Topluluk kayıtları mutlak dilsel doğruluk garantisi değildir.

## Okuma ve kataloglar

Paketli Alice's Adventures in Wonderland (Lewis Carroll, Gutenberg #11) ve
Little Women (Louisa May Alcott, #514) orijinal İngilizce kısa pasajlardır.
İki yazarın ölümünden itibaren 70 yıldan fazla süre geçmiştir; Türkiye ve ABD
bağlamı için eski orijinal metinler seçilmiştir. Modern çeviri/uyarlama/kapak
hakları bu değerlendirmeye dahil değildir. Yeni eser veya farklı ülke için
hakları ayrıca incele; küresel serbestlik iddiası yapılmaz.

[Gutenberg lisansı](https://www.gutenberg.org/policy/license.html),
[robot erişim politikası](https://www.gutenberg.org/policy/robot_access.html) ve
[bağlantı politikası](https://www.gutenberg.org/policy/linking.html) uygulanmalıdır.
Kaynak URL/ID ve ilgili hak bildirimi görünürdür. Yeni toplu indirme/scraping
yapılmaz; kataloglardan fulltext otomatik ithal edilmez.

[Open Library resmi arama API](https://openlibrary.org/dev/docs/api/search):
`https://openlibrary.org/search.json` q, fields, limit ve page kullanır.
20'lik sayfalar kullanıcı isteğiyle gelir. Eser/başlık/yazar ve kaynak linki
gösterilir; hak durumu **bilinmiyor** olarak etiketlenir. Katalogda görünmek
okuma metninin yeniden kullanım hakkını kanıtlamaz. Otomatik toplu istek yapma;
resmi oran sınırlarına uy. Tam kitap/dijital ödünç alma dahil edilmedi.

[Gutendex belgeleri](https://gutendex.com/):
`https://gutendex.com/books/?languages=en&copyright=false&search=...`.
Gutenberg'in kendisi değil, açık kaynak katalog hizmetidir. `copyright=false`
ABD değerlendirmesidir; Türkiye veya başka ülke için kanıt değildir. Genel
demo servisinin sürekliliği garanti edilmez, kalıcı yoğun kullanım için kendi
sunucusunu kurmak ek çalışma gerektirir. Bu testte canlı hizmet timeout verdi;
entegrasyon adaptörü mevcut, canlı başarı doğrulanmış sayılmadı.

Kişisel Reading pasajları yalnız kullanıcının hak/izin onayından sonra saklanır.
Bu onay bağımsız telif doğrulaması değildir. Kullanıcı kaynak/lisans bilgisini
hak alanıyla birlikte takip etmelidir.

## Kelime keşfi

[Datamuse resmi API](https://www.datamuse.com/api/):
`https://api.datamuse.com/words?ml={topic}&max=1000`.
Bir sorgunun en fazla 1000 sonucunu küçük görünüm gruplarıyla açar; yeni konu
aramaları yapılabilir. Bu upstream sınırıdır, kişisel kelime veya günlük kota değil.
Öneriler kaynak koşullarıyla etiketlenir; doğrulanmış tanım/çeviri gibi sunulmaz.
Resmi sayfa 2027 başında anahtar gereksinimi duyuruyor. Bu sürüm 1 Şubat 2027'den
itibaren yeni anahtarsız istekleri durdurur; anahtar veya ücretli geçiş kurmaz.
O tarihte koşulları tekrar kontrol etmek gerekir; önceden cache'lenen öneriler kalır.

## Test sonucu ve dürüst kapsam

Canlı headless tarayıcı testinde Tatoeba, Wiktionary, Datamuse ve Open Library
çalıştı ve uygulama içi kontrolleri geçti. Free Dictionary API ve Gutendex
ayrı canlı probunda 12 saniyede timeout verdi. Dictionary API için daha önce
gerçek hello yanıtı alındı ve yanıt fixture ile test edildi; bu son canlı browser
probunun başarılı olduğu iddia edilmez. Hiçbir dış sağlayıcı %100 süreklilik
sunmaz; hata mesajları/cache/diğer öğrenme özellikleri bağımsız tutulur.
