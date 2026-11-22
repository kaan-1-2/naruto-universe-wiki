import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Portrait } from './ArchiveCard.jsx';
import Icon from './Icon.jsx';
import { useSavedCollection } from '../context/CollectionContext.jsx';
import {
  asStringArray,
  characterAffiliation,
  characterClan,
  firstAppearance,
} from '../utils/format.js';
import { familyConnections, illustratedTechniques } from '../utils/art.js';
import {
  characterGallery,
  characterHref,
  findCharacterByName,
} from '../utils/characterDirectory.js';
import ShinobiTile from './ShinobiTile.jsx';
import { stories, subtitles } from '../data/character-content.js';
import useCharacterDetails from '../hooks/useCharacterDetails.js';
import { biographySummary, latestRecordedText, recordedText } from '../utils/profileData.js';

export default function CharacterProfile({ item: baseItem }) {
  const { character: item, extra, loading: loadingExtra } = useCharacterDetails(baseItem);
  const [tab, setTab] = useState('Overview');
  const navigate = useNavigate();
  useEffect(() => {
    setTab('Overview');
    document.title = `${item.name} · Naruto Universe Wiki`;
  }, [item.id, item.name]);
  const gallery = characterGallery(item);
  const { isFavorite, inCompare, toggleFavorite, toggleCompare } = useSavedCollection();
  const p = item.personal || {};
  const jutsu = asStringArray(item.jutsu);
  const abilities = illustratedTechniques(jutsu);
  const family = familyConnections(item.family);
  const relationships =
    item.name === 'Jiraiya'
      ? [
          ['Naruto Uzumaki', 'Student'],
          ['Minato Namikaze', 'Student'],
          ['Tsunade', 'Comrade'],
          ['Orochimaru', 'Comrade'],
          ['Nagato', 'Student'],
        ].map(([name, relationship]) => ({ name, relationship }))
      : family;
  const show = (name) => tab === 'Overview' || tab === name;
  const biography =
    biographySummary(extra?.biography) ||
    stories[item.name] ||
    `${item.name} is part of the Naruto universe. Explore this shinobi’s origins, recorded techniques and family connections below.`;
  const alias = recordedText(subtitles[item.name] || characterClan(item));
  const debut = recordedText(firstAppearance(item));
  const stats = [
    [
      'leaf',
      'Affiliation',
      recordedText(asStringArray(p.affiliation)[0] || characterAffiliation(item)),
    ],
    ['shield', 'Rank', latestRecordedText(item.rank?.ninjaRank)],
    ['users', 'Gender', recordedText(p.sex)],
    ['clock', 'Birthday', recordedText(p.birthdate)],
    ['layers', 'Height', latestRecordedText(p.height)],
  ].filter(([, , info]) => info);
  const personalDetails = [
    ['Full Name', recordedText(item.name)],
    ['Affiliation', recordedText(characterAffiliation(item))],
    ['Clan', recordedText(characterClan(item))],
    ['Team', recordedText(p.team)],
    ['Occupation', recordedText(p.occupation)],
    ['Age', recordedText(p.age)],
    ['Blood Type', recordedText(p.bloodType)],
    ['Height', recordedText(p.height)],
    ['Weight', recordedText(p.weight)],
    ['Status', recordedText(p.status)],
  ].filter(([, info]) => info);
  return (
    <article className="character-profile">
      <section className="profile-hero">
        <div className="profile-photo">
          <Portrait item={item} className="profile-portrait" />
        </div>
        <div className="profile-intro">
          <span className="red-ribbon">
            {item.name === 'Jiraiya'
              ? 'Legendary Sannin'
              : asStringArray(p.classification)[0] || 'Shinobi Profile'}
          </span>
          <h1>{item.name}</h1>
          {alias && <p className="profile-alias">— {alias}</p>}
          <p className="profile-summary">{biography}</p>
          <dl className="profile-stats">
            {stats.map(([icon, label, info]) => (
              <div key={label}>
                <Icon name={icon} size={26} />
                <span>
                  <dt>{label}</dt>
                  <dd>{info}</dd>
                </span>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <div className="profile-toolbar">
        <div className="profile-tabs" role="tablist" aria-label="Character details">
          {[
            ['Overview', 'home'],
            ['Abilities', 'spark'],
            ['Relations', 'users'],
            ['Gallery', 'gallery'],
          ].map(([label, icon]) => (
            <button
              role="tab"
              key={label}
              id={`tab-${label}`}
              aria-controls="profile-panel"
              aria-selected={tab === label}
              onClick={() => setTab(label)}
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
        </div>
        <div className="profile-actions">
          <button aria-pressed={isFavorite(item.id)} onClick={() => toggleFavorite(item)}>
            <Icon name="bookmark" filled={isFavorite(item.id)} size={19} />
            {isFavorite(item.id) ? 'Favorited' : 'Favorite'}
          </button>
          <button
            onClick={() => {
              if (!inCompare(item.id)) toggleCompare(item);
              navigate('/compare');
            }}
          >
            <Icon name="compare" size={19} />
            {inCompare(item.id) ? 'View Comparison' : 'Compare'}
          </button>
        </div>
      </div>
      <div
        className="profile-paper parchment"
        id="profile-panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
      >
        <div className={`profile-columns ${tab === 'Overview' ? '' : 'single-column'}`}>
          {tab === 'Overview' && (
            <div className="profile-facts">
              <section className="paper-panel">
                <h2 className="brush-heading">About</h2>
                <p>{biography}</p>
                {loadingExtra && (
                  <p role="status" className="biography-loading">
                    Loading additional details…
                  </p>
                )}
                {extra?.biography && (
                  <>
                    <details className="full-biography">
                      <summary>Read full biography</summary>
                      <div>
                        {extra.biography.split(/\n\s*\n/).map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                      </div>
                    </details>
                    <a
                      className="biography-source"
                      href={extra.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Biography source: AniList
                    </a>
                  </>
                )}
                {debut && <p className="debut-line">First appearance: {debut}</p>}
              </section>
              <section className="paper-panel">
                <h2 className="brush-heading">Personal Details</h2>
                <dl className="personal-rows">
                  {personalDetails.map(([label, info]) => (
                    <div key={label}>
                      <dt>
                        <Icon name={label === 'Status' ? 'shield' : 'users'} size={15} />
                        {label}
                      </dt>
                      <dd>{info}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            </div>
          )}
          {show('Abilities') && (
            <section className="paper-panel ability-panel">
              <h2 className="brush-heading">Notable Abilities</h2>
              {abilities.length > 0 && (
                <div className="ability-grid">
                  {abilities.map((a) => (
                    <div className="ability-card" key={a.name}>
                      <img src={a.art} alt={a.name} loading="lazy" />
                      <h3>{a.name}</h3>
                    </div>
                  ))}
                </div>
              )}
              {!jutsu.length && <p>No techniques are recorded for this character.</p>}
              {tab === 'Abilities' && (
                <>
                  <h3 className="small-heading">Recorded techniques</h3>
                  <div className="technique-list">
                    {jutsu.map((j) => (
                      <span key={j}>{j}</span>
                    ))}
                  </div>
                  <h3 className="small-heading">Chakra natures</h3>
                  <div className="technique-list">
                    {asStringArray(item.natureType).map((n) => (
                      <span key={n}>{n}</span>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}
        </div>
        {show('Relations') && (
          <section className="paper-panel relations-panel">
            <div className="section-heading">
              <h2 className="brush-heading">
                <Icon name="users" />
                Relations
              </h2>
              {family.length > 0 && (
                <button
                  className="text-link"
                  onClick={() => {
                    setTab('Relations');
                    document.getElementById('family-tree')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Family Tree
                </button>
              )}
            </div>
            {relationships.length ? (
              <div className="relation-grid">
                {relationships.map((r, i) => (
                  <ShinobiTile
                    key={r.name + i}
                    item={findCharacterByName(r.name) || { name: r.name }}
                    caption={r.relationship}
                  />
                ))}
              </div>
            ) : (
              <p>No relationships are listed in this record.</p>
            )}
            {tab === 'Relations' && family.length > 0 && (
              <div id="family-tree">
                <h3 className="small-heading">Family connections</h3>
                <div className="family-tree">
                  {family.map((r, i) => (
                    <Link key={r.name + i} to={characterHref({ name: r.name })}>
                      <Portrait
                        item={findCharacterByName(r.name) || { name: r.name }}
                        className="family-portrait"
                      />
                      <span>{r.relationship}</span>
                      <strong>{r.name}</strong>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
        {tab === 'Gallery' && (
          <section className="paper-panel">
            <h2 className="brush-heading">Gallery</h2>
            {gallery.length === 0 && <p>No gallery images are available for this character.</p>}
            <div className="profile-gallery">
              {gallery.map((src, i) => (
                <figure key={src}>
                  <img
                    src={src}
                    alt={`${item.name} — portrait ${i + 1}`}
                    onError={(e) => {
                      e.currentTarget.closest('figure').hidden = true;
                    }}
                  />
                  <figcaption>{item.name}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
