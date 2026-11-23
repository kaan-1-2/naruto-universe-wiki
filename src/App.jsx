import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import CatalogPage from './pages/CatalogPage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import ComparePage from './pages/ComparePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import NinjaDashPage from './pages/NinjaDashPage.jsx';
import CharacterNameRedirect from './pages/CharacterNameRedirect.jsx';
import AnimePage from './pages/AnimePage.jsx';
import KunaiChallengePage from './pages/KunaiChallengePage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/characters" element={<CatalogPage key="characters" type="characters" />} />
        <Route path="/clans" element={<CatalogPage key="clans" type="clans" />} />
        <Route path="/villages" element={<CatalogPage key="villages" type="villages" />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/characters/name/:name" element={<CharacterNameRedirect />} />
        <Route path="/characters/:id" element={<DetailPage key="characters" type="characters" />} />
        <Route path="/clans/:id" element={<DetailPage key="clans" type="clans" />} />
        <Route path="/villages/:id" element={<DetailPage key="villages" type="villages" />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/ninja-dash" element={<NinjaDashPage />} />
        <Route path="/kunai-challenge" element={<KunaiChallengePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
