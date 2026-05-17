import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles';

interface CameraScreenProps {
  facing: CameraType;
  onCameraReady?: () => void;
  onPictureTaken: (photo: any) => void;
  onFlipCamera: () => void;
}

export function CameraScreen({ facing, onCameraReady, onPictureTaken, onFlipCamera }: CameraScreenProps) {
  const cameraRef = React.useRef<CameraView>(null);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          base64: true,
        });
        onPictureTaken(photo);
      } catch (error) {
        console.error('Failed to take picture:', error);
      }
    }
  };

  return (
    <CameraView
      ref={cameraRef}
      style={styles.camera}
      facing={facing}
      onCameraReady={onCameraReady}
    >
      <View style={styles.overlay}>
        <Text 
          style={styles.title}
          accessibilityRole="header"
        >
          Edible Plant Finder
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
            accessibilityRole="button"
            accessibilityLabel="Take photo"
            accessibilityHint="Captures a photo of the plant using the camera"
          >
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onFlipCamera}
            style={{ marginLeft: 30, padding: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Flip camera"
            accessibilityHint="Switches between front and back camera"
          >
            <Ionicons name="camera-reverse" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </CameraView>
  );
}
