import OtamatoneFader from './OtamatoneFader'
import './SongCard.css'

function SongCard({ song }) {
  return (
    <article className="song-card">
      <div className="song-card-top">
        <h3 className="song-card-title">{song.title}</h3>
        <OtamatoneFader value={song.proficiency} size="sm" />
      </div>
      <div className="song-card-links">
        {song.sheetUrl && (
          <a className="btn btn-ghost btn-sm" href={song.sheetUrl} target="_blank" rel="noreferrer">
            📄 악보 보기
          </a>
        )}
        {song.audioUrl && (
          <a className="btn btn-ghost btn-sm" href={song.audioUrl} target="_blank" rel="noreferrer">
            🎧 음원 듣기
          </a>
        )}
      </div>
    </article>
  )
}

export default SongCard
