import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  getSavedIdentifications,
  deleteIdentification,
  SavedIdentification,
} from '../services/storage';

interface Props {
  onSelect: (item: SavedIdentification) => void;
}

export function MyPlantsScreen({ onSelect }: Props) {
  const [plants, setPlants] = useState<SavedIdentification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPlants = async () => {
    setLoading(true);
    const data = await getSavedIdentifications();
    setPlants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlants();
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete plant?',
      'This will remove the saved identification and its photo.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteIdentification(id);
            loadPlants();
          },
        },
      ]
    );
  };

  const getImageSource = (item: SavedIdentification) => {
    if (item.photoUri) {
      return { uri: item.photoUri };
    }
    if (item.photoBase64) {
      return { uri: `data:image/jpeg;base64,${item.photoBase64}` };
    }
    return undefined;
  };

  const renderItem = ({ item }: { item: SavedIdentification }) => {
    const top = item.result.classification.suggestions[0];
    const name = top.details?.common_names?.[0] ?? top.name;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelect(item)}
        accessibilityRole="button"
        accessibilityLabel={`Saved plant: ${name}`}
      >
        {getImageSource(item) ? (
          <Image source={getImageSource(item)} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholder]}>
            <Text style={styles.placeholderText}>No photo</Text>
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.meta}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
          <Text style={styles.confidence}>
            {(top.probability * 100).toFixed(0)}% confidence
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteButton}
          accessibilityRole="button"
          accessibilityLabel="Delete saved plant"
        >
          <Text style={styles.deleteText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading your plants...</Text>
      </View>
    );
  }

  if (plants.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          No plants saved yet.{'\n'}Take a photo and save your first identification!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={plants}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 16 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#222',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    alignItems: 'center',
  },
  thumbnail: {
    width: 70,
    height: 70,
  },
  placeholder: {
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 12,
  },
  info: {
    flex: 1,
    padding: 12,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  meta: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 2,
  },
  confidence: {
    color: '#0c0',
    fontSize: 14,
    marginTop: 4,
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    color: '#e57373',
    fontSize: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
