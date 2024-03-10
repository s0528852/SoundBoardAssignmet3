import React, { useState, useEffect } from 'react';
import { View, Pressable, Text, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import * as SQLite from 'expo-sqlite';
import styles from './styles/styles_sheet'; 

const db = SQLite.openDatabase('soundboard.db');

export default function App() {
  const [sound, setSound] = useState(null);
  const [recording, setRecording] = useState(null);
  const [recordedSounds, setRecordedSounds] = useState([]);

  const sounds = [
    require('./Sounds/rizz-sounds.mp3'),
    require('./Sounds/summer-time-anime-love_q5du5Qo.mp3'),
    require('./Sounds/unspoken-rizz.mp3'),
  ];

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
      );
      tx.executeSql('SELECT * FROM recordings;', [], (_, { rows }) => {
        setRecordedSounds(rows._array);
      });
    });
  }, []);

  // Plays the sound
  const playSound = async (soundResource) => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
    const { sound: newSound } = await Audio.Sound.createAsync(soundResource);
    setSound(newSound);
    await newSound.playAsync();
  };

  // Stops the sound
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  //Starts recording of the sounds, says the maximum limit
  const startRecording = async () => {
    if (recordedSounds.length >= 8) {
      Alert.alert("Limit Reached Maximum 8", "Delete an existing recording first");
      return;
    }
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stops recording sound
  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) {
      db.transaction(tx => {
        tx.executeSql('INSERT INTO recordings (uri) VALUES (?);', [uri], () => {
          updateRecordedSounds();
        });
      });
    }
  };

  // Updates Sound recordings
  const updateRecordedSounds = () => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM recordings;', [], (_, { rows }) => {
        setRecordedSounds(rows._array);
      });
    });
  };
  
  // Deletes sound recordings
  const deleteRecording = (id) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM recordings WHERE id = ?;', [id], () => {
        updateRecordedSounds();
      });
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {sounds.map((soundResource, index) => (
          <Pressable
            key={index}
            onPress={() => playSound(soundResource)}
            style={({ pressed }) => [
              styles.button,
              pressed ? styles.buttonPressed : {}, // Dynamically changes style when pressed
            ]}>
            <Text style={styles.buttonText}>Play {index + 1}</Text>
          </Pressable>
        ))}
      </View>
      
      {sound && (
        <Pressable
          onPress={stopSound}
          style={({ pressed }) => [
            styles.button,
            pressed ? styles.buttonPressed : {}, // Dynamically changes style when pressed
          ]}>
          <Text style={styles.buttonText}>Stop Sound</Text>
        </Pressable>
      )}
      
      <Pressable
        onPress={recording ? stopRecording : startRecording}
        style={({ pressed }) => [
          styles.button,
          pressed ? styles.buttonPressed : {}, // Dynamically changes style when pressed
        ]}>
        <Text style={styles.buttonText}>
          {recording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </Pressable>
      
      {/* FlatList for displaying recorded sounds , scroll feature */}
      <FlatList
        style={{ flex: 1, maxHeight: 400 }} // Adjusts FlatList size maxHeight 
        contentContainerStyle={{ paddingBottom: 20 }}
        data={recordedSounds}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => playSound({ uri: item.uri })}
              style={({ pressed }) => [
                styles.buttonRecorded,
                pressed ? styles.buttonPressed : {},
              ]}>
              <Text style={styles.buttonTextRecorded}>Custom Sound {item.id}</Text>
            </Pressable>
            <Pressable
              onPress={() => deleteRecording(item.id)}
              style={({ pressed }) => [
                styles.buttonDelete,
                pressed ? styles.buttonPressed : {},
              ]}>
              <Text style={styles.buttonText}>Delete</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}  