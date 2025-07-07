
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const qs = require('qs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.get('/login', (req, res) => {
  const scope = [
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
  ].join(' ');

  const authURL =
    'https://accounts.spotify.com/authorize?' +
    qs.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope,
      redirect_uri: REDIRECT_URI,
    });

  res.redirect(authURL);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      qs.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    // Send tokens back to your app via deep link (change scheme if needed)
    const params = new URLSearchParams(response.data).toString();

    // Use your Expo app scheme here, for example: musicsocialapp://spotify-auth
    res.redirect(`myapp://spotify-auth?${params}`);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(400).send('Authentication failed');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
