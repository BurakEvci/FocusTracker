import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function CategoryPieChart({ data }) {
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.sectionTitle}>Kategori Dağılımı</Text>
      <PieChart
        data={data}
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
});