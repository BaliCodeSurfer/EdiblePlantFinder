import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraType, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { styles } from './styles';
import { identifyPlant } from './services/plantId';
import { CameraScreen } from './components/CameraScreen';
import { ResultCard } from './components/ResultCard';
import { MyPlantsScreen } from './components/MyPlantsScreen';
import { SavedPlantDetail } from './components/SavedPlantDetail';
import { PlantIdentificationResult } from './types';
import { useAppAnimations } from './hooks/useAppAnimations';
import { saveIdentification, SavedIdentification } from './services/storage';

type Tab = 'camera' | 'myPlants';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlantIdentificationResult | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [selectedPlant, setSelectedPlant] = useState<SavedIdentification | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const { width, height } = useWindowDimensions();
  const isWide = width > 700;

  const {
    onAnalyzePressIn,
    onAnalyzePressOut,
    resultAnimatedStyle,
    photoAnimatedStyle,
    analyzeButtonAnimatedStyle,
    resetAnimations,
    animateResultEntrance,
  } = useAppAnimations(photoUri, loading);

  const handleSaveToMyPlants = async () => {
    if (!result) return;

    try {
      await saveIdentification(result, photoUri, base64Image);

      // Pleasant success haptic when saving a plant
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert('Saved!', 'This plant has been added to My Plants.');
    } catch (error: any) {
      console.error('Failed to save plant:', error);
      Alert.alert('Error', error?.message ?? 'Failed to save plant.');
    }
  };

  const handleSelectPlant = (item: SavedIdentification) => {
    setSelectedPlant(item);
    setDetailVisible(true);
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
    setActiveTab('camera');
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
      animateResultEntrance();
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
    resetAnimations();
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const renderCameraTab = () => (
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
            <Animated.Image
              source={{ uri: photoUri }}
              style={[
                styles.previewImage,
                isWide && {
                  height: Math.min(height * 0.6, 650),
                  borderRadius: 20,
                },
                photoAnimatedStyle,
              ]}
              resizeMode="contain"
              accessibilityRole="image"
              accessibilityLabel="Captured plant photo"
            />

            {result ? (
              <Animated.View style={resultAnimatedStyle}>
                <ResultCard result={result} />

                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSaveToMyPlants}
                    accessibilityRole="button"
                    accessibilityLabel="Save to My Plants"
                  >
                    <Text style={styles.buttonText}>Save to My Plants</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.iconButton]}
                    onPress={reset}
                    accessibilityRole="button"
                    accessibilityLabel="Retake photo"
                    accessibilityHint="Discards the current result and returns to the camera"
                  >
                    <Ionicons name="camera" size={28} color="#fff" />
                  </TouchableOpacity>
                </View>
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

  const renderMyPlantsTab = () => (
    <MyPlantsScreen onSelect={handleSelectPlant} />
  );

  return (
    <View style={styles.container}>
      {/* Tab Bar with safe area for notch / status bar */}
      <SafeAreaView edges={['top']} style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'camera' && styles.tabButtonActive]}
          onPress={() => setActiveTab('camera')}
        >
          <Ionicons
            name="camera"
            size={24}
            color={activeTab === 'camera' ? '#fff' : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'camera' && styles.tabTextActive]}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'myPlants' && styles.tabButtonActive]}
          onPress={() => setActiveTab('myPlants')}
        >
          <Ionicons
            name="leaf"
            size={24}
            color={activeTab === 'myPlants' ? '#fff' : '#888'}
          />
          <Text style={[styles.tabText, activeTab === 'myPlants' && styles.tabTextActive]}>
            My Plants
          </Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Tab Content */}
      {activeTab === 'camera' ? renderCameraTab() : renderMyPlantsTab()}

      {/* Detail Modal */}
      <SavedPlantDetail
        visible={detailVisible}
        item={selectedPlant}
        onClose={() => {
          setDetailVisible(false);
          setSelectedPlant(null);
        }}
      />
    </View>
  );
}
