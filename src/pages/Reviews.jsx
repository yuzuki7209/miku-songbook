import { useEffect, useState } from 'react'
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import './Reviews.css'

function formatDate(timestamp) {
  if (!timestamp?.toDate) return ''
  return timestamp.toDate().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

function Reviews() {
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReviews(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    setStatus(null)
    try {
      await addDoc(collection(db, 'reviews'), {
        nickname: nickname.trim() || '익명의 방문자',
        content: content.trim(),
        createdAt: serverTimestamp(),
      })
      setContent('')
      setStatus({ type: 'ok', message: '감상평 감사해요! 💚' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: '등록에 실패했어요. 잠시 후 다시 시도해주세요.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="home-hero">
          <span className="eyebrow">💌 감상평</span>
          <h1>노래책에 남기는 한마디</h1>
          <p>연주를 듣고 느낀 점을 자유롭게 남겨주세요.</p>
        </div>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="review-nickname">닉네임 (선택)</label>
            <input
              id="review-nickname"
              className="input"
              value={nickname}
              maxLength={30}
              onChange={(event) => setNickname(event.target.value)}
              placeholder="예: 지나가던 미쿠팬"
            />
          </div>
          <div className="field">
            <label htmlFor="review-content">감상평</label>
            <textarea
              id="review-content"
              className="textarea"
              value={content}
              maxLength={500}
              onChange={(event) => setContent(event.target.value)}
              placeholder="어떤 노래가 좋았는지, 오타마톤 소리가 어땠는지 알려주세요"
              required
            />
          </div>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? '등록 중...' : '감상평 남기기 ♪'}
          </button>
          {status && (
            <p className={status.type === 'error' ? 'error-text' : 'hint'} style={{ marginTop: '0.6rem' }}>
              {status.message}
            </p>
          )}
        </form>

        <h2 className="section-title">방문자들의 감상평</h2>
        {loading && <p className="empty-state">불러오는 중...</p>}
        {!loading && reviews.length === 0 && <p className="empty-state">아직 감상평이 없어요. 첫 감상평을 남겨보세요!</p>}
        <div className="review-list">
          {reviews.map((review) => (
            <div className="review-bubble" key={review.id}>
              <div className="review-bubble-head">
                <strong>{review.nickname}</strong>
                <span className="hint">{formatDate(review.createdAt)}</span>
              </div>
              <p>{review.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Reviews
