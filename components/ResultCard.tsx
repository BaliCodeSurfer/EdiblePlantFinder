import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { PlantIdentificationResult } from '../types';

interface ResultCardProps {
  result: PlantIdentificationResult;
  onRetake: () => void;
}

export function ResultCard({ result, onRetake }: ResultCardProps) {
  const top = result.classification.suggestions[0];
  const commonName = top.details?.common_names?.[0] ?? top.name;
  const edibleParts = top.details?.edible_parts ?? [];
  const isEdible = edibleParts.length > 0;
  const toxicity = top.details?.toxicity;

  return (
    <View style={styles.resultCard}>
      <Text style={styles.plantName}>{commonName}</Text>
      <Text style={styles.scientificName}>{top.name}</Text>
      <Text style={styles.probability}>
        Confidence: {(top.probability * 100).toFixed(1)}%
      </Text>

      {isEdible ? (
        <View style={styles.edibleFlag}>
          <Text style={styles.edibleText}>✅ EDIBLE PLANT DETECTED</Text>
          <Text style={styles.edibleParts}>
            Edible parts: {edibleParts.join(', ')}
          </Text>
        </View>
      ) : (
        <View style={styles.notEdibleFlag}>
          <Text style={styles.notEdibleText}>⚠️ No edible parts found (or unknown)</Text>
          {toxicity && <Text style={styles.toxicity}>Toxicity: {toxicity}</Text>}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={onRetake}>
        <Text style={styles.buttonText}>Take Another Photo</Text>
      </TouchableOpacity>
    </View>
  );
}
