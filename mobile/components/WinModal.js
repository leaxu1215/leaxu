import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';

const WinModal = ({ time, onNewGame, onClose }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
          <View style={styles.header}>
            <Text style={styles.title}>You Win!</Text>
          </View>

          <Text style={styles.emojiRow}>♥ 😻 ♥</Text>

          <Text style={styles.heading}>Congratulations!</Text>
          <Text style={styles.message}>You solved the puzzle! Meow!</Text>

          <View style={styles.timeContainer}>
            <Text style={styles.timeLabel}>Time:</Text>
            <Text style={styles.timeValue}>{formatTime(time)}</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <Pressable style={styles.newGameButton} onPress={onNewGame}>
              <Text style={styles.newGameButtonText}>New Game</Text>
            </Pressable>

            <Pressable style={styles.okButton} onPress={onClose}>
              <Text style={styles.okButtonText}>OK</Text>
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
    backgroundColor: '#ffd166',
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d2d2d',
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
    marginBottom: 20,
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  timeLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd166',
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  newGameButton: {
    flex: 1,
    backgroundColor: '#ffd166',
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
  okButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d2d',
  },
  okButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d2d2d',
  },
});

export default WinModal;
