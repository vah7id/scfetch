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
        if(trackData.downloadURL) {
            setIsFetching(true);
            setConvertBtn({
                disabled: true,
                label: 'LOADING...'
            });
            fetch(`/api/convertToWav?filePath=${trackData.downloadURL}`).then(response => {
                setConvertBtn({
                    disabled: false,
                    label: 'CONVERT TO WAV'
                });
                setTimeout(() => {
                    // SHOW ADS
                    setIsFetching(false);
                    window.open('/static/'+trackData.downloadURL.replace('mp3', 'wav'), "_blank");
                }, 2000);
            }).catch(err => {
                console.log(err)
                setIsFetching(false);
                showNotification('error', 'Oopss, It seems there was an issue with converting the origin file! Please try a again!!');
                setConvertBtn({
                    disabled: false,
                    label: 'CONVERT TO WAV'
                });
            });
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
            window.open('/static/'+trackData.downloadURL, "_blank");
            setDlBtn({
                disabled: false,
                label: 'DOWNLOAD'
            })
            setIsFetching(false);
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
            setIsFetching(true);

            const regionId = Object.keys(wavesurfer.regions.list)[0];
            const region = wavesurfer.regions.list[regionId];
            if(region) {
                wavesurfer.pause();
                fetch(`/api/trim?filePath=${trackData.downloadURL}&start=${region.start}&duration=${region.end-region.start}`).then(response => response.json()).then(response => {
                    var anchorAudio = document.createElement("a");
                    anchorAudio.href = '/static/trimmed-'+trackData.downloadURL;
                    anchorAudio.download = "trimmed-"+trackData.downloadURL;
                    anchorAudio.click();
                    setIsFetching(false);
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
