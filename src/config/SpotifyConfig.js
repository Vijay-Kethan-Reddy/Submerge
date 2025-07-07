export const SPOTIFY_CONFIG = {
  clientID: 'ca78be50f2114cb7bfb6fcf6aa9351c1',                     // Get this from Spotify dashboard
  redirectURL: 'https://callback',                     // Same as in AndroidManifest and dashboard
  tokenSwapURL: '',                                    // Leave empty if not using backend
  tokenRefreshURL: '',                                 // Same here
  scope: 'app-remote-control streaming user-modify-playback-state user-read-playback-state user-read-currently-playing',
};
