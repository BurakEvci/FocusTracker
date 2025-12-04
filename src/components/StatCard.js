import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text } from 'react-native';

// Bu bileşen, istatistik kartlarını tek bir merkezden yönetmemizi sağlar
export default function StatCard({ title, value, unit, colors, isWide }) {
  
  // Eğer geniş kart istenirse (Toplam Süre gibi)
  if (isWide) {
    return null; 
  }

  // Standart Küçük Kart (Bugün, Dağılma vb.)
  return (
    <LinearGradient colors={colors} style={styles.smallCard} start={{x:0, y:0}} end={{x:1, y:1}}>
      <Text style={styles.cardLabel}>{title}</Text>
      <Text style={[styles.bigNumber, { color: unit ? '#00f2ff' : '#fff' }]}>
        {value} {unit && <Text style={styles.unit}>{unit}</Text>}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  smallCard: { 
    width: '48%', 
    padding: 20, 
    borderRadius: 20, 
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    marginBottom: 15
  },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 5 },
  bigNumber: { fontSize: 32, fontWeight: 'bold' },
  unit: { fontSize: 16, fontWeight: 'normal', color: 'rgba(255,255,255,0.7)' },
});