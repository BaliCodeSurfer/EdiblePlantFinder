import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { SavedIdentification } from '../services/storage';
import { ResultCard } from './ResultCard';

interface Props {
  visible: boolean;
  item: SavedIdentification | null;
  onClose: () => void;
}

export function SavedPlantDetail({ visible, item, onClose }: Props) {
  if (!item) return null;

  const getImageSource = () => {
    if (item.photoUri) {
      return { uri: item.photoUri };
    }
    if (item.photoBase64) {
      return { uri: `data:image/jpeg;base64,${item.photoBase64}` };
    }
    return undefined;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Plant</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {getImageSource() && (
            <Image
              source={getImageSource()}
              style={styles.photo}
              resizeMode="contain"
            />
          )}

          <View style={styles.cardContainer}>
            <ResultCard result={item.result} />
          </View>

          <Text style={styles.timestamp}>
            Saved on {new Date(item.timestamp).toLocaleString()}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#000',
  },
  closeButton: {
    width: 40,
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 24,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  cardContainer: {
    marginTop: -20,
    paddingHorizontal: 16,
  },
  timestamp: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
});
