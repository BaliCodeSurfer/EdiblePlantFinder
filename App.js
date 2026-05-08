import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { hasApiKey, identifyPlant } from './services/plantId';
import { CameraScreen } from './components/CameraScreen';
import { ResultCard } from './components/ResultCard';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!hasApiKey()) {
      Alert.alert(
        'API Key Missing',
        'Please sign up at https://www.kindwise.com/plant-id and set your API key in services/plantId.js'
      );
    }
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to take pictures</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: true,
      });
      setPhotoUri(photo.uri);
      setBase64Image(photo.base64);
      setResult(null); // clear the data about edibility
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const analyzePlant = async () => {
    if (!base64Image) return;

    setLoading(true);
    try {
      const plantResult = await identifyPlant(base64Image);
      if (!plantResult?.classification?.suggestions?.length) {
        Alert.alert('No matches', 'Could not identify a plant in this photo.');
        return;
      }
      setResult(plantResult);
    } catch (error) {
      console.error('Full error:', error);
      Alert.alert('Analysis failed', error.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhotoUri(null);
    setBase64Image(null);
    setResult(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {!photoUri ? (
        <CameraScreen
          cameraRef={cameraRef}
          onReady={() => setCameraReady(true)}
          onCapture={takePicture}
        />
      ) : (
        <ScrollView style={styles.previewContainer} contentContainerStyle={styles.scrollContent}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />

          {result ? (
            <ResultCard result={result} onRetake={reset} />
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.analyzeButton]}
                onPress={analyzePlant}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Analyze Photo</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.iconButton]}
                onPress={reset}
                accessibilityLabel="Retake photo"
              >
                <Ionicons name="camera" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.disclaimer}>
            ⚠️ SAFETY FIRST: This app is for informational purposes only. Never eat wild plants without expert confirmation.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}
