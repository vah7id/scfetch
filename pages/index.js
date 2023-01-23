import { Typography } from '@mui/material'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import SearchInput from './components/SearchInput'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Soundcloud Downloader MP3 / WAV formats</title>
        <meta name="description" content="download soundcloud URL to mp3 and wav format" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h2 className={styles.title}>
          <a href="/">SCFetch</a>: Soundcloud URL fetcher!
        </h2>
        <Typography variant="body2" style={{ opacity: '0.6', margin: '10px 0 40px 0' }}>
          Download High Quality Mp3 (128 & 320 kbps) and WAV (raw) format from Soundcloud Using Soundcloud to Mp3/WAV Converter!
        </Typography>
        <SearchInput />
      </main>
    </div>
  )
}
