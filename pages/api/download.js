// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdl = require('soundcloud-downloader').default
const fs = require('fs')
const axios = require('axios').default
const path = require('path');
const cwd = path.join(__dirname, '..');
const {Storage} = require('@google-cloud/storage');
const stream = require('stream');

export default function handler(req, res) {
    const SOUNDCLOUD_URL = req.query.scurl;
    const CLIENT_ID = "e2OoIxUtdZaNGNvJPRgMP4fHcUQ7qIeb";
    const rootDir = path.join(process.cwd(), '/');

    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:path.join(rootDir, 'key.json')});
    const myBucket = storage.bucket('scfetch2');

    scdl.getInfo(SOUNDCLOUD_URL,CLIENT_ID).then(trackData => {
            const filePath = `${trackData.title.replace(/ /g, '').replace('&','-').replace('&','-').replace('&','-').replace('&','-').replace('&','-').replace('&','-').replace('&','-').replace('&','-')}-${trackData.id}.mp3`;
            console.log(trackData)
            if(trackData.waveform_url) {
                fetch(trackData.waveform_url).then(resp => resp.json()).then(resp => {
                    const waveFormSamples = resp.samples.map(sample => sample/500)
                    res.status(200).json({ 
                        artist: trackData.user.username, 
                        title: trackData.title,
                        artwork: trackData.artwork_url, 
                        id: trackData.id,
                        downloadURL: filePath,
                        waveForm: waveFormSamples
                    }); 
                })
            } else {
                res.status(200).json({ 
                    artist: trackData.user.username, 
                    title: trackData.title,
                    artwork: trackData.artwork_url, 
                    id: trackData.id,
                    downloadURL: filePath,
                    waveForm: []
                }); 
            }
            
          
    }).catch(err => {
        res.status(400).json({ err });    
    })
    
  }
