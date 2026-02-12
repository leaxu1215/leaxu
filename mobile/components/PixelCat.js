import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const PixelCat = ({ mood = 'idle' }) => {
  const animValue = useRef(new Animated.Value(0)).current;
  const animValue2 = useRef(new Animated.Value(0)).current;
  const [showSpeech, setShowSpeech] = useState(false);

  const moodConfig = {
    idle: {
      emoji: '🐱',
      speech: null,
    },
    happy: {
      emoji: '😺',
      speech: 'Nya~!',
    },
    upset: {
      emoji: '😾',
      speech: 'Mrrp!',
    },
    sleep: {
      emoji: '😴',
      speech: 'zzz...',
    },
    celebrate: {
      emoji: '😸',
      speech: 'Purrfect!',
    },
    scared: {
      emoji: '🙀',
      speech: null,
    },
  };

  useEffect(() => {
    // Reset animation values
    animValue.setValue(0);
    animValue2.setValue(0);

    // Show speech bubble briefly for moods that have speech
    if (moodConfig[mood].speech) {
      setShowSpeech(true);
      const timer = setTimeout(() => setShowSpeech(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSpeech(false);
    }
  }, [mood]);

  useEffect(() => {
    let animation;

    switch (mood) {
      case 'idle':
        // Slow scale pulse 1.0→1.05→1.0
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'happy':
        // Bounce 0→-10→0, loop 3 times
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        );
        break;

      case 'upset':
        // Shake -5→5→-5→0, loop 3 times
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: -1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: -1,
              duration: 150,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 150,
              useNativeDriver: true,
            }),
          ]),
          { iterations: 3 }
        );
        break;

      case 'sleep':
        // Very slow scale pulse 1.0→1.03→1.0
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      case 'celebrate':
        // Fast bounce and rotate
        const bounce = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ])
        );
        const rotate = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue2, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(animValue2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ])
        );
        animation = Animated.parallel([bounce, rotate]);
        break;

      case 'scared':
        // Rapid shake -3→3
        animation = Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: -1,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 1,
              duration: 100,
              useNativeDriver: true,
            }),
          ])
        );
        break;

      default:
        break;
    }

    if (animation) {
      animation.start();
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [mood, animValue, animValue2]);

  const getAnimatedStyle = () => {
    switch (mood) {
      case 'idle':
        return {
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1.0, 1.05],
              }),
            },
          ],
        };

      case 'happy':
        return {
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -10],
              }),
            },
          ],
        };

      case 'upset':
        return {
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [-1, 1],
                outputRange: [-5, 5],
              }),
            },
          ],
        };

      case 'sleep':
        return {
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1.0, 1.03],
              }),
            },
          ],
        };

      case 'celebrate':
        return {
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -15],
              }),
            },
            {
              rotate: animValue2.interpolate({
                inputRange: [0, 1],
                outputRange: ['-10deg', '10deg'],
              }),
            },
          ],
        };

      case 'scared':
        return {
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [-1, 1],
                outputRange: [-3, 3],
              }),
            },
          ],
        };

      default:
        return {};
    }
  };

  const config = moodConfig[mood] || moodConfig.idle;

  return (
    <View style={styles.container}>
      {showSpeech && config.speech && (
        <View style={styles.speechBubble}>
          <Text style={styles.speechText}>{config.speech}</Text>
        </View>
      )}
      <Animated.Text style={[styles.catEmoji, getAnimatedStyle()]}>
        {config.emoji}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  catEmoji: {
    fontSize: 60,
  },
  speechBubble: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
  },
  speechText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default PixelCat;
