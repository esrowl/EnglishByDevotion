# Ekran açılamıyor — teşhis raporu

EnglishByDevotion · Esra · 18 Ekim 2026

## Kesin bulgular

1. Kullanıcının bildirdiği adres `http://localhost:5173/`.
2. Kontrol sırasında 5173 portunda dinleyen sunucu yoktu. Sandbox dışındaki doğrudan
   HTTP denemesinde hem `::1:5173` hem `127.0.0.1:5173` bağlantısı `Connection refused`
   döndürdü. Bu, şu andaki sunucu durumudur; hatanın ilk oluştuğu andaki durum ayrıca
   yakalanmadığından ilk nedenin kesin kanıtı olarak sunulmaz.
3. `node scripts/start.mjs --check` başarılı: başlatıcı doğru proje klasörünü ve 5173
   adresini gösteriyor; Node v26.11.1 mevcut. Bu kontrol normal sunucuyu başlatmadı.
4. İzole 5180 sunucusunda temiz profil ve mevcut disk yedeğinin test kopyasında
   11'er ekran açıldı: Home, Continuous Study, Flashcard, Writing, Vocabulary,
   Review, Reading, Grammar, Import/Export, Statistics, Settings.
   İki profilde de bildirilen ErrorBoundary mesajı oluşmadı; mevcut yedek kopyasında
   JavaScript konsol hatası görülmedi. Temiz profildeki tek 404, bir kaynak dosyası
   yükleme uyarısıydı; ekranları engellemedi.
5. Asıl disk yedeği değişmedi: `storage/backups/current.json`, 254.651 byte,
   son değişiklik 15 Ekim 2026 10:30:10. Test kopyasında görülen sayılar: 25 kelime,
   13 review kaydı, 1 reading, 3 grammar progress, 5 grammar attempt.
   Bu, mevcut tarayıcıdaki dışarı aktarılmamış son değişikliklerin incelendiği
   anlamına gelmez. Kullanıcının kişisel tarayıcı profiline erişilmedi.

## Aynı hata mesajının yeniden üretilmesi

`App.tsx` ekranların çoğunu `React.lazy(() => import(...))` ile yükler.
`ErrorBoundary.tsx` bu yükleme/render hatalarını tek genel mesajla kapatır:

> This screen could not be displayed. Your saved data has not been deleted.

İzole testte yalnızca Continuous Study JavaScript modülünün isteği engellendi.
Konsoldaki gerçek hata:

```text
TypeError: Failed to fetch dynamically imported module:
http://127.0.0.1:5180/src/components/daily/OpenEndedLearningView.tsx
```

Tam olarak bildirilen ekran mesajı oluştu. Modül erişimi geri açıldıktan sonra
`Try again` düğmesi yine aynı hataya döndü: düğme yalnızca boundary durumunu
sıfırlıyor; React.lazy başarısız yükleme sonucunu tutuyor. Tam sayfa yenilemesinden
sonra ekran tekrar açıldı.

**Yorum:** kapalı/yeniden başlatılan geliştirme sunucusu, açık kalmış eski sekme veya
yüklenemeyen eski ekran modülleri güçlü adaylar. Kullanıcının gerçek sekmesinin
konsol hatası henüz yakalanmadığı için bunu ilk olayın kesin kök nedeni olarak
ilan etmiyoruz. Aynı genel mesaj başka render hatalarında da gösterilebilir.

## Zaman aşımı kaynak denetimi

Tarayıcıdan ilk canlı testte dört aktif kaynak da başarılıydı. Sonra her kaynak
`winter`, `curiosity`, `learning` sorgularıyla ayrı ayrı kontrol edildi:

| Kaynak | Başarı | Üç sorguda süre |
| --- | --- | --- |
| Wiktionary | 3/3 | 187–524 ms |
| Tatoeba | 3/3 | 648–1.895 ms |
| Datamuse | 3/3 | 196–312 ms |
| Open Library | 3/3 | 373–2.874 ms |

12 istekte zaman aşımı veya başarısız yanıt görülmedi. Bu, kullanıcının ağında
geçici bir problem hiç yaşanmadığını kanıtlamaz. Fakat bu kontrolde bozuk/zaman aşımı
veren kaynak saptanmadığından çalışan kaynaklar silinmedi. Free Dictionary API ve
Gutendex zaten aktif çalışma akışında bulunmuyor; eski atıf/önbellek metadata'sı
kullanıcı verisini korumak için kalabilir.

Kaynak hataları mevcut servis/event handler'larında yakalanıp mesaj olarak
gösteriliyor. Tespit edilen modül yükleme hatası bir dictionary API timeout'u değil.
Normal yeni kelime keşfi zaten hazırlanmış yerel sözlükten çalışıyor.

## Yapılan / yapılmayan değişiklikler

- Uygulama kodu, database şeması, kişisel kayıtlar ve mevcut kaynak adaptörleri
  değiştirilmedi; istek teşhis ve bildirim odaklıydı.
- Yalnızca yeniden çalıştırılabilir teşhis araçları ve raporlar eklendi:
  `tests/diagnose-screens.cjs`, `tests/diagnose-sources.cjs`,
  `tests/diagnose-module-loading.cjs`,
  `docs/reports/SOURCE_DIAGNOSTICS_2026-10-18.json` ve bu rapor.
- Normal 5173 sunucusu otomatik başlatılmadı; kişisel sekme/veri durumu değiştirilmedi.
- Testler geçici yedek dizini ve izole tarayıcı bağlamları kullandı. IndexedDB,
  localStorage veya asıl yedek silinmedi.

## Kullanıcı tarafında güvenli doğrulama

1. Proje içindeki `EnglishByDevotion.command` kısayolunu aç; Terminal açık kalsın.
2. `http://localhost:5173/` adresini aç ve `⌘⇧R` ile tam yenile.
3. Tarayıcı site verilerini veya IndexedDB'yi temizleme.
4. Aynı hata devam ederse o sekmenin Developer Tools → Console bölümündeki ilk
   kırmızı hatayı paylaş. Bu, genel ErrorBoundary mesajının örttüğü asıl exception'ı
   ayırmak için gereken eksik kanıttır.

`Try again` davranışını onaracak bir uygulama değişikliği bu teşhis kapsamında
uygulanmadı. Başarısız modül yüklemesi için gerçek yeniden deneme/tam yenileme ve
hata ayrıntılarının görünür olması ayrıca uygulanabilir.
