import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Veri kaydı için eklendi
import { useEffect, useRef, useState } from 'react';
import { Alert, AppState, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  // --- STATE TANIMLARI ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 dakika (saniye cinsinden)
  const [isActive, setIsActive] = useState(false); // Sayaç çalışıyor mu?
  const [category, setCategory] = useState('Kodlama'); // Varsayılan kategori
  const [distractionCount, setDistractionCount] = useState(0); // Dikkat dağınıklığı sayısı
  
  const appState = useRef(AppState.currentState); // Uygulamanın durumu (Arka plan/Ön plan)

  // --- APP STATE (DİKKAT DAĞINIKLIĞI) DİNLEYİCİSİ ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // Uygulamaya geri dönüldü
        console.log('Uygulama ön plana geldi');
      } else if (nextAppState === 'background' && isActive) {
        // Sayaç çalışırken uygulama arka plana atıldı! (Dikkat Dağınıklığı)
        setIsActive(false); // Sayacı durdur
        setDistractionCount(prev => prev + 1); // Hatayı artır
        Alert.alert("Dikkat Dağınıklığı!", "Uygulamadan çıktığın için sayacı durdurduk.");
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isActive]);

  // --- ZAMANLAYICI MANTIĞI ---
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {  
      // Süre bitti
      setIsActive(false);
      saveSession(); // KAYDETME FONKSİYONU
      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı ve kaydedildi.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);


// --- VERİ KAYDETME FONKSİYONU (YENİ) ---
  const saveSession = async () => {
    try {
      // Kaydedilecek veri objesi
      const newSession = {
        id: Date.now(), // Benzersiz ID
        date: new Date().toISOString(), // Tarih
        duration: 25, // Dakika cinsinden (Sabit 25 dk şimdilik)
        category: category,
        distractionCount: distractionCount
      };

      // Mevcut verileri oku
      const existingSessions = await AsyncStorage.getItem('sessions');
      let sessions = existingSessions ? JSON.parse(existingSessions) : [];

      // Yeni veriyi ekle
      sessions.push(newSession);

      // Tekrar kaydet
      await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
      console.log("Seans kaydedildi:", newSession);
      
    } catch (e) {
      console.error("Kaydetme hatası:", e);
      Alert.alert("Hata", "Veri kaydedilemedi.");
    }
  };

  // --- YARDIMCI FONKSİYONLAR ---
  // Saniyeyi MM:SS formatına çevirir
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    setDistractionCount(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Başlık */}
      <Text style={styles.headerTitle}>Odaklanma Modu</Text>

      {/* Kategori Seçimi */}
      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Kategori Seç:</Text>
        <View style={styles.categoryButtons}>
          {['Kodlama', 'Ders', 'Kitap', 'Proje'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, category === cat && styles.catButtonActive]}
              onPress={() => !isActive && setCategory(cat)} // Sayaç çalışırken değişmez
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sayaç Göstergesi */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>{isActive ? 'Odaklanılıyor...' : 'Duraklatıldı'}</Text>
      </View>

      {/* İstatistik Özeti (Anlık) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Ionicons name="alert-circle-outline" size={24} color="#e74c3c" />
          <Text style={styles.statValue}>{distractionCount}</Text>
          <Text style={styles.statLabel}>Dikkat Dağınıklığı</Text>
        </View>
      </View>

      {/* Kontrol Butonları */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.mainButton} onPress={toggleTimer}>
          <Ionicons name={isActive ? "pause" : "play"} size={32} color="white" />
          <Text style={styles.mainButtonText}>{isActive ? "Duraklat" : "Başlat"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.mainButton, styles.resetButton]} onPress={resetTimer}>
          <Ionicons name="refresh" size={32} color="white" />
          <Text style={styles.mainButtonText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    marginTop: 10,
  },
  categoryContainer: {
    width: '100%',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
    color: '#7f8c8d',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  catButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#ecf0f1',
    margin: 5,
  },
  catButtonActive: {
    backgroundColor: '#3498db',
  },
  catText: {
    color: '#7f8c8d',
  },
  catTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 40,
    borderRadius: 200,
    borderWidth: 5,
    borderColor: '#3498db',
    width: 250,
    height: 250,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statusText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#fadbd8',
    padding: 15,
    borderRadius: 10,
    minWidth: 150,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#c0392b',
  },
  statLabel: {
    fontSize: 12,
    color: '#c0392b',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  mainButton: {
    backgroundColor: '#2ecc71',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    width: 140,
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#95a5a6',
  },
  mainButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
  },
});