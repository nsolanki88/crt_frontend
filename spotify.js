/* ───────────────────────────────────────────────────
   SPOTIFY WEB CLONE — JavaScript
──────────────────────────────────────────────────── */

'use strict';

/* ── State ── */
const state = {
  isPlaying: false,
  isShuffle: false,
  repeatMode: 0,   // 0 = off, 1 = all, 2 = one
  isMuted: false,
  volume: 0.7,
  progress: 0,       // 0–1
  duration: 225,     // seconds (3:45 placeholder)
  elapsed: 0,
  isLiked: false,
  nowPlayingOpen: false,
  currentTrack: {
    name: 'After Hours',
    artist: 'The Weeknd',
    img: 'https://i.scdn.co/image/ab67616d0000b2733e3b6dcf4a0b1fba28d09b40',
    duration: 225
  },
  progressTimer: null
};

/* ── DOM refs ── */
const app            = document.querySelector('.app');
const btnPlay        = document.getElementById('btnPlay');
const btnShuffle     = document.getElementById('btnShuffle');
const btnRepeat      = document.getElementById('btnRepeat');
const btnPrev        = document.getElementById('btnPrev');
const btnNext        = document.getElementById('btnNext');
const btnMute        = document.getElementById('btnMute');
const btnNowPlaying  = document.getElementById('btnNowPlaying');
const btnBack        = document.getElementById('btnBack');
const btnForward     = document.getElementById('btnForward');
const closeNP        = document.getElementById('closeNowPlaying');

const progressBar    = document.getElementById('progressBar');
const progressFill   = document.getElementById('progressFill');
const progressThumb  = document.getElementById('progressThumb');
const volumeBar      = document.getElementById('volumeBar');
const volumeFill     = document.getElementById('volumeFill');
const volumeThumb    = document.getElementById('volumeThumb');

const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');

const playerThumb    = document.getElementById('playerThumb');
const playerTrack    = document.getElementById('playerTrack');
const playerArtist   = document.getElementById('playerArtist');
const playerHeart    = document.getElementById('playerHeart');

const npArt          = document.getElementById('npArt');
const npTrack        = document.getElementById('npTrack');
const npArtist       = document.getElementById('npArtist');
const npHeart        = document.getElementById('npHeart');

const homePage       = document.getElementById('homePage');
const searchPage     = document.getElementById('searchPage');
const genrePage      = document.getElementById('genrePage');
const topbarSearch   = document.getElementById('topbarSearch');
const searchInput    = document.getElementById('searchInput');
const greetingText   = document.getElementById('greetingText');
const genreHero      = document.getElementById('genreHero');
const genreHeroTitle = document.getElementById('genreHeroTitle');
const genreTrackList = document.getElementById('genreTrackList');
const genrePlayBtn   = document.getElementById('genrePlayBtn');
const genreHeartBtn  = document.getElementById('genreHeart');
const mainEl         = document.querySelector('.main');

const navLinks       = document.querySelectorAll('.nav-link');
const filterPills    = document.querySelectorAll('.pill');
const nowPlayingPanel = document.getElementById('nowPlayingPanel');

/* ───────── Utility ───────── */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function setGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) greetingText.textContent = 'Good morning';
  else if (hour < 18) greetingText.textContent = 'Good afternoon';
  else greetingText.textContent = 'Good evening';
}

/* ───────── Track loading ───────── */
function loadTrack(name, artist, img, duration = 225) {
  state.currentTrack = { name, artist, img, duration };
  state.elapsed = 0;
  state.duration = duration;

  // Player bar
  playerThumb.src = img;
  playerTrack.textContent = name;
  playerArtist.textContent = artist;

  // Now Playing panel
  npArt.src = img;
  npTrack.textContent = name;
  npArtist.textContent = artist;

  // Reset progress
  updateProgressUI(0);
  totalTimeEl.textContent = formatTime(duration);

  // Auto-play
  startPlay();
}

/* ───────── Playback ───────── */
function startPlay() {
  state.isPlaying = true;
  btnPlay.innerHTML = '<i class="fa-solid fa-pause"></i>';
  startProgressTimer();
}

function pausePlay() {
  state.isPlaying = false;
  btnPlay.innerHTML = '<i class="fa-solid fa-play"></i>';
  stopProgressTimer();
}

function togglePlay() {
  if (state.isPlaying) pausePlay();
  else startPlay();
}

/* ───────── Progress timer ───────── */
function startProgressTimer() {
  stopProgressTimer();
  state.progressTimer = setInterval(() => {
    state.elapsed += 1;
    if (state.elapsed >= state.duration) {
      // Track ended
      if (state.repeatMode === 2) {
        state.elapsed = 0;
      } else {
        pausePlay();
        state.elapsed = state.duration;
      }
    }
    const ratio = state.elapsed / state.duration;
    updateProgressUI(ratio);
  }, 1000);
}

function stopProgressTimer() {
  if (state.progressTimer) {
    clearInterval(state.progressTimer);
    state.progressTimer = null;
  }
}

function updateProgressUI(ratio) {
  const pct = (ratio * 100).toFixed(2) + '%';
  progressFill.style.width = pct;
  progressThumb.style.left = pct;
  currentTimeEl.textContent = formatTime(state.elapsed);
}

/* ───────── Seek ───────── */
function seekTo(e) {
  const rect = progressBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  state.elapsed = Math.floor(ratio * state.duration);
  updateProgressUI(ratio);
}

progressBar.addEventListener('click', seekTo);

let isDraggingProgress = false;
progressBar.addEventListener('mousedown', () => { isDraggingProgress = true; });
document.addEventListener('mousemove', (e) => { if (isDraggingProgress) seekTo(e); });
document.addEventListener('mouseup', () => { isDraggingProgress = false; });

/* ───────── Volume ───────── */
function setVolume(ratio) {
  state.volume = Math.min(Math.max(ratio, 0), 1);
  const pct = (state.volume * 100).toFixed(2) + '%';
  volumeFill.style.width = pct;
  volumeThumb.style.left = pct;
  updateMuteIcon();
}

function updateMuteIcon() {
  const v = state.isMuted ? 0 : state.volume;
  if (v === 0) {
    btnMute.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
  } else if (v < 0.4) {
    btnMute.innerHTML = '<i class="fa-solid fa-volume-low"></i>';
  } else {
    btnMute.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  }
}

function seekVolume(e) {
  const rect = volumeBar.getBoundingClientRect();
  const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
  state.isMuted = false;
  setVolume(ratio);
}

volumeBar.addEventListener('click', seekVolume);

let isDraggingVolume = false;
volumeBar.addEventListener('mousedown', () => { isDraggingVolume = true; });
document.addEventListener('mousemove', (e) => { if (isDraggingVolume) seekVolume(e); });
document.addEventListener('mouseup', () => { isDraggingVolume = false; });

btnMute.addEventListener('click', () => {
  state.isMuted = !state.isMuted;
  updateMuteIcon();
});

/* ───────── Shuffle ───────── */
btnShuffle.addEventListener('click', () => {
  state.isShuffle = !state.isShuffle;
  btnShuffle.classList.toggle('ctrl-btn--active', state.isShuffle);
});

/* ───────── Repeat ───────── */
btnRepeat.addEventListener('click', () => {
  state.repeatMode = (state.repeatMode + 1) % 3;
  btnRepeat.classList.toggle('ctrl-btn--active', state.repeatMode > 0);
  if (state.repeatMode === 2) {
    btnRepeat.innerHTML = '<i class="fa-solid fa-repeat"></i><span style="font-size:9px;position:absolute;top:0;right:0;background:var(--essential-bright-accent);color:#000;border-radius:50%;width:8px;height:8px;display:flex;align-items:center;justify-content:center;">1</span>';
    btnRepeat.style.position = 'relative';
  } else {
    btnRepeat.innerHTML = '<i class="fa-solid fa-repeat"></i>';
    btnRepeat.style.position = '';
  }
});

/* ───────── Like ───────── */
function toggleLike(heartBtn) {
  state.isLiked = !state.isLiked;
  heartBtn.classList.toggle('liked', state.isLiked);
  playerHeart.classList.toggle('liked', state.isLiked);
  npHeart.classList.toggle('liked', state.isLiked);
}

playerHeart.addEventListener('click', () => toggleLike(playerHeart));
npHeart.addEventListener('click', () => toggleLike(npHeart));

/* ───────── Play button ───────── */
btnPlay.addEventListener('click', togglePlay);

/* ───────── Prev / Next (stub) ───────── */
btnPrev.addEventListener('click', () => {
  state.elapsed = 0;
  updateProgressUI(0);
  if (state.isPlaying) startProgressTimer();
});

btnNext.addEventListener('click', () => {
  // In a real app, load the next song; here we just reset
  state.elapsed = 0;
  updateProgressUI(0);
  if (state.isPlaying) startProgressTimer();
});

/* ───────── Now Playing panel ───────── */
btnNowPlaying.addEventListener('click', () => {
  state.nowPlayingOpen = !state.nowPlayingOpen;
  app.classList.toggle('np-open', state.nowPlayingOpen);
  btnNowPlaying.classList.toggle('ctrl-btn--active', state.nowPlayingOpen);
});

closeNP.addEventListener('click', () => {
  state.nowPlayingOpen = false;
  app.classList.remove('np-open');
  btnNowPlaying.classList.remove('ctrl-btn--active');
});

/* ───────── Music card / greeting card play ───────── */
function attachCardListeners() {
  document.querySelectorAll('.card-play-btn, .greeting-play-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('[data-track]');
      if (!card) return;
      const { track, artist, img } = card.dataset;
      loadTrack(track, artist, img);
    });
  });

  document.querySelectorAll('.music-card').forEach(card => {
    card.addEventListener('click', () => {
      const { track, artist, img } = card.dataset;
      if (!track) return;
      loadTrack(track, artist, img);
    });
  });

  document.querySelectorAll('.greeting-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.greeting-play-btn')) return;
      const { track, artist, img } = card.dataset;
      if (!track) return;
      loadTrack(track, artist, img);
    });
  });
}

/* ───────── Sidebar library items ───────── */
document.querySelectorAll('.library__item').forEach(item => {
  item.addEventListener('click', () => {
    const nameEl = item.querySelector('.library__item-name');
    const imgEl  = item.querySelector('img, .library__item-thumb--gradient');
    const name   = nameEl ? nameEl.textContent : 'Unknown';
    const img    = imgEl?.src || state.currentTrack.img;
    loadTrack(name, 'Spotify', img);
  });
});

/* ══════════════════════════════════════════════════
   PAGE ROUTING
══════════════════════════════════════════════════ */

// All pages — keyed by name
const pages = { home: homePage, search: searchPage, genre: genrePage };

// History stack for back/forward
const pageHistory = [{ name: 'home', data: null }];
let historyIndex  = 0;

/** Show exactly one page, hide others, update topbar */
function showPage(name) {
  Object.entries(pages).forEach(([key, el]) => {
    el.style.display = key === name ? 'block' : 'none';
  });

  // Scroll main back to top on every page switch
  mainEl.querySelector('.page[style*="block"]')?.scrollTo?.(0, 0);

  // Topbar search bar only on search + genre
  const showSearch = name === 'search';
  topbarSearch.style.display = showSearch ? 'flex' : 'none';
  if (showSearch) searchInput.focus();

  // Active nav link highlight
  navLinks.forEach(l => {
    const isHome   = l.querySelector('.fa-house') !== null;
    const isSrch   = l.querySelector('.fa-magnifying-glass') !== null;
    l.classList.toggle('nav-link--active',
      (isHome && name === 'home') || (isSrch && (name === 'search' || name === 'genre'))
    );
  });

  updateBackForward();
}

/** Push a new page onto the history stack and display it */
function navigateTo(name, data = null) {
  // Drop forward history
  pageHistory.splice(historyIndex + 1);
  pageHistory.push({ name, data });
  historyIndex = pageHistory.length - 1;

  applyPage(name, data);
}

/** Apply page state (used by both navigateTo and back/forward) */
function applyPage(name, data) {
  if (name === 'genre' && data) buildGenrePage(data.genre, data.color);
  showPage(name);
}

function updateBackForward() {
  btnBack.style.opacity    = historyIndex > 0 ? '1' : '0.4';
  btnForward.style.opacity = historyIndex < pageHistory.length - 1 ? '1' : '0.4';
  btnBack.style.cursor     = historyIndex > 0 ? 'pointer' : 'default';
  btnForward.style.cursor  = historyIndex < pageHistory.length - 1 ? 'pointer' : 'default';
}

btnBack.addEventListener('click', () => {
  if (historyIndex > 0) {
    historyIndex--;
    const { name, data } = pageHistory[historyIndex];
    applyPage(name, data);
  }
});

btnForward.addEventListener('click', () => {
  if (historyIndex < pageHistory.length - 1) {
    historyIndex++;
    const { name, data } = pageHistory[historyIndex];
    applyPage(name, data);
  }
});

/* ───────── Navigation: Home / Search nav links ───────── */
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const isSearch = link.querySelector('.fa-magnifying-glass') !== null;
    navigateTo(isSearch ? 'search' : 'home');
  });
});

/* ───────── Filter pills ───────── */
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('pill--active'));
    pill.classList.add('pill--active');
  });
});

/* ══════════════════════════════════════════════════
   GENRE DETAIL PAGE
══════════════════════════════════════════════════ */

// Sample tracks per genre  (img urls are real Spotify CDN covers)
const genreData = {
  'Pop':              ['As It Was·Harry Styles·Harry\'s House·Aug 2022·2:37·https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14','Anti-Hero·Taylor Swift·Midnights·Oct 2022·3:20·https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5','Flowers·Miley Cyrus·Endless Summer Vacation·Jan 2023·3:20·https://i.scdn.co/image/ab67616d0000b273f429549123dbe8552764ba1d','Levitating·Dua Lipa·Future Nostalgia·Oct 2020·3:24·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e','Shape of You·Ed Sheeran·÷ (Divide)·Jan 2017·3:54·https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96'],
  'Hip-Hop':          ['God\'s Plan·Drake·Scorpion·Jan 2018·3:18·https://i.scdn.co/image/ab67616d0000b2734293385d324db8558179afd9','HUMBLE.·Kendrick Lamar·DAMN.·Apr 2017·2:57·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e','Sicko Mode·Travis Scott·ASTROWORLD·Aug 2018·5:12·https://i.scdn.co/image/ab67616d0000b273be82673b5f79d9658ec0a9fd','rockstar·Post Malone·beerbongs & bentleys·Sep 2017·3:38·https://i.scdn.co/image/ab67616d0000b2733e3b6dcf4a0b1fba28d09b40','Montero·Lil Nas X·MONTERO·Sep 2021·2:18·https://i.scdn.co/image/ab67616d0000b273be82673b5f79d9658ec0a9fd'],
  'R&B':              ['Blinding Lights·The Weeknd·After Hours·Nov 2019·3:20·https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452','Peaches·Justin Bieber·Justice·Mar 2021·3:18·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e','Leave The Door Open·Silk Sonic·An Evening With Silk Sonic·Mar 2021·4:01·https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96','Best Part·Daniel Caesar·Freudian·Aug 2017·3:34·https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14','Essence·Wizkid·Made In Lagos·Oct 2020·4:04·https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5'],
  'Dance/Electronic': ['Blinding Lights·The Weeknd·After Hours·Nov 2019·3:20·https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452','Levitating·Dua Lipa·Future Nostalgia·Oct 2020·3:24·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e','Stay·The Kid LAROI·F*CK LOVE 3·Jul 2021·2:21·https://i.scdn.co/image/ab67616d0000b2735ef878a782c987e4a84db7d8','Dynamite·BTS·BE·Aug 2020·3:19·https://i.scdn.co/image/ab67616d0000b2730a551e4a46dd97bdd7b7b2e5','Physical·Dua Lipa·Future Nostalgia·Apr 2020·3:13·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e'],
};

// Fallback tracks for genres without specific data
const fallbackTracks = [
  'Song 1·Various Artists·Album 1·Jan 2023·3:15·https://i.scdn.co/image/ab67616d0000b2733e3b6dcf4a0b1fba28d09b40',
  'Song 2·Various Artists·Album 2·Feb 2023·4:02·https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
  'Song 3·Various Artists·Album 3·Mar 2023·2:58·https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
  'Song 4·Various Artists·Album 4·Apr 2023·3:44·https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
  'Song 5·Various Artists·Album 5·May 2023·3:21·https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
];

let currentGenrePlayingRow = null;

function buildGenrePage(genre, color) {
  // Hero
  genreHero.style.background = `linear-gradient(135deg, ${color}cc, ${color})`;
  genreHeroTitle.textContent = genre;

  // Gradient on main for immersion
  mainEl.style.background = `linear-gradient(180deg, ${color}55 0%, #121212 380px)`;

  // Track rows
  const tracks = genreData[genre] || fallbackTracks;
  genreTrackList.innerHTML = '';

  tracks.forEach((entry, i) => {
    const [name, artist, album, date, dur, img] = entry.split('·');
    const tr = document.createElement('tr');
    tr.className = 'track-row';
    tr.dataset.track  = name;
    tr.dataset.artist = artist;
    tr.dataset.img    = img;
    tr.innerHTML = `
      <td class="track-row__num">
        <span class="row-num">${i + 1}</span>
        <span class="row-play"><i class="fa-solid fa-play"></i></span>
      </td>
      <td>
        <div class="track-row__title-cell">
          <img class="track-row__art" src="${img}" alt="${name}" />
          <div>
            <p class="track-row__name">${name}</p>
            <p class="track-row__artist">${artist}</p>
          </div>
        </div>
      </td>
      <td class="track-row__album">${album}</td>
      <td class="track-row__date">${date}</td>
      <td class="track-row__dur">${dur}</td>
    `;
    tr.addEventListener('click', () => {
      // Highlight playing row
      if (currentGenrePlayingRow) currentGenrePlayingRow.classList.remove('playing');
      tr.classList.add('playing');
      currentGenrePlayingRow = tr;
      loadTrack(name, artist, img);
    });
    genreTrackList.appendChild(tr);
  });

  // Genre play button → plays first track
  genrePlayBtn.onclick = () => {
    const first = genreTrackList.querySelector('.track-row');
    if (first) first.click();
  };

  // Genre heart
  genreHeartBtn.classList.remove('liked');
}

/* ───────── Genre card click → navigate to genre page ───────── */
document.querySelectorAll('.genre-card').forEach(card => {
  card.addEventListener('click', () => {
    const genre = card.dataset.genre;
    const color = card.dataset.color || '#333';
    navigateTo('genre', { genre, color });
  });
});

/* ───────── Init ───────── */
function init() {
  setGreeting();
  setVolume(0.7);
  totalTimeEl.textContent = formatTime(state.duration);
  updateBackForward();
  attachCardListeners();

  // Reset main bg when navigating away from genre page
  const observer = new MutationObserver(() => {
    const current = pageHistory[historyIndex]?.name;
    if (current !== 'genre') {
      mainEl.style.background = 'linear-gradient(180deg, #1a3a2a 0%, #121212 340px)';
    }
  });
  observer.observe(homePage, { attributes: true, attributeFilter: ['style'] });
}

init();
