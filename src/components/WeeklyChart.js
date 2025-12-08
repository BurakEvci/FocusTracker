import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function WeeklyChart({ data }) {
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Haftalık Performans</Text>
      <BarChart
        data={data}
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
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 10
  },
  chart: {
    borderRadius: 16,
    paddingRight: 35
  },
});