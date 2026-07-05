import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { PROFICIENCY_LEVELS } from '../lib/proficiency'
import SongCard from '../components/SongCard'
import './Home.css'

function Home() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  useEffect(() => {
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setSongs(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError('노래 목록을 불러오지 못했어요. Firebase 설정을 확인해주세요.')
        setLoading(false)
      },
    )
    return unsubscribe
  }, [])

  const filteredSongs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return songs.filter((song) => {
      const matchesKeyword = !keyword || song.title?.toLowerCase().includes(keyword)
      const matchesLevel = levelFilter === 'all' || song.proficiency === levelFilter
      return matchesKeyword && matchesLevel
    })
  }, [songs, searchText, levelFilter])

  return (
    <div className="page">
      <div className="container">
        <div className="home-hero">
          <span className="eyebrow">🎤 Hatsune Miku × 🎵 Otamatone</span>
          <h1>오타마톤으로 연주하는 미쿠 노래책</h1>
          <p>연습한 노래를 모아두고, 악보와 음원을 검색해보세요.</p>
        </div>

        <div className="home-controls card">
          <input
            className="input"
            type="search"
            placeholder="노래 제목으로 검색하기 (예: 텔레캐스터 소녀)"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <div className="home-filters">
            <button
              type="button"
              className={levelFilter === 'all' ? 'is-active' : ''}
              onClick={() => setLevelFilter('all')}
            >
              전체
            </button>
            {PROFICIENCY_LEVELS.map((level) => (
              <button
                key={level.id}
                type="button"
                className={levelFilter === level.id ? 'is-active' : ''}
                onClick={() => setLevelFilter(level.id)}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {loading && <p className="empty-state">노래를 불러오는 중이에요...</p>}
        {error && <p className="empty-state error-text">{error}</p>}

        {!loading && !error && filteredSongs.length === 0 && (
          <p className="empty-state">
            {songs.length === 0
              ? '아직 등록된 노래가 없어요. 관리자가 노래를 추가하면 여기에 표시돼요!'
              : '검색 결과가 없어요.'}
          </p>
        )}

        <div className="song-grid">
          {filteredSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
