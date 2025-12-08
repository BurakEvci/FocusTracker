import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'sessions';

const DataService = {
  // 1. Tüm Verileri Getir
  getSessions: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
      console.error("Veri okuma hatası:", e);
      return [];
    }
  },

  // 2. Yeni Seans Ekle
  addSession: async (newSession) => {
    try {
      const currentSessions = await DataService.getSessions();
      const updatedSessions = [...currentSessions, newSession];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      return updatedSessions;
    } catch (e) {
      console.error("Veri kaydetme hatası:", e);
    }
  },

  // 3. Tekil Veri Sil
  deleteSession: async (id) => {
    try {
      const currentSessions = await DataService.getSessions();
      const filteredSessions = currentSessions.filter(item => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSessions));
      return filteredSessions;
    } catch (e) {
      console.error("Silme hatası:", e);
    }
  },

  // 4. Tüm Verileri Temizle
  clearAll: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return [];
    } catch (e) {
      console.error("Temizleme hatası:", e);
    }
  }
};

export default DataService;