import * as React from 'react';
import Box from '@mui/material/Box';
import DownloadIcon from '@mui/icons-material/Download';
import {TextField, Button, Typography, Card, CardMedia, CardContent} from '@mui/material';

export default function SearchInput() {
    const [url, setURL] = React.useState('');
    const [dlBtn, setDlBtn] = React.useState({
        disabled: false,
        label: 'DOWNLOAD'
    });

    const [trackData, setTrackData] = React.useState({
        title:"",
        artwork: "",
        id: undefined,
        artist: "",
        downloadURL: ""
    }) 

    const handleChange = () => {
        // send to api
        fetch(`/api/download?scurl=${url}`).then(response => response.json()).then(response => {
            setTrackData(response)
        }).catch(err => console.log(err));
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
                        </Box>
                    </Box>
                    
                </Card>}
            </Box>
        </Box>
    )
  }
