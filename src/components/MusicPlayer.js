import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import Icon from 'react-native-vector-icons/Ionicons';

const formatTime = millis => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const MusicPlayer = ({ track }) => {
  const sound = useRef(new Audio.Sound());
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  useEffect(() => {
    loadAudio();

    return () => {
      unloadAudio();
    };
  }, []);

  const loadAudio = async () => {
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound: playbackObj, status } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      sound.current = playbackObj;
      setIsPlaying(true);
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  };

  const unloadAudio = async () => {
    try {
      await sound.current.unloadAsync();
    } catch (error) {
      console.error('Error unloading audio:', error);
    }
  };

  const onPlaybackStatusUpdate = status => {
    if (status.isLoaded) {
      setIsLoading(false);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
      setIsPlaying(status.isPlaying);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await sound.current.pauseAsync();
    } else {
      await sound.current.playAsync();
    }
  };

  const handleSeek = async value => {
    const seekPosition = value * duration;
    await sound.current.setPositionAsync(seekPosition);
  };

  // Placeholder functions for previous/next — implement your logic here
  const handlePrevious = () => {
    console.log('Previous pressed');
    // TODO: Add logic to play previous track
  };

  const handleNext = () => {
    console.log('Next pressed');
    // TODO: Add logic to play next track
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00A6CB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: track.artwork }} style={styles.artwork} />
      <Text style={styles.title}>{track.title}</Text>
      <Text style={styles.artist}>{track.artistName || 'Unknown Artist'}</Text>

      <Slider
        style={styles.slider}
        value={duration ? position / duration : 0}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#00A6CB"
        maximumTrackTintColor="#ccc"
        thumbTintColor="#00A6CB"
      />

      {/* Time indicators */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(position)}</Text>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.controlItem}>
          <TouchableOpacity onPress={handlePrevious}>
            <Icon name="play-skip-back" size={26} color="#00A6CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.controlItem}>
          <TouchableOpacity onPress={handlePlayPause}>
            <Icon name={isPlaying ? 'pause' : 'play'} size={44} color="#00A6CB" />
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.controlItem}>
          <TouchableOpacity onPress={handleNext}>
            <Icon name="play-skip-forward" size={26} color="#00A6CB" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default MusicPlayer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  artist: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  timeText: {
    color: '#666',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  controlItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  separator: {
    width: 1,
    height: 32,
    backgroundColor: '#00A6CB',
    marginHorizontal: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
