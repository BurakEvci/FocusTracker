import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatTime } from '../utils/helpers';

export default function TimerCircle({ timeLeft, isActive, onPress }) {

  return (
    <TouchableOpacity onPress={onPress} style={styles.timerWrapper}>
      <LinearGradient
        colors={isActive ? ['#00f2ff', '#00c6ff'] : ['#2c3e50', '#000000']}
        style={styles.timerCircle}
      >
        <View style={styles.innerCircle}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.statusText}>
            {isActive ? 'DAKİKA KALIYOR' : 'AYARLAMAK İÇİN BAS'}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  timerWrapper: { marginBottom: 40 },
  timerCircle: { width: 280, height: 280, borderRadius: 140, padding: 3, justifyContent: 'center', alignItems: 'center' },
  innerCircle: { width: 270, height: 270, borderRadius: 135, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center', borderWidth: 10, borderColor: '#1c1c1e' },
  timerText: { fontSize: 64, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  statusText: { color: '#555', fontSize: 12, marginTop: 5, letterSpacing: 1 }
});