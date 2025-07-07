import Spotify from 'react-native-spotify-remote';
import { SPOTIFY_CONFIG } from '../config/SpotifyConfig';

class MusicPlayerViewModel {
  async connectToSpotify() {
    const isConnected = await Spotify.isConnectedAsync();
    if (!isConnected) {
      try {
        await Spotify.initialize(SPOTIFY_CONFIG);
        await Spotify.connect();
        console.log('✅ Connected to Spotify');
      } catch (error) {
        console.error('❌ Spotify connection error:', error);
        throw error;
      }
    }
  }

  async play(uri) {
    await Spotify.playUri(uri);
  }

  async pause() {
    await Spotify.pause();
  }

  async resume() {
    await Spotify.resume();
  }

  async stop() {
    await Spotify.pause(); // No direct stop
    await Spotify.seek(0); // Reset to beginning
  }

  async seek(positionMs) {
    await Spotify.seek(positionMs);
  }

  async queue(uri) {
    await Spotify.queue(uri);
  }

  async getPlaybackState() {
    return await Spotify.getPlayerState();
  }
}

export default new MusicPlayerViewModel();
