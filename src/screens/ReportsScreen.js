import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- BİLEŞENLER ---
import CategoryPieChart from '../components/CategoryPieChart';
import StatCard from '../components/StatCard';
import WeeklyChart from '../components/WeeklyChart';
import DataService from '../services/DataService';

// --- YARDIMCI FONKSİYONLAR (UTILS) ---
import { formatDate, formatHourMin } from '../utils/helpers';

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [todayTime, setTodayTime] = useState(0);
  const [totalDistraction, setTotalDistraction] = useState(0);

  const [chartData, setChartData] = useState({
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [0] }]
  });
  const [pieData, setPieData] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const data = await DataService.getSessions();
      const reversedData = data.reverse(); 
      setSessions(reversedData);
      calculateStats(reversedData);
    } catch (e) { console.error("Veri hatası", e); }
  };

  const clearAllData = async () => {
    Alert.alert("Tümünü Sıfırla", "Emin misiniz?", [
      { text: "İptal", style: "cancel" },
      { 
        text: "Evet", style: 'destructive',
        onPress: async () => {
          await DataService.clearAll();
          setSessions([]); calculateStats([]); 
          Alert.alert("Başarılı", "Temizlendi.");
        }
      }
    ]);
  };

  const deleteSession = async (id) => {
    Alert.alert("Sil", "Bu kaydı silmek istiyor musunuz?", [
      { text: "Vazgeç", style: "cancel" },
      { 
        text: "Sil", style: 'destructive',
        onPress: async () => {
          const updatedList = await DataService.deleteSession(id);
          const reversedData = updatedList.reverse();
          setSessions(reversedData); calculateStats(reversedData);
        }
      }
    ]);
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setTotalTime(0); setTotalDistraction(0); setTodayTime(0);
      setChartData({ labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"], datasets: [{ data: [0] }] });
      setPieData([{ name: "Veri Yok", population: 1, color: "#333", legendFontColor: "#777", legendFontSize: 12 }]);
      return;
    }

    setTotalTime(data.reduce((acc, curr) => acc + curr.duration, 0));
    setTotalDistraction(data.reduce((acc, curr) => acc + curr.distractionCount, 0));
    const todayStr = new Date().toISOString().split('T')[0];
    setTodayTime(data.filter(s => s.date.startsWith(todayStr)).reduce((acc, curr) => acc + curr.duration, 0));

    // Pasta Grafik
    const categories = {};
    data.forEach(s => { categories[s.category] = (categories[s.category] || 0) + s.duration; });
    const colors = ["#00f2ff", "#bd00ff", "#ffe600", "#ff0055", "#ffffff"];
    const pData = Object.keys(categories).map((key, index) => ({
      name: key, population: categories[key], color: colors[index % colors.length], legendFontColor: "#b0b0b0", legendFontSize: 13
    }));
    setPieData(pData.length === 0 ? [{ name: "Veri Yok", population: 1, color: "#333", legendFontColor: "#777", legendFontSize: 12 }] : pData);

    // Bar Grafik
    const last7Days = []; const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]); labels.push(d.getDate().toString()); 
    }
    const groupedData = {};
    data.forEach(item => { const k = item.date.split('T')[0]; groupedData[k] = (groupedData[k] || 0) + item.duration; });
    setChartData({ labels: labels, datasets: [{ data: last7Days.map(day => groupedData[day] || 0) }] });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.headerRow}>
        <Text style={styles.header}>İstatistikler</Text>
        <TouchableOpacity onPress={clearAllData} style={styles.clearButton}>
          <Ionicons name="trash-bin-outline" size={24} color="#ff0055" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topStatsRow}>
          <StatCard title="Bugün Toplam Odaklanma" value={todayTime} unit="dk" colors={['#232526', '#414345']} />
          <StatCard title="Toplam Dikkat Dağınıklığı Sayısı" value={totalDistraction} colors={['#3a1c71', '#d76d77', '#ffaf7b']} />
        </View>

        <View style={styles.wideCard}>
          <View>
            <Text style={styles.cardLabel}>Tüm Zamanlar</Text>
            <Text style={styles.midNumber}>{formatHourMin(totalTime)}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Tamamlanan</Text>
            <Text style={styles.midNumber}>{sessions.length} Seans</Text>
          </View>
        </View>

        <WeeklyChart data={chartData} />
        <CategoryPieChart data={pieData} />

        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
        <View style={styles.historyList}>
          {sessions.length === 0 ? (
             <Text style={styles.noHistoryText}>Henüz kayıt yok.</Text>
          ) : (
            sessions.slice(0, 10).map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyLeft}>
                  <Ionicons name="time-outline" size={20} color="#555" />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.historyCategory}>{item.category}</Text>
                    {/* HELPER KULLANILDI */}
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                
                <View style={styles.historyRight}>
                  <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                    <Text style={styles.historyDuration}>{item.duration} dk</Text>
                    {item.distractionCount > 0 && (
                      <Text style={styles.distractionText}>
                         ⚠️ {item.distractionCount} Dağılma
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => deleteSession(item.id)} style={styles.deleteItemBtn}>
                    <Ionicons name="close-circle" size={22} color="#fb0606ff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{height: 100}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  clearButton: { padding: 10, backgroundColor: 'rgba(255, 0, 85, 0.1)', borderRadius: 12 },
  topStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  wideCard: { backgroundColor: '#1c1c1e', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLabel: { color: '#a0a0a0', fontSize: 14, marginBottom: 5 },
  midNumber: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  historyList: { marginBottom: 20 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1e', padding: 15, borderRadius: 15, marginBottom: 10 },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  historyCategory: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  historyDate: { color: '#777', fontSize: 12 },
  historyRight: { flexDirection: 'row', alignItems: 'center' },
  historyDuration: { color: '#00f2ff', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  deleteItemBtn: { padding: 5 },
  noHistoryText: { color: '#555', fontStyle: 'italic' },
  distractionText: {color: '#f72525ff', fontWeight: 'bold',marginTop: 2},

});