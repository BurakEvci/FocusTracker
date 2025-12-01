# FocusTracker - Proje Raporu

## 1. Proje Hakkında
**Proje Adı:** FocusTracker (Odaklanma Takibi ve Raporlama Uygulaması)
**Teknoloji:** React Native (Expo)
**Geliştirici:** Burak Evci

### Projenin Amacı
FocusTracker, dijital dikkat dağınıklığıyla mücadele etmek amacıyla geliştirilmiş bir mobil uygulamadır. Kullanıcıların Pomodoro tekniği veya kendi belirledikleri sürelerle odaklanma seansları yapmalarını sağlar. Uygulama, seans sırasında kullanıcının uygulamadan çıkıp çıkmadığını (dikkat dağınıklığını) takip eder ve bu verileri raporlayarak kullanıcının verimliliğini artırmayı hedefler.

---

## 2. Kapsam ve Özellikler
Bu proje, MVP (Minimum Viable Product) gereksinimlerini karşılayacak şekilde aşağıdaki özellikleri içerir:

### A. Ekranlar ve Navigasyon
Uygulama, `react-navigation` kütüphanesi kullanılarak oluşturulmuş bir **Tab Navigator** (Alt Menü) yapısına sahiptir.
1.  **Odaklan (Ana Sayfa):** Sayaç ve seans yönetiminin yapıldığı ekran.
2.  **Raporlar (Dashboard):** İstatistiklerin ve grafiklerin görüntülendiği ekran.

### B. Temel Fonksiyonlar
*   **Zamanlayıcı (Timer):**
    *   Varsayılan 25 dakikalık geri sayım.
    *   Kullanıcı tarafından ayarlanabilir süre (Hızlı seçim veya manuel giriş).
    *   Başlat, Duraklat, Sıfırla fonksiyonları.
*   **Kategori Yönetimi:**
    *   Seanslar için kategori seçimi (Kodlama, Ders, Kitap, Proje vb.).
*   **Dikkat Dağınıklığı Takibi (Distraction Tracking):**
    *   `AppState` API kullanılarak uygulamanın arka plana atılması (başka uygulamaya geçilmesi) tespit edilir.
    *   Her odak kaybı sayaca +1 olarak işlenir ve sayaç otomatik duraklatılır.
*   **Veri Kaydı:**
    *   Tamamlanan seanslar `AsyncStorage` kullanılarak cihazda kalıcı olarak saklanır.
*   **Raporlama:**
    *   Günlük ve Toplam Odaklanma Süresi.
    *   Toplam Dikkat Dağınıklığı Sayısı.
    *   **Grafikler:**
        *   Son 7 günün performansını gösteren Çubuk Grafik (Bar Chart).
        *   Kategori dağılımını gösteren Pasta Grafik (Pie Chart).

---

## 3. Teknik Mimari

### Kullanılan Teknolojiler ve Kütüphaneler
*   **React Native & Expo:** Çapraz platform mobil uygulama geliştirme.
*   **React Navigation:** Sayfalar arası geçiş ve Tab yapısı için.
*   **AsyncStorage:** Verilerin cihazda kalıcı olarak saklanması için.
*   **Expo Linear Gradient:** Estetik, gradyan arka planlar ve butonlar için.
*   **React Native Chart Kit:** Veri görselleştirme ve grafikler için.
*   **Expo Vector Icons:** Uygulama içi ikonlar için.

### Dosya Yapısı
```
FocusTracker/
├── App.js                  # Ana giriş noktası ve Navigasyon yapısı
├── src/
│   ├── components/         # (Varsa) Yeniden kullanılabilir bileşenler
│   └── screens/
│       ├── HomeScreen.js   # Zamanlayıcı ve Seans Yönetimi Ekranı
│       └── ReportsScreen.js# İstatistik ve Raporlama Ekranı
├── assets/                 # Görseller ve ikonlar
└── package.json            # Bağımlılıklar ve scriptler
```

### İş Akışı (Flow)
1.  Kullanıcı uygulamayı açar ve **Ana Sayfa**'yı görür.
2.  Bir kategori seçer (Örn: Kodlama) ve süreyi ayarlar.
3.  "Başlat" butonuna basarak sayacı çalıştırır.
4.  Eğer uygulamadan çıkarsa (Instagram'a bakmak vb.), sayaç durur ve "Dikkat Dağınıklığı" kaydedilir.
5.  Süre bittiğinde, kullanıcıya seansın özeti (Süre, Kategori, Dikkat Kaybı) bir Modal ile gösterilir.
6.  Veriler kaydedilir.
7.  Kullanıcı **Raporlar** sekmesine geçerek günlük ve haftalık performansını grafiklerle inceler.

---

## 4. Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için:

1.  Repoyu klonlayın veya indirin.
2.  Terminali proje klasöründe açın.
3.  Bağımlılıkları yükleyin:
    ```bash
    npm install
    ```
4.  Uygulamayı başlatın:
    ```bash
    npx expo start
    ```
5.  Çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması ile taratın veya emülatörde çalıştırın.

---

## 5. Sonuç
FocusTracker, modern React Native yeteneklerini (Hooks, AppState, AsyncStorage) kullanarak, kullanıcının odaklanma alışkanlıklarını takip etmesine ve geliştirmesine yardımcı olan, kullanıcı dostu ve estetik bir mobil uygulamadır.
