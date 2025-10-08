/* =========================================================================
   Esency Blog — Single Post Loader
   Handles: rendering a post page from shared data, prev/next nav, views, read-time
   ======================================================================= */

/* ===== 1) Shared posts data (keep synced with blog-main.js) ===== */
const posts = [
  {
    id: "the-power-of-writing-and-producing-your-own-music",
    title: "The Power of Writing and Producing Your Own Music",
    date: "2025-09-01",
    tags: ["song writing", "artist producer", "producing", "music producer", "music artist"],
    excerpt: "Being an artist today isn’t just about writing lyrics or singing melodies—it’s about taking full ownership of your sound.",
    cover: "../assets/images/blog-images/music-studio.avif",
    content: `
      <h2>Being an Artist and Producer</h2>
      <p>Being an artist today isn’t just about writing lyrics or singing melodies—it’s about taking full ownership of your sound. When you not only write your own songs but also produce for yourself and others, you unlock a level of creative freedom and professional opportunity that can transform your career.</p>
      <h2>Creative Freedom and Artistic Identity</h2>
      <p>Producing your own records means you aren’t waiting on someone else to shape your sound. You set the tone, the energy, and the mood exactly how you envision it. This kind of creative control allows your music to stay authentic and true to your vision, while also giving you the flexibility to experiment with new ideas, sounds, and styles without outside limitations.</p>
      <h2>Building Sustainable Income</h2>
      <p>Beyond creativity, producing is also a business move. When you can produce not only for yourself but also for other artists, you’re essentially creating another stream of income. That money can be reinvested into your own projects—studio sessions, videos, marketing, and collaborations. Instead of waiting for a label or sponsor, you fund your own growth, which keeps you independent and moving forward.</p>
      <h2>Networking Through Collaboration</h2>
      <p>Working on other artists’ projects doesn’t just pay—it builds connections. Every session is a chance to learn from someone else’s style, perspective, and workflow. These collaborations help you expand your sound, sharpen your skills, and grow your network in the music industry. Each track you produce becomes part of your portfolio, opening doors to bigger opportunities and new audiences.</p>
      <img src="../assets/images/blog-images/studio-production.avif" alt="Studio production setup" />
      <h2>The Edge in Today’s Music Industry</h2>
      <p>Artists who can both write and produce are in a unique position. You’re more versatile, more independent, and more attractive to potential collaborators and industry players. In an era where self-reliance and individuality are celebrated, being both a songwriter and producer sets you apart. It’s a creative and financial advantage that allows you to move with confidence and control in your career.</p>
      <p>Bottom line: Writing and producing isn’t just a skill set—it’s a strategy. It’s how you create your own lane, sustain your growth, and keep your art authentic while still building the connections and resources you need to thrive.</p>
    `
  },
  {
    id: "slide-by-esency",
    title: 'New Release! "SLIDE" by Esency dropping soon',
    date: "2025-09-01",
    tags: ["new release", "slide by esency", "new song", "slide up on me"],
    excerpt: "With R&B season coming soon, a new single with catchy melodies, addictive drum bounce, and catchy hook is soon to drop.",
    cover: "../assets/images/Esency-Photos/Smoky Street Nights_100.JPG",
    content: `
      <h1>SLIDE</h1>
      <p>With R&amp;B season coming soon, <strong>“Slide”</strong> is primed with catchy melodies, an addictive drum bounce, and a hook that sticks.</p>
      <h2>The Sound</h2>
      <p>Smooth R&amp;B textures layered over urban percussion—intimate for late nights, punchy for the club.</p>
      <h2>The Vibe</h2>
      <p>“Slide” is movement: sliding into love, sliding through the city, sliding past distractions. Effortless energy.</p>
      <h2>Release Info</h2>
      <p>Dropping soon on all platforms. Follow <a href="https://www.instagram.com/esencyofficial/" target="_blank" rel="noopener">@esencyofficial</a> for the date and pre-save.</p>
    `
  },
  {
    id: "nada-personal-album-breakdown",
    title: "Nada Personal Album — Track-by-Track Breakdown",
    date: "2025-08-28",
    tags: ["feature", "album", "nada personal", "latin album"],
    excerpt: "Inside the songwriting, melodies, drums, bass lines, and late-night sessions that shaped 'Nada Personal'.",
    cover: "../assets/images/Album Art/nada-personal-album-art.jpg",
    content: `
      <p>We unpack the textures, influences, and late-night sessions that shaped <em>Nada Personal</em>.</p>
      <h2>1) Opening Energy</h2>
      <p>Drums, tempo, and hook—plus the Bronx flavor that sets the tone.</p>
      <h2>2) Melodic Center</h2>
      <p>Vocal chain choices, reverb tails, and ad-lib stacks.</p>
      <h2>3) Outro & Transitions</h2>
      <p>Arrangement decisions that keep movement alive without overstuffing the mix.</p>
    `
  }
];

/* ===== 2) Utility helpers ===== */
const fmtDate = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const calcReadingTime = (html = "") => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const words = (tmp.innerText || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

/* Local-only views (same key as blog list) */
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
  inc(id) { const v = this.get(id) + 1; this._load()[id] = v; this._save(); return v; }
};

/* ===== 3) Router + Renderer ===== */
(function initPost() {
  const params = new URLSearchParams(location.search);
  let id = params.get("id");

  // fallback: derive from filename /posts/<slug>.html
  if (!id) {
    const match = location.pathname.match(/\/posts\/([^/]+)\.html$/);
    if (match) id = match[1];
  }

  const post = posts.find((p) => p.id === id);
  const wrap = document.getElementById("post");

  if (!post) {
    wrap.innerHTML = `
      <div class="content" style="padding:16px">
        <h1>Post not found</h1>
        <p>We couldn’t find a post with id <code>${id ?? "(none)"}</code>.</p>
        <h3>Recent posts</h3>
        <ul>${posts.slice(0, 5).map((p) => `<li><a href="./${p.id}.html">${p.title}</a></li>`).join("")}</ul>
      </div>`;
    document.getElementById("year").textContent = new Date().getFullYear();
    return;
  }

  const idx = posts.findIndex((p) => p.id === id);

  // fill meta
  document.title = `${post.title} • Esency Blog`;
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-date").textContent = fmtDate(post.date);
  document.getElementById("post-tags").innerHTML =
    (post.tags || []).map((t) => `<span class="tag">#${t}</span>`).join("");
  document.getElementById("post-cover").src = post.cover;
  document.getElementById("post-cover").alt = post.title;

  // fill content + reading time
  const html = post.content || "<p>Post content coming soon.</p>";
  document.getElementById("post-content").innerHTML = html;
  document.getElementById("read-time").textContent = calcReadingTime(html);

  // views
  document.getElementById("views").textContent = viewStore.inc(id);

  // prev / next
  const prev = posts[idx - 1] || null;
  const next = posts[idx + 1] || null;

  const prevLink = document.getElementById("prevLink");
  const nextLink = document.getElementById("nextLink");
  const prevTitle = document.getElementById("prevTitle");
  const nextTitle = document.getElementById("nextTitle");

  if (prev) {
    prevLink.href = `./${prev.id}.html`;
    prevTitle.textContent = prev.title;
    prevLink.style.opacity = "1";
  } else {
    prevLink.removeAttribute("href");
    prevTitle.textContent = "No previous post";
    prevLink.style.opacity = ".5";
  }

  if (next) {
    nextLink.href = `./${next.id}.html`;
    nextTitle.textContent = next.title;
    nextLink.style.opacity = "1";
  } else {
    nextLink.removeAttribute("href");
    nextTitle.textContent = "No next post";
    nextLink.style.opacity = ".5";
  }

  // footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
