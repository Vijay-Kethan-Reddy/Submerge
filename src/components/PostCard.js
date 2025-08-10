import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuthContext } from '../context/AuthContext';

const PostCard = ({ post }) => {
  const navigation = useNavigation();
  const { user } = useAuthContext();
  const currentUserId = user?.uid;

  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const likeAnimation = new Animated.Value(1);

  useEffect(() => {
    // Check if current user liked this post
    if (post?.likes?.includes(currentUserId)) {
      setIsLiked(true);
    }
    setLikeCount(post?.likes?.length || 0);
  }, [post, currentUserId]);

  const toggleLike = () => {
    // Animate the like button
    Animated.sequence([
      Animated.timing(likeAnimation, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(likeAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Simulate like toggle with animation
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }

    // TODO: Add Firebase integration when permissions are configured
    // const postRef = doc(db, 'posts', post.id);
    // await updateDoc(postRef, { likes: isLiked ? arrayRemove(currentUserId) : arrayUnion(currentUserId) });
  };

  const handleFollowToggle = () => {
    // Simulate follow toggle
    setIsFollowing(!isFollowing);

    // TODO: Add Firebase integration when permissions are configured
    // if (isFollowing) {
    //   await unfollowUser(currentUserId, post.authorId);
    // } else {
    //   await followUser(currentUserId, post.authorId);
    // }
  };

  const handleShare = async () => {
    try {
      const shareContent = post?.content || 'Check out this post from a musician!';
      await Share.share({
        message: `${shareContent}\n\nShared from SUBMERGE`,
        title: `Post by ${post?.user?.name || 'Unknown Artist'}`,
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const goToArtistProfile = () => {
    if (post?.user) {
      navigation.navigate('ArtistScreen', { musician: post.user });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';

    const now = new Date();
    const postTime = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInHours = (now - postTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return `${Math.floor(diffInHours / 24)}d`;
    }
  };

  const renderMediaContent = () => {
    if (post?.imageUrl) {
      return (
        <View style={styles.mediaContainer}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      );
    }

    if (post?.videoUrl) {
      return (
        <View style={styles.mediaContainer}>
          <View style={styles.videoPlaceholder}>
            <View style={styles.playButtonContainer}>
              <Icon name="play-circle" size={64} color="#00A6CB" />
            </View>
            <Text style={styles.mediaLabel}>Video Content</Text>
          </View>
        </View>
      );
    }

    if (post?.audioUrl) {
      return (
        <View style={styles.mediaContainer}>
          <View style={styles.audioContainer}>
            <View style={styles.audioInfo}>
              <Icon name="musical-notes" size={28} color="#00A6CB" />
              <View style={styles.audioDetails}>
                <Text style={styles.audioTitle}>Audio Track</Text>
                <Text style={styles.audioDuration}>3:24</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <Icon name="play" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.card}>
      {/* Header with user info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToArtistProfile} style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: post?.user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post?.user?.name || 'User') + '&background=00A6CB&color=fff'
              }}
              style={styles.avatar}
            />
            <View style={styles.avatarBorder} />
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.username}>{post?.user?.name || 'Unknown Artist'}</Text>
            <View style={styles.timestampRow}>
              <Icon name="time-outline" size={12} color="#00A6CB" />
              <Text style={styles.timestamp}>{formatTimestamp(post?.timestamp)}</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-horizontal" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Post content */}
      {post?.content && (
        <View style={styles.contentContainer}>
          <Text style={styles.content}>{post.content}</Text>
        </View>
      )}

      {/* Media content */}
      {renderMediaContent()}

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
            <Animated.View
              style={[
                styles.actionIconContainer,
                isLiked && styles.likedIconContainer,
                { transform: [{ scale: likeAnimation }] }
              ]}
            >
              <Icon
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#fff' : '#00A6CB'}
              />
            </Animated.View>
            {likeCount > 0 && (
              <Text style={[styles.actionText, isLiked && styles.likedText]}>
                {likeCount}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
          <View style={styles.actionIconContainer}>
            <Icon name="share-social-outline" size={20} color="#00A6CB" />
          </View>
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00A6CB',
    opacity: 0.3,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#00A6CB',
    marginLeft: 4,
    fontWeight: '600',
  },
  moreButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  content: {
    fontSize: 15,
    lineHeight: 22,
    color: '#2c3e50',
    fontWeight: '400',
  },
  mediaContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: 280,
    backgroundColor: '#f8f9fa',
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 32,
    padding: 8,
    marginBottom: 8,
  },
  mediaLabel: {
    color: '#00A6CB',
    fontSize: 14,
    fontWeight: '600',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e3f2fd',
  },
  audioInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  audioDetails: {
    marginLeft: 12,
    flex: 1,
  },
  audioTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  audioDuration: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
  },
  playButton: {
    backgroundColor: '#00A6CB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00A6CB',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    backgroundColor: '#fafbfc',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  actionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  likedIconContainer: {
    backgroundColor: '#ff4757',
  },
  actionText: {
    fontSize: 13,
    color: '#00A6CB',
    fontWeight: '600',
  },
  likedText: {
    color: '#ff4757',
  },
});