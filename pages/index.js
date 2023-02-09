import { Typography } from '@mui/material'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import SearchInput from './components/SearchInput'
import { gtag, install } from 'ga-gtag';
import { useEffect } from 'react'
import Image from 'next/image'
export default function Home() {
  useEffect(() => {
    install('G-CS3ZP0C44M'); 
    fetch('/api/authSpotify').then(resp => resp.json()).then(resp => {
      console.log('authorized with spotify api!')
    }).catch(err => {
      console.log(err)
      console.log('cannot authorize with spotify!!!')
    })
  })
  return (
    <div lang="en" className={styles.container}>
      <Head> 
        <title>Soundcloud Downloader MP3 / WAV Converter / Sampler (Crop Tool)</title>
        <meta name="description" content="Soundcloud Downloader MP3 / WAV formats / Trim & Crop Audio Tool / Sample from Soundcloud" />
        <link rel="icon" href="/favicon.png" />
        <link rel="alternate" href="http://scfetch.app" hrefLang="en"/>
        <meta name="keywords" content="soundcloud to mp3, soundcloud wav, soundcloud convert wav, soundcloud download, soundcloud downloader, soundcloud sampler, soundcloud crop trim" />
          <meta name="googlebot" content="index, follow" />
          <meta name="robots" content="index, follow" />
          <link rel="apple-touch-icon-precomposed" href="/favicon.png" />
          <link rel="shortcut icon" href="/favicon.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Soundcloud Downloader MP3 / WAV formats / Trim & Crop / Sample from Soundcloud" />
          <meta name="twitter:description" content="NO ADS / NO BULLSHIT!!" />
          <meta name="twitter:image:src" content="/favicon.png" />
        {/*<meta property="fb:admins" content="100002861414139">
          <meta property="fb:app_id" content="503426229739677">*/}
          <meta property="og:url" content="https://scfetch.app" />
          <meta property="og:type" content="article" />
          <meta property="og:title" content="Soundcloud Downloader MP3 / WAV formats / Trim & Crop / Sample from Soundcloud" />
          <meta property="og:image" content="/favicon.png"/>
          <meta property="og:description" content="NO ADS / NO BULLSHIT!!"/>
          <meta property="og:site_name" content="SCFetch.app" />
          <meta itemProp="name" content="Soundcloud Downloader and SoundCloud to MP3 / WAV Converter, Soundcloud Sampler, Crop Audio" />
          <meta itemProp="description" content="Fast and Free SoundCloud to MP3 / WAV conversion and download via SCFetch.app. You don&#039;t need software or an account, just the SoundCloud URL." />
          <meta itemProp="image" content="./favicon.png" />
      </Head>
      <main lang="en" className={styles.main}>
        
        <h1 className={styles.title}>
          <Link title="homepage" href="/">SCFetch</Link>: Soundcloud URL Downloader & Sampler
        </h1>
        <Typography variant="h2" style={{ fontSize: '1rem', lineHeight: '24px', opacity: '0.4', textAlign: 'center', margin: '16px 0 40px 0' }}>
          Download High Quality Mp3 (128 & 320 kbps) and WAV (raw) format from Soundcloud <br />find tempo (BPM) and song key and easily crop your audio for sampling purposes! its FREE, Enjoy :)
        </Typography>
        <SearchInput />
      </main>
    </div>
  )
}
