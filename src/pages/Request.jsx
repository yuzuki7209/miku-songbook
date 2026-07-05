import { useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './Request.css'

function formatDate(timestamp) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function Request() {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'requests'), {
        title: title.trim(),
        note: note.trim(),
        createdAt: serverTimestamp(),
      })
      setTitle('')
      setNote('')
      setStatus({ type: 'ok', message: '요청이 등록됐어요! 오타마톤으로 열심히 연습해볼게요.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: '요청 등록에 실패했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="home-hero">
          <span className="eyebrow">노래 요청</span>
          <h1>듣고 싶은 노래가 있나요?</h1>
          <p>연주해줬으면 하는 노래를 요청해보세요.</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="request-title">노래 제목</label>
            <input
              id="request-title"
              className="input"
              value={title}
              maxLength={200}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="예: 미쿠미쿠하게 해줄게"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="request-note">메모 (선택)</label>
            <textarea
              id="request-note"
              className="textarea"
              value={note}
              maxLength={500}
              onChange={(event) => setNote(event.target.value)}
              placeholder="가수, 원곡 링크, 하고 싶은 이유 등 자유롭게 적어주세요"
            />
          </div>
          <button className="btn btn-pink" type="submit" disabled={submitting}>
            {submitting ? '등록 중...' : '요청 보내기'}
          </button>
          {status && (
            <p className={status.type === 'error' ? 'error-text' : 'hint'} style={{ marginTop: '0.6rem' }}>
              {status.message}
            </p>
          )}
        </form>

        <h2 className="section-title">지금까지 온 요청</h2>
        {loading && <p className="empty-state">불러오는 중...</p>}
        {!loading && requests.length === 0 && <p className="empty-state">아직 요청이 없어요. 첫 요청을 남겨보세요!</p>}
        <div className="request-list">
          {requests.map((request) => (
            <div className="card request-item" key={request.id}>
              <div className="request-item-head">
                <h3>{request.title}</h3>
                <span className="hint">{formatDate(request.createdAt)}</span>
              </div>
              {request.note && <p className="request-note">{request.note}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Request
