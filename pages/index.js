import { Typography } from '@mui/material'
import Head from 'next/head'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import SearchInput from './components/SearchInput'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
      <title>Soundcloud Downloader MP3 / WAV formats / Trim & Crop Audio Tool / Sample from Soundcloud</title>
        <meta name="description" content="Soundcloud Downloader MP3 / WAV formats / Trim & Crop Audio Tool / Sample from Soundcloud" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>
          <Link href="/">SCFetch</Link>: Soundcloud URL Downloader & Sampler
        </h2>
        <Typography variant="body2" style={{ opacity: '0.5', textAlign: 'center', margin: '16px 0 40px 0' }}>
          Download High Quality Mp3 (128 & 320 kbps) and WAV (raw) format from Soundcloud Using SCFetch &<br />easily trim your audio by crop tool for sampling purposes! Enjoy :)
        </Typography>
        <SearchInput />
      </main>
    </div>
  )
}
