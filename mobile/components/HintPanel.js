import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const HintPanel = ({ hint, onDismiss, onApply }) => {
  if (!hint) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💡 Hint</Text>
      </View>
      <Text style={styles.message}>{hint.message}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
          <Text style={styles.buttonText}>Got it!</Text>
        </TouchableOpacity>
        {hint.technique !== 'error' && (
          <TouchableOpacity style={styles.applyButton} onPress={onApply}>
            <Text style={styles.buttonText}>Fill it in</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderLeftWidth: 4,
    borderLeftColor: '#ffd166',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
  message: {
    fontSize: 14,
    color: '#2d2d2d',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dismissButton: {
    backgroundColor: '#fffef2',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  applyButton: {
    backgroundColor: '#c8f7c5',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d2d2d',
    textAlign: 'center',
  },
});

export default HintPanel;
