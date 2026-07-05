import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { PROFICIENCY_LEVELS } from '../lib/proficiency'
import { GENRES } from '../lib/genre'
import SongCard from '../components/SongCard'
import './Home.css'

function Home() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [selectedLevels, setSelectedLevels] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])
  const [filterOpen, setFilterOpen] = useState(false)

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

  useEffect(() => {
    if (!filterOpen) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setFilterOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [filterOpen])

  const toggleLevel = (id) => {
    setSelectedLevels((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const toggleGenre = (genre) => {
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((v) => v !== genre) : [...prev, genre]))
  }

  const resetFilters = () => {
    setSelectedLevels([])
    setSelectedGenres([])
  }

  const activeFilterCount = selectedLevels.length + selectedGenres.length

  const filteredSongs = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()
    return songs.filter((song) => {
      const matchesKeyword =
        !keyword ||
        song.title?.toLowerCase().includes(keyword) ||
        song.singer?.toLowerCase().includes(keyword)
      const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(song.proficiency)
      const matchesGenre = selectedGenres.length === 0 || selectedGenres.includes(song.genre)
      return matchesKeyword && matchesLevel && matchesGenre
    })
  }, [songs, searchText, selectedLevels, selectedGenres])

  return (
    <div className="page">
      <div className="container">
        <div className="home-hero">
          <span className="eyebrow">Hatsune Miku × Otamatone</span>
          <h1>오타마톤으로 연주하는 미쿠마톤 노래책</h1>
          <p>좋아하는 노래를 검색해보세요</p>
        </div>

        <div className="home-controls card">
          <div className="home-search-row">
            <input
              className="input"
              type="search"
              placeholder="제목이나 가수로 검색하기 (예: 멜트)"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
            <button type="button" className="filter-trigger-btn" onClick={() => setFilterOpen(true)}>
              필터{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </button>
          </div>
        </div>

        {filterOpen && (
          <div className="filter-modal-backdrop" onClick={() => setFilterOpen(false)}>
            <div
              className="filter-modal card"
              role="dialog"
              aria-modal="true"
              aria-label="검색 필터"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="filter-modal-header">
                <h2>필터</h2>
                <button
                  type="button"
                  className="filter-modal-close"
                  onClick={() => setFilterOpen(false)}
                  aria-label="닫기"
                >
                  ×
                </button>
              </div>

              <div className="filter-modal-section">
                <h3>숙련도</h3>
                <div className="filter-chip-group">
                  {PROFICIENCY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      type="button"
                      aria-pressed={selectedLevels.includes(level.id)}
                      className={selectedLevels.includes(level.id) ? 'is-active' : ''}
                      onClick={() => toggleLevel(level.id)}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-modal-section">
                <h3>장르</h3>
                <div className="filter-chip-group filter-chip-group-genre">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      aria-pressed={selectedGenres.includes(genre)}
                      className={selectedGenres.includes(genre) ? 'is-active' : ''}
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-modal-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
                  초기화
                </button>
                <button type="button" className="btn btn-sm" onClick={() => setFilterOpen(false)}>
                  적용하기
                </button>
              </div>
            </div>
          </div>
        )}

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
