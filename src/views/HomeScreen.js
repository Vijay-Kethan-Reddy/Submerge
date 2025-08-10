import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
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

// Helper function to get valid artwork URL
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
    `https://via.placeholder.com/150x150/00A6CB/FFFFFF?text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`,
    `https://dummyimage.com/150x150/00A6CB/ffffff&text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`,
    null
  ];

  return fallbacks.find(url => url) || null;
};

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all categories data
  const fetchAll = async () => {
    const results = {};
    await Promise.all(
      categories.map(async (cat) => {
        try {
          const res = await fetch(cat.url);
          const json = await res.json();

          if (json.data && Array.isArray(json.data)) {
            results[cat.key] = json.data.map((track) => {
              const artworkUrl = getValidArtworkUrl(track);
              return {
                id: track.id,
                title: track.title,
                artistName: track.user?.name || track.user?.handle || 'Unknown Artist',
                artwork: artworkUrl,
              };
            });
          } else {
            results[cat.key] = [];
          }
        } catch (err) {
          console.error(`Error loading ${cat.key}:`, err);
          results[cat.key] = [];
        }
      })
    );
    setData(results);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Refresh callback for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAll();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Track card component
  const TrackCard = ({ track }) => {
    const [imageError, setImageError] = React.useState(false);
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    const fallbackImages = [
      track.artwork,
      `https://via.placeholder.com/150x150/00A6CB/FFFFFF?text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`,
      `https://dummyimage.com/150x150/00A6CB/ffffff&text=${encodeURIComponent(track.title?.substring(0, 2) || 'M')}`
    ].filter(Boolean);

    const handleImageError = () => {
      if (currentImageIndex < fallbackImages.length - 1) {
        setCurrentImageIndex(currentImageIndex + 1);
        setImageError(false);
      } else {
        setImageError(true);
      }
    };

    return (
      <TouchableOpacity
        key={track.id.toString()}
        style={styles.trackCard}
        onPress={() =>
          navigation.navigate('Music', {
            track: {
              ...track,
              artist: track.artistName,
              audioUrl: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream`,
            },
          })
        }
      >
        {imageError || !fallbackImages[currentImageIndex] ? (
          <View style={[styles.cover, styles.placeholderCover]}>
            <Icon name="musical-notes" size={40} color="#ffffff" />
          </View>
        ) : (
          <Image
            source={{ uri: fallbackImages[currentImageIndex] }}
            style={styles.cover}
            onError={handleImageError}
            resizeMode="cover"
          />
        )}
        <Text style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {track.artistName}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTrackCard = (track) => <TrackCard key={track.id.toString()} track={track} />;

  const renderSection = (title, items) => {
    if (!items || items.length === 0) return null;

    return (
      <View key={title}>
        <Text style={styles.heading}>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
          {items.map(renderTrackCard)}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      <View style={[styles.topBarBackground, { paddingTop: insets.top }]}>
        <View style={styles.topBarContent}>
          <View style={styles.leftSpace} />
          <Text style={styles.appTitle}>SUBMERGE</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SearchScreen')} style={styles.iconButton}>
            <Icon name="search-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A6CB" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#00A6CB']}
              tintColor="#00A6CB"
            />
          }
          style={styles.contentContainer}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {categories.map((cat) => renderSection(cat.title, data[cat.key]))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  leftSpace: { width: 44 },
  appTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 26,
    fontWeight: '600',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  heading: {
    fontFamily: 'RobotoCondensed-Bold',
    fontSize: 18,
    marginTop: 20,
    marginBottom: 15,
    color: '#00A6CB',
    paddingLeft: 5,
  },
  horizontalList: { marginBottom: 10 },
  trackCard: {
    marginRight: 12,
    alignItems: 'center',
    width: 140,
  },
  cover: {
    width: 140,
    height: 140,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  placeholderCover: {
    backgroundColor: '#00A6CB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackTitle: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    fontWeight: '500',
  },
  artistName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  contentContainer: { flex: 1, paddingHorizontal: 10, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
