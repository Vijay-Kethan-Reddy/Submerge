
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

const CLIENT_ID = 'ca78be50f2114cb7bfb6fcf6aa9351c1';

export function spotifyAuth() {
  const redirectUri = makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: CLIENT_ID,
      scopes: ['user-read-email', 'user-read-playback-state', 'user-modify-playback-state'],
      redirectUri,
      usePKCE: true,
      responseType: 'code', // ✅ required for PKCE
    },
    discovery
  );

  return { request, response, promptAsync, redirectUri };
}
