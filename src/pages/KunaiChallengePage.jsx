import { Link } from 'react-router-dom';
import KunaiPractice from '../components/KunaiPractice.jsx';
import Icon from '../components/Icon.jsx';

export default function KunaiChallengePage() {
  return (
    <div className="kunai-challenge-page">
      <div className="page-width kunai-page-heading">
        <Link to="/" className="screen-back">
          <Icon name="arrowLeft" size={18} /> Back to home
        </Link>
        <p className="screen-eyebrow">Shinobi games / Kunai Challenge</p>
        <h1>Kunai Challenge</h1>
        <p>
          Click falling logs and target boards to throw a kunai. Avoid red paper bombs. Let a safe
          object fall, miss a throw or hit a bomb and the round ends. Every five hits makes the next
          stage faster and busier.
        </p>
      </div>
      <KunaiPractice />
      <div className="page-width kunai-other-game">
        <Link to="/ninja-dash">
          Try Shinobi Dash <Icon name="arrow" size={18} />
        </Link>
      </div>
    </div>
  );
}
