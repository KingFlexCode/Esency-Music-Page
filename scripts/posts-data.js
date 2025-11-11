/* =========================================================================
   Esency Blog — Single Post Loader (Final Release-Ready Version)
   Handles: rendering a post page from shared data, view tracking,
   read time, and proper next/previous navigation.
   ======================================================================= */

/* ===== 1) Shared posts data ===== */
const posts = [
  {
    id: "francina-feature",
    title: 'Francina: "La Nena de RD" An Anthem of Empowerment, Culture & Celebration',
    date: "2025-11-14",
    tags: ["Francina", "Dominican Artist", "Women in Music", "Feature"],
    excerpt: "Dominican-born artist Francina fuses Caribbean rhythm and global sounds in her empowering new single 'La Nena de RD'.",
    cover: "../assets/images/blog-images/francina-yellow-backdrop.png",
    content: `
      <section>
        <h2>Francina: La Nena de RD — Empowering Women Through Music</h2>
        <p>Dominican-born artist <strong>Francina</strong> blends her island roots with international influences, creating a fusion of sound that celebrates confidence, freedom, and femininity. Her latest single, <em>"La Nena de RD"</em>, produced by <strong>Zcottie</strong>, is a vibrant anthem dedicated to women everywhere — especially those embracing their Dominican pride.</p>
        <blockquote>“It’s for women, especially Dominican women, but really for all women to have fun, feel good, and feel like a mamacita.”</blockquote>
        <h3>The Creative Process</h3>
        <p>Francina and Zcottie’s chemistry in the studio brings out the best of both worlds — rhythmic energy and emotional storytelling. They begin by crafting melodies, building lyrics, and layering harmonies until every piece flows seamlessly.</p>
        <h3>A Voice of Empowerment</h3>
        <p>Francina doesn’t follow trends — she follows her intuition. “When I want to do a genre that might not be popular, people say it won’t work. I just don’t listen to that,” she says. Her sound remains fresh, feminine, and unstoppable.</p>
        <h3>Looking Ahead</h3>
        <p>With future plans to tour <strong>Mexico</strong>, <strong>Chile</strong>, <strong>Argentina</strong>, <strong>Spain</strong>, and the <strong>U.S.</strong>, Francina continues to inspire women to embrace their identity and passion. Her message is clear: <em>be bold, be proud, and keep creating.</em></p>
        <p>Follow <a href="https://www.instagram.com/francinamusic/" target="_blank">@francinamusic</a> for upcoming releases and behind-the-scenes moments.</p>
      </section>
    `
  },
  {
    id: "zcottie-feature",
    title: "Zcottie: Engineering Sound and Soul in the Age of AI",
    date: "2025-11-08",
    tags: ["Zcottie", "Music Producer", "AI in Music", "Feature"],
    excerpt: "Producer Zcottie opens up about his creative journey, AI in music, and keeping the human touch alive in sound.",
    cover: "../assets/images/blog-images/scottie-studio.png",
    content: `
      <section>
        <h2>Zcottie: Engineering Sound and Soul in the Age of AI</h2>
        <p>New York–based engineer and producer <strong>Zcottie</strong> bridges the gap between classic musicianship and modern technology. Known for his work with <strong>Francina</strong> and other emerging artists, he believes that creativity should always lead the process — even in an era of artificial intelligence.</p>
        <blockquote>“AI lowered the barrier to start making music, but it’s still just another tool. It can’t replace learning your craft.”</blockquote>
        <h3>From Texas to New York</h3>
        <p>Starting out in Texas with an old computer and no internet, Zcottie taught himself how to record and produce. What began as curiosity became a lifelong pursuit of sound design, rhythm, and emotional storytelling.</p>
        <h3>Collaboration & Process</h3>
        <p>“When working with artists, it’s about vibing and bouncing ideas. You’ve got to stay open and not egotistical,” he says. His approach is fluid — building from small sparks, loops, and melodies into fully realized songs.</p>
        <h3>The Human Touch in an AI Era</h3>
        <p>While he experiments with tools like <em>Suno</em> and generative plugins, Zcottie emphasizes the irreplaceable emotion of human-made music. “There’ll always be people who enjoy AI songs, but the human vibe hits different,” he notes.</p>
        <h3>What’s Next</h3>
        <p>Up next is the reggaeton single <strong>“La Nena de RD”</strong> with Francina — a fun, high-energy collaboration celebrating women and culture. He’s also crafting a new merengue track and more experimental releases that explore both heritage and innovation.</p>
        <p>Follow <a href="https://www.instagram.com/iamzcottie/" target="_blank">@iamzcottie</a> for studio updates and behind-the-scenes moments.</p>
      </section>
    `
  },
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
      <p>Producing your own records means you aren’t waiting on someone else to shape your sound. You set the tone, the energy, and the mood exactly how you envision it.</p>
      <h2>Building Sustainable Income</h2>
      <p>Beyond creativity, producing is also a business move. When you can produce not only for yourself but also for other artists, you’re essentially creating another stream of income. That money can be reinvested into your own projects—studio sessions, videos, marketing, and collaborations.</p>
      <h2>Networking Through Collaboration</h2>
      <p>Working on other artists’ projects doesn’t just pay—it builds connections. Every session is a chance to learn from someone else’s style, perspective, and workflow.</p>
    `
  }
];

/* ===== 2) Utility helpers ===== */
const fmtDate = (iso) =>
  new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

const calcReadingTime = (html = "") => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const words = (tmp.innerText || "").trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

/* Local-only views */
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

  // Filter unreleased posts
  const today = new Date().toISOString().split("T")[0];
  const visiblePosts = posts.filter(p => p.date <= today);

  const post = visiblePosts.find(p => p.id === id);
  const wrap = document.getElementById("post");

  if (!post) {
    wrap.innerHTML = `
      <div class="content" style="padding:16px">
        <h1>Post not found</h1>
        <ul>${visiblePosts.slice(0, 5)
          .map(p => `<li><a href="./${p.id}.html">${p.title}</a></li>`)
          .join("")}</ul>
      </div>`;
    document.getElementById("year").textContent = new Date().getFullYear();
    return;
  }

  // Sort newest → oldest
  const sortedVisible = [...visiblePosts].sort((a, b) => b.date.localeCompare(a.date));
  const idx = sortedVisible.findIndex(p => p.id === id);

  const prev = idx < sortedVisible.length - 1 ? sortedVisible[idx + 1] : null; // older
  const next = idx > 0 ? sortedVisible[idx - 1] : null; // newer

  // Populate post
  document.title = `${post.title} • Esency Blog`;
  document.getElementById("post-title").textContent = post.title;
  document.getElementById("post-date").textContent = fmtDate(post.date);
  document.getElementById("post-tags").innerHTML = (post.tags || [])
    .map(t => `<span class="tag">#${t}</span>`)
    .join("");
  document.getElementById("post-cover").src = post.cover;
  document.getElementById("post-content").innerHTML = post.content;
  document.getElementById("read-time").textContent = calcReadingTime(post.content);
  document.getElementById("views").textContent = viewStore.inc(id);

  // ===== FIXED PREVIOUS / NEXT NAVIGATION (FINAL) =====
  const prevLink = document.getElementById("prevLink");
  const nextLink = document.getElementById("nextLink");
  const prevTitle = document.getElementById("prevTitle");
  const nextTitle = document.getElementById("nextTitle");

  // Previous (older)
  if (prev) {
    prevLink.href = `./${prev.id}.html`;
    prevTitle.textContent = prev.title;
    prevLink.style.visibility = "visible";
  } else {
    prevLink.style.visibility = "hidden";
  }

  // Next (newer)
  if (next) {
    nextLink.href = `./${next.id}.html`;
    nextTitle.textContent = next.title;
    nextLink.style.visibility = "visible";
  } else {
    nextLink.style.visibility = "hidden";
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
