
import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import { spotifyAuth } from '../config/spotifyAuth'; // adjust the path
import { CLIENT_ID } from '../config/spotifyAuth'; // put your CLIENT_ID there

export default function MusicPlayerScreen() {
  const { request, response, promptAsync, redirectUri } = spotifyAuth();
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      if (response?.type === 'success' && response.params.code) {
        try {
          const res = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              grant_type: 'authorization_code',
              code: response.params.code,
              redirect_uri: redirectUri,
              code_verifier: request.codeVerifier,
            }).toString(),
          });

          const tokenResponse = await res.json();

          if (tokenResponse.access_token) {
            setAccessToken(tokenResponse.access_token);
            Alert.alert('✅ Success', 'Spotify Login Successful');
            console.log('🎧 Spotify access token:', tokenResponse.access_token);
          } else {
            Alert.alert('❌ Token Error', JSON.stringify(tokenResponse));
          }
        } catch (err) {
          Alert.alert('❌ Fetch Error', err.message);
        }
      }
    };

    fetchToken();
  }, [response]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>

      <Button
        title={accessToken ? 'Logged In to Spotify' : 'Login with Spotify'}
        onPress={() => promptAsync({ useProxy: true })}
        disabled={!request}
      />

      {accessToken && (
        <View style={{ marginTop: 20 }}>
          <Text>🎵 Ready to control Spotify playback!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
