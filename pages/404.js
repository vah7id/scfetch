// pages/404.js
import { Box, Button } from '@mui/material'
import Link from 'next/link'

export default function Custom404() {
return (<Box style={{'text-align': 'center', width: '400px', margin: '0 auto', display: 'block', padding: '25px'}}>
        <Link href="/"><Button href="/" variant="outlined">SCFetch.app: Go To Homepage </Button></Link>
         
       
        <h1 >404 - Page Not Found</h1>
        </Box>
        )
}