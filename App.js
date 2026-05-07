import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

//API key can be stolen from the client easily
/*Instead of calling https://api.plant.id/v2/identify (or v3) directly from the user's phone/browser:

Your mobile/web app sends the photo(s) to your server.
Your server adds the secret API key and forwards the request to Kindwise.
Your server receives the result and sends it back to the user.
*/
const API_KEY = 'rjgibOFK8LZgUbeVOqbabGfFxKOjnDRrYqo371YiRGnrJX2zkT'; // ← Get at https://www.kindwise.com/plant-id

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const cameraRef = useRef(null);

  const [photoUri, setPhotoUri] = useState(null);
  const [base64Image, setBase64Image] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!API_KEY) {
      Alert.alert(
        'API Key Missing',
        'Please sign up at https://www.kindwise.com/plant-id and replace YOUR_PLANT_ID_API_KEY_HERE'
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
      setResult(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const analyzePlant = async () => {
    if (!base64Image) return;

    setLoading(true);
    try {
      const response = await fetch(
        'https://api.plant.id/v3/identification?details=common_names,edible_parts,toxicity,description,url',
        {
          method: 'POST',
          headers: {
            'Api-Key': API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            images: [`data:image/jpeg;base64,${base64Image}`],
            classification_level: 'all',

          }),
        }
      );
    
      // === NEW DEBUG CODE ===
      const responseText = await response.text();   // Read as text first
      console.log("Status:", response.status);
      console.log("Raw response from Plant.id:", responseText);
    
      if (!response.ok) {
        throw new Error(`Plant.id API error ${response.status}: ${responseText}`);
      }
    
      const data = JSON.parse(responseText);
      console.log("Parsed data:", data);

      // Plant.id v3 nests classification under `result`
      if (!data.result?.classification?.suggestions?.length) {
        Alert.alert('No matches', 'Could not identify a plant in this photo.');
        return;
      }

      setResult(data.result);
    } catch (error) {
      console.error("Full error:", error);
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
        // CAMERA SCREEN
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          onCameraReady={() => setCameraReady(true)}
        >
          <View style={styles.overlay}>
            <Text style={styles.title}>Edible Plant Finder (v3)</Text>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </View>
        </CameraView>
      ) : (
        // PREVIEW + RESULTS SCREEN
        <ScrollView style={styles.previewContainer} contentContainerStyle={styles.scrollContent}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />

          {result ? (
            <View style={styles.resultCard}>
              <Text style={styles.plantName}>
                {result.classification.suggestions[0].details?.common_names?.[0]
                  ?? result.classification.suggestions[0].name}
              </Text>
              <Text style={styles.scientificName}>
                {result.classification.suggestions[0].name}
              </Text>
              <Text style={styles.probability}>
                Confidence: {(result.classification.suggestions[0].probability * 100).toFixed(1)}%
              </Text>

              {/* EDIBILITY FLAG */}
              {result.classification.suggestions[0].details?.edible_parts &&
              result.classification.suggestions[0].details.edible_parts.length > 0 ? (
                <View style={styles.edibleFlag}>
                  <Text style={styles.edibleText}>✅ EDIBLE PLANT DETECTED</Text>
                  <Text style={styles.edibleParts}>
                    Edible parts: {result.classification.suggestions[0].details.edible_parts.join(', ')}
                  </Text>
                </View>
              ) : (
                <View style={styles.notEdibleFlag}>
                  <Text style={styles.notEdibleText}>⚠️ No edible parts found (or unknown)</Text>
                  {result.classification.suggestions[0].details?.toxicity && (
                    <Text style={styles.toxicity}>
                      Toxicity: {result.classification.suggestions[0].details.toxicity}
                    </Text>
                  )}
                </View>
              )}

              <TouchableOpacity style={styles.button} onPress={reset}>
                <Text style={styles.buttonText}>Take Another Photo</Text>
              </TouchableOpacity>
            </View>
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
                  <Text style={styles.buttonText}>Analyze for Edible Plants</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={reset}>
                <Text style={styles.buttonText}>Retake Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Safety disclaimer */}
          <Text style={styles.disclaimer}>
            ⚠️ SAFETY FIRST: This app is for informational purposes only. Never eat wild plants without expert confirmation.
          </Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 50 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff0000',
  },
  previewContainer: { flex: 1, backgroundColor: '#111' },
  scrollContent: { padding: 20, alignItems: 'center' },
  previewImage: { width: '100%', height: 400, borderRadius: 16, marginBottom: 20 },
  resultCard: { width: '100%', backgroundColor: '#222', borderRadius: 16, padding: 20, marginBottom: 20 },
  plantName: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  scientificName: { fontSize: 13, fontStyle: 'italic', color: '#bbb', textAlign: 'center', marginTop: 2 },
  probability: { fontSize: 16, color: '#aaa', textAlign: 'center', marginBottom: 15 },
  edibleFlag: {
    backgroundColor: '#00c853',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  edibleText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  edibleParts: { color: '#fff', marginTop: 8, textAlign: 'center' },
  notEdibleFlag: {
    backgroundColor: '#d32f2f',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
  },
  notEdibleText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  toxicity: { color: '#fff', marginTop: 5 },
  actions: { width: '100%', marginTop: 10 },
  button: {
    backgroundColor: '#1e88e5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    marginVertical: 8,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  analyzeButton: { backgroundColor: '#00c853' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  disclaimer: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  message: { color: '#fff', fontSize: 18, textAlign: 'center', margin: 40 },
});