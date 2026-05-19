import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { styles } from './styles';
import { identifyPlant } from './services/plantId';
import { CameraScreen } from './components/CameraScreen';
import { ResultCard } from './components/ResultCard';
import { PlantIdentificationResult } from './types';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);

  const { width, height } = useWindowDimensions();
  const isWide = width > 700;

  const resultAnim = useRef(new Animated.Value(0)).current;

  // Scales the Analyze button down on press and springs back on release.
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Pulses the Analyze button opacity while the API call is in-flight.
  const loadingPulse = useRef(new Animated.Value(1)).current;

  // Drives a spring scale + fade when a photo is first captured.
  // Starts invisible and scaled down; springs into place on arrival.
  const photoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (photoUri) {
      photoAnim.setValue(0);
      Animated.spring(photoAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }
  }, [photoUri]);

  // While the API call is in-flight, loop an opacity pulse on the button
  // (1.0 → 0.4 → 1.0) to signal activity. Stops and resets when done.
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingPulse, { toValue: 0.4, duration: 600, useNativeDriver: true }),
          Animated.timing(loadingPulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      loadingPulse.stopAnimation();
      loadingPulse.setValue(1);
    }
  }, [loading]);

  // Shrinks the button slightly on press to give tactile feedback.
  const onAnalyzePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.9, useNativeDriver: true }).start();
  };

  // Springs the button back to full size on release, with a natural bounce.
  const onAnalyzePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Drives a fade + slide-up entrance for the ResultCard.
  // resultAnim goes 0→1 over 1000ms; opacity maps directly while
  // translateY interpolates from 40px below to its final position.
  const resultAnimatedStyle = {
    opacity: resultAnim,
    transform: [{ translateY: resultAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
  };

  const analyzeButtonAnimatedStyle = {
    transform: [{ scale: buttonScale }],
    opacity: loadingPulse,
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

  const takePicture = (photo: any) => {
    setPhotoUri(photo.uri ?? null);
    setBase64Image(photo.base64 ?? null);
    setResult(null);
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
      Animated.timing(resultAnim, { toValue: 1, duration: 1000, useNativeDriver: true }).start();
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
    photoAnim.setValue(0);
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
          onPictureTaken={takePicture}
          onFlipCamera={toggleCameraFacing}
        />
      ) : (
        <ScrollView style={styles.previewContainer} contentContainerStyle={styles.scrollContent}>
          <View style={[styles.contentWrapper, isWide && styles.contentWrapperWide]}>
            {/* photoAnim springs 0→1 on capture, fading in and scaling
                up from 60% to give the photo a satisfying pop entrance. */}
          <Animated.Image
            source={{ uri: photoUri }}
            style={[
              styles.previewImage,
              isWide && {
                height: Math.min(height * 0.6, 900),
                borderRadius: 20,
              },
              {
                opacity: photoAnim,
                transform: [{ scale: photoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
              },
            ]}
            resizeMode="contain"
            accessibilityRole="image"
            accessibilityLabel="Captured plant photo"
          />

            {result ? (
              <Animated.View style={resultAnimatedStyle}>
                <ResultCard result={result} onRetake={reset} />
              </Animated.View>
            ) : (
              <View style={[styles.actions, isWide && styles.actionsWide]}>
                <Animated.View style={analyzeButtonAnimatedStyle}>
                  <TouchableOpacity
                    style={[styles.button, styles.analyzeButton, isWide && styles.buttonWide]}
                    onPress={analyzePlant}
                    onPressIn={onAnalyzePressIn}
                    onPressOut={onAnalyzePressOut}
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
                </Animated.View>

                <TouchableOpacity
                  style={[styles.button, styles.iconButton, isWide && styles.iconButtonWide]}
                  onPress={reset}
                  accessibilityRole="button"
                  accessibilityLabel="Retake photo"
                  accessibilityHint="Discards the current photo and returns to the camera"
                >
                  <Ionicons name="camera" size={isWide ? 36 : 28} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            <Text
              style={[styles.disclaimer, isWide && styles.disclaimerWide]}
              accessibilityRole="text"
              accessibilityLabel="Safety disclaimer: This app is for informational purposes only. Never eat wild plants without expert confirmation."
            >
              ⚠️ SAFETY FIRST: This app is for informational purposes only. Never eat wild plants without expert confirmation.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
