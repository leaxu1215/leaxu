import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const CoinAnimation = ({ coins }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {coins.map((coin) => (
        <CoinItem key={coin.id} coin={coin} />
      ))}
    </View>
  );
};

const CoinItem = ({ coin }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -40,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.coinItem,
        {
          left: coin.x,
          top: coin.y,
          opacity: opacity,
          transform: [{ translateY: translateY }],
        },
      ]}
    >
      <Text style={styles.coinEmoji}>🪙</Text>
      <Text style={styles.coinText}>+1</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coinItem: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 24,
  },
  coinText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default CoinAnimation;
