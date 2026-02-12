import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const difficulties = [
  { key: 'easy', label: 'Easy', emoji: '😺', desc: 'Purrfect for beginners' },
  { key: 'medium', label: 'Medium', emoji: '😼', desc: 'A nice cat-llenge' },
  { key: 'hard', label: 'Hard', emoji: '🙀', desc: 'For top cats only!' },
];

const DifficultyModal = ({ onSelect, onClose, hasSave, onResume }) => {
  const getDifficultyColor = (key) => {
    switch (key) {
      case 'easy':
        return '#c8f7c5';
      case 'medium':
        return '#ffd166';
      case 'hard':
        return '#ffb4b4';
      default:
        return '#ffffff';
    }
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>New Game</Text>

          {hasSave && (
            <Pressable
              style={styles.resumeButton}
              onPress={onResume}
            >
              <Text style={styles.resumeButtonText}>Resume Saved Game</Text>
            </Pressable>
          )}

          <View style={styles.difficultiesContainer}>
            {difficulties.map((difficulty) => (
              <Pressable
                key={difficulty.key}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: getDifficultyColor(difficulty.key) }
                ]}
                onPress={() => onSelect(difficulty.key)}
              >
                <Text style={styles.emoji}>{difficulty.emoji}</Text>
                <Text style={styles.difficultyLabel}>{difficulty.label}</Text>
                <Text style={styles.difficultyDesc}>{difficulty.desc}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2d2d2d',
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2d2d2d',
  },
  resumeButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  resumeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  difficultiesContainer: {
    marginBottom: 20,
  },
  difficultyButton: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
    marginBottom: 4,
  },
  difficultyDesc: {
    fontSize: 14,
    color: '#555555',
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#2d2d2d',
    fontWeight: '600',
  },
});

export default DifficultyModal;
