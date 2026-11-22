import { Link } from 'react-router-dom';
import { Portrait } from './ArchiveCard.jsx';
import { characterHref } from '../utils/characterDirectory.js';
import { subtitles } from '../data/character-content.js';

export default function ShinobiTile({ item, caption }) {
  return (
    <Link className="shinobi-tile" to={characterHref(item)}>
      <Portrait item={item} className="tile-portrait" />
      <div className="tile-caption">
        <h3>{item.name}</h3>
        <p>{caption || subtitles[item.name] || 'View shinobi profile'}</p>
      </div>
    </Link>
  );
}
