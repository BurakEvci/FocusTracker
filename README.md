# 🎯 FocusTracker

**FocusTracker**, dijital dikkat dağınıklığıyla mücadele etmek amacıyla geliştirilmiş, Pomodoro tekniği ve özel odaklanma seanslarını destekleyen bir React Native mobil uygulamasıdır.

## 📱 Proje Hakkında

Bu proje, kullanıcıların verimliliğini artırmayı hedefler. Kullanıcı odaklanma seansı başlattığında, uygulama arka plana atılma durumlarını (başka uygulamaya geçişleri) takip eder ve bunu "Dikkat Dağınıklığı" olarak kaydeder. Seans sonunda ve Raporlar ekranında bu veriler görselleştirilir.

## ✨ Özellikler

* **⏱ Akıllı Zamanlayıcı:** Varsayılan 25 dk veya kullanıcı tanımlı süre seçenekleri.
* **⚠️ Dikkat Takibi (Distraction Tracking):** `AppState` API ile uygulamadan çıkışların (Instagram, WhatsApp vb. geçişlerin) tespiti.
* **📂 Kategori Yönetimi:** Çalışmalarınızı (Kodlama, Ders, Kitap vb.) kategorize etme imkanı.
* **📊 Gelişmiş Raporlama:**
    * Günlük ve toplam odaklanma süreleri.
    * Son 7 günün performans grafiği (Bar Chart).
    * Kategori dağılım grafiği (Pie Chart).
* **💾 Veri Saklama:** `AsyncStorage` ile verilerin cihazda kalıcı tutulması.

## 🛠 Kullanılan Teknolojiler

* **Framework:** React Native (Expo)
* **Navigasyon:** React Navigation (Tab Navigator)
* **Depolama:** AsyncStorage
* **Görselleştirme:** React Native Chart Kit
* **UI/Design:** Expo Linear Gradient, Vector Icons

## 🚀 Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Repoyu Klonlayın:**
    ```bash
    git clone [https://github.com/BurakEvci/FocusTracker.git](https://github.com/BurakEvci/FocusTracker.git)
    cd FocusTracker
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Uygulamayı Başlatın:**
    ```bash
    npx expo start
    ```

4.  **Test Edin:**
    * Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması ile taratın.
    * Veya `a` tuşuna basarak Android Emülatörde, `i` tuşuna basarak iOS Simülatörde çalıştırın.

---
**Geliştirici:** Burak Can Evci