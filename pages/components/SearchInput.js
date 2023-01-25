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

import {TextField, Button, Typography, Card, CardMedia, CardContent, BottomNavigation, BottomNavigationAction, Stack, IconButton} from '@mui/material';

export default function SearchInput() {
    const [url, setURL] = React.useState('');
    const [wavesurfer, setWaveSurfer] = React.useState(null);
    const [region, setRegion] = React.useState(null);
    const [isPlaying, setPlaying] = React.useState(false);
    const [regionPoints, setRegionPoints] = React.useState({start: 0, end: 10});
    const [trimButtonVisible, setTrimButtonVisible] = React.useState(false);
    const [selectedAction, setSelectedAction] = React.useState(0);
    const [isMute, setIsMute] = React.useState(false);

    
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

    const handleChange = () => {
        fetch(`/api/download?scurl=${url}`).then(response => response.json()).then(response => {
            setTrackData(response)
        }).catch(err => console.log(err));
    }

    const convertToWav = () => {
        if(trackData.downloadURL) {
            setConvertBtn({
                disabled: true,
                label: 'LOADING...'
            });
            fetch(`/api/convertToWav?filePath=${trackData.downloadURL}`).then(response => {
                console.log(response)
                setConvertBtn({
                    disabled: false,
                    label: 'CONVERT TO WAV'
                });
                setTimeout(() => {
                    // SHOW ADS
                    window.open('/static/'+trackData.downloadURL.replace('mp3', 'wav'), "_blank");
                }, 2000);
            }).catch(err => {
                console.log(err)
                setConvertBtn({
                    disabled: false,
                    label: 'CONVERT TO WAV'
                });
            });
        }
    }

    const handleDownload = () => {
        setDlBtn({
            disabled: true,
            label: 'LOADING...'
        })
        setTimeout(() => {
            // loading (put some ads here)
            window.open('/static/'+trackData.downloadURL, "_blank");
            setDlBtn({
                disabled: false,
                label: 'DOWNLOAD'
            })
        }, 3000);
    }

    const openAudioEditor = async() => {
        if(wavesurfer === null) {
            setTrimButtonVisible(true)
            let WaveSurfer = (await import("wavesurfer.js")).default;
            var RegionsPlugin = await require("wavesurfer.js/dist/plugin/wavesurfer.regions.min.js");
            const wavesurferInstance = WaveSurfer.create({
                container: '#waveform',
                waveColor: '#1976d2',
                progressColor: 'purple',
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

            wavesurferInstance.on('ready', async () => {
                wavesurferInstance.play();
                setPlaying(true);
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


            wavesurferInstance.load('/static/'+trackData.downloadURL);
            setWaveSurfer(wavesurferInstance);
        }
    }

    const trimAudio = () => {
        if(wavesurfer.regions) {
            const regionId = Object.keys(wavesurfer.regions.list)[0];
            const region = wavesurfer.regions.list[regionId];
            if(region) {
                wavesurfer.pause();
                fetch(`/api/trim?filePath=${trackData.downloadURL}&start=${region.start}&duration=${region.end-region.start}`).then(response => response.json()).then(response => {
                    var anchorAudio = document.createElement("a");
                    anchorAudio.href = '/static/trimmed-'+trackData.downloadURL;
                    anchorAudio.download = "trimmed-"+trackData.downloadURL;
                    anchorAudio.click();
                }).catch(err => console.log(err));
            }
            
        }
    }

    const toggleMute = () => {
        wavesurfer.setMute(!isMute);
        setIsMute(!isMute);
    }


    return (
        <Box>
            <TextField 
                value={url} 
                onChange={(event) => setURL(event.target.value)} 
                id="filled-basic" 
                style={{ width: '768px'}} 
                label="SoundCloud URL here to download..." 
                variant="filled" 
            />
            <Button 
                onClick={handleChange} 
                size='large'  
                style={{ padding: '15px', marginLeft: '20px'}} 
                variant='contained'
                >
                    Fetch
            </Button>
            <Box>
                {trackData.id &&
                <Card sx={{ marginTop: '32px', display: "flex", }}>
                    <CardMedia
                        component="img"
                        sx={{ width: 150, marginRight: '25px' }}
                        image={trackData.artwork}
                    />
                    <Box sx={{  display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flex: '1 0 auto' }}>
                            <Typography component="div" variant="h5">
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
                </Card>}
                <div style={{marginTop: '25px', background: '#eee'}} id="waveform"></div>
                {trimButtonVisible && <>
                {/*<Typography style={{opacity: '0.7', width: '400px', float: 'left', marginTop: '24px'}} variant='body2'>Use the region handler to select your area to trim your audio, startTime and length should be specified!!</Typography>*/}
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
                <Button style={{ float: 'right', marginTop: '-42px'}} onClick={trimAudio} variant='contained' startIcon={<SaveIcon />}>
                    EXPORT
                </Button>
                </>}
            </Box>
        </Box>
    )
  }
