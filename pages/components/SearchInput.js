import * as React from 'react';
import Box from '@mui/material/Box';
import DownloadIcon from '@mui/icons-material/Download';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SaveIcon from '@mui/icons-material/Save';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import LoopIcon from '@mui/icons-material/Loop';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import {TextField, Button, Typography, Card, CardMedia, CardContent, BottomNavigation, BottomNavigationAction, Stack, IconButton, Skeleton, LinearProgress, Backdrop, CircularProgress} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

function downloadMp3(buffer) {
    console.log(buffer)
    var MP3Blob = analyzeAudioBuffer(buffer);
    console.log('here is your mp3 url:');
    console.log(URL.createObjectURL(MP3Blob));
  }
  
  function analyzeAudioBuffer(aBuffer) {
      let numOfChan = aBuffer.numberOfChannels,
          btwLength = aBuffer.length * numOfChan * 2 + 44,
          btwArrBuff = new ArrayBuffer(btwLength),
          btwView = new DataView(btwArrBuff),
          btwChnls = [],
          btwIndex,
          btwSample,
          btwOffset = 0,
          btwPos = 0;
      setUint32(0x46464952); // "RIFF"
      setUint32(btwLength - 8); // file length - 8
      setUint32(0x45564157); // "WAVE"
      setUint32(0x20746d66); // "fmt " chunk
      setUint32(16); // length = 16
      setUint16(1); // PCM (uncompressed)
      setUint16(numOfChan);
      setUint32(aBuffer.sampleRate);
      setUint32(aBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
      setUint16(numOfChan * 2); // block-align
      setUint16(16); // 16-bit
      setUint32(0x61746164); // "data" - chunk
      setUint32(btwLength - btwPos - 4); // chunk length
  
      for (btwIndex = 0; btwIndex < aBuffer.numberOfChannels; btwIndex++)
          btwChnls.push(aBuffer.getChannelData(btwIndex));
  
      while (btwPos < btwLength) {
          for (btwIndex = 0; btwIndex < numOfChan; btwIndex++) {
              // interleave btwChnls
              btwSample = Math.max(-1, Math.min(1, btwChnls[btwIndex][btwOffset])); // clamp
              btwSample = (0.5 + btwSample < 0 ? btwSample * 32768 : btwSample * 32767) | 0; // scale to 16-bit signed int
              btwView.setInt16(btwPos, btwSample, true); // write 16-bit sample
              btwPos += 2;
          }
          btwOffset++; // next source sample
      }
  
      let wavHdr = lamejs.WavHeader.readHeader(new DataView(btwArrBuff));
  
      //Stereo
      let data = new Int16Array(btwArrBuff, wavHdr.dataOffset, wavHdr.dataLen / 2);
      let leftData = [];
      let rightData = [];
      for (let i = 0; i < data.length; i += 2) {
                   leftData.push(data[i]);
                   rightData.push(data[i + 1]);
      }
      var left = new Int16Array(leftData);
      var right = new Int16Array(rightData);
  
  
  
      //STEREO
      if (wavHdr.channels===2)
          return bufferToMp3(wavHdr.channels, wavHdr.sampleRate,  left,right);
      //MONO
      else if (wavHdr.channels===1)
          return bufferToMp3(wavHdr.channels, wavHdr.sampleRate,  data);
      
  
      function setUint16(data) {
          btwView.setUint16(btwPos, data, true);
          btwPos += 2;
      }
  
      function setUint32(data) {
          btwView.setUint32(btwPos, data, true);
          btwPos += 4;
      }
    }
  
    function bufferToMp3(channels, sampleRate, left, right = null) {
      var buffer = [];
      var mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      var remaining = left.length;
      var samplesPerFrame = 1152;
    
    
      for (var i = 0; remaining >= samplesPerFrame; i += samplesPerFrame) {
    
          if (!right)
          {
              var mono = left.subarray(i, i + samplesPerFrame);
              var mp3buf = mp3enc.encodeBuffer(mono);
          }
          else {
              var leftChunk = left.subarray(i, i + samplesPerFrame);
              var rightChunk = right.subarray(i, i + samplesPerFrame);
              var mp3buf = mp3enc.encodeBuffer(leftChunk,rightChunk);
          }
              if (mp3buf.length > 0) {
                      buffer.push(mp3buf);//new Int8Array(mp3buf));
              }
              remaining -= samplesPerFrame;
      }
      var d = mp3enc.flush();
      if(d.length > 0){
              buffer.push(new Int8Array(d));
      }
    
      var mp3Blob = new Blob(buffer, {type: 'audio/mpeg'});
      //var bUrl = window.URL.createObjectURL(mp3Blob);
    
      // send the download link to the console
      //console.log('mp3 download:', bUrl);
      return mp3Blob;
    
    }

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SearchInput() {
    const [url, setURL] = React.useState('');
    const [wavesurfer, setWaveSurfer] = React.useState(null);
    const [region, setRegion] = React.useState(null);
    const [isPlaying, setPlaying] = React.useState(false);
    const [isFetching, setIsFetching] = React.useState(false);

    const [regionPoints, setRegionPoints] = React.useState({start: 0, end: 10});
    const [trimButtonVisible, setTrimButtonVisible] = React.useState(false);
    const [isMute, setIsMute] = React.useState(false);
    const [openSnackbar, setSnackbarOpen] = React.useState(false);
    const [notification, setNotification] = React.useState({ type: null, message: ""});

    const showNotification = (type, message) => {
        setSnackbarOpen(true);
        setNotification({
            type: 'error',
            message
        })
    };
  
    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setSnackbarOpen(false);
    };
    
    const [dlBtn, setDlBtn] = React.useState({
        disabled: false,
        label: 'DOWNLOAD MP3 320kbps'
    });
    const [convertBtn, setConvertBtn] = React.useState({
        disabled: false,
        label: 'CONVERT TO WAV'
    });

    const [trackData, setTrackData] = React.useState({
        title:"",
        artwork: "",
        id: undefined,
        artist: "",
        downloadURL: ""
    }) 

    const handleChange = (targetURL) => {
        if(wavesurfer) {
            wavesurfer.destroy();
            setWaveSurfer(null);
        }
        setIsFetching(true);
        setTrimButtonVisible(false);
        fetch(`/api/download?scurl=${targetURL || url}`).then(response => response.json()).then(response => {
            setIsFetching(false);
            if(response.err) {
                showNotification('error', response.err.message);

            } else {
                setTrackData(response)
            }
        }).catch(err => {
            console.log(err.message)
            setIsFetching(false);
            showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
        });
    }

    const convertToWav = () => {
        if(trackData.downloadURL !== "") {
            setIsFetching(true);
            setDlBtn({
                disabled: true,
                label: 'LOADING...'
            })
            setTimeout(() => {
                // loading (put some ads here)
                window.open('https://storage.cloud.google.com/scfetch2/'+trackData.downloadURL.replace('mp3','wav'), "_blank");
                setDlBtn({
                    disabled: false,
                    label: 'DOWNLOAD'
                })
                setIsFetching(false);
            }, 3000);
        }
    }

    const handleDownload = () => {
        setIsFetching(true);
        setDlBtn({
            disabled: true,
            label: 'LOADING...'
        })
        setTimeout(() => {
            // loading (put some ads here)
            window.open('https://storage.cloud.google.com/scfetch2/'+trackData.downloadURL, "_blank");
            setDlBtn({
                disabled: false,
                label: 'DOWNLOAD'
            })
            setIsFetching(false);
        }, 3000);
    }


    const openAudioEditor = async() => {
        
        if(wavesurfer === null) {
            setIsFetching(true);
            setTrimButtonVisible(true)
            let WaveSurfer = (await import("wavesurfer.js")).default;
            var RegionsPlugin = await require("wavesurfer.js/dist/plugin/wavesurfer.regions.min.js");
            const wavesurferInstance = WaveSurfer.create({
                container: '#waveform',
                waveColor: '#1976d2',
                progressColor: '#A8DBA8',
                backend: 'MediaElement',
                plugins: [
                    RegionsPlugin.create({
                        regionsMinLength: 1,
                        regions: [
                            {
                                start: regionPoints.start,
                                end: regionPoints.end,
                                loop: true,
                                color: 'rgb(156 200 255 / 50%)'
                            }
                        ],
                        dragSelection: {
                            slop: 5
                        }
                    })
                ]
            });


           wavesurferInstance.load('https://storage.cloud.google.com/scfetch2/'+trackData.downloadURL, [
           0.0218, 0.0183, 0.0165, 0.0198, 0.2137, 0.2888, 0.2313, 0.15, 0.2542, 0.2538, 0.2358, 0.1195, 0.1591, 0.2599, 0.2742, 0.1447, 0.2328, 0.1878, 0.1988, 0.1645, 0.1218, 0.2005, 0.2828, 0.2051, 0.1664, 0.1181, 0.1621, 0.2966, 0.189, 0.246, 0.2445, 0.1621, 0.1618, 0.189, 0.2354, 0.1561, 0.1638, 0.2799, 0.0923, 0.1659, 0.1675, 0.1268, 0.0984, 0.0997, 0.1248, 0.1495, 0.1431, 0.1236, 0.1755, 0.1183, 0.1349, 0.1018, 0.1109, 0.1833, 0.1813, 0.1422, 0.0961, 0.1191, 0.0791, 0.0631, 0.0315, 0.0157, 0.0166, 0.0108]);
            
            wavesurferInstance.on('ready', async () => {
                console.log('ready')
                    wavesurferInstance.play();
                    setPlaying(true);
                    setIsFetching(false);
                    const regionId = Object.keys(wavesurferInstance.regions.list)[0];
                    const region = wavesurferInstance.regions.list[regionId];
                    if(region) {
                        setRegion(region);
                    }
            });

            wavesurferInstance.on('region-created', (region) => {
                var regions = region.wavesurfer.regions.list;
                var keys = Object.keys(regions);
                if(keys.length > 1){
                    regions[keys[1]].remove();
                }
            })

            wavesurferInstance.on('region-updated', (region) => {
                var regions = region.wavesurfer.regions.list;
                var keys = Object.keys(regions);
                if(keys.length > 1){
                    regions[keys[1]].remove();
                }
                setRegionPoints({
                    start: region.start,
                    end: region.end
                })
            })

            wavesurferInstance.on('pause', () => {
                setPlaying(false);
            })

            wavesurferInstance.on('play', () => {
                setPlaying(true);
            })


            setWaveSurfer(wavesurferInstance);
        }
    }

    const trimAudio = () => {
        if(wavesurfer.regions) {
            setIsFetching(true);

            const regionId = Object.keys(wavesurfer.regions.list)[0];
            const region = wavesurfer.regions.list[regionId];

            const startTimeBytesPosition = (44,100 * region.start) * 2 * 2;
            const endTimeBytesPosition = (44,100 * region.end) * 2 * 2;


            if(region) {
                wavesurfer.pause();
                fetch(`/api/trim?filePath=${trackData.downloadURL}&start=${region.start}&duration=${region.end - region.start}`).then(response => response.json()).then(response => {
                    setTimeout(() => {
                        var anchorAudio = document.createElement("a");
                        anchorAudio.target = "_blank";
                        anchorAudio.href = 'https://storage.cloud.google.com/scfetch2/'+response.trimmedURL
                        anchorAudio.download = response.trimmedURL;
                        anchorAudio.click();
                        setIsFetching(false);
                    }, 3000);
             
                }).catch(err => {
                    showNotification('error', 'Oopss, It seems there was an issue with trimming the origin file! Please try a again!!');
                    console.log(err)
                    setIsFetching(false);
                });
            }
            
        }
    }

    const toggleMute = () => {
        wavesurfer.setMute(!isMute);
        setIsMute(!isMute);
    }

    const handlePaste = (event) => {
        handleChange(event.clipboardData.getData('text/plain'));
    }

    return (
        <Box>
            <Box>
                <TextField 
                    value={url} 
                    onChange={(event) => setURL(event.target.value)} 
                    id="filled-basic" 
                    onPaste={handlePaste}
                    style={{ width: '768px'}} 
                    label="Paste the SoundCloud URL here to download..." 
                    variant="filled" 
                />
                <Button 
                    onClick={() => handleChange(url)} 
                    size='large'  
                    style={{ padding: '15px', marginLeft: '20px'}} 
                    variant='contained'
                    >
                        Fetch
                </Button>
                <Box sx={{ width: '100%', mt: '10px', opacity: '0.3', fontSize: '14px' }}>
                    <Typography variant="subtitle">
                        https://soundcloud.com/artist/track-name
                    </Typography>
                </Box>
                {isFetching && <Box sx={{ width: '100%', mt: '15px' }}>
                    <LinearProgress />
                </Box>}
            </Box>

            <Box>
                {trackData.id ?
                <Card sx={{ marginTop: '32px', display: "flex", }}>
                    <CardMedia
                        component="img"
                        sx={{ width: 150, marginRight: '25px' }}
                        image={trackData.artwork}
                    />
                    <Box sx={{  display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography component="div" style={{maxWidth: '600px'}} variant="h5">
                                {trackData.title}
                            </Typography>
                        <Typography variant="subtitle1" color="text.secondary" component="div">
                            {trackData.artist}
                        </Typography>
                        </CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 2 }}>
                            <Button 
                                disabled={dlBtn.disabled} 
                                onClick={handleDownload} 
                                variant="outlined" 
                                startIcon={<DownloadIcon />}>
                                    {dlBtn.label}
                            </Button>
                            <Button 
                            style={{marginLeft: '20px'}}
                                disabled={convertBtn.disabled} 
                                onClick={convertToWav} 
                                variant="outlined" 
                                startIcon={<AudioFileIcon />}>
                                    {convertBtn.label}
                            </Button>
                            <Button 
                            style={{marginLeft: '20px'}}
                                onClick={openAudioEditor} 
                                variant="outlined" 
                                startIcon={<ContentCutIcon />}>
                                    CROP (TRIM AUDIO)
                            </Button>
                        </Box>
                    </Box>  
                </Card> :<>{isFetching && <>
                    <Box  sx={{ width: 210, float: 'left', marginRight: '25px', my: 5 }}>
                        <Skeleton variant="rectangular" width={210} height={120} />
                    </Box>
                    <Box sx={{ width: 210, marginTop: '40px', float: 'left' }}>
                        <Skeleton />
                        <Skeleton width="60%" />
                        <br /><br />
                        <Skeleton variant="rectangular" width={150} height={35} />
                    </Box>
                    </>}
                </>}
                
                <div style={{marginTop: '25px', background: '#eee'}} id="waveform"></div>
                
                {trimButtonVisible && <>
                <Stack sx={{ width: 500, paddingTop: '20px' }} direction="row" spacing={4}>
                    {wavesurfer &&
                        <IconButton sx={{background: '#eee'}} onClick={() => wavesurfer.playPause()} aria-label="play">
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </IconButton>
                    }
                    <IconButton sx={{background: '#eee'}} onClick={() => region.loop = !region.loop} aria-label="loop" color={(region && region?.loop === true) ? "primary" : "disabled"}>
                        <LoopIcon />
                    </IconButton>
                    <IconButton sx={{background: '#eee'}} onClick={toggleMute} aria-label="add an alarm">
                        {isMute ? <VolumeUpIcon /> : <VolumeOffIcon />}
                    </IconButton>
                    <Typography variant='body2'><b>Start Time:</b> {region && regionPoints.start.toPrecision(6)}</Typography>
                    <Typography variant='body2'><b>End Time:</b> {region &&  regionPoints.end.toPrecision(6)}</Typography>
                    <Typography variant='body2'>Length: {region && (regionPoints.end-regionPoints.start).toPrecision(6)}</Typography>
                </Stack>
                
                <Button color="success" style={{ float: 'right', marginTop: '-42px'}} onClick={trimAudio} variant='contained' startIcon={<SaveIcon />}>
                    EXPORT
                </Button>
                <Button color="info" style={{ float: 'right', marginRight: '120px', marginTop: '-42px', }} disabled variant='contained' startIcon={<SettingsIcon />}>
                    MIXER
                </Button>
                <Alert style={{marginTop: '25px', padding: '5px 10px', boxShadow: 'none', opacity:"0.6"}} variant="outlined" severity="info">Adjust the blue area by using your mouse to set the start and end time to crop!</Alert>
                </>}
            </Box>

            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={openSnackbar} autoHideDuration={5000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={notification.type || 'error'} sx={{ width: '100%' }}>
                    {notification.message || ''}
                </Alert>
            </Snackbar>
            
            {isFetching && <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isFetching}
                >
                <CircularProgress color="inherit" />
            </Backdrop>}

        </Box>
    )
  }
