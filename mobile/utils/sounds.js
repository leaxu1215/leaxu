import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MUTE_KEY = 'catdoku-muted';

let muted = false;

/**
 * Initialize the sound system
 * Loads mute preference from AsyncStorage
 */
export async function initSounds() {
  try {
    const stored = await AsyncStorage.getItem(MUTE_KEY);
    if (stored !== null) {
      muted = JSON.parse(stored);
    }

    // Set audio mode for iOS
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.error('Error initializing sounds:', error);
  }
}

/**
 * Play a sound by name
 * Currently a no-op stub for development
 * Sound files can be added later
 *
 * @param {string} name - One of: 'click', 'coin', 'error', 'erase', 'meow', 'mew', 'win', 'gameOver', 'hint', 'undo', 'noteToggle'
 */
export function playSound(name) {
  if (muted) return;

  if (__DEV__) {
    console.log(`[Sound] Playing: ${name}`);
  }

  // TODO: Load and play actual sound files when available
  // Example implementation:
  // const soundObject = new Audio.Sound();
  // await soundObject.loadAsync(require(`../assets/sounds/${name}.mp3`));
  // await soundObject.playAsync();
}

/**
 * Toggle mute state
 * Saves preference to AsyncStorage
 *
 * @returns {Promise<boolean>} The new muted state
 */
export async function toggleMute() {
  muted = !muted;

  try {
    await AsyncStorage.setItem(MUTE_KEY, JSON.stringify(muted));
  } catch (error) {
    console.error('Error saving mute state:', error);
  }

  return muted;
}

/**
 * Get current muted state
 *
 * @returns {boolean} Whether sounds are currently muted
 */
export function isMuted() {
  return muted;
}
