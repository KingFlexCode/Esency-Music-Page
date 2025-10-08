/* =========================================================================
   Esency Blog – Main List Page
   - Posts data (edit freely)
   - Utilities
   - Grouping, Archive render
   - Post cards + Main render
   - Routing (hash month + search)
   ======================================================================= */

/* ===== 1) POSTS DATA (add/remove freely) ===== */
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

/* ===== 2) UTILITIES ===== */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const safeDate = (iso) => new Date(`${iso}T12:00:00`); // avoid TZ shifts
const monthKey  = (iso) => {
  const d = safeDate(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};
const monthLabel = (key) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: "long", year: "numeric" });
};

const debounce = (fn, ms = 150) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* Local-only (per-visitor) view counter */
const viewStore = {
  key: "esency_blog_views",
  cache: null,
  _load() {
    if (this.cache) return this.cache;
    try { this.cache = JSON.parse(localStorage.getItem(this.key) || "{}"); }
    catch { this.cache = {}; }
    return this.cache;
  },
  _save() { localStorage.setItem(this.key, JSON.stringify(this.cache || {})); },
  get(id) { return this._load()[id] ?? 0; },
  set(id, n) { this._load()[id] = n; this._save(); return n; },
  inc(id) { return this.set(id, this.get(id) + 1); }
};

/* ===== 3) GROUP POSTS BY MONTH ===== */
function groupByMonth(list) {
  const sorted = [...list].sort((a, b) => b.date.localeCompare(a.date));
  return sorted.reduce((map, p) => {
    const key = monthKey(p.date);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
    return map;
  }, new Map());
}

/* ===== 4) RENDER ARCHIVE (SIDEBAR) ===== */
function renderArchive(groups) {
  const arch = $("#archive");
  if (!arch) return;
  arch.innerHTML = "";

  let first = true;
  for (const [key, items] of groups) {
    const details = document.createElement("details");
    details.className = "month";
    details.open = first; first = false;

    const summary = document.createElement("summary");
    summary.textContent = `${monthLabel(key)} · ${items.length}`;

    const ul = document.createElement("ul");
    items.forEach(p => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = p.title;
      a.href = `#${key}`; // clicking filters main list to this month
      li.appendChild(a);
      ul.appendChild(li);
    });

    details.append(summary, ul);
    arch.appendChild(details);
  }
}

/* ===== 5) CARDS + MAIN RENDER ===== */
function postCard(p) {
  const pub = safeDate(p.date).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const views = viewStore.get(p.id);

  const card = document.createElement("article");
  card.className = "card post-card";
  card.dataset.id = p.id;

  card.innerHTML = `
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
      <div class="tags">${(p.tags || []).map(t => `<span class="tag">#${t}</span>`).join("")}</div>
    </div>
  `;

  // increment views on any click-through
  card.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      const v = viewStore.inc(p.id);
      const el = card.querySelector(".views");
      if (el) el.textContent = v;
    });
  });

  return card;
}

function renderPosts(groups, monthFilter = null, term = null) {
  const mount  = $("#posts");
  const active = $("#activeFilters");
  if (!mount || !active) return;

  mount.innerHTML = "";
  active.innerHTML = "";

  // base list
  let list = monthFilter && groups.has(monthFilter)
    ? [...groups.get(monthFilter)]
    : Array.from(groups.values()).flat();

  // month pill
  if (monthFilter && groups.has(monthFilter)) {
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.innerHTML = `Month: <strong>${monthLabel(monthFilter)}</strong>`;
    active.appendChild(pill);
  }

  // search filter
  if (term && term.trim()) {
    const q = term.trim().toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      (p.excerpt || "").toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
      monthLabel(monthKey(p.date)).toLowerCase().includes(q)
    );
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.textContent = `Search: ${term}`;
    active.appendChild(pill);
  }

  // group again for month labels in output
  const frag = document.createDocumentFragment();
  const byMonth = groupByMonth(list);

  for (const [key, items] of byMonth) {
    const label = document.createElement("div");
    label.className = "month-label";
    label.textContent = monthLabel(key);
    frag.appendChild(label);
    items.forEach(p => frag.appendChild(postCard(p)));
  }

  if (!list.length) {
    mount.innerHTML = '<div style="color:var(--muted); padding:12px 0">No posts match that yet.</div>';
  } else {
    mount.appendChild(frag);
  }
}

/* ===== 6) CONTROLLERS (hash + search) ===== */
const groups = groupByMonth(posts);
renderArchive(groups);

function route() {
  const hash = location.hash.replace("#", "") || null;
  const term = ($("#search") && $("#search").value) || null;
  renderPosts(groups, hash, term);
}

window.addEventListener("hashchange", route);
const searchInput = $("#search");
if (searchInput) searchInput.addEventListener("input", debounce(route, 150));

// initial render
route();

// footer year
const y = $("#year");
if (y) y.textContent = new Date().getFullYear();
