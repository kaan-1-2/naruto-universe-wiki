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
          Hit falling logs, target boards, training dummies and scrolls. Avoid paper bombs, spiked
          iron balls and poison bottles. There is no time limit: survive as long as you can. A
          missed throw, dropped safe object or hazard hit ends the run. Every three hits raises the
          stage.
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
