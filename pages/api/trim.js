// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const {Storage} = require('@google-cloud/storage');
const stream = require('stream');
const fs = require('fs')
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);



export default async function handler(req, res) {
    const sourceAudioFile = req.query.filePath;
    const start = req.query.start;
    const duration = req.query.duration;

    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:'./key.json'});
    const myBucket = storage.bucket('scfetch2');
    const contents = await myBucket.file(sourceAudioFile).download();

    const options = {
        destination: `./tmp/sss${sourceAudioFile}`,
      };
  
      // Downloads the file
      await myBucket.file(sourceAudioFile).download(options);

    
    console.log(`/tmp/${sourceAudioFile}`)
    const conv = ffmpeg({ source: `./tmp/sss${sourceAudioFile}`});
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
            res.status(200).json({trimmedURL: "./tmp/trimmed-"+sourceAudioFile});
        }
    })
    .saveToFile("./tmp/trimmed-"+sourceAudioFile);
  }


/*const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const ffmpeg = require('fluent-ffmpeg');
const {Storage} = require('@google-cloud/storage');
const stream = require('stream');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// console.log(ffmpegInstaller.path, ffmpegInstaller.version);

import path from "path";


export default async function handler(req, res) {
    const sourceAudioFile = req.query.filePath;
    const start = req.query.start;
    const duration = req.query.duration;
    const storage = new Storage({projectId: 'scfetch-375920', keyFilename:'./key.json'});
    const myBucket = storage.bucket('scfetch2');

    async function downloadByteRange() {
        const options = {
          destination: 'trimmed'+sourceAudioFile,
          start: start,
          end: duration,
        };
    
        // Downloads the file from the starting byte to the ending byte specified in options
        const fileResponse = await myBucket.file(sourceAudioFile).download(options)
         
    }
        downloadByteRange().catch(console.err);
    

    return;

    async function downloadIntoMemory() {
        // Downloads the file into a buffer in memory.
        const contents = await myBucket.file(sourceAudioFile).download();
        console.log(contents)
        const conv = ffmpeg({source: 'https://storage.cloud.google.com/scfetch2/'+sourceAudioFile});
       
        conv.setStartTime(start) //Can be in "HH:MM:SS" format also
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
                res.status(200).json({trimmedURL: "trimmed-"+sourceAudioFile});
            }
        })
        .save(async(output) => {
            console.log(output)
            const options = {
                destination: "trimmed-"+sourceAudioFile,
                // Optional:
                preconditionOpts: {ifGenerationMatch: generationMatchPrecondition},
            };
        
            await myBucket.upload(output, options);
            console.log(`${filePath} uploaded to ${bucketName}`);
        });
        
      }
    
     // downloadIntoMemory().catch(console.error);

   
  }
*/