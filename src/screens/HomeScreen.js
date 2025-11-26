import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  // --- STATE TANIMLARI ---
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false); 
  const [category, setCategory] = useState('Kodlama'); 
  const [distractionCount, setDistractionCount] = useState(0); 
  
  // Süre Ayarlama State'leri (YENİ)
  const [modalVisible, setModalVisible] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');
  
  const appState = useRef(AppState.currentState); 

  // --- APP STATE DİNLEYİCİSİ ---
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('Uygulama ön plana geldi');
      } else if (nextAppState === 'background' && isActive) {
        setIsActive(false);
        setDistractionCount(prev => prev + 1); 
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
      setIsActive(false);
      saveSession(); 
      Alert.alert("Tebrikler!", "Odaklanma seansı tamamlandı ve kaydedildi.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // --- VERİ KAYDETME ---
  const saveSession = async () => {
    try {
      // Kaydedilecek süre, kullanıcının ayarladığı (customMinutes) veya o anki sayaç başlangıcı olmalı
      // Ancak basitlik adına o anki session süresini hesaplayalım:
      // Burada kullanıcı 40 dk seçtiyse raporlara 40 dk olarak geçmeli.
      const durationMin = parseInt(customMinutes) || 25;

      const newSession = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: durationMin, 
        category: category,
        distractionCount: distractionCount
      };

      const existingSessions = await AsyncStorage.getItem('sessions');
      let sessions = existingSessions ? JSON.parse(existingSessions) : [];
      sessions.push(newSession);
      await AsyncStorage.setItem('sessions', JSON.stringify(sessions));
      
    } catch (e) {
      console.error("Kaydetme hatası:", e);
    }
  };

  // --- SÜRE DEĞİŞTİRME FONKSİYONLARI (YENİ) ---
  const handleTimeChange = () => {
    const minutes = parseInt(customMinutes);
    if (!minutes || minutes <= 0) {
      Alert.alert("Hata", "Lütfen geçerli bir süre giriniz.");
      return;
    }
    setTimeLeft(minutes * 60);
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const openModal = () => {
    if (isActive) {
      Alert.alert("Uyarı", "Süreyi değiştirmek için önce sayacı durdurmalısın.");
      return;
    }
    setModalVisible(true);
  };

  // --- YARDIMCI FONKSİYONLAR ---
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
    // Sıfırlandığında ayarlanan süreye geri dönsün
    const minutes = parseInt(customMinutes) || 25;
    setTimeLeft(minutes * 60);
    setDistractionCount(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Odaklanma Modu</Text>

      {/* Kategori Seçimi */}
      <View style={styles.categoryContainer}>
        <Text style={styles.label}>Kategori Seç:</Text>
        <View style={styles.categoryButtons}>
          {['Kodlama', 'Ders', 'Kitap', 'Proje'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catButton, category === cat && styles.catButtonActive]}
              onPress={() => !isActive && setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sayaç Göstergesi - TIKLANABİLİR YAPILDI */}
      <TouchableOpacity onPress={openModal} style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
          {isActive ? 'Odaklanılıyor...' : 'Süreyi ayarlamak için tıkla'}
        </Text>
        {!isActive && <Ionicons name="create-outline" size={24} color="#3498db" style={{marginTop: 5}} />}
      </TouchableOpacity>

      {/* İstatistik Özeti */}
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

      {/* --- SÜRE AYARLAMA MODALI (YENİ) --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Süre Ayarla (Dakika)</Text>
            
            <TextInput
              style={styles.input}
              onChangeText={setCustomMinutes}
              value={customMinutes}
              keyboardType="numeric"
              maxLength={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.textStyle}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]} 
                onPress={handleTimeChange}
              >
                <Text style={styles.textStyle}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 20, marginTop: 10 },
  categoryContainer: { width: '100%', marginBottom: 30 },
  label: { fontSize: 16, marginBottom: 10, color: '#7f8c8d' },
  categoryButtons: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' },
  catButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#ecf0f1', margin: 5 },
  catButtonActive: { backgroundColor: '#3498db' },
  catText: { color: '#7f8c8d' },
  catTextActive: { color: 'white', fontWeight: 'bold' },
  
  // Timer Container Güncellendi
  timerContainer: { 
    alignItems: 'center', marginBottom: 30, padding: 30, 
    borderRadius: 200, borderWidth: 5, borderColor: '#3498db', 
    width: 250, height: 250, justifyContent: 'center',
    backgroundColor: '#fbfbfb' // Hafif arka plan
  },
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#2c3e50' },
  statusText: { fontSize: 14, color: '#7f8c8d', marginTop: 5 },
  
  statsContainer: { flexDirection: 'row', marginBottom: 30 },
  statItem: { alignItems: 'center', backgroundColor: '#fadbd8', padding: 15, borderRadius: 10, minWidth: 150 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#c0392b' },
  statLabel: { fontSize: 12, color: '#c0392b' },
  controls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  mainButton: { backgroundColor: '#2ecc71', flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, width: 140, justifyContent: 'center' },
  resetButton: { backgroundColor: '#95a5a6' },
  mainButtonText: { color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },

  // --- MODAL STYLES (YENİ) ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%'
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 20,
    fontWeight: 'bold'
  },
  input: {
    height: 50,
    width: '100%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#ddd',
    fontSize: 24,
    textAlign: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10
  },
  modalButton: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: "#3498db",
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  }
});