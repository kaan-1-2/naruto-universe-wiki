import test from 'node:test';
import assert from 'node:assert/strict';
import {
  familyConnections,
  illustratedTechniques,
  localPortrait,
  portraitCandidates,
} from '../src/utils/art.js';

test('Jiraiya has a bundled portrait even when the remote image breaks', () => {
  assert.equal(localPortrait('Jiraiya'), '/assets/portraits/jiraiya.jpg');
  const sources = portraitCandidates({
    name: 'Jiraiya',
    images: ['https://example.invalid/jiraiya.jpg'],
  });
  assert.equal(sources[0], '/assets/portraits/jiraiya.jpg');
});

test('other featured shinobi have fallback portrait after remote sources', () => {
  const sources = portraitCandidates({
    name: 'Naruto Uzumaki',
    images: ['https://example.invalid/naruto.jpg'],
  });
  assert.equal(sources[0], '/assets/portraits/naruto-uzumaki.png');
  assert.match(sources.at(-1), /^data:image\/svg\+xml/);
  assert.match(
    portraitCandidates({ name: 'Unknown Person', images: [] })[0],
    /^data:image\/svg\+xml/,
  );
});

test('popular techniques receive appropriate artwork without inventing jutsu', () => {
  const result = illustratedTechniques([
    'Chidori',
    'Demonic Illusion: Hell Viewing Technique',
    'Rasengan',
    'Sage Mode',
  ]);
  assert.deepEqual(
    result.map((x) => x.name),
    ['Chidori', 'Rasengan', 'Sage Mode'],
  );
});

test('relationship names are converted into clickable family targets', () => {
  const result = familyConnections({
    father: 'Minato Namikaze',
    mother: 'Kushina Uzumaki (deceased)',
    godfather: ['Jiraiya'],
  });
  assert.deepEqual(
    result.map((x) => x.name),
    ['Minato Namikaze', 'Kushina Uzumaki', 'Jiraiya'],
  );
});
