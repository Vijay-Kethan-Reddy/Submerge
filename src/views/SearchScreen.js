import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BASE_URL = 'https://discoveryprovider.audius.co/v1/tracks/trending';

const categories = [
  { key: 'top10Weekly', title: 'Top 10 Weekly Hits', url: `${BASE_URL}?time=week&limit=10&app_name=SubmergeApp` },
  { key: 'top50AllTime', title: 'Top 50 All-Time Hits', url: `${BASE_URL}?time=allTime&limit=50&app_name=SubmergeApp` },
  { key: 'underground', title: 'Underground Gems', url: `https://discoveryprovider.audius.co/v1/tracks/trending/underground?limit=20&app_name=SubmergeApp` },
  { key: 'rock', title: 'Rock Hits', url: `${BASE_URL}?genre=Rock&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'metal', title: 'Metal Mania', url: `${BASE_URL}?genre=Metal&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'electronic', title: 'Electronic Vibes', url: `${BASE_URL}?genre=Electronic&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'hiphopRap', title: 'HipHop/Rap Beats', url: `${BASE_URL}?genre=HipHop/Rap&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'experimental', title: 'Experimental Sounds', url: `${BASE_URL}?genre=Experimental&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'punk', title: 'Punk Rock', url: `${BASE_URL}?genre=Punk&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'pop', title: 'Pop Favorites', url: `${BASE_URL}?genre=Pop&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'folk', title: 'Folk & Acoustic', url: `${BASE_URL}?genre=Folk&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'alternative', title: 'Alternative Hits', url: `${BASE_URL}?genre=Alternative&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'ambient', title: 'Ambient', url: `${BASE_URL}?genre=Ambient&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'jazz', title: 'Jazz', url: `${BASE_URL}?genre=Jazz&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'acoustic', title: 'Acoustic', url: `${BASE_URL}?genre=Acoustic&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'funk', title: 'Funk', url: `${BASE_URL}?genre=Funk&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'rnbSoul', title: 'R&B/Soul', url: `${BASE_URL}?genre=R%26B%2FSoul&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'classical', title: 'Classical', url: `${BASE_URL}?genre=Classical&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'reggae', title: 'Reggae', url: `${BASE_URL}?genre=Reggae&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'country', title: 'Country', url: `${BASE_URL}?genre=Country&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'blues', title: 'Blues', url: `${BASE_URL}?genre=Blues&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'lofi', title: 'Lo-Fi', url: `${BASE_URL}?genre=Lo-Fi&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'techno', title: 'Techno', url: `${BASE_URL}?genre=Techno&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'trap', title: 'Trap', url: `${BASE_URL}?genre=Trap&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'house', title: 'House', url: `${BASE_URL}?genre=House&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'deephouse', title: 'Deep House', url: `${BASE_URL}?genre=Deep+House&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'disco', title: 'Disco', url: `${BASE_URL}?genre=Disco&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'electro', title: 'Electro', url: `${BASE_URL}?genre=Electro&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'jungle', title: 'Jungle', url: `${BASE_URL}?genre=Jungle&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'progressivehouse', title: 'Progressive House', url: `${BASE_URL}?genre=Progressive+House&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'trance', title: 'Trance', url: `${BASE_URL}?genre=Trance&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'dubstep', title: 'Dubstep', url: `${BASE_URL}?genre=Dubstep&time=month&limit=20&app_name=SubmergeApp` },
  { key: 'vaporwave', title: 'Vaporwave', url: `${BASE_URL}?genre=Vaporwave&time=month&limit=20&app_name=SubmergeApp` },
];

// Helper function to get valid artwork URL (same as HomeScreen)
const getValidArtworkUrl = (track) => {
  const possibleUrls = [
    track.artwork?.['150x150'],
    track.cover_art_sizes?.['150x150'],
    track.artwork?.['480x480'],
    track.cover_art_sizes?.['480x480'],
    track.user?.profile_picture_sizes?.['150x150'],
    track.user?.profile_picture_sizes?.['480x480'],
    track.cover_art,
    track.user?.profile_picture,
    track.artwork?.['1000x1000'],
    track.cover_art_sizes?.['1000x1000'],
    track.user?.profile_picture_sizes?.['1000x1000']
  ];

  const validUrl = possibleUrls.find(url =>
    url &&
    typeof url === 'string' &&
    url.trim() !== '' &&
    (url.startsWith('http://') || url.startsWith('https://'))
  );

  const fallbacks = [
    validUrl,
    `https://via.placeholder.com/60x60/00A6CB/FFFFFF?text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`,
    `https://dummyimage.com/60x60/00A6CB/ffffff&text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`,
    null
  ];

  return fallbacks.find(url => url) || null;
};

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [allTracks, setAllTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Fetch all tracks from categories (similar to HomeScreen)
  const fetchAllTracks = async () => {
    setLoading(true);
    const allTracksArray = [];

    await Promise.all(
      categories.map(async (cat) => {
        try {
          const res = await fetch(cat.url);
          const json = await res.json();

          if (json.data && Array.isArray(json.data)) {
            const tracks = json.data.map((track) => {
              const artworkUrl = getValidArtworkUrl(track);
              return {
                id: track.id,
                title: track.title,
                artistName: track.user?.name || track.user?.handle || 'Unknown Artist',
                artwork: artworkUrl,
                category: cat.title,
                genre: track.genre || 'Unknown',
              };
            });
            allTracksArray.push(...tracks);
          }
        } catch (err) {
          console.error(`Error loading ${cat.key}:`, err);
        }
      })
    );

    // Remove duplicates based on track ID
    const uniqueTracks = allTracksArray.filter((track, index, self) =>
      index === self.findIndex(t => t.id === track.id)
    );

    setAllTracks(uniqueTracks);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllTracks();
  }, []);

  const handleSearch = (text) => {
    setQuery(text);

    if (text.trim() === '') {
      setFilteredTracks([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    // Debounce search
    const timeoutId = setTimeout(() => {
      const filtered = allTracks.filter(track =>
        track.title.toLowerCase().includes(text.toLowerCase()) ||
        track.artistName.toLowerCase().includes(text.toLowerCase()) ||
        track.genre.toLowerCase().includes(text.toLowerCase())
      );

      setFilteredTracks(filtered);
      setSearching(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const TrackItem = ({ track }) => {
    const [imageError, setImageError] = useState(false);

    return (
      <TouchableOpacity
        style={styles.trackItem}
        onPress={() =>
          navigation.navigate('MusicPlayerScreen', {
            track: {
              ...track,
              artist: track.artistName,
              audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream`,
            },
          })
        }
      >
        {imageError || !track.artwork ? (
          <View style={[styles.trackImage, styles.placeholderImage]}>
            <Icon name="musical-notes" size={20} color="#ffffff" />
          </View>
        ) : (
          <Image
            source={{ uri: track.artwork }}
            style={styles.trackImage}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        )}

        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {track.title}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artistName}
          </Text>
          <Text style={styles.trackCategory} numberOfLines={1}>
            {track.category} • {track.genre}
          </Text>
        </View>

        <TouchableOpacity style={styles.playButton}>
          <Icon name="play" size={18} color="white" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#00A6CB" />
          <Text style={styles.emptyText}>Loading tracks...</Text>
        </View>
      );
    }

    if (query.trim() === '') {
      return (
        <View style={styles.emptyState}>
          <Icon name="search-outline" size={50} color="#00A6CB" />
          <Text style={styles.emptyText}>Search for tracks, artists, or genres</Text>
          <Text style={styles.emptySubtext}>
            {allTracks.length} tracks available to search
          </Text>
        </View>
      );
    }

    if (searching) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#00A6CB" />
          <Text style={styles.emptyText}>Searching...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Icon name="musical-notes-outline" size={50} color="#666" />
        <Text style={styles.emptyText}>No tracks found</Text>
        <Text style={styles.emptySubtext}>
          Try searching for a different track, artist, or genre
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      {/* Blue Header Bar */}
      <View style={[styles.headerBar, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back-outline" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Search Music</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Icon name="search-outline" size={20} color="#00A6CB" />
          <TextInput
            style={styles.input}
            placeholder="Search tracks, artists, genres..."
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => {
              setQuery('');
              setFilteredTracks([]);
            }}>
              <Icon name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.trim() !== '' && filteredTracks.length > 0 && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredTracks.length} result{filteredTracks.length !== 1 ? 's' : ''} found
          </Text>
        </View>
      )}

      <FlatList
        data={filteredTracks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <TrackItem track={item} />}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        style={styles.resultsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerBar: {
    backgroundColor: '#00A6CB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },
  searchContainer: {
    backgroundColor: '#00A6CB',
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  input: {
    flex: 1,
    color: '#333',
    marginLeft: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  resultsCount: {
    color: '#00A6CB',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'RobotoCondensed-Bold',
  },
  resultsList: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
  },
  trackImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  placeholderImage: {
    backgroundColor: '#00A6CB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 15,
    marginRight: 15,
  },
  trackTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
  },
  trackArtist: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Roboto-Regular',
  },
  trackCategory: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Roboto-Regular',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00A6CB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
    backgroundColor: 'white',
  },
  emptyText: {
    color: '#00A6CB',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    fontFamily: 'RobotoCondensed-Bold',
  },
  emptySubtext: {
    color: '#00A6CB',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
});