// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdl = require('soundcloud-downloader').default
const fs = require('fs')
const axios = require('axios').default
const path = require('path');
const cwd = path.join(__dirname, '..');

export default function handler(req, res) {
    const SOUNDCLOUD_URL = req.query.scurl;
    const CLIENT_ID = ''

    scdl.getInfo(SOUNDCLOUD_URL,CLIENT_ID).then(trackData => {
        scdl.download(SOUNDCLOUD_URL,CLIENT_ID).then(stream => {
            console.log(cwd)
            const filePath = `${trackData.title.replace(/ /g, '')}-${trackData.id}.mp3`;
            console.log(path.join(cwd, filePath))
            stream.pipe(fs.createWriteStream(path.join(cwd, filePath)))
            res.status(200).json({ 
                artist: trackData.user.username, 
                title: trackData.title,
                artwork: trackData.artwork_url, 
                id: trackData.id,
                downloadURL: filePath 
            });    
        }).catch(err => res.status(400).json({ err }))
    }).catch(err => {
        res.status(400).json({ err });    
    })
    
  }
