import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
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

  const handlePickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      onPictureTaken({
        uri: asset.uri,
        base64: asset.base64,
      });
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
            onPress={handlePickFromLibrary}
            style={{ marginRight: 30, padding: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Pick photo from library"
            accessibilityHint="Opens the photo library to choose an existing image"
          >
            <Ionicons name="images" size={32} color="#fff" />
          </TouchableOpacity>

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
