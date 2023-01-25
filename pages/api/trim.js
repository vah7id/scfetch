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


export default async function handler(req, res) {
    const sourceAudioFile = req.query.filePath;
    const start = req.query.start;
    const duration = req.query.duration;

    console.log('./public/static/'+sourceAudioFile)

    if (!isMp3File('./public/static/'+sourceAudioFile)) {
        res.status(400);
    }

    const conv = ffmpeg({ source: './public/static/'+sourceAudioFile });
    conv
    .setStartTime(start) //Can be in "HH:MM:SS" format also
    .setDuration(duration) 
    .on("start", function(commandLine) {
        console.log("Spawned FFmpeg with command: " + commandLine);
    })
    .on("error", function(err) {
        console.log("error: ", +err);
        res.status(400);
    })
    .on("end", function(err) {
        if (!err) {
            res.status(200).json({trimmedURL: "./public/static/trimmed-"+sourceAudioFile});
        }
    })
    .saveToFile("./public/static/trimmed-"+sourceAudioFile);
  }
