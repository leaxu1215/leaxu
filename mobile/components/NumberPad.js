import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

const NumberPad = ({ onNumber, onErase }) => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {numbers.map((num) => (
          <Pressable
            key={num}
            style={({ pressed }) => [
              styles.numberButton,
              pressed && styles.numberButtonPressed
            ]}
            onPress={() => onNumber(num)}
          >
            <Text style={styles.numberText}>{num}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.eraseButton,
          pressed && styles.eraseButtonPressed
        ]}
        onPress={onErase}
      >
        <Text style={styles.eraseText}>Erase</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 144,
    gap: 4,
  },
  numberButton: {
    width: 44,
    height: 44,
    backgroundColor: '#f5f0e8',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonPressed: {
    backgroundColor: '#e8e2d6',
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
  eraseButton: {
    width: 144,
    height: 44,
    backgroundColor: '#ffe8d6',
    borderWidth: 2,
    borderColor: '#2d2d2d',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  eraseButtonPressed: {
    backgroundColor: '#ffd9bd',
  },
  eraseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d2d2d',
  },
});

export default NumberPad;
