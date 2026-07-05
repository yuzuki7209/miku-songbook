import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { auth, db, ADMIN_EMAIL } from '../firebase'
import { DEFAULT_PROFICIENCY, getProficiency } from '../lib/proficiency'
import OtamatoneFader from '../components/OtamatoneFader'
import './Admin.css'

function formatDate(timestamp) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function LoginGate() {
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoggingIn(true)
    setLoginError(null)
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password)
      setPassword('')
    } catch (err) {
      console.error(err)
      setLoginError('비밀번호가 올바르지 않아요.')
    } finally {
      setLoggingIn(false)
    }
  }

  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="home-hero">
          <span className="eyebrow">🔒 관리자</span>
          <h1>관리자 로그인</h1>
          <p>비밀번호를 입력하면 노래를 추가하고 삭제할 수 있어요.</p>
        </div>
        <form className="card" onSubmit={handleLogin}>
          <div className="field">
            <label htmlFor="admin-password">비밀번호</label>
            <input
              id="admin-password"
              type="password"
              className="input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoFocus
              required
            />
          </div>
          <button className="btn" type="submit" disabled={loggingIn}>
            {loggingIn ? '확인 중...' : '로그인'}
          </button>
          {loginError && (
            <p className="error-text" style={{ marginTop: '0.6rem' }}>
              {loginError}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

function SongManager() {
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')
  const [audioUrl, setAudioUrl] = useState('')
  const [proficiency, setProficiency] = useState(DEFAULT_PROFICIENCY)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    const q = query(collection(db, 'songs'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSongs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleAdd = async (event) => {
    event.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'songs'), {
        title: title.trim(),
        sheetUrl: sheetUrl.trim(),
        audioUrl: audioUrl.trim(),
        proficiency,
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setSheetUrl('')
      setAudioUrl('')
      setProficiency(DEFAULT_PROFICIENCY)
      setStatus({ type: 'ok', message: '노래를 추가했어요!' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: '노래 추가에 실패했어요.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (song) => {
    if (!window.confirm(`'${song.title}'을(를) 삭제할까요?`)) return
    try {
      await deleteDoc(doc(db, 'songs', song.id))
    } catch (err) {
      console.error(err)
      window.alert('삭제에 실패했어요.')
    }
  }

  return (
    <>
      <form className="card" onSubmit={handleAdd}>
        <h2>새 노래 추가</h2>
        <div className="field">
          <label htmlFor="song-title">제목</label>
          <input
            id="song-title"
            className="input"
            value={title}
            maxLength={200}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="예: 멜트"
            required
          />
        </div>
        <div className="field">
          <label htmlFor="song-sheet">악보 링크</label>
          <input
            id="song-sheet"
            className="input"
            type="url"
            value={sheetUrl}
            onChange={(event) => setSheetUrl(event.target.value)}
            placeholder="https://..."
            required
          />
        </div>
        <div className="field">
          <label htmlFor="song-audio">음원 링크</label>
          <input
            id="song-audio"
            className="input"
            type="url"
            value={audioUrl}
            onChange={(event) => setAudioUrl(event.target.value)}
            placeholder="https://..."
            required
          />
        </div>
        <div className="field">
          <label>숙련도</label>
          <OtamatoneFader value={proficiency} onChange={setProficiency} />
        </div>
        <button className="btn" type="submit" disabled={saving}>
          {saving ? '추가하는 중...' : '노래 추가하기 ♪'}
        </button>
        {status && (
          <p className={status.type === 'error' ? 'error-text' : 'hint'} style={{ marginTop: '0.6rem' }}>
            {status.message}
          </p>
        )}
      </form>

      <h2 className="section-title">등록된 노래 ({songs.length})</h2>
      {loading && <p className="empty-state">불러오는 중...</p>}
      {!loading && songs.length === 0 && <p className="empty-state">아직 등록된 노래가 없어요.</p>}
      <div className="admin-song-list">
        {songs.map((song) => (
          <div className="card admin-song-row" key={song.id}>
            <div className="admin-song-info">
              <div className="admin-song-title-row">
                <h3>{song.title}</h3>
                <span className={`badge ${getProficiency(song.proficiency).badgeClass}`}>
                  {getProficiency(song.proficiency).label}
                </span>
              </div>
              <div className="admin-song-links">
                {song.sheetUrl && (
                  <a href={song.sheetUrl} target="_blank" rel="noreferrer">
                    악보
                  </a>
                )}
                {song.audioUrl && (
                  <a href={song.audioUrl} target="_blank" rel="noreferrer">
                    음원
                  </a>
                )}
              </div>
            </div>
            <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(song)}>
              삭제
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

function RequestModerationList() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleDelete = async (request) => {
    if (!window.confirm(`'${request.title}' 요청을 삭제할까요?`)) return
    await deleteDoc(doc(db, 'requests', request.id))
  }

  if (loading) return <p className="empty-state">불러오는 중...</p>
  if (requests.length === 0) return <p className="empty-state">아직 요청이 없어요.</p>

  return (
    <div className="admin-song-list">
      {requests.map((request) => (
        <div className="card admin-song-row" key={request.id}>
          <div className="admin-song-info">
            <div className="admin-song-title-row">
              <h3>{request.title}</h3>
              <span className="hint">{formatDate(request.createdAt)}</span>
            </div>
            {request.note && <p className="request-note">{request.note}</p>}
          </div>
          <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(request)}>
            삭제
          </button>
        </div>
      ))}
    </div>
  )
}

function ReviewModerationList() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleDelete = async (review) => {
    if (!window.confirm('이 감상평을 삭제할까요?')) return
    await deleteDoc(doc(db, 'reviews', review.id))
  }

  if (loading) return <p className="empty-state">불러오는 중...</p>
  if (reviews.length === 0) return <p className="empty-state">아직 감상평이 없어요.</p>

  return (
    <div className="admin-song-list">
      {reviews.map((review) => (
        <div className="card admin-song-row" key={review.id}>
          <div className="admin-song-info">
            <div className="admin-song-title-row">
              <h3>{review.nickname}</h3>
              <span className="hint">{formatDate(review.createdAt)}</span>
            </div>
            <p className="request-note">{review.content}</p>
          </div>
          <button className="btn btn-danger btn-sm" type="button" onClick={() => handleDelete(review)}>
            삭제
          </button>
        </div>
      ))}
    </div>
  )
}

function AdminDashboard() {
  const [tab, setTab] = useState('songs')

  return (
    <div className="page">
      <div className="container">
        <div className="admin-top">
          <div className="home-hero admin-hero">
            <span className="eyebrow">🎛️ 관리자</span>
            <h1>노래책 관리</h1>
          </div>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => signOut(auth)}>
            로그아웃
          </button>
        </div>

        <div className="admin-tabs">
          <button type="button" className={tab === 'songs' ? 'is-active' : ''} onClick={() => setTab('songs')}>
            노래 관리
          </button>
          <button type="button" className={tab === 'requests' ? 'is-active' : ''} onClick={() => setTab('requests')}>
            노래 요청함
          </button>
          <button type="button" className={tab === 'reviews' ? 'is-active' : ''} onClick={() => setTab('reviews')}>
            감상평함
          </button>
        </div>

        {tab === 'songs' && <SongManager />}
        {tab === 'requests' && <RequestModerationList />}
        {tab === 'reviews' && <ReviewModerationList />}
      </div>
    </div>
  )
}

function Admin() {
  const [user, setUser] = useState(undefined)

  useEffect(() => onAuthStateChanged(auth, setUser), [])

  if (user === undefined) {
    return (
      <div className="page">
        <div className="container">
          <p className="empty-state">확인하는 중...</p>
        </div>
      </div>
    )
  }

  return user ? <AdminDashboard /> : <LoginGate />
}

export default Admin
