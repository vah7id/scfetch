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
    const CLIENT_ID = "JXeKNif7tC7NuruSw0nHwNufIKolDMtS";
    const rootDir = path.join(process.cwd(), '/');

    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:path.join(rootDir, 'key.json')});
    const myBucket = storage.bucket('scfetch2');

    scdl.getInfo(SOUNDCLOUD_URL,CLIENT_ID).then(trackData => {
        scdl.download(SOUNDCLOUD_URL,CLIENT_ID).then(async(stream) => {
            const filePath = `${trackData.title.replace(/ /g, '')}-${trackData.id}.mp3`;
            const filePath2 = `${trackData.title.replace(/ /g, '')}-${trackData.id}.wav`;
            const file = myBucket.file(filePath);
            const file2 = myBucket.file(filePath2);
            stream.pipe(file.createWriteStream());
            stream.pipe(file2.createWriteStream());


            res.status(200).json({ 
                artist: trackData.user.username, 
                title: trackData.title,
                artwork: trackData.artwork_url, 
                id: trackData.id,
                downloadURL: filePath 
            }); 

            /*const passthroughStream = new stream.PassThrough();
            passthroughStream.write(stream);
            passthroughStream.end();
            console.log('dfsfdsfdsfs22222')

            console.log(stream)
            async function streamFileUpload() {
                console.log('dfsfdsfdsfs')
                passthroughStream.pipe(file.createWriteStream()).on('finish', () => {
                    res.status(200).json({ 
                        artist: trackData.user.username, 
                        title: trackData.title,
                        artwork: trackData.artwork_url, 
                        id: trackData.id,
                        downloadURL: filePath 
                    }); 
                });
              
                console.log(`${destFileName} uploaded to ${bucketName}`);
              }
              
              streamFileUpload().catch(console.error);*/
            //stream.pipe(fs.createWriteStream(path.join(cwd, filePath)))
            
        }).catch(err => res.status(400).json({ err }))
    }).catch(err => {
        res.status(400).json({ err });    
    })
    
  }
