import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const GameOverModal = ({ mistakes, onRetry, onNewGame }) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onNewGame}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Game Over</Text>
          </View>

          <Text style={styles.emojiRow}>♡ 😿 ♡</Text>

          <Text style={styles.heading}>Game Over!</Text>
          <Text style={styles.message}>
            You made {mistakes} mistake{mistakes !== 1 ? 's' : ''}.
          </Text>

          <View style={styles.buttonsContainer}>
            <Pressable style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </Pressable>

            <Pressable style={styles.newGameButton} onPress={onNewGame}>
              <Text style={styles.newGameButtonText}>New Game</Text>
            </Pressable>
          </View>
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
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#e74c3c',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
  },
  emojiRow: {
    fontSize: 32,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d2d2d',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555555',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  retryButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  newGameButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  newGameButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
  },
});

export default GameOverModal;
