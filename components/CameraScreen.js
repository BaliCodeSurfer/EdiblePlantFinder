import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CameraView } from 'expo-camera';
import { styles } from '../styles';

export function CameraScreen({ cameraRef, onReady, onCapture }) {
  return (
    <CameraView ref={cameraRef} style={styles.camera} onCameraReady={onReady}>
      <View style={styles.overlay}>
        <Text style={styles.title}>Edible Plant Finder (v3)</Text>
        <TouchableOpacity style={styles.captureButton} onPress={onCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </CameraView>
  );
}
