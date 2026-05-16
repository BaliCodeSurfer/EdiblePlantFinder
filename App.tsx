import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { identifyPlant } from './services/plantId';
import { CameraScreen } from './components/CameraScreen';
import { ResultCard } from './components/ResultCard';
import { PlantIdentificationResult } from './types';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [facing, setFacing] = useState<CameraType>('back');

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);

  const resultAnim = useRef(new Animated.Value(0)).current;

  // Drives a fade + slide-up entrance for the ResultCard.
  // resultAnim goes 0→1 over 1000ms; opacity maps directly while
  // translateY interpolates from 40px below to its final position.
  const resultAnimatedStyle = {
    opacity: resultAnim,
    transform: [
      {
        translateY: resultAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera permission to take pictures</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}
          accessibilityRole="button"
          accessibilityLabel="Grant camera permission"
          accessibilityHint="Opens the system permission dialog to allow camera access"
        >
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async (photo: any) => {
    try {
      setPhotoUri(photo.uri ?? null);
      setBase64Image(photo.base64 ?? null);
      setResult(null);
    } catch (error) {
      console.error('Camera error:', error);
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

      Animated.timing(resultAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    } catch (error: any) {
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
    resultAnim.setValue(0);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {!photoUri ? (
        <CameraScreen
          facing={facing}
          onCameraReady={() => setCameraReady(true)}
          onPictureTaken={takePicture}
          onFlipCamera={toggleCameraFacing}
        />
      ) : (
        <ScrollView style={styles.previewContainer} contentContainerStyle={styles.scrollContent}>
          <Image 
            source={{ uri: photoUri }} 
            style={styles.previewImage} 
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Captured plant photo"
          />

          {result ? (
            <Animated.View style={resultAnimatedStyle}>
              <ResultCard result={result} onRetake={reset} />
            </Animated.View>
          ) : (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.analyzeButton]}
                onPress={analyzePlant}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Analyze photo"
                accessibilityHint="Sends the captured photo to the server for plant identification"
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
                accessibilityRole="button"
                accessibilityLabel="Retake photo"
                accessibilityHint="Discards the current photo and returns to the camera"
              >
                <Ionicons name="camera" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}

          <Text
            style={styles.disclaimer}
            accessibilityRole="text"
            accessibilityLabel="Safety disclaimer: This app is for informational purposes only. Never eat wild plants without expert confirmation."
          >
            ⚠️ SAFETY FIRST: This app is for informational purposes only. Never eat wild plants without expert confirmation.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}