import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient'; // Gradyan arka planlar için
import { useCallback, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

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
      const data = jsonValue != null ? JSON.parse(jsonValue) : [];
      setSessions(data);
      calculateStats(data);
    } catch (e) {
      console.error("Veri okuma hatası", e);
    }
  };

  const calculateStats = (data) => {
    // 1. Genel İstatistikler
    const allTime = data.reduce((acc, curr) => acc + curr.duration, 0);
    const allDistraction = data.reduce((acc, curr) => acc + curr.distractionCount, 0);
    setTotalTime(allTime);
    setTotalDistraction(allDistraction);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = data.filter(session => session.date.startsWith(todayStr));
    const todayTotal = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);
    setTodayTime(todayTotal);

    // 2. Pasta Grafik
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

    // 3. Bar Grafik
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

  // Saat formatına çevir (örn: 75 dk -> 1sa 15dk)
  const formatHourMin = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}sa ${m}dk`;
    return `${m}dk`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.header}>İstatistikler</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Üst Kartlar */}
        <View style={styles.topStatsRow}>
          {/* Sol Kart: Bugün */}
          <LinearGradient colors={['#232526', '#414345']} style={styles.smallCard}>
            <Text style={styles.cardLabel}>Bugün</Text>
            <Text style={[styles.bigNumber, { color: '#00f2ff' }]}>{todayTime} <Text style={styles.unit}>dk</Text></Text>
          </LinearGradient>

          {/* Sağ Kart: Dağılma */}
          <LinearGradient colors={['#3a1c71', '#d76d77', '#ffaf7b']} start={{x:0, y:0}} end={{x:1, y:1}} style={styles.smallCard}>
            <Text style={[styles.cardLabel, {color: '#fff'}]}>Dikkat Dağılması</Text>
            <Text style={[styles.bigNumber, { color: '#fff' }]}>{totalDistraction}</Text>
          </LinearGradient>
        </View>

        {/* Geniş Kart: Toplam */}
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

        {/* Grafik: Haftalık Performans */}
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
              color: (opacity = 1) => `rgba(0, 242, 255, ${opacity})`, // Neon Mavi
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              barPercentage: 0.6,
            }}
            style={styles.chart}
            showBarTops={false}
            fromZero={true}
          />
        </View>

        {/* Grafik: Kategori Dağılımı */}
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

        <View style={{height: 100}} /> 
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 20, paddingTop: 50 },
  header: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  
  topStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  smallCard: { 
    width: '48%', 
    padding: 20, 
    borderRadius: 20, 
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8
  },
  cardLabel: { color: '#a0a0a0', fontSize: 14, marginBottom: 5 },
  bigNumber: { fontSize: 32, fontWeight: 'bold' },
  unit: { fontSize: 16, fontWeight: 'normal', color: '#a0a0a0' },

  wideCard: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  midNumber: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

  chartContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 15 },
  chart: { borderRadius: 16, paddingRight: 35 },
});