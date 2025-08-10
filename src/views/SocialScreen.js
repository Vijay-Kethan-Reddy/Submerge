import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCard from '../components/PostCard';
import { auth, db } from '../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc
} from 'firebase/firestore';

export default function SocialScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [followedMusicians, setFollowedMusicians] = useState([]);
  const insets = useSafeAreaInsets();

  // Get current user data and followed musicians
  useEffect(() => {
    const getCurrentUser = async () => {
      if (auth.currentUser) {
        console.log('Current auth user:', auth.currentUser.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
          if (userDoc.exists()) {
            const userData = { id: auth.currentUser.uid, ...userDoc.data() };
            console.log('Current user data:', userData);
            setCurrentUser(userData);

            // FIX 1: Use correct field name for followed musicians
            // Changed from 'following' to 'followingMusicians' to match AuthContext
            if (userData.followingMusicians && userData.followingMusicians.length > 0) {
              setFollowedMusicians(userData.followingMusicians);
              console.log('Followed musicians:', userData.followingMusicians);
            } else {
              console.log('No followed musicians found');
            }
          } else {
            console.log('User document does not exist');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          Alert.alert('Error', 'Failed to fetch user data: ' + error.message);
        }
      } else {
        console.log('No authenticated user');
      }
    };

    getCurrentUser();
  }, []);

  // Listen to posts in real-time
  useEffect(() => {
    if (!currentUser) {
      console.log('No current user, skipping posts fetch');
      return;
    }

    console.log('Setting up posts listener for user:', currentUser.userType, currentUser.id);

    // Try direct collection access first
    const postsRef = collection(db, 'posts');
    console.log('Posts collection reference created');

    const unsubscribe = onSnapshot(postsRef, async (snapshot) => {
      console.log('=== POSTS SNAPSHOT RECEIVED ===');
      console.log('Snapshot empty:', snapshot.empty);
      console.log('Documents count:', snapshot.docs.length);
      console.log('Snapshot metadata:', snapshot.metadata);

      if (snapshot.docs.length === 0) {
        console.log('No documents found in posts collection');
        setPosts([]);
        setLoading(false);
        return;
      }

      try {
        const postsData = [];

        for (let i = 0; i < snapshot.docs.length; i++) {
          const docSnap = snapshot.docs[i];
          const postData = docSnap.data();

          console.log(`--- Processing post ${i + 1}/${snapshot.docs.length} ---`);
          console.log('Post ID:', docSnap.id);
          console.log('Post data:', postData);
          console.log('Author ID:', postData.authorId);

          if (!postData.authorId) {
            console.log('Skipping post - no authorId');
            continue;
          }

          // Get author details
          try {
            console.log('Fetching author data for:', postData.authorId);
            const authorDoc = await getDoc(doc(db, 'users', postData.authorId));

            if (!authorDoc.exists()) {
              console.log('Author document does not exist for:', postData.authorId);
              continue;
            }

            const authorData = authorDoc.data();
            console.log('Author data:', authorData);
            console.log('Author userType:', authorData.userType);

            // Only include posts from musicians
            if (authorData.userType !== 'musician') {
              console.log('Skipping post - author is not a musician:', authorData.userType);
              continue;
            }

            console.log('✅ Adding post from musician:', authorData.displayName || 'Unknown');

            // Create consistent post object
            const transformedPost = {
              id: docSnap.id,
              authorId: postData.authorId,
              user: {
                id: postData.authorId,
                name: authorData.displayName || authorData.name || 'Unknown Artist',
                avatar: authorData.profileImage || authorData.avatar || null,
              },
              content: postData.content || postData.text || '',
              audioUrl: postData.audioUrl || null,
              imageUrl: postData.imageUrl || null,
              videoUrl: postData.videoUrl || null,
              timestamp: postData.timestamp,
              likes: postData.likes || [],
              comments: postData.comments || [],
              type: postData.type || 'text',
            };

            postsData.push(transformedPost);
            console.log('Added post to array. Total posts so far:', postsData.length);

          } catch (authorError) {
            console.error('Error fetching author for post:', docSnap.id, authorError);
          }
        }

        console.log('=== FINAL PROCESSING ===');
        console.log('Total posts to display:', postsData.length);

        if (postsData.length === 0) {
          console.log('No valid posts found after processing');
        }

        // Sort by timestamp manually (newest first)
        postsData.sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          try {
            const aTime = a.timestamp.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
            const bTime = b.timestamp.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
            return bTime - aTime;
          } catch (e) {
            console.log('Error sorting by timestamp:', e);
            return 0;
          }
        });

        // Optional: Sort posts to show followed musicians first for regular users
        if (currentUser.userType === 'user' && followedMusicians.length > 0) {
          console.log('Prioritizing posts from followed musicians');
          postsData.sort((a, b) => {
            const aIsFollowed = followedMusicians.includes(a.authorId);
            const bIsFollowed = followedMusicians.includes(b.authorId);

            if (aIsFollowed && !bIsFollowed) return -1;
            if (!aIsFollowed && bIsFollowed) return 1;
            return 0; // Keep original order (by timestamp)
          });
        }

        console.log('Setting posts state with', postsData.length, 'posts');
        setPosts(postsData);
        setLoading(false);

      } catch (error) {
        console.error('Error processing posts:', error);
        Alert.alert('Error', 'Failed to process posts: ' + error.message);
        setLoading(false);
      }
    }, (error) => {
      console.error('=== FIRESTORE LISTENER ERROR ===');
      console.error('Error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      Alert.alert('Database Error', 'Failed to load posts: ' + error.message);
      setLoading(false);
    });

    console.log('Posts listener set up, waiting for data...');
    return () => {
      console.log('Cleaning up posts listener');
      unsubscribe();
    };
  }, [currentUser, followedMusicians]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Real-time listener updates posts automatically
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCreatePost = () => {
    if (currentUser?.userType === 'musician') {
      navigation.navigate('CreatePostScreen');
    } else {
      Alert.alert(
        'Access Denied',
        'Only musicians can create posts.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSearch = () => {
    navigation.navigate('SearchScreen');
  };

  const navigateToDiscover = () => {
    navigation.navigate('DiscoverScreen');
  };

  const renderItem = ({ item }) => <PostCard post={item} />;

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color="#00A6CB" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </>
      ) : (
        <>
          <Icon name="musical-notes-outline" size={64} color="#B0BEC5" />
          <Text style={styles.emptyText}>No posts yet</Text>
          <Text style={styles.emptySubtext}>
            {currentUser?.userType === 'musician'
              ? 'Be the first to share something with the community!'
              : 'No musicians have shared anything yet. Check back later!'}
          </Text>
          {currentUser?.userType === 'user' && (
            <TouchableOpacity
              style={styles.discoverButton}
              onPress={navigateToDiscover}
            >
              <Text style={styles.discoverButtonText}>Discover Musicians</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      {/* Top Bar */}
      <View style={[styles.topBarBackground, { paddingTop: insets.top }]}>
        <View style={styles.topBarContent}>
          <View style={styles.leftSpace} />

          <Text style={styles.appTitle}>SUBMERGE</Text>

          <TouchableOpacity
            onPress={handleSearch}
            style={styles.iconButton}
            activeOpacity={0.7}
          >
            <Icon name="search-outline" size={26} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main content */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={posts.length === 0 ? styles.emptyContentContainer : styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00A6CB']}
            tintColor="#00A6CB"
          />
        }
        ListEmptyComponent={renderEmptyComponent}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={3}
        windowSize={10}
        getItemLayout={(data, index) => ({
          length: 400, // Approximate item height
          offset: 400 * index,
          index,
        })}
      />

      {/* Floating Add Post Button - Only show for musicians */}
      {currentUser?.userType === 'musician' && (
        <TouchableOpacity
          style={styles.addPostButton}
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <Icon name="add" size={28} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  topBarBackground: {
    backgroundColor: '#00A6CB',
    paddingBottom: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  leftSpace: {
    width: 44,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
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
    paddingTop: 8,
    paddingBottom: 100, // Extra padding for floating button
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#7A9BA8',
    marginTop: 16,
  },
  discoverButton: {
    backgroundColor: '#00A6CB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 16,
  },
  discoverButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  addPostButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#00A6CB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#00A6CB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});