import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const [timeLeft, setTimeLeft] = useState(25 * 60); 
  const [isActive, setIsActive] = useState(false); 
  const [category, setCategory] = useState('Kodlama'); 
  const [distractionCount, setDistractionCount] = useState(0); 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('25');
  
  const appState = useRef(AppState.currentState); 

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background' && isActive) {
        setIsActive(false);
        setDistractionCount(prev => prev + 1); 
        Alert.alert("Odak Kaybı!", "Uygulamadan çıktığın için sayaç durdu.");
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [isActive]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      saveSession(); 
      Alert.alert("Harika!", "Seans tamamlandı.");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const saveSession = async () => {
    try {
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
    } catch (e) { console.error(e); }
  };

  const handleTimeChange = () => {
    const minutes = parseInt(customMinutes);
    if (!minutes || minutes <= 0) return;
    setTimeLeft(minutes * 60);
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const openModal = () => {
    if (isActive) { Alert.alert("Uyarı", "Sayacı durdurmalısın."); return; }
    setModalVisible(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  const resetTimer = () => {
    setIsActive(false);
    const minutes = parseInt(customMinutes) || 25;
    setTimeLeft(minutes * 60);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Üst Kısım: Kategori Seçici */}
      <View style={styles.headerContainer}>
        <Ionicons name="book-outline" size={24} color="#00f2ff" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {['Kodlama', 'Ders', 'Kitap', 'Proje'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => !isActive && setCategory(cat)}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.greeting}>Hazır mısın?</Text>
      <Text style={styles.subGreeting}>Seansını planla ve odaklan.</Text>

      {/* SAYAÇ DAİRESİ */}
      <TouchableOpacity onPress={openModal} style={styles.timerWrapper}>
        <LinearGradient
          colors={isActive ? ['#00f2ff', '#00c6ff'] : ['#2c3e50', '#000000']}
          style={styles.timerCircle}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statusText}>{isActive ? 'DAKİKA KALIYOR' : 'AYARLAMAK İÇİN BAS'}</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* İstatistik */}
      {distractionCount > 0 && (
         <View style={styles.alertBox}>
           <Ionicons name="alert-circle" size={20} color="#ff0055" />
           <Text style={styles.alertText}>{distractionCount} Kez Dağıldın</Text>
         </View>
      )}

      {/* Butonlar */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setIsActive(!isActive)}>
          <LinearGradient
            colors={isActive ? ['#ff9966', '#ff5e62'] : ['#00f2ff', '#00c6ff']}
            style={styles.mainButton}
          >
            <Ionicons name={isActive ? "pause" : "play"} size={32} color="#121212" />
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={resetTimer} style={styles.smallButton}>
           <Ionicons name="refresh" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Süre Seç</Text>

            {/* Hızlı Seçim Butonları */}
            <View style={styles.quickSelectContainer}>
              {[15, 25, 40, 60].map((min) => (
                <TouchableOpacity 
                  key={min} 
                  style={[
                    styles.quickBtn, 
                    customMinutes === min.toString() && styles.quickBtnActive // Seçiliyse rengi değişsin
                  ]}
                  onPress={() => setCustomMinutes(min.toString())}
                >
                  <Text style={[
                    styles.quickBtnText,
                    customMinutes === min.toString() && styles.quickBtnTextActive
                  ]}>{min} dk</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Manuel Giriş Alanı */}
            <Text style={styles.inputLabel}>veya manuel gir:</Text>
            <TextInput 
              style={styles.input} 
              onChangeText={setCustomMinutes} 
              value={customMinutes} 
              keyboardType="numeric" 
              maxLength={3} 
              placeholderTextColor="#555"
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleTimeChange}>
               <Text style={styles.saveButtonText}>TAMAM</Text>
            </TouchableOpacity>
            
            {/* Kapatma Butonu (İsteğe bağlı, boşluğa tıklayınca kapanmıyorsa) */}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginTop: 15}}>
              <Text style={{color: '#777'}}>İptal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', paddingTop: 60 },
  
  headerContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', 
    padding: 10, borderRadius: 30, marginBottom: 30, width: '90%' 
  },
  catScroll: { marginLeft: 10 },
  catText: { color: '#555', fontSize: 16, marginRight: 20, fontWeight: '600' },
  catTextActive: { color: '#fff' },

  greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 16, color: '#777', marginBottom: 40 },

  timerWrapper: { marginBottom: 40 },
  timerCircle: { width: 280, height: 280, borderRadius: 140, padding: 3, justifyContent: 'center', alignItems: 'center' },
  innerCircle: { 
    width: 270, height: 270, borderRadius: 135, backgroundColor: '#121212', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 10, borderColor: '#1c1c1e' 
  },
  timerText: { fontSize: 64, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  statusText: { color: '#555', fontSize: 12, marginTop: 5, letterSpacing: 1 },

  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 0, 85, 0.2)', padding: 10, borderRadius: 10, marginBottom: 20 },
  alertText: { color: '#ff0055', marginLeft: 10, fontWeight: 'bold' },

  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  mainButton: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  smallButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1c1c1e', justifyContent: 'center', alignItems: 'center' },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.85)' },
  modalView: { backgroundColor: "#1c1c1e", borderRadius: 25, padding: 25, alignItems: "center", width: '85%', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: "#fff", fontSize: 20, marginBottom: 20, fontWeight: 'bold' },

// YENİ: Hızlı Seçim Stilleri
  quickSelectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  quickBtn: {
    backgroundColor: '#2c2c2e',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    minWidth: 60,
    alignItems: 'center'
  },
  quickBtnActive: {
    backgroundColor: 'rgba(0, 242, 255, 0.2)', // Seçilince hafif neon mavi arka plan
    borderColor: '#00f2ff', // Neon kenarlık
  },
  quickBtnText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  quickBtnTextActive: {
    color: '#00f2ff', // Seçilince yazı da parlasın
    fontWeight: 'bold',
  },

  inputLabel: { color: '#777', fontSize: 12, marginBottom: 5, alignSelf: 'flex-start', marginLeft: 5 },
  input: { 
    backgroundColor: '#2c2c2e', 
    color: '#fff', 
    width: '100%', 
    borderRadius: 12, 
    padding: 15, 
    fontSize: 20, 
    textAlign: 'center', 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444'
  },
  saveButton: { backgroundColor: "#00f2ff", borderRadius: 12, padding: 15, width: '100%', alignItems: 'center' },
  saveButtonText: { color: "#000", fontWeight: 'bold', fontSize: 16 }

});