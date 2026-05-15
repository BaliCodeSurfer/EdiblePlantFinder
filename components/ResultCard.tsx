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
    <View 
      style={styles.resultCard}
      accessibilityRole="summary"
      accessibilityLabel={`Plant identification result for ${commonName}`}
    >
      <Text 
        style={styles.plantName}
        accessibilityRole="header"
      >
        {commonName}
      </Text>
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

      <TouchableOpacity 
        style={styles.button} 
        onPress={onRetake}
        accessibilityRole="button"
        accessibilityLabel="Take another photo"
        accessibilityHint="Discards the current result and returns to the camera"
      >
        <Text style={styles.buttonText}>Take Another Photo</Text>
      </TouchableOpacity>
    </View>
  );
}
