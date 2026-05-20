import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
  iconButton: {
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    paddingVertical: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  disclaimer: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  message: { color: '#fff', fontSize: 18, textAlign: 'center', margin: 40 },

  // Large-screen / wide layout styles
  contentWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  contentWrapperWide: {
    maxWidth: 720,
    alignSelf: 'center',
  },
  actionsWide: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 24,
  },
  buttonWide: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 36,
    minWidth: 280,
  },
  iconButtonWide: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  disclaimerWide: {
    fontSize: 15,
    marginTop: 32,
  },

  // Tab bar styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#0c0',
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
  },

  // Save button
  saveButton: {
    backgroundColor: '#2e7d32',
    marginTop: 12,
  },

  // Result action row (Save + Retake icon)
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
});
