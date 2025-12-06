import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import StatCard from '../components/StatCard';

const screenWidth = Dimensions.get("window").width;

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
      const jsonValue = await AsyncStorage.getItem('sessions');
      // Veriyi ters çevir (reverse) ki en son yapılan en üstte gözüksün
      const data = jsonValue != null ? JSON.parse(jsonValue).reverse() : [];
      setSessions(data);
      calculateStats(data);
    } catch (e) {
      console.error("Veri okuma hatası", e);
    }
  };

  const clearAllData = async () => {
    Alert.alert(
      "Tümünü Sıfırla",
      "Tüm odaklanma geçmişiniz silinecek. Emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        { 
          text: "Evet, Sil", 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('sessions');
              setSessions([]);
              calculateStats([]); 
              Alert.alert("Başarılı", "Tüm veriler temizlendi.");
            } catch (e) { console.error("Silme hatası", e); }
          }
        }
      ]
    );
  };

  // --- YENİ: TEKİL SİLME FONKSİYONU ---
  const deleteSession = async (id) => {
    Alert.alert(
      "Kaydı Sil",
      "Bu seans kaydını silmek istiyor musunuz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { 
          text: "Sil", 
          style: 'destructive',
          onPress: async () => {
            try {
              // Silinecek id dışındakileri filtrele
              // Not: sessions state'i zaten ters (reverse) duruyor, orijinal sıraya sadık kalmak için:
              // Veritabanından taze okuyup silmek en güvenlisidir.
              const jsonValue = await AsyncStorage.getItem('sessions');
              let originalData = jsonValue != null ? JSON.parse(jsonValue) : [];
              
              const filteredData = originalData.filter(item => item.id !== id);
              
              await AsyncStorage.setItem('sessions', JSON.stringify(filteredData));
              
              // Ekrana yansıt
              const reversedData = filteredData.reverse();
              setSessions(reversedData);
              calculateStats(reversedData);
              
            } catch (e) { console.error("Tekil silme hatası", e); }
          }
        }
      ]
    );
  };

  const calculateStats = (data) => {
    if (!data || data.length === 0) {
      setTotalTime(0);
      setTotalDistraction(0);
      setTodayTime(0);
      setChartData({
        labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
        datasets: [{ data: [0] }]
      });
      setPieData([{ name: "Veri Yok", population: 1, color: "#333", legendFontColor: "#777", legendFontSize: 12 }]);
      return;
    }

    const allTime = data.reduce((acc, curr) => acc + curr.duration, 0);
    const allDistraction = data.reduce((acc, curr) => acc + curr.distractionCount, 0);
    setTotalTime(allTime);
    setTotalDistraction(allDistraction);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = data.filter(session => session.date.startsWith(todayStr));
    const todayTotal = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    setTodayTime(todayTotal);

    const categories = {};
    data.forEach(session => {
      if (categories[session.category]) {
        categories[session.category] += session.duration;
      } else {
        categories[session.category] = session.duration;
      }
    });

    const colors = ["#00f2ff", "#bd00ff", "#ffe600", "#ff0055", "#ffffff"];
    const pData = Object.keys(categories).map((key, index) => ({
      name: key,
      population: categories[key],
      color: colors[index % colors.length],
      legendFontColor: "#b0b0b0",
      legendFontSize: 13
    }));

    if (pData.length === 0) {
       setPieData([{ name: "Veri Yok", population: 1, color: "#333", legendFontColor: "#777", legendFontSize: 12 }]);
    } else {
       setPieData(pData);
    }

    const last7Days = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(dateStr);
      labels.push(d.getDate().toString()); 
    }

    const groupedData = {};
    data.forEach(item => {
      const dateKey = item.date.split('T')[0];
      if (groupedData[dateKey]) {
        groupedData[dateKey] += item.duration;
      } else {
        groupedData[dateKey] = item.duration;
      }
    });

    const chartValues = last7Days.map(day => groupedData[day] || 0);

    setChartData({
      labels: labels,
      datasets: [{ data: chartValues }]
    });
  };

  const formatHourMin = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    const time = `${d.getHours() < 10 ? '0'+d.getHours() : d.getHours()}:${d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes()}`;
    const date = `${d.getDate()}/${d.getMonth() + 1}`;
    return `${time} (${date})`;
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
          <StatCard title="Bugün" value={todayTime} unit="dk" colors={['#232526', '#414345']} />
          <StatCard title="Dikkat Dağınıklığı" value={totalDistraction} colors={['#3a1c71', '#d76d77', '#ffaf7b']} />
        </View>

        <View style={styles.wideCard}>
          <View>
            <Text style={styles.cardLabel}>Toplam Odaklanma</Text>
            <Text style={styles.midNumber}>{formatHourMin(totalTime)}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Tamamlanan</Text>
            <Text style={styles.midNumber}>{sessions.length} Seans</Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Haftalık Performans</Text>
          <BarChart
            data={chartData}
            width={screenWidth - 40}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "#1c1c1e",
              backgroundGradientTo: "#1c1c1e",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 242, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              barPercentage: 0.6,
            }}
            style={styles.chart}
            showBarTops={false}
            fromZero={true}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 20}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            absolute
          />
        </View>

        <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
        <View style={styles.historyList}>
          {sessions.length === 0 ? (
             <Text style={styles.noHistoryText}>Henüz kayıt yok.</Text>
          ) : (
            sessions.slice(0, 10).map((item) => ( // Son 10 kaydı gösterelim
              <View key={item.id} style={styles.historyItem}>
                
                {/* Sol Taraf: Bilgiler */}
                <View style={styles.historyLeft}>
                  <Ionicons name="time-outline" size={20} color="#555" />
                  <View style={{marginLeft: 10}}>
                    <Text style={styles.historyCategory}>{item.category}</Text>
                    <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                  </View>
                </View>
                
                {/* Sağ Taraf: Süre ve SİLME BUTONU */}
                <View style={styles.historyRight}>
                  <Text style={styles.historyDuration}>{item.duration} dk</Text>
                  
                  {/* TEKİL SİLME BUTONU */}
                  <TouchableOpacity onPress={() => deleteSession(item.id)} style={styles.deleteItemBtn}>
                    <Ionicons name="close-circle" size={20} color="#fb0606ff" />
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
  chartContainer: { backgroundColor: '#1c1c1e', borderRadius: 20, padding: 15, marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginTop: 10 },
  chart: { borderRadius: 16, paddingRight: 35 },
  
  historyList: { marginBottom: 20 },
  historyItem: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1c1c1e', padding: 15, borderRadius: 15, marginBottom: 10
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center' },
  historyCategory: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  historyDate: { color: '#777', fontSize: 12 },
  historyRight: { flexDirection: 'row', alignItems: 'center' },
  historyDuration: { color: '#00f2ff', fontWeight: 'bold', fontSize: 16, marginRight: 10 },
  
  // Yeni Buton Stili
  deleteItemBtn: { padding: 5 }
  ,
  noHistoryText: { color: '#555', fontStyle: 'italic' }
});