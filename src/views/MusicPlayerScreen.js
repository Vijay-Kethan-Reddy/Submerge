import React from 'react';
import { View, Text, ScrollView, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MusicPlayer from '../components/MusicPlayer';

export default function MusicScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const track = route?.params?.track;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      {/* Top Bar */}
      <View style={[styles.topBarBackground, { paddingTop: insets.top }]}>
        <View style={styles.topBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="arrow-back" size={26} color="white" />
          </TouchableOpacity>

          <Text style={styles.appTitle}>SUBMERGE</Text>

          <View style={styles.leftSpace} />
        </View>
      </View>

      {/* Music Player or Placeholder */}
      <ScrollView style={styles.contentContainer}>
        {track ? (
          <MusicPlayer track={track} />
        ) : (
          <View style={styles.noTrackContainer}>
            <Text style={styles.noTrackText}>No track selected</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topBarBackground: {
    backgroundColor: '#00A6CB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  topBarContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  leftSpace: {
    width: 44,
  },
  appTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  noTrackContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: 18,
    color: '#888',
  },
});
