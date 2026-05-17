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
  const toxicity = top.details?.toxicity ?? '';
  const toxicityLower = toxicity.toLowerCase();

  // Check for explicit safety language first (e.g., "safe", "non-toxic", "not toxic").
  const isExplicitlySafe =
    toxicityLower.includes('safe') ||
    toxicityLower.includes('non-toxic') ||
    toxicityLower.includes('not toxic') ||
    toxicityLower.includes('no toxicity') ||
    toxicityLower.includes('non toxic');

  // Only flag as toxic if danger keywords exist AND it's not explicitly marked safe.
  const hasActualToxicity =
    !isExplicitlySafe && (
      toxicityLower.includes('toxic') ||
      toxicityLower.includes('poison') ||
      toxicityLower.includes('harmful') ||
      toxicityLower.includes('danger')
    );

  // Safety-first logic: only treat toxicity as a warning if it contains danger keywords.
  // Safe/non-toxic descriptions should not trigger a red banner.
  const showEdible = edibleParts.length > 0 && !hasActualToxicity;

  const accessibilitySummary = hasActualToxicity
    ? `Caution: ${commonName} has reported toxicity. ${toxicity}. Edible parts: ${edibleParts.length ? edibleParts.join(', ') : 'unknown'}`
    : showEdible
    ? `Edible plant detected: ${commonName}. Edible parts: ${edibleParts.join(', ')}`
    : `No known edible parts for ${commonName}. ${toxicity ? `Toxicity: ${toxicity}` : ''}`;

  return (
    <View 
      style={styles.resultCard}
      accessibilityRole="summary"
      accessibilityLabel={accessibilitySummary}
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

      {hasActualToxicity ? (
        <View style={styles.notEdibleFlag}>
          <Text style={styles.notEdibleText}>⚠️ TOXICITY WARNING</Text>
          <Text style={styles.toxicity}>Toxicity: {toxicity}</Text>
          {edibleParts.length > 0 && (
            <Text style={styles.edibleParts}>
              Reported edible parts: {edibleParts.join(', ')} — use extreme caution
            </Text>
          )}
        </View>
      ) : showEdible ? (
        <View style={styles.edibleFlag}>
          <Text style={styles.edibleText}>✅ EDIBLE PLANT DETECTED</Text>
          <Text style={styles.edibleParts}>
            Edible parts: {edibleParts.join(', ')}
          </Text>
        </View>
      ) : (
        <View style={styles.notEdibleFlag}>
          <Text style={styles.notEdibleText}>⚠️ No edible parts found (or unknown)</Text>
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
