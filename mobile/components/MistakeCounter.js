import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MistakeCounter = ({ mistakes, maxMistakes }) => {
  const remainingLives = maxMistakes - mistakes;

  return (
    <View style={styles.container}>
      {[...Array(maxMistakes)].map((_, index) => {
        const isFull = index < remainingLives;
        return (
          <Text key={index} style={[styles.heart, isFull ? styles.fullHeart : styles.emptyHeart]}>
            {isFull ? '♥' : '♡'}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heart: {
    fontSize: 24,
  },
  fullHeart: {
    color: '#ff6b35',
  },
  emptyHeart: {
    color: '#999',
  },
});

export default MistakeCounter;
