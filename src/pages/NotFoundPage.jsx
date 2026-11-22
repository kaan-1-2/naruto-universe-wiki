import { Link } from 'react-router-dom';
import Icon from '../components/Icon.jsx';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <p className="text-7xl font-black tracking-tight text-orange-400">404</p>
      <h1 className="mt-4 text-3xl font-black">This path has vanished.</h1>
      <p className="mt-4 text-slate-400">This page does not exist in the shinobi world.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-[#111827]"
      >
        <Icon name="arrowLeft" size={17} /> Back to home
      </Link>
    </div>
  );
}
