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
import {TextField, Button, Typography, Card, CardMedia, CardContent, BottomNavigation, BottomNavigationAction, Stack, IconButton, Skeleton, LinearProgress, Backdrop, CircularProgress, Grid, Divider, Breadcrumbs, Link, Chip} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import HomeIcon from '@mui/icons-material/Home';
import ShareURL from './ShareURL';
import styles from '../../styles/Home.module.css'
import SearchIcon from '@mui/icons-material/Search';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import GrainIcon from '@mui/icons-material/Grain';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function SearchInput() {
    const [url, setURL] = React.useState('');
    const [wavesurfer, setWaveSurfer] = React.useState(null);
    const [region, setRegion] = React.useState(null);
    const [isPlaying, setPlaying] = React.useState(false);
    const [isFetching, setIsFetching] = React.useState(false);
    const [trackDetails, setTrackDetails] = React.useState({tempo: -1, songKey: -1, duration: -1, mode: -1})
    const [trimmedURL, setTrimmedURL] = React.useState('');
    const [regionPoints, setRegionPoints] = React.useState({start: 0, end: 10});
    const [trimButtonVisible, setTrimButtonVisible] = React.useState(false);
    const [isMute, setIsMute] = React.useState(false);
    const [openSnackbar, setSnackbarOpen] = React.useState(false);
    const [notification, setNotification] = React.useState({ type: null, message: ""});
    const [mp3URL, setmp3URL] = React.useState('');
    const [wavURL, setWavURL] = React.useState('');
    const [showMobileLimitError, setShowMobileLimitError] = React.useState(false);

    const showNotification = (type, message) => {
        setSnackbarOpen(true);
        setNotification({
            type: type,
            message
        })
    };
  
    const handleSnackbarClose = (event, reason) => {
      if (reason === 'clickaway') {
        return;
      }
  
      setSnackbarOpen(false);
    };

    const findSongKeyBpm = (query) => {
        fetch('/api/findBpm?title='+query).then(resp => resp.json()).then(resp => {
            console.log(resp);
            setTrackDetails({
                tempo: Math.round(resp.tempo),
                songKey: resp.songKey,
                duration: resp.duration,
                mode: resp.mode
            });
        });
    }
    
    const [dlBtn, setDlBtn] = React.useState({
        disabled: false,
        label: 'DOWNLOAD MP3'
    });
    const [convertBtn, setConvertBtn] = React.useState({
        disabled: false,
        label: 'DOWNLOAD WAV'
    });

    const [trackData, setTrackData] = React.useState({
        title:"",
        artwork: "",
        id: undefined,
        artist: "",
        downloadURL: "",
        waveForm: []
    }) 

    const handleChange = (targetURL) => {
        if(wavesurfer) {
            wavesurfer.destroy();
            setWaveSurfer(null);
        }
        setIsFetching(true);
        setTrimButtonVisible(false);
        setmp3URL("")
        setWavURL("")
        setTrimmedURL("")


        fetch(`/api/download?scurl=${targetURL || url}`).then(response => response.json()).then(response => {
            setIsFetching(false);
            if(response.err) {
                showNotification('error', response.err.message);

            } else {
                setTrackData(response);
                findSongKeyBpm(response.title+"+"+response.artist);
            }
        }).catch(err => {
            console.log(err.message)
            setIsFetching(false);
            showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
        });
    }

    const convertToWav = () => {
        setIsFetching(true);
        setConvertBtn({
            disabled: true,
            label: 'LOADING...'
        })
        fetch(`/api/convertToWav?scurl=${url}&title=`+trackData.downloadURL).then(response => response.json()).then(response => {
            setIsFetching(false);
            if(response.err) {
                setConvertBtn({
                    disabled: false,
                    label: 'DOWNLOAD WAV'
                })
                showNotification('error', response.err.message);
                setIsFetching(false);
                showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
            } else {
                showNotification('info','Audio has been converted to Wav file successfully!')

                setTimeout(() => {
                    setWavURL('https://storage.cloud.google.com/scfetch2/'+response.downloadURL.replace('mp3','wav'));
                    setConvertBtn({
                        disabled: false,
                        label: 'DOWNLOAD WAV'
                    })
                    setIsFetching(false);
                    const anchorAudio = document.createElement("a");
                    anchorAudio.target = "_blank";
                    anchorAudio.rel = "noopener";
                    anchorAudio.href = 'https://storage.cloud.google.com/scfetch2/'+response.downloadURL.replace('mp3','wav');
                    anchorAudio.download = "trimmed-"+response.downloadURL.replace('mp3','wav');
                    anchorAudio.click();
                    //window.open('https://storage.cloud.google.com/scfetch2/'+response.downloadURL.replace('mp3','wav'), "_blank");

                }, 1000);
            }
        }).catch(err => {
            setConvertBtn({
                disabled: false,
                label: 'DOWNLOAD WAV'
            })
            console.log(err.message)
            setIsFetching(false);
            showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
        });
    }

    const handleDownload = () => {
        setIsFetching(true);
        setDlBtn({
            disabled: true,
            label: 'LOADING...'
        })
        fetch(`/api/downloadStream?scurl=${url}&title=`+trackData.downloadURL).then(response => response.json()).then(response => {
            setIsFetching(false);
            if(response.err) {
                setDlBtn({
                    disabled: false,
                    label: 'DOWNLOAD MP3'
                })
                
                setIsFetching(false);
                showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
            } else {
                showNotification('info', 'Bingo!!, Download will start in 2 seconds... Enjoy :)')

                setTimeout(() => {
                    setmp3URL('https://storage.cloud.google.com/scfetch2/'+response.downloadURL)
                    setDlBtn({
                        disabled: false,
                        label: 'DOWNLOAD MP3'
                    })
                    setIsFetching(false);
                    const anchorAudio = document.createElement("a");
                    anchorAudio.target = "_blank";
                    anchorAudio.rel = "noopener";
                    anchorAudio.href = 'https://storage.cloud.google.com/scfetch2/'+response.downloadURL;
                    anchorAudio.download = response.downloadURL;
                    anchorAudio.click();
                    //window.open('https://storage.cloud.google.com/scfetch2/'+response.downloadURL, "_blank");

                }, 3000);
            }
        }).catch(err => {
            setDlBtn({
                disabled: false,
                label: 'DOWNLOAD MP3'
            })
            console.log(err.message)
            setIsFetching(false);
            showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
        });
    }


    const openAudioEditor = async() => {
        if(wavesurfer === null) {
            setIsFetching(true);

            if(mobileCheck()) {
                setShowMobileLimitError(true);
            }

            fetch(`/api/downloadStream?scurl=${url}&title=`+trackData.downloadURL).then(response => response.json()).then(async(response) => {
                if(response.err) {
                    setIsFetching(false);
                    setShowMobileLimitError(false);

                    showNotification('error', 'Oops, Unfortunately we cannot fetch the URL!! Please try again!!!');
                } else {
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
    
                //https://asset-opti-tst.luminus.be/api/proxy/api/document/query/v1/document/${documentDetails.id}/content
               wavesurferInstance.load('https://storage.cloud.google.com/scfetch2/'+trackData.downloadURL,trackData.waveForm.length > 0 ? trackData.waveForm : [
                0.0218, 0.0183, 0.0165, 0.0198, 0.2137, 0.2888, 0.2313, 0.15, 0.2542, 0.2538, 0.2358, 0.1195, 0.1591, 0.2599, 0.2742, 0.1447, 0.2328, 0.1878, 0.1988, 0.1645, 0.1218, 0.2005, 0.2828, 0.2051, 0.1664, 0.1181, 0.1621, 0.2966, 0.189, 0.246, 0.2445, 0.1621, 0.1618, 0.189, 0.2354, 0.1561, 0.1638, 0.2799, 0.0923, 0.1659, 0.1675, 0.1268, 0.0984, 0.0997, 0.1248, 0.1495, 0.1431, 0.1236, 0.1755, 0.1183, 0.1349, 0.1018, 0.1109, 0.1833, 0.1813, 0.1422, 0.0961, 0.1191, 0.0791, 0.0631, 0.0315, 0.0157, 0.0166, 0.0108]
               );

               
                
                wavesurferInstance.on('ready', async () => {
                    wavesurferInstance.play();
                    setPlaying(true);
                    setShowMobileLimitError(false);
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
            }).catch(err => {
                setShowMobileLimitError(false);
                showNotification('error', 'Cannot fetch the audio content to load!!!');
            })
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
                    showNotification('info', 'Bingo!!, Download will start in 3 seconds... Enjoy :)')
                    setTimeout(() => {
                        const anchorAudio = document.createElement("a");
                        anchorAudio.target = "_blank";
                        anchorAudio.rel = "noopener"
                        anchorAudio.href = 'https://storage.cloud.google.com/scfetch2/'+response.trimmedURL;
                        anchorAudio.download = "trimmed-"+response.trimmedURL;
                        anchorAudio.click();
                        //window.open('https://storage.cloud.google.com/scfetch2/'+response.trimmedURL)
                        setIsFetching(false);
                        setTrimmedURL('https://storage.cloud.google.com/scfetch2/'+response.trimmedURL)
                    }, 4000);
             
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

    function msToTime(duration) {
        var milliseconds = Math.floor((duration % 1000) / 100),
          seconds = Math.floor((duration / 1000) % 60),
          minutes = Math.floor((duration / (1000 * 60)) % 60),
          hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
      
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
      
        return minutes + ":" + seconds;
      }

    const mobileCheck = () => {
        let check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
        return check;
    };
    const getSongKeyTitle = (key, mode) => {
        console.log(key)
        let modeTitle = "";
        if(mode === 1) 
            modeTitle = "Major";
        if(mode === 0) 
            modeTitle = "Minor";

        switch(key) {
            case -1:
                return "Not Detected";
            case 0:
                return "C " + modeTitle;
            case 1:
                return "C♯/D♭ " + modeTitle;
            case 2:
                return "D " + modeTitle;
            case 3:
                return "D#,E♭ " + modeTitle;
            case 4:
                return "E " + modeTitle;
            case 5:
                return "F " + modeTitle;
            case 6:
                return "F# " + modeTitle;
            case 7:
                return "G " + modeTitle;
            case 8:
                return "G#/A♭ " + modeTitle;
            case 9:
                return "A " + modeTitle;
            case 10:
                return "A#/B♭ " + modeTitle;
            case 11:
                return "B " + modeTitle;
            default:
                return "Not Detected";
        }
    }

    return (
        <Box sx={{maxWidth: '768px'}}>
             <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={10}>
                        <TextField 
                        value={url} 
                        onChange={(event) => setURL(event.target.value)} 
                        id="filled-basic" 
                        onPaste={handlePaste}
                        style={{width: '100%'}}
                        label="Paste the SoundCloud URL here to download..." 
                        variant="filled" 
                    />
                    </Grid>
                    <Grid item xs={2}>
                        <Button 
                            onClick={() => handleChange(url)} 
                            size='large'  
                            style={{ width: '100%', padding: '15px'}} 
                            variant='contained'
                            >
                                Fetch
                        </Button>
                    </Grid>
                </Grid>
                
                
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
                <Card sx={{ marginTop: '32px', display: "flex", maxWidth: '768px' }}>
                    <CardMedia
                        className={styles.artwork}
                        component="img"
                        image={trackData.artwork}
                    />
                   
                        <CardContent sx={{width: '100%', paddingLeft: '25px', paddingRight: '25px'}}>
                            <Typography style={{ padding: '10px 0px 10px 0'}} component="div" variant="h5">
                                {trackData.artist} - {trackData.title}
                            </Typography>
                            <Stack direction={window.innerWidth < 768 ? "column" :"row"} style={{textAlign: 'left'}}  spacing={1}>
                                {trackDetails.songKey !== -1 && <Chip style={{fontSize: '0.9rem'}} label={`Key: ${getSongKeyTitle(trackDetails.songKey, trackDetails.mode)}`}/> }
                                {trackDetails.tempo !== -1 && <Chip style={{fontSize: '0.9rem'}} label={`Tempo: ${trackDetails.tempo} BPM`} />}
                                {trackDetails.duration !== -1 && <Chip style={{fontSize: '0.9rem'}} label={`Duration: ${msToTime(trackDetails.duration)}`} />}
                            
                            </Stack>
                            <Grid style={{marginTop: '10px'}} container  spacing={2}>
                                <Grid item mt={1} md={4} xs={12}>
                                    <Button 
                                        style={{width: '100%'}}
                                        disabled={dlBtn.disabled} 
                                        onClick={handleDownload} 
                                        variant="outlined" 
                                        startIcon={<DownloadIcon />}>
                                            {dlBtn.label}
                                    </Button>
                                </Grid>
                                <Grid item md={4} mt={1} xs={12}>
                                    <Button 
                                        style={{width: '100%'}}

                                        disabled={convertBtn.disabled} 
                                        onClick={convertToWav} 
                                        variant="outlined" 
                                        startIcon={<AudioFileIcon />}>
                                            {convertBtn.label}
                                    </Button>
                                </Grid>
                                <Grid item md={4} mt={1} xs={12}>
                                    <Button 
                                        style={{width: '100%'}}

                                        onClick={openAudioEditor} 
                                        variant="outlined" 
                                        startIcon={<ContentCutIcon />}>
                                            CROP AUDIO
                                    </Button>
                                </Grid>
                            </Grid>
                        </CardContent>
                        
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

                {mp3URL !== '' && <Box>
                    <Alert style={{marginTop: '25px', padding: '0px 10px', boxShadow: 'none', opacity:"0.8", width: '100%'}} variant="outlined" severity="success">
                    <Typography variant="caption">MP3 FORMAT IS READY TO DOWNLOAD !</Typography>
                    <Link title="download mp3" download rel={"noopener"} target={'_blank'} href={mp3URL}> CLICK HERE TO SAVE AS MP3 320KBS</Link>
                    <ShareURL shareUrl={mp3URL} title={'Shared from scfetch.app: '+trackData.title + ' - '+ trackData.artist+'.mp3'} />
                </Alert>
                </Box>}
                

                {wavURL !== '' && <Box>
                    <Alert style={{marginTop: '25px', padding: '0px 10px', boxShadow: 'none', opacity:"0.8", width: '100%'}} variant="outlined" severity="success">
                        <Typography variant="caption">WAV FORMAT IS READY TO DOWNLOAD !</Typography>
                        <Link title="download wav" download rel={"noopener"} target={'_blank'} href={wavURL}> CLICK HERE TO SAVE AS WAV FILE</Link>
                         <ShareURL shareUrl={wavURL} title={'Shared from scfetch: '+trackData.title + ' - '+ trackData.artist+'.wav'} />
                    </Alert>
                </Box>}
                
                <div style={{marginTop: '25px', background: '#eee'}} id="waveform"></div>
                
                {trimButtonVisible && <>
                <Stack sx={{ width: '100%', paddingTop: '20px' }} direction="row" spacing={4}>
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
                    <Typography style={{maxWidth: '100px'}} variant='body2'><b>Start Time:</b> {region && regionPoints.start.toPrecision(6)}</Typography>
                    <Typography style={{maxWidth: '100px'}} variant='body2'><b>End Time:</b> {region &&  regionPoints.end.toPrecision(6)}</Typography>
                    <Typography style={{maxWidth: '100px'}} variant='body2'>Length: {region && (regionPoints.end-regionPoints.start).toPrecision(6)}</Typography>
                </Stack>
                
                <Button color="success" className={styles.exportButton} onClick={trimAudio} variant='contained' startIcon={<SaveIcon />}>
                    EXPORT
                </Button>
                <Alert style={{marginTop: '25px', padding: '5px 10px', boxShadow: 'none', opacity:"0.6"}} variant="outlined" severity="info">Adjust the blue area by using your mouse to set the start and end time to crop!</Alert>
                {trimmedURL !== '' && <Box>
                    <Alert style={{marginTop: '25px', padding: '0px 10px', boxShadow: 'none', opacity:"0.8", width: '100%'}} variant="outlined" severity="success">
                        <Typography variant="caption">EXPORT IS READY TO DOWNLOAD !</Typography>
                        <Link title="download mp3" download rel={"noopener"} target={'_blank'} href={trimmedURL}> CLICK HERE TO SAVE AS A FILE</Link>
                         <ShareURL shareUrl={trimmedURL} title={'Shared from scfetch: '+trackData.title + ' - '+ trackData.artist+'-trimmed.wav'} />
                    </Alert>
                </Box>}
                </>}

                <Box sx={{ width: '100%',  paddingTop: '25px', color: '#ccc' }}>
                <Breadcrumbs sx={{ width: '100%', fontSize: '12px', marginTop: '250px', marginBottom: '12px', opacity: 0.5 }} aria-label="breadcrumb">
                    <Link
                        title="Home"
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        href="/"
                    >
                    <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                    Home
                    </Link>
                    <Link
                        title="Terms"
                        rel={"noopener"}
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="inherit"
                        href="/terms"
                    >
                    Terms & Conditions
                    </Link>
                   
                    <Link
                        title="Sampling Guide"
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="inherit"
                        rel={"noopener"}
                        target="_blank"
                        href="https://blog.landr.com/sampling-music-the-complete-guide/"
                    >
                     Sampling Music Guide
                    </Link>
                    <Link
                        rel={"noopener"}
                        title="Github"
                        underline="hover"
                        sx={{ display: 'flex', alignItems: 'center' }}
                        color="inherit"
                        target="_blank"
                        href="https://github.com/vah7id/scfetch"
                    >
                    Github (V.1.1.2)
                    </Link>
                </Breadcrumbs>
                </Box>
                <Divider light />
                <Stack sx={{ paddingTop: '25px', color: '#ccc' }} direction="row" spacing={4}>
                <Typography variant="caption">
                    <b>Disclaimer:</b> SoundCloud Downloader is an online tool to download SoundCloud tracks and music. SoundCloud allows you to listen to as many tracks as possible, but it does not enable soundtrack downloads. scfetch.app is not responsible for any media downloaded from here. SCFetch does not Host any SoundCloud Songs on our Server, and SCFetch allows you to download Public Domain SoundCloud tracks for which the corresponding owner gave Download permissions. Kindly read our Terms of Service before using this service. By using SCFetch, you have accepted the Terms & conditions
                    </Typography>
                </Stack>
            </Box>

            <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }} open={openSnackbar} autoHideDuration={5000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity={notification.type || 'error'} sx={{ width: '100%' }}>
                    {notification.message || ''}
                </Alert>
            </Snackbar>
            
            {isFetching && <Backdrop
                sx={{ color: '#fff', textAlign: 'center', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isFetching}
                >
                
                <Box>
                <CircularProgress color="inherit" />
                {showMobileLimitError && <Alert sx={{marginTop: '20px'}} severity="warning">
                    Due to web audio API limitation on some mobile phones, crop tool might not be able to load the track from the stream! Try on desktop browser without any problem :)
                    </Alert>}
                </Box>
            </Backdrop>}
 
        </Box>
    )
  }
