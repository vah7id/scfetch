import * as React from 'react';
import Box from '@mui/material/Box';
import DownloadIcon from '@mui/icons-material/Download';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import {TextField, Button, Typography, Card, CardMedia, CardContent} from '@mui/material';

export default function SearchInput() {
    const [url, setURL] = React.useState('');
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
        let WaveSurfer = (await import("wavesurfer.js")).default;
       
        const wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: 'violet',
            progressColor: 'purple',
            backend: 'MediaElement',
        });

        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });

        wavesurfer.load('/static/'+trackData.downloadURL);
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
                <div id="waveform"></div>
            </Box>
        </Box>
    )
  }
