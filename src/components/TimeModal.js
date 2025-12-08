import * as Haptics from 'expo-haptics';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TimeModal({ visible, onClose, onSave, customMinutes, setCustomMinutes }) {
  
  const handleQuickSelect = (min) => {
    setCustomMinutes(min.toString());
    Haptics.selectionAsync(); 
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Süre Seç</Text>
          
          {/* Hızlı Seçim Butonları */}
          <View style={styles.quickSelectContainer}>
            {[15, 25, 40, 60].map((min) => (
              <TouchableOpacity 
                key={min} 
                style={[
                  styles.quickBtn, 
                  customMinutes === min.toString() && styles.quickBtnActive
                ]}
                onPress={() => handleQuickSelect(min)}
              >
                <Text style={[
                  styles.quickBtnText, 
                  customMinutes === min.toString() && styles.quickBtnTextActive
                ]}>{min} dk</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.inputLabel}>veya manuel gir:</Text>
          <TextInput 
            style={styles.input} 
            onChangeText={setCustomMinutes} 
            value={customMinutes} 
            keyboardType="numeric" 
            maxLength={3} 
            placeholderTextColor="#555"
          />

          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
             <Text style={styles.saveButtonText}>TAMAM</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose} style={{marginTop: 15}}>
            <Text style={{color: '#777'}}>İptal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: 'rgba(0,0,0,0.85)' },
  modalView: { backgroundColor: "#1c1c1e", borderRadius: 25, padding: 25, alignItems: "center", width: '85%', borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: "#fff", fontSize: 20, marginBottom: 20, fontWeight: 'bold' },
  quickSelectContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  quickBtn: { backgroundColor: '#2c2c2e', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#444', minWidth: 60, alignItems: 'center' },
  quickBtnActive: { backgroundColor: 'rgba(0, 242, 255, 0.2)', borderColor: '#00f2ff' },
  quickBtnText: { color: '#aaa', fontSize: 14, fontWeight: '600' },
  quickBtnTextActive: { color: '#00f2ff', fontWeight: 'bold' },
  inputLabel: { color: '#777', fontSize: 12, marginBottom: 5, alignSelf: 'flex-start', marginLeft: 5 },
  input: { backgroundColor: '#2c2c2e', color: '#fff', width: '100%', borderRadius: 12, padding: 15, fontSize: 20, textAlign: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#444' },
  saveButton: { backgroundColor: "#00f2ff", borderRadius: 12, padding: 15, width: '100%', alignItems: 'center' },
  saveButtonText: { color: "#000", fontWeight: 'bold', fontSize: 16 }
});