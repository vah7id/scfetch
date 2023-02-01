// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const {Storage} = require('@google-cloud/storage');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);

export default async function handler(req, res) {
    const sourceAudioFile = req.query.filePath;
    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:'./key.json'});
    const myBucket = storage.bucket('scfetch2');
    const contents = await myBucket.file(sourceAudioFile).download();
    res.status(200).json(contents);
  }
