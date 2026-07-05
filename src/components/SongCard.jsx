import OtamatoneFader from './OtamatoneFader'
import './SongCard.css'

function SongCard({ song }) {
  return (
    <article className="song-card">
      <div className="song-card-top">
        <div>
          <h3 className="song-card-title">{song.title}</h3>
          {song.singer && <p className="song-card-singer">{song.singer}</p>}
          {song.genre && <span className="badge badge-genre">{song.genre}</span>}
        </div>
        <OtamatoneFader value={song.proficiency} size="sm" />
      </div>
      <div className="song-card-links">
        {song.sheetUrl && (
          <a className="btn btn-ghost btn-sm" href={song.sheetUrl} target="_blank" rel="noreferrer">
            악보
          </a>
        )}
        {song.audioUrl && (
          <a className="btn btn-ghost btn-sm" href={song.audioUrl} target="_blank" rel="noreferrer">
            음원
          </a>
        )}
      </div>
    </article>
  )
}

export default SongCard
