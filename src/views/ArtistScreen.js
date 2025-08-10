import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const { width } = Dimensions.get('window');

const ArtistScreen = ({ route, navigation }) => {
  const { musician } = route.params;
  const [artistPosts, setArtistPosts] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const insets = useSafeAreaInsets();

  const fetchArtistProfile = async () => {
    try {
      const userRef = doc(db, 'users', musician.id);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setArtistProfile(userSnap.data());
      } else {
        console.log('No profile found for musician:', musician.id);
      }
    } catch (error) {
      console.error('Error fetching artist profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchArtistPosts = async () => {
    try {
      const postsRef = collection(db, 'posts');
      const q = query(postsRef, where('authorId', '==', musician.id), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setArtistPosts(posts);
    } catch (error) {
      console.error('Error fetching artist posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistProfile();
    fetchArtistPosts();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // Here you can add Firebase logic to follow/unfollow the artist
    // Example: updateDoc(doc(db, 'users', currentUserId), { following: arrayUnion(musician.id) })
  };

  const handleLike = (postId) => {
    const newLikedPosts = new Set(likedPosts);
    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
    } else {
      newLikedPosts.add(postId);
    }
    setLikedPosts(newLikedPosts);
    // Here you can add Firebase logic to like/unlike the post
    // Example: updateDoc(doc(db, 'posts', postId), { likes: increment(1) })
  };

  const handleShare = async (post) => {
    try {
      const artistName = artistProfile?.displayName || artistProfile?.name || musician.name || 'Unknown Artist';
      const result = await Share.share({
        message: `Check out this post by ${artistName}: "${post.content}" - Shared from SUBMERGE`,
        title: `Post by ${artistName}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share this post');
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Profile Section */}
      <View style={styles.profileSection}>
        <View style={styles.profileContainer}>
          <View style={styles.profileImageContainer}>
            {artistProfile?.avatar || artistProfile?.profileImage || artistProfile?.photoURL ? (
              <Image
                source={{
                  uri: artistProfile.avatar || artistProfile.profileImage || artistProfile.photoURL
                }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePlaceholder}>
                <Icon name="person" size={50} color="#00A6CB" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.artistName}>
              {artistProfile?.displayName || artistProfile?.name || musician.name || 'Unknown Artist'}
            </Text>

            {(artistProfile?.bio || artistProfile?.about) && (
              <Text style={styles.bio}>{artistProfile.bio || artistProfile.about}</Text>
            )}

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{artistPosts.length}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollow}>
          <Icon
            name={isFollowing ? "checkmark-outline" : "add-outline"}
            size={20}
            color={isFollowing ? "#00A6CB" : "#fff"}
            style={styles.followIcon}
          />
          <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
            {isFollowing ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Posts Header */}
      <View style={styles.postsHeader}>
        <Icon name="musical-notes-outline" size={20} color="#00A6CB" />
        <Text style={styles.postsTitle}>Recent Posts</Text>
      </View>
    </View>
  );

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postImageContainer}>
          {artistProfile?.avatar || artistProfile?.profileImage ? (
            <Image
              source={{
                uri: artistProfile.avatar || artistProfile.profileImage
              }}
              style={styles.postAvatar}
            />
          ) : (
            <View style={styles.postAvatarPlaceholder}>
              <Icon name="person" size={20} color="#00A6CB" />
            </View>
          )}
        </View>
        <View style={styles.postHeaderInfo}>
          <Text style={styles.postAuthor}>
            {artistProfile?.displayName || artistProfile?.name || musician.name}
          </Text>
          <Text style={styles.postDate}>{formatDate(item.timestamp)}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{item.content}</Text>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleLike(item.id)}
        >
          <Icon
            name={likedPosts.has(item.id) ? "heart" : "heart-outline"}
            size={18}
            color={likedPosts.has(item.id) ? "#ff4757" : "#00A6CB"}
          />
          <Text style={[styles.actionText, likedPosts.has(item.id) && styles.likedText]}>
            Like
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Icon name="share-outline" size={18} color="#00A6CB" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="musical-notes-outline" size={60} color="#ccc" />
      <Text style={styles.emptyStateText}>No posts yet</Text>
      <Text style={styles.emptyStateSubtext}>This artist hasn't shared anything yet.</Text>
    </View>
  );

  if (profileLoading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

        {/* Top Bar */}
        <View style={[styles.topBarBackground, { paddingTop: insets.top }]}>
          <View style={styles.topBarContent}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <Icon name="chevron-back" size={26} color="white" />
            </TouchableOpacity>
            <Text style={styles.appTitle}>ARTIST</Text>
            <View style={styles.rightSpace} />
          </View>
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00A6CB" />
          <Text style={styles.loadingText}>Loading artist profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      {/* Top Bar */}
      <View style={[styles.topBarBackground, { paddingTop: insets.top }]}>
        <View style={styles.topBarContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon name="chevron-back" size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.appTitle}>SUBMERGE</Text>
          <View style={styles.rightSpace} />
        </View>
      </View>

      <FlatList
        data={artistPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          loading ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color="#00A6CB" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Top Bar Styles (matching SettingsScreen exactly)
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
  rightSpace: {
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
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    color: '#333',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
  },
  headerContainer: {
    backgroundColor: '#fff',
  },

  // Profile Section (matching SettingsScreen style)
  profileSection: {
    marginTop: 30,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  profilePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  profileInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    alignItems: 'center',
    marginRight: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },

  // Follow Button (matching logout button style)
  followButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#00A6CB',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  followIcon: {
    marginRight: 8,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Following Button States
  followingButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#00A6CB',
  },
  followingButtonText: {
    color: '#00A6CB',
  },

  // Posts Header (matching settings item style)
  postsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  postsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },

  // Post Cards
  postCard: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postImageContainer: {
    marginRight: 12,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  postAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postHeaderInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  postContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    fontWeight: '400',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#00A6CB',
    fontWeight: '500',
    marginLeft: 6,
  },

  // Liked state
  likedText: {
    color: '#ff4757',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLoading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default ArtistScreen;