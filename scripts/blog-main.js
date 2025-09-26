// ====== 1) YOUR POSTS DATA (add/remove freely) ======
// date: ISO (YYYY-MM-DD) — grouping uses year+month
const posts = [
  {
    id: "the-power-of-writing-and-producing-your-own-music",
    title: "The Power of Writing and Producing Your Own Music",
    date: "2025-09-01",
    tags: ["song writing", "artist producer", "producing", "music producer", "music artist"],
    excerpt: "Being an artist today isn’t just about writing lyrics or singing melodies—it’s about taking full ownership of your sound.",
    cover: "../assets/images/blog-images/music-studio.avif",
    url: "../posts/the-power-of-writing-and-producing-your-own-music.html"
  },
  {
    id: "slide-by-esency",
    title: "New Release: Slide dropping soon by Esency",
    date: "2025-09-01",
    tags: ["new release", "slide by esency", "new song", "slide up on me"],
    excerpt: "With R&B season coming soon, a new single with catchy melodys, addictive drum bounce, and catchy hook is soon to drop.",
    cover: "../assets/images/Esency-Photos/Smoky Street Nights_100.JPG",
    url: "../posts/slide-by-esency.html"
  },
  {
    id: "nada-personal-album-breakdown",
    title: "Nada Personal Album — Track-by-Track Breakdown",
    date: "2025-08-28",
    tags: ["feature", "album", "nada personal", "latin album"],
    excerpt: "Inside the song writing, melodies, drums, bass lines, and late-night sessions that shaped 'Nada Personal'.",
    cover: "../assets/images/Album Art/nada-personal-album-art.jpg",
    url: "../posts/nada-personal-breakdown.html"
  }
];

// ====== 2) UTILITIES ======
const $ = (sel, all=false, root=document) => all ? Array.from(root.querySelectorAll(sel)) : root.querySelector(sel);
const fmtMonth = (d) => new Date(d+"T12:00:00"); // avoid TZ shift
const monthKey = (d) => {
  const dt = fmtMonth(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
};
const monthLabel = (key) => {
  const [y,m] = key.split('-').map(Number);
  return new Date(y, m-1, 1).toLocaleString(undefined,{ month:'long', year:'numeric' });
};

// Local-only view counter (per-visitor). For global counts, plug into a backend later.
const viewStore = {
  key: 'esency_blog_views',
  cache: null,
  _load(){
    if(this.cache) return this.cache;
    try{ this.cache = JSON.parse(localStorage.getItem(this.key) || '{}'); }
    catch(e){ this.cache = {}; }
    return this.cache;
  },
  _save(){ localStorage.setItem(this.key, JSON.stringify(this.cache||{})); },
  get(id){ return (this._load()[id] ?? 0); },
  set(id, n){ this._load()[id] = n; this._save(); return n; },
  increment(id){ const v = this.get(id)+1; return this.set(id, v); }
};

// ====== 3) GROUP POSTS BY MONTH ======
function groupByMonth(list){
  const sorted = [...list].sort((a,b)=> b.date.localeCompare(a.date));
  const map = new Map();
  for(const p of sorted){
    const key = monthKey(p.date);
    if(!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  return map; // Map(monthKey => posts[])
}

// ====== 4) RENDER ARCHIVE (SIDEBAR) ======
function renderArchive(groups){
  const arch = $('#archive');
  arch.innerHTML = '';
  for(const [key, items] of groups){
    const label = monthLabel(key);
    const details = document.createElement('details');
    details.className = 'month';
    // auto-open the most recent month
    if(arch.children.length === 0) details.open = true;

    const summary = document.createElement('summary');
    summary.textContent = `${label} · ${items.length}`;

    const ul = document.createElement('ul');
    items.forEach(p => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = p.title;
      a.href = '#'+key; // clicking filters main list to this month
      li.appendChild(a); ul.appendChild(li);
    });

    details.appendChild(summary);
    details.appendChild(ul);
    arch.appendChild(details);
  }
}

// ====== 5) RENDER POSTS (MAIN) ======
function postCard(p){
  const wrap = document.createElement('article');
  wrap.className = 'card';
  wrap.dataset.id = p.id;
  const pub = new Date(p.date+"T12:00:00").toLocaleDateString(undefined,{year:'numeric', month:'short', day:'numeric'});
  const views = viewStore.get(p.id);
  wrap.innerHTML = `
    <a class="thumb-link" href="${p.url}" target="_blank" rel="noopener">
      <img class="thumb" src="${p.cover}" alt="${p.title}">
    </a>
    <div class="meta">
      <a class="title" href="${p.url}" target="_blank" rel="noopener">${p.title}</a>
      <div class="stats">
        <span class="stat" title="Published">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="9" stroke="#b7b7b7" stroke-width="2"/><path d="M12 7v5l3 3" stroke="#b7b7b7" stroke-width="2" stroke-linecap="round"/></svg>
          <span class="date">${pub}</span>
        </span>
        <span class="dot"></span>
        <span class="stat" title="Views">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="#b7b7b7" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="#b7b7b7" stroke-width="2"/></svg>
          <span class="views" data-id="${p.id}">${views}</span>
        </span>
      </div>
      <div class="excerpt">${p.excerpt}</div>
      <div class="tags">${(p.tags||[]).map(t=>`<span class="tag">#${t}</span>`).join('')}</div>
    </div>`;

  // Increment views when users click through
  wrap.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      const v = viewStore.increment(p.id);
      const el = wrap.querySelector('.views');
      if(el) el.textContent = v;
    });
  });

  return wrap;
}

function renderPosts(groups, monthFilter=null, term=null){
  const mount = $('#posts');
  const active = $('#activeFilters');
  mount.innerHTML = ''; active.innerHTML = '';

  let entries = [];
  if(monthFilter && groups.has(monthFilter)){
    entries = groups.get(monthFilter);
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.innerHTML = `Month: <strong>${monthLabel(monthFilter)}</strong>`;
    active.appendChild(pill);
  } else {
    // flatten all
    for(const [,items] of groups) entries.push(...items);
  }

  if(term){
    const q = term.trim().toLowerCase();
    entries = entries.filter(p =>
      p.title.toLowerCase().includes(q)
      || (p.excerpt||'').toLowerCase().includes(q)
      || (p.tags||[]).some(t=>t.toLowerCase().includes(q))
      || monthLabel(monthKey(p.date)).toLowerCase().includes(q)
    );
    const pill = document.createElement('div');
    pill.className = 'pill';
    pill.textContent = `Search: ${term}`;
    active.appendChild(pill);
  }

  // group again by month for section labels
  const byMonth = groupByMonth(entries);
  for(const [key, items] of byMonth){
    const label = document.createElement('div');
    label.className = 'month-label';
    label.textContent = monthLabel(key);
    mount.appendChild(label);
    items.forEach(p => mount.appendChild(postCard(p)));
  }

  if(entries.length === 0){
    mount.innerHTML = '<div style="color:var(--muted); padding:12px 0">No posts match that yet.</div>';
  }
}

// ====== 6) CONTROLLERS (hash + search) ======
const groups = groupByMonth(posts);
renderArchive(groups);

function route(){
  const hash = location.hash.replace('#','');
  const term = $('#search').value || null;
  renderPosts(groups, hash||null, term);
}
window.addEventListener('hashchange', route);
$('#search').addEventListener('input', () => route());
route();

// Footer year
$('#year').textContent = new Date().getFullYear();
