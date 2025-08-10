import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
// import DocumentPicker from 'react-native-document-picker';
import { auth, db, storage } from '../firebaseConfig';
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

const { width } = Dimensions.get('window');

export default function CreatePostScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentUser, setCurrentUser] = useState(null);
  const [postText, setPostText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image', 'video', 'audio'
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is musician on component mount
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!auth.currentUser) {
        Alert.alert('Error', 'Please log in to continue');
        navigation.goBack();
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.userType !== 'musician') {
            Alert.alert(
              'Access Denied',
              'Only musicians can create posts.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
          }
          setCurrentUser({ id: auth.currentUser.uid, ...userData });
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to verify user permissions');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    checkUserPermissions();
  }, [navigation]);

  const selectImage = () => {
    const options = {
      mediaType: 'mixed',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) return;

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedMedia(asset);
        setMediaType(asset.type?.startsWith('video') ? 'video' : 'image');
      }
    });
  };

  const selectAudio = async () => {
    // Temporarily disabled - DocumentPicker not available
    Alert.alert(
      'Audio Upload',
      'Audio upload feature is temporarily unavailable. Please use the photo/video option for now.',
      [{ text: 'OK' }]
    );

    // Alternative: Use image picker for video with audio
    // You can uncomment this to allow video selection instead
    /*
    const options = {
      mediaType: 'video',
      includeBase64: false,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel || response.errorMessage) return;

      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedMedia(asset);
        setMediaType('video');
      }
    });
    */
  };

  const removeMedia = () => {
    setSelectedMedia(null);
    setMediaType(null);
  };

  const uploadMediaToStorage = async (media) => {
    if (!media) return null;

    try {
      const fileUri = media.uri || media.fileCopyUri;
      const fileName = `${mediaType}s/${Date.now()}_${media.fileName || 'media'}`;
      const storageRef = ref(storage, fileName);

      // Convert file to blob for upload
      const response = await fetch(fileUri);
      const blob = await response.blob();

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload media');
    }
  };

  const createPost = async () => {
    if (!postText.trim() && !selectedMedia) {
      Alert.alert('Error', 'Please add some content or media to your post');
      return;
    }

    setIsPosting(true);

    try {
      let mediaUrl = null;

      if (selectedMedia) {
        mediaUrl = await uploadMediaToStorage(selectedMedia);
      }

      const postData = {
        authorId: auth.currentUser.uid,
        content: postText.trim(),
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
        type: mediaType || 'text',
      };

      // Add media URL based on type
      if (mediaUrl) {
        switch (mediaType) {
          case 'image':
            postData.imageUrl = mediaUrl;
            break;
          case 'video':
            postData.videoUrl = mediaUrl;
            break;
          case 'audio':
            postData.audioUrl = mediaUrl;
            break;
        }
      }

      await addDoc(collection(db, 'posts'), postData);

      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Post creation error:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    return (
      <View style={styles.mediaPreviewContainer}>
        <TouchableOpacity style={styles.removeMediaButton} onPress={removeMedia}>
          <Icon name="close-circle" size={24} color="#FF6B6B" />
        </TouchableOpacity>

        {mediaType === 'image' && (
          <Image source={{ uri: selectedMedia.uri }} style={styles.imagePreview} />
        )}

        {mediaType === 'video' && (
          <View style={styles.videoPreview}>
            <Icon name="play-circle" size={60} color="#00A6CB" />
            <Text style={styles.videoText}>Video Selected</Text>
          </View>
        )}

        {mediaType === 'audio' && (
          <View style={styles.audioPreview}>
            <Icon name="musical-note" size={40} color="#00A6CB" />
            <Text style={styles.audioText}>{selectedMedia.name}</Text>
            <Text style={styles.mediaSize}>
              {(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00A6CB" />
        <Text style={styles.loadingText}>Verifying permissions...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar backgroundColor="#00A6CB" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}
        >
          <Icon name="arrow-back" size={26} color="white" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Post</Text>

        <TouchableOpacity
          onPress={createPost}
          disabled={isPosting || (!postText.trim() && !selectedMedia)}
          style={[
            styles.postButton,
            (!postText.trim() && !selectedMedia) && styles.postButtonDisabled
          ]}
        >
          {isPosting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.postButtonText}>Post</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Icon name="person" size={24} color="#00A6CB" />
          </View>
          <View>
            <Text style={styles.userName}>
              {currentUser?.displayName || 'Musician'}
            </Text>
            <View style={styles.musicianBadge}>
              <Icon name="musical-note" size={12} color="#00A6CB" />
              <Text style={styles.musicianText}>Musician</Text>
            </View>
          </View>
        </View>

        {/* Text Input */}
        <TextInput
          style={styles.textInput}
          placeholder="What's on your mind? Share your music journey..."
          placeholderTextColor="#7A9BA8"
          value={postText}
          onChangeText={setPostText}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />

        <Text style={styles.characterCount}>{postText.length}/500</Text>

        {/* Media Preview */}
        {renderMediaPreview()}

        {/* Media Selection Buttons */}
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity style={styles.mediaButton} onPress={selectImage}>
            <Icon name="camera" size={24} color="#00A6CB" />
            <Text style={styles.mediaButtonText}>Photo/Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.mediaButton} onPress={selectAudio}>
            <Icon name="musical-note" size={24} color="#00A6CB" />
            <Text style={styles.mediaButtonText}>Audio</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for great posts:</Text>
          <Text style={styles.tipText}>• Share behind-the-scenes content</Text>
          <Text style={styles.tipText}>• Add audio previews of your tracks</Text>
          <Text style={styles.tipText}>• Engage with your audience</Text>
          <Text style={styles.tipText}>• Use relevant hashtags</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7A9BA8',
    fontFamily: 'RobotoCondensed-Bold',
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#00A6CB',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    fontFamily: 'Poppins-Bold',
  },
  postButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'RobotoCondensed-Bold',
  },

  // Content Styles
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'RobotoCondensed-Bold',
    marginBottom: 4,
  },
  musicianBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 166, 203, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  musicianText: {
    fontSize: 12,
    color: '#00A6CB',
    marginLeft: 4,
    fontFamily: 'RobotoCondensed-Bold',
    fontWeight: '600',
  },

  // Text Input Styles
  textInput: {
    fontSize: 18,
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
    fontFamily: 'RobotoCondensed-Bold',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E6ED',
  },
  characterCount: {
    fontSize: 12,
    color: '#7A9BA8',
    textAlign: 'right',
    marginTop: 8,
    marginBottom: 20,
    fontFamily: 'RobotoCondensed-Bold',
  },

  // Media Preview Styles
  mediaPreviewContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    position: 'relative',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  videoPreview: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
  },
  videoText: {
    fontSize: 16,
    color: '#00A6CB',
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'RobotoCondensed-Bold',
  },
  audioPreview: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
    borderRadius: 12,
  },
  audioText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'RobotoCondensed-Bold',
  },
  mediaSize: {
    fontSize: 12,
    color: '#7A9BA8',
    marginTop: 4,
    fontFamily: 'RobotoCondensed-Bold',
  },

  // Media Buttons Styles
  mediaButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E6ED',
    flex: 0.45,
    justifyContent: 'center',
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#00A6CB',
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'RobotoCondensed-Bold',
  },

  // Tips Styles
  tipsContainer: {
    backgroundColor: 'rgba(0, 166, 203, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A6CB',
    marginBottom: 12,
    fontFamily: 'RobotoCondensed-Bold',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'RobotoCondensed-Bold',
  },
});