// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdl = require('soundcloud-downloader').default
const fs = require('fs')
const axios = require('axios').default
const path = require('path');
const cwd = path.join(__dirname, '..');

const SpotifyWebApi = require('spotify-web-api-node');

export default function handler(req, res) {

    const clientId = '6233cf5397864e0abb091744ea919486',
    clientSecret = '5d967a86893f46299a46ea4c94695ddf';

    // Create the api object with the credentials
    const spotifyApi = new SpotifyWebApi({
        clientId: clientId,
        clientSecret: clientSecret
    });

    // Retrieve an access token.
    spotifyApi.clientCredentialsGrant().then(
    function(data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);

        // Save the access token so that it's used in future calls
        spotifyApi.setAccessToken(data.body['access_token']);
        res.status(200).json({ 
            status: 'logged-in'
        });  
    },
    function(err) {
        console.log('Something went wrong when retrieving an access token', err);
        const scopes = ['user-read-private', 'user-read-email'],
        state = 'some-state-of-my-choice';

        // Create the authorization URL
        const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);
        res.redirect(authorizeURL);
    });
    
  }
