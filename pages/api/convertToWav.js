// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);


import path from "path";

function isMp3File(wavFilename) {
    const ext = path.extname(wavFilename);
    return ext === ".mp3";
  }

function convertWavToMp3(mp3filePath) {
    return new Promise((resolve, reject) => {
        if (!isMp3File(mp3filePath)) {
            throw new Error(`Not a mp3 file`);
        }
    const outputFile = mp3filePath.replace(".mp3", ".wav");
        ffmpeg({
            source: mp3filePath,
        }).on("error", (err) => {
            reject(err);
        }).on("end", () => {
            resolve(outputFile);
        }).save(outputFile);
    });
}


export default async function handler(req, res) {
    const sourceAudioFile = req.query.filePath;
    console.log(sourceAudioFile)
    console.log('./public/static/'+sourceAudioFile)
   
    convertWavToMp3('./public/static/'+sourceAudioFile).then((wavFile => {
        res.status(200).json(wavFile);
    })).catch((err) => {
        console.log(err)
        res.status(400);
    });
  }
