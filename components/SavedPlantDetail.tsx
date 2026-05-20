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
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Drag handle for iOS page sheet */}
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        {/* Header with blur background and SafeAreaView */}
        <SafeAreaView edges={['top']} style={styles.headerWrapper}>
          <BlurView intensity={60} tint="dark" style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Saved Plant</Text>
            <View style={{ width: 44 }} />
          </BlurView>
        </SafeAreaView>

        <ScrollView contentContainerStyle={styles.content}>
          {getImageSource() && (
            <Image
              source={getImageSource()}
              style={styles.photo}
              resizeMode="contain"
            />
          )}

          <LinearGradient
            colors={['rgba(17,17,17,0.92)', '#111111']}
            style={styles.cardContainer}
          >
            <ResultCard result={item.result} />
          </LinearGradient>

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
  headerWrapper: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    // Semi-transparent background as fallback when blur is not rendered
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  // Drag handle (iOS page sheet style)
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#000',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#555',
    borderRadius: 2,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  closeText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '300',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 60,
  },
  photo: {
    width: '100%',
    height: 300,
    backgroundColor: '#000',
  },
  cardContainer: {
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  timestamp: {
    color: '#888',
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 28,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
});
