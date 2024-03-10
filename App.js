import React, { useState, useEffect } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Audio } from 'expo-av';
import styles from './styles/styles_sheet'; 

export default function App() {
  const [sound, setSound] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);

  // Array of local sound files
  const sounds = [
    require('./Sounds/rizz-sounds.mp3'),
    require('./Sounds/summer-time-anime-love_q5du5Qo.mp3'),
    require('./Sounds/unspoken-rizz.mp3'),
  ];

  // Function to play a sound
  const playSound = async (soundResource) => {
    // Stop any sound currently playing before starting a new one
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    console.log('Loading Sound');
    const { sound: newSound } = await Audio.Sound.createAsync(soundResource);
    setSound(newSound);
    console.log('Playing Sound');
    await newSound.playAsync();
  };

  // Function to stop the currently playing sound
  const stopSound = async () => {
    if (sound) {
      console.log('Stopping Sound');
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  // Function to start recording
  const startRecording = async () => {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log('Starting recording..');
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recording.startAsync();
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    console.log('Stopping recording..');
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      console.log('Recording stopped and stored at', uri);
    }
  };

  // Function to play the recorded sound
  const playRecordedSound = async () => {
    if (recordedUri) {
      // Stop any sound currently playing before starting a new one
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      
      console.log('Loading Recorded Sound');
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setSound(newSound);
      console.log('Playing Recorded Sound');
      await newSound.playAsync();
    }
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  return (
    <View style={styles.container}>
      {sounds.map((soundResource, index) => (
        <Pressable key={index} style={styles.button} onPress={() => playSound(soundResource)}>
          <Text style={styles.buttonText}>Play Sound {index + 1}</Text>
        </Pressable>
      ))}
      {sound && (
        <Pressable style={styles.button} onPress={stopSound}>
          <Text style={styles.buttonText}>Stop Sound</Text>
        </Pressable>
      )}
      <Pressable style={styles.button} onPress={recording ? stopRecording : startRecording}>
        <Text style={styles.buttonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </Pressable>
      {recordedUri && (
        <Pressable style={styles.button} onPress={playRecordedSound}>
          <Text style={styles.buttonText}>Play Recorded Sound</Text>
        </Pressable>
      )}
    </View>
  );
}
