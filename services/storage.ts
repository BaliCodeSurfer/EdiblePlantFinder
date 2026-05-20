import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { PlantIdentificationResult } from '../types';

const STORAGE_KEY = 'saved_identifications';

export interface SavedIdentification {
  id: string;
  timestamp: string;
  photoUri: string | null;      // preferred (permanent file)
  photoBase64?: string | null;  // fallback only
  result: PlantIdentificationResult;
}

export async function saveIdentification(
  result: PlantIdentificationResult,
  tempPhotoUri: string | null,
  tempPhotoBase64?: string | null
): Promise<void> {
  let permanentUri: string | null = null;
  let base64Fallback: string | null = null;

  if (tempPhotoUri) {
    const fileName = `plant_${Date.now()}.jpg`;

    try {
      const sourceFile = new File(tempPhotoUri);
      const destinationFile = new File(Paths.document, fileName);

      sourceFile.copy(destinationFile);
      permanentUri = destinationFile.uri;
    } catch (error) {
      console.warn('Failed to copy photo, falling back to base64:', error);
      base64Fallback = tempPhotoBase64 ?? null;
    }
  } else if (tempPhotoBase64) {
    base64Fallback = tempPhotoBase64;
  }

  const existing = await getSavedIdentifications();
  const newEntry: SavedIdentification = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    photoUri: permanentUri,
    photoBase64: base64Fallback,
    result,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([newEntry, ...existing]));
}

export async function getSavedIdentifications(): Promise<SavedIdentification[]> {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function deleteIdentification(id: string): Promise<void> {
  const existing = await getSavedIdentifications();
  const toDelete = existing.find(item => item.id === id);

  if (toDelete?.photoUri) {
    try {
      const fileToDelete = new File(toDelete.photoUri);
      if (fileToDelete.exists) {
        fileToDelete.delete();
      }
    } catch (error) {
      console.warn('Failed to delete photo file:', error);
    }
  }

  const filtered = existing.filter(item => item.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
