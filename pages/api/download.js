// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdlCreate = require('soundcloud-downloader').create
const fs = require('fs')
const axios = require('axios').default


export default function handler(req, res) {
    const SOUNDCLOUD_URL = req.query.scurl;
    const CLIENT_ID = 'JXeKNif7tC7NuruSw0nHwNufIKolDMtS'

    const scdl = scdlCreate({
        clientID: CLIENT_ID,
        saveClientID: true,
        filePath: './client_id.json',
        axiosInstance: axios.create()
    })

    scdl.getInfo(SOUNDCLOUD_URL).then(trackData => {
        scdl.download(SOUNDCLOUD_URL).then(stream => {
            const filePath = `${trackData.title.replace(/ /g, '')}-${trackData.id}.mp3`;
            stream.pipe(fs.createWriteStream(`./public/static/${filePath}`))
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
