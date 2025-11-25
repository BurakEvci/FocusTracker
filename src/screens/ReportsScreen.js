import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; // Sayfa her açıldığında veriyi yenilemek için
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function ReportsScreen() {
  const [sessions, setSessions] = useState([]);
  
  // İstenen 3 İstatistik Verisi
  const [totalTime, setTotalTime] = useState(0);      // Tüm Zamanlar
  const [todayTime, setTodayTime] = useState(0);      // Bugün (YENİ EKLENDİ)
  const [totalDistraction, setTotalDistraction] = useState(0); // Dikkat Dağınıklığı

  const [chartData, setChartData] = useState({
    labels: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
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
      const data = jsonValue != null ? JSON.parse(jsonValue) : [];
      setSessions(data);
      calculateStats(data);
    } catch (e) {
      console.error("Veri okuma hatası", e);
    }
  };

  const calculateStats = (data) => {
    // --- 1. GENEL İSTATİSTİKLER ---
    
    // A. Tüm Zamanların Toplam Süresi ve Dikkat Dağınıklığı
    const allTime = data.reduce((acc, curr) => acc + curr.duration, 0);
    const allDistraction = data.reduce((acc, curr) => acc + curr.distractionCount, 0);
    
    setTotalTime(allTime);
    setTotalDistraction(allDistraction);

    // B. Bugün Toplam Odaklanma Süresi (YENİ)
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todaySessions = data.filter(session => session.date.startsWith(todayStr));
    const todayTotal = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    
    setTodayTime(todayTotal);

    // --- 2. PASTA GRAFİK (Kategori Dağılımı) ---
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
    
    // Veri yoksa boş grafik hatası vermesin diye kontrol
    if (pData.length === 0) {
       setPieData([{ name: "Veri Yok", population: 1, color: "#bdc3c7", legendFontColor: "#7f8c8d", legendFontSize: 15 }]);
    } else {
       setPieData(pData);
    }

    // --- 3. ÇUBUK GRAFİK (Son 7 Günlük Dağılım) ---
    const last7Days = [];
    const labels = [];
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      last7Days.push(dateStr);
      // Label olarak sadece günü göster (Örn: 24)
      labels.push(d.getDate().toString()); 
    }

    // Günlere göre veriyi topla
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Raporlar & İstatistikler</Text>

      {/* İstatistik Kartları - ÖDEV GEREKSİNİMİNE GÖRE GÜNCELLENDİ */}
      <View style={styles.statsContainer}>
        
        {/* 1. Kart: Bugün */}
        <View style={[styles.card, { backgroundColor: '#d4efdf' }]}>
          <Text style={styles.cardTitle}>Bugün</Text>
          <Text style={[styles.cardValue, { color: '#27ae60' }]}>{todayTime} dk</Text>
        </View>

        {/* 2. Kart: Tüm Zamanlar */}
        <View style={[styles.card, { backgroundColor: '#d6eaf8' }]}>
          <Text style={styles.cardTitle}>Toplam</Text>
          <Text style={[styles.cardValue, { color: '#2980b9' }]}>{totalTime} dk</Text>
        </View>

        {/* 3. Kart: Dikkat Dağınıklığı */}
        <View style={[styles.card, { backgroundColor: '#fadbd8' }]}>
          <Text style={styles.cardTitle}>Dağılma</Text>
          <Text style={[styles.cardValue, { color: '#c0392b' }]}>{totalDistraction}</Text>
        </View>

      </View>

      {/* Grafik 1: Bar Chart */}
      <Text style={styles.chartTitle}>Son 7 Gün Odaklanma (dk)</Text>
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
      
      {sessions.length === 0 && (
        <Text style={styles.noDataText}>Henüz veri bulunmuyor.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#2c3e50' },
  
  // Kartlar için yeni düzen
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  card: { width: '30%', paddingVertical: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 12, color: '#7f8c8d', marginBottom: 5, fontWeight: '600' },
  cardValue: { fontSize: 20, fontWeight: 'bold' },

  chartTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 10, color: '#34495e' },
  chart: { marginVertical: 8, borderRadius: 16 },
  noDataText: { textAlign: 'center', marginTop: 20, color: '#95a5a6', fontStyle: 'italic' }
});