import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Sayfa her açıldığında veriyi yenilemek için
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  const [totalTime, setTotalTime] = useState(0);
  const [totalDistraction, setTotalDistraction] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
  });
  const [pieData, setPieData] = useState([]);

  // Sayfa her görüntülendiğinde verileri çek
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('sessions');
      const data = jsonValue != null ? JSON.parse(jsonValue) : [];
      setSessions(data);
      calculateStats(data);
    } catch (e) {
      console.error("Veri okuma hatası", e);
    }
  };

const calculateStats = (data) => {
    // 1. Genel İstatistikler
    const totalMin = data.reduce((acc, curr) => acc + curr.duration, 0);
    const totalDis = data.reduce((acc, curr) => acc + curr.distractionCount, 0);
    
    setTotalTime(totalMin);
    setTotalDistraction(totalDis);

    // 2. Pie Chart Verisi (Kategori Dağılımı)
    const categories = {};
    data.forEach(session => {
      if (categories[session.category]) {
        categories[session.category] += session.duration;
      } else {
        categories[session.category] = session.duration;
      }
    });

    const pData = Object.keys(categories).map((key, index) => ({
      name: key,
      population: categories[key],
      color: index === 0 ? "#f39c12" : index === 1 ? "#3498db" : index === 2 ? "#e74c3c" : "#9b59b6",
      legendFontColor: "#7f8c8d",
      legendFontSize: 15
    }));
    setPieData(pData);

    // 3. Bar Chart Verisi (Basitçe son eklenenleri gösterelim - Geliştirilebilir)
    // Not: Gerçek tarih kontrolü için moment.js kullanılabilir ama şimdilik basit tutuyoruz.
    const last7Sessions = data.slice(-7).map(s => s.duration);
    // Eğer veri yoksa boş array hatası vermemesi için
    const cleanData = last7Sessions.length > 0 ? last7Sessions : [0];
    
    setChartData({
      labels: ["Son 7", "Seans", "Verisi", "...", "...", "...", "Bugün"], // Statik label şimdilik
      datasets: [{ data: cleanData }]
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Raporlar & İstatistikler</Text>

      {/* Özet Kartları */}
      <View style={styles.statsRow}>
        <View style={[styles.card, { backgroundColor: '#e8f8f5' }]}>
          <Text style={styles.cardTitle}>Toplam Süre</Text>
          <Text style={[styles.cardValue, { color: '#1abc9c' }]}>{totalTime} dk</Text>
        </View>
        <View style={[styles.card, { backgroundColor: '#fdedec' }]}>
          <Text style={styles.cardTitle}>Dikkat Dağınıklığı</Text>
          <Text style={[styles.cardValue, { color: '#e74c3c' }]}>{totalDistraction}</Text>
        </View>
      </View>

      {/* Grafik 1: Bar Chart */}
      <Text style={styles.chartTitle}>Son Odaklanma Süreleri (dk)</Text>
      <BarChart
        data={chartData}
        width={screenWidth - 40}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: "#ffffff",
          backgroundGradientFrom: "#ffffff",
          backgroundGradientTo: "#ffffff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />

      {/* Grafik 2: Pie Chart */}
      <Text style={styles.chartTitle}>Kategori Dağılımı</Text>
      <PieChart
        data={pieData}
        width={screenWidth - 20}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor={"population"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
      
      {/* Veri yoksa uyarı */}
      {sessions.length === 0 && (
        <Text style={styles.noDataText}>Henüz kaydedilmiş bir odaklanma seansı yok.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { width: '48%', padding: 20, borderRadius: 15, alignItems: 'center' },
  cardTitle: { fontSize: 14, color: '#7f8c8d', marginBottom: 5 },
  cardValue: { fontSize: 28, fontWeight: 'bold' },
  chartTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#34495e' },
  chart: { marginVertical: 8, borderRadius: 16 },
  noDataText: { textAlign: 'center', marginTop: 20, color: '#95a5a6', fontStyle: 'italic' }
});