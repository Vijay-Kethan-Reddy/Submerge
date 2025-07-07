require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI; // e.g. https://yourbackend.onrender.com/callback

app.get('/login', (req, res) => {
  const scope = 'user-read-playback-state user-modify-playback-state streaming';
  const authorizeUrl = 'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
    }).toString();
  res.redirect(authorizeUrl);
});

app.get('/callback', async (req, res) => {
  const code = req.query.code || null;
  try {
    const tokenResponse = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
      },
      data: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri,
      }).toString(),
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Redirect back to your Expo app with tokens in query string (or send JSON)
    res.redirect(`exp://your-expo-app-url?access_token=${access_token}&refresh_token=${refresh_token}`);
  } catch (error) {
    res.status(400).send('Error exchanging token');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on ${port}`));
