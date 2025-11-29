import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './src/screens/HomeScreen';
import ReportsScreen from './src/screens/ReportsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Odaklan') iconName = focused ? 'timer' : 'timer-outline';
            else if (route.name === 'Raporlar') iconName = focused ? 'stats-chart' : 'stats-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#00f2ff', // Neon Mavi
          tabBarInactiveTintColor: '#555',
          tabBarStyle: {
            backgroundColor: '#121212', // Koyu Arka Plan
            borderTopWidth: 0,
            paddingTop: 10,
          },
          headerStyle: {
            backgroundColor: '#121212',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerTintColor: '#fff',
          headerTitleAlign: 'center',
          headerShown: false, // Header'ı sayfa içinde yaptık, burada kapatalım
        })}
      >
        <Tab.Screen name="Odaklan" component={HomeScreen} />
        <Tab.Screen name="Raporlar" component={ReportsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}