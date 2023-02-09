// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const scdl = require('soundcloud-downloader').default
const fs = require('fs')
const axios = require('axios').default
const path = require('path');
const cwd = path.join(__dirname, '..');
const {Storage} = require('@google-cloud/storage');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const storeFS = (stream, filename ) => {
    const uploadDir = '/tmp';
    const path = `${uploadDir}/${filename}`;
    return new Promise((resolve, reject) =>
      stream
        .on('error', error => {
          if (stream.truncated)
            // delete the truncated file
            fs.unlinkSync(path);
          reject(error);
        })
        .pipe(fs.createWriteStream(path))
        .on('error', error => reject(error))
        .on('finish', () => resolve({ path }))
    );
  }

export default function handler(req, res) {
    const SOUNDCLOUD_URL = req.query.scurl;
    const CLIENT_ID = "e2OoIxUtdZaNGNvJPRgMP4fHcUQ7qIeb";
    const rootDir = path.join(process.cwd(), '/');

    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:path.join(rootDir, 'key.json')});
    const myBucket = storage.bucket('scfetch2');

    scdl.download(SOUNDCLOUD_URL,CLIENT_ID).then(async(stream) => {

            const track = `${req.query.title}`;
            storeFS(stream, track);
            setTimeout(() => {
              ffmpeg('/tmp/'+track)
              .toFormat('wav')
              .on('error', (err) => {
                console.log(err)
                  res.status(400).json({ err });    
              })
              .on('progress', (progress) => {
                  // console.log(JSON.stringify(progress));
                  console.log('Processing: ' + progress.targetSize + ' KB converted');
              })
              .on('end', () => {
                async function uploadFromMemory() {
                  await myBucket.upload('/tmp/'+req.query.title.replace('mp3','wav'), {destination: req.query.title.replace('mp3','wav')});
                  await myBucket.file(req.query.title.replace('mp3','wav')).makePublic();
                  res.status(200).json({ 
                      downloadURL: req.query.title 
                  });  
                }
                uploadFromMemory().catch(console.error);
              })
              .save(`/tmp/${req.query.title.replace('mp3','wav')}`);
            }, 2000)
            
            

    }).catch(err => {
      console.log(err)
        res.status(400).json({ err });    
    })
    
  }
