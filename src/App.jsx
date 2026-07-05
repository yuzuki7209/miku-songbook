import { HashRouter, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Request from './pages/Request'
import Reviews from './pages/Reviews'
import Admin from './pages/Admin'
import { isFirebaseConfigured } from './firebase'

function FirebaseSetupNotice() {
  return (
    <div className="page">
      <div className="container container-narrow">
        <div className="home-hero">
          <span className="eyebrow">설정 필요</span>
          <h1>Firebase 설정이 아직 안 됐어요</h1>
        </div>
        <div className="card">
          <p>
            노래 데이터를 저장할 Firebase 설정 값이 비어있어요. 프로젝트 루트에 <code>.env</code> 파일을 만들고
            Firebase 콘솔에서 발급받은 값을 채워주세요.
          </p>
          <pre style={{ background: '#f4f9f8', padding: '0.75rem 1rem', borderRadius: 12, overflowX: 'auto' }}>
            cp .env.example .env
          </pre>
          <p className="hint">자세한 설정 방법은 저장소의 README.md를 참고해주세요.</p>
        </div>
      </div>
    </div>
  )
}

function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseSetupNotice />
  }

  return (
    <HashRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/request" element={<Request />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <footer className="site-footer">
        <div className="container">
          <p>미쿠마톤 노래책 — 오타마톤으로 미쿠를 연주해요</p>
        </div>
      </footer>
    </HashRouter>
  )
}

export default App
