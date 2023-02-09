// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const {Storage} = require('@google-cloud/storage');
import axios from 'axios';
const path = require('path');
const cwd = path.join(__dirname, '..');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);

export default async function handler(req, res) {
  
    const sourceAudioFile = req.query.filePath;
    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:'./key.json'});
    const myBucket = storage.bucket('scfetch2');
    const rootDir = path.join(process.cwd(), '/');
    const dest = path.join(rootDir, '/tmp/'+sourceAudioFile);
    const options = {
      destination: dest,
    };
     await myBucket.file(sourceAudioFile).download(options);
    //const fileContents = Buffer.from(contents, "base64");
   // res.status(200).json(contents);

      return res.status(200).json({dest: dest.toString()});
  }
