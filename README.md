# Naruto Universe Wiki

React ve JavaScript ile geliştirilmiş Naruto ansiklopedisi. Karakter, klan ve köy kayıtlarını inceleme; aile ilişkileri arasında gezinme; favori kaydetme; iki karakteri karşılaştırma ve Shinobi Dash oynama özelliklerini içerir.

## Gereksinimler ve çalıştırma

Node.js 20.19+ veya 22.12+, npm ve API erişimi için internet bağlantısı gerekir.

```bash
npm install
npm run dev
```

Vite tarafından belirtilen yerel adres tarayıcıda açılır. Üretim paketi ve testler:

```bash
npm test
npm run format:check
npm run build
npm run preview
```

## Teknolojiler

- React 19, React Router 7
- Vite, Tailwind CSS
- Canvas 2D ile oyun çizimi
- Favoriler, karşılaştırma seçimi ve en yüksek skor için localStorage
- Karakter, klan ve köy verileri için Dattebayo API
- Biyografi, ek kişisel bilgiler, anime ve film verileri için AniList GraphQL API

## Veri ve görseller

API istekleri geliştirme ortamında Vite proxy'si, Vercel üzerinde ise yönlendirme kuralları üzerinden yapılır. İsim dizini; aksanlı karakterleri ve Hinata Uzumaki / Hinata Hyūga gibi ad farklılıklarını aynı profile bağlar. İlk 120 karakterin kayıtları, yerel karakter görselleri ve popüler karakterlerin galerileri uygulamayla birlikte bulunur. Liste, detay ve ana sayfadaki öne çıkan karakterler için önce API isteği yapılır. Bağlantı kesintisi, zaman aşımı, istek sınırı veya sunucu hatasında mevcut yerel kayıtlar kullanılabilir. Bulunamayan kayıtlar ve kullanıcı tarafından iptal edilen istekler yerel kayıtlarla değiştirilmez.

Profil açıldığında AniList'ten ek bilgiler istenir. Eşleştirme, karakter adı ve Naruto/Boruto eser bağlantısı üzerinden doğrulanır. Dattebayo'da bulunan bilgiler korunur; boş kişisel alanlar doğrulanmış AniList verileriyle tamamlanır. Ek servis kullanılamadığında temel profil çalışmaya devam eder. İstekler sıraya alınır; başarılı yanıtlar aynı oturumda kısa süreli bellek önbelleğinde tutulur.

## Proje yapısı

`/anime` sayfası Naruto ve Boruto anime serileriyle filmlerini Japonya yayın tarihine göre listeler. Format filtreleri, başlık araması ve `/anime/:id` detay sayfaları afiş, konu özeti, bölüm sayısı, süre ve yapım bilgilerini sunar. AniList yanıtları kısa süreli bellekte tutulur; yayın tarihi bilinmeyen yapımlar listenin sonunda gösterilir.

| Klasör         | İçerik                                                |
| -------------- | ----------------------------------------------------- |
| src/components | Menü, kartlar, profil ve durum bileşenleri            |
| src/pages      | Sayfa bileşenleri ve yönlendirmeler                   |
| src/services   | API istekleri                                         |
| src/data       | Karakter dizini, kayıtlar ve görsel eşlemeleri        |
| src/utils      | İsim çözümleme, veri biçimlendirme ve görsel seçimi   |
| src/context    | Favori ve karşılaştırma durumu                        |
| src/game       | Oyun fiziği, arazi ve Canvas çizimleri                |
| tests          | Node.js testleri                                      |
| public/assets  | Karakterler, galeriler, harita ve dekoratif görseller |

## Kod biçimlendirme

`npm run format` kaynak dosyalarını Prettier ile biçimlendirir. `npm run format:check` yalnızca biçim kontrolü yapar. Görseller, derleme çıktıları ve API veri dosyaları bu işlemden hariç tutulur.

## Shinobi Dash

Oyuncu Konoha, Suna, Kiri ve Kumo etaplarında ilerler. Bina çatıları ve kayalık yamaçlar üzerine çıkılabilen yüzeylerdir. Çatı kenarından çıkıldığında yerçekimi uygulanır. Shuriken, kunai ve senbon engelleri parkurun yüksekliğine göre hareket eder.

| Tuş                          | İşlev              |
| ---------------------------- | ------------------ |
| Space / Yukarı / W / dokunma | Zıplama            |
| Havadayken tekrar zıplama    | Çift zıplama       |
| P                            | Duraklatma / devam |
| R                            | Sıfırlama          |

## Dağıtım

Vercel için derleme komutu `npm run build`, çıktı klasörü `dist` olarak ayarlanır. `vercel.json` istemci yönlendirmelerini ve API proxy kurallarını içerir.

## Kaynaklar

Veri: [Dattebayo API](https://dattebayo-api.onrender.com/characters), [AniList API](https://docs.anilist.co/). Görsel kaynakları ve türleri ASSET_NOTES.md dosyasında belirtilmiştir. Naruto karakterleri ve ilgili adlar hak sahiplerine aittir.
