import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const Controls = ({
  notesMode,
  onToggleNotes,
  onUndo,
  onRedo,
  onHint,
  onNewGame,
  canUndo,
  canRedo,
}) => {
  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          notesMode && styles.notesButtonActive,
          pressed && styles.buttonPressed,
        ]}
        onPress={onToggleNotes}
      >
        <Text style={[styles.buttonText, notesMode && styles.notesTextActive]}>
          ✏ {notesMode ? 'Notes ON' : 'Notes OFF'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canUndo && styles.buttonDisabled,
          pressed && canUndo && styles.buttonPressed,
        ]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Text style={[styles.buttonText, !canUndo && styles.textDisabled]}>
          ↩ Undo
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          !canRedo && styles.buttonDisabled,
          pressed && canRedo && styles.buttonPressed,
        ]}
        onPress={onRedo}
        disabled={!canRedo}
      >
        <Text style={[styles.buttonText, !canRedo && styles.textDisabled]}>
          ↪ Redo
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.hintButton,
          pressed && styles.hintButtonPressed,
        ]}
        onPress={onHint}
      >
        <Text style={styles.buttonText}>💡 Hint</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          styles.newGameButton,
          pressed && styles.newGameButtonPressed,
        ]}
        onPress={onNewGame}
      >
        <Text style={styles.buttonText}>★ New Game</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  button: {
    backgroundColor: '#f5f0e8',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#e8e2d6',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
  notesButtonActive: {
    backgroundColor: '#118ab2',
  },
  notesTextActive: {
    color: '#ffffff',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  textDisabled: {
    opacity: 0.4,
  },
  hintButton: {
    backgroundColor: '#ffd166',
  },
  hintButtonPressed: {
    backgroundColor: '#f5c850',
  },
  newGameButton: {
    backgroundColor: '#ff6b35',
  },
  newGameButtonPressed: {
    backgroundColor: '#e85f30',
  },
});

export default Controls;
