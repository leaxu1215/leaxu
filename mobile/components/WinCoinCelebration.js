import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const WinCoinCelebration = ({ active }) => {
  const [phase, setPhase] = useState('idle');
  const [coins, setCoins] = useState([]);

  useEffect(() => {
    if (active) {
      setPhase('shower');

      // Generate 30 coins with random positions
      const newCoins = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * (SCREEN_WIDTH - 40),
        startY: -50 - Math.random() * 100,
      }));
      setCoins(newCoins);

      // Transition to 'collect' phase at 1400ms
      const collectTimer = setTimeout(() => {
        setPhase('collect');
      }, 1400);

      // Transition to 'done' phase at 2800ms
      const doneTimer = setTimeout(() => {
        setPhase('done');
      }, 2800);

      return () => {
        clearTimeout(collectTimer);
        clearTimeout(doneTimer);
      };
    } else {
      setPhase('idle');
      setCoins([]);
    }
  }, [active]);

  if (!active || phase === 'idle') {
    return null;
  }

  return (
    <View style={styles.overlay} pointerEvents="none">
      {coins.map((coin) => (
        <CoinItem key={coin.id} coin={coin} phase={phase} />
      ))}
      {phase === 'collect' && (
        <View style={styles.collectContainer}>
          <Text style={styles.purseEmoji}>👛</Text>
          <Text style={styles.collectText}>+30</Text>
        </View>
      )}
    </View>
  );
};

const CoinItem = ({ coin, phase }) => {
  const translateY = useRef(new Animated.Value(coin.startY)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (phase === 'shower') {
      // Coins fall from top
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT * 0.6,
        duration: 1400,
        useNativeDriver: true,
      }).start();
    } else if (phase === 'collect') {
      // Coins move toward center bottom (wallet icon)
      const centerX = SCREEN_WIDTH / 2 - coin.x - 20;
      const targetY = SCREEN_HEIGHT - 150;

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: centerX,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: targetY - coin.startY,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [phase]);

  return (
    <Animated.View
      style={[
        styles.coinItem,
        {
          left: coin.x,
          top: 0,
          transform: [{ translateX: translateX }, { translateY: translateY }],
        },
      ]}
    >
      <Text style={styles.coinEmoji}>🪙</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  coinItem: {
    position: 'absolute',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 32,
  },
  collectContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purseEmoji: {
    fontSize: 48,
  },
  collectText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginTop: 8,
  },
});

export default WinCoinCelebration;
