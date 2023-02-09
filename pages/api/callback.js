// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdl = require('soundcloud-downloader').default
const fs = require('fs')
const axios = require('axios').default
const path = require('path');
const cwd = path.join(__dirname, '..');

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: '6233cf5397864e0abb091744ea919486',
    clientSecret: '5d967a86893f46299a46ea4c94695ddf',
    redirectUri: 'https://scfetch.app/api/callback'
});


export default function handler(req, res) {
    const code = req.query.code//"AQBeqna-24YZ_Pitl6cWKnCT9qu4Z5ftQFoJ8cOwu9wCgvXPraG8KP_BIN41OrUNDljG3R5JG8KACkRxdPpzmGSwp5QXNluZ3gOnan273JD_oILwiT64wtnD_ujknTY4z4Vw1kLaJQFWtDuT1LdVLvx9w8Un4z_PUbQRp_IE79tdPht3QeuOrtO5CPT4dJvvBQxDZKtEWLDl4mhZlU1_DQzdu4wXdKIi"

  // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(code).then(
    function(data) {
      console.log('The token expires in ' + data.body['expires_in']);
      console.log('The access token is ' + data.body['access_token']);
      console.log('The refresh token is ' + data.body['refresh_token']);
  
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      res.redirect('/')
    },
    function(err) {
        res.status(400).json({ err });    
    }
  );


    return;
    fetch('').then(resp => resp.json()).then(resp => {
        res.status(200).json({ 
            downloadURL: req.query.title 
        });  
    }).catch(err => {
        res.status(400).json({ err });    
    })
    
  }
