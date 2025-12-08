import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Keyboard,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import TimeModal from '../components/TimeModal';
import TimerCircle from '../components/TimerCircle';
import DataService from '../services/DataService';

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
        Vibration.vibrate([0, 500, 200, 500]);
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
      Vibration.vibrate([0, 800]); 
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
      await DataService.addSession(newSession);      
    
    } catch (e) { console.error(e); }
  };

  const handleTimeSave = () => {
    const minutes = parseInt(customMinutes);
    if (!minutes || minutes <= 0) return;
    setTimeLeft(minutes * 60);
    setModalVisible(false);
    Keyboard.dismiss();
  };

  const openModal = () => {
    if (isActive) { Alert.alert("Uyarı", "Sayacı durdurmalısın."); return; }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); 
    setModalVisible(true);
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive(false);
    const minutes = parseInt(customMinutes) || 25;
    setTimeLeft(minutes * 60);
    setDistractionCount(0);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.headerContainer}>
        <Ionicons name="book-outline" size={24} color="#00f2ff" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {['Kodlama', 'Ders', 'Kitap', 'Proje'].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => {
                if(!isActive) {
                   setCategory(cat);
                   Haptics.selectionAsync(); 
                }
              }}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Text style={styles.greeting}>Hazır mısın?</Text>
      <Text style={styles.subGreeting}>Seansını planla ve odaklan.</Text>

      {/* MODÜLERLEŞTİRİLMİŞ SAYAÇ BİLEŞENİ */}
      <TimerCircle 
        timeLeft={timeLeft} 
        isActive={isActive} 
        onPress={openModal} 
      />

      {distractionCount > 0 && (
         <View style={styles.alertBox}>
           <Ionicons name="alert-circle" size={20} color="#ff0055" />
           <Text style={styles.alertText}>{distractionCount} Kez Dağıldın</Text>
         </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity onPress={toggleTimer}>
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

      {/* MODÜLERLEŞTİRİLMİŞ MODAL BİLEŞENİ */}
      <TimeModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleTimeSave}
        customMinutes={customMinutes}
        setCustomMinutes={setCustomMinutes}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', alignItems: 'center', paddingTop: 60 },
  headerContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', padding: 10, borderRadius: 30, marginBottom: 30, width: '90%' },
  catScroll: { marginLeft: 10 },
  catText: { color: '#555', fontSize: 16, marginRight: 20, fontWeight: '600' },
  catTextActive: { color: '#fff' },
  greeting: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 16, color: '#777', marginBottom: 40 },
  alertBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 0, 85, 0.2)', padding: 10, borderRadius: 10, marginBottom: 20 },
  alertText: { color: '#ff0055', marginLeft: 10, fontWeight: 'bold' },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  mainButton: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  smallButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#1c1c1e', justifyContent: 'center', alignItems: 'center' },
});