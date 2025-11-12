/* =========================================================================
   Esency Blog — Single Post Loader
   Handles: rendering a post page from shared data, prev/next nav, views, read-time
   ======================================================================= */

/* ===== 1) Shared posts data (keep synced with blog-main.js) ===== */
const posts = [
  {
    id: "francina-feature",
    title: 'Francina: "La Nena de RD" An Anthem of Empowerment, Culture & Celebration',
    date: "2025-11-14",
    tags: ["Francina", "Dominican Artist", "Women in Music", "Feature"],
    excerpt: "Dominican-born artist Francina blends her Caribbean roots with global sounds in her empowering new single 'La Nena de RD'.",
    cover: "../assets/images/blog-images/francina-yellow-backdrop.png",
    content: `
      <section>
        <h2>Francina new song "La Nena de RD" Empowering Women Through Music</h2>
        <p>Born between the vibrant streets of the Dominican Republic and the metropolitan rhythm of New York, <strong>Francina</strong> stands at the crossroads of Caribbean heritage and international ambition. With her upcoming single <em>“La Nena de RD”</em>, she channels that dual identity into a bold, celebratory anthem dedicated to women — especially Dominican women — while inviting listeners everywhere to feel powerful, proud, and unstoppable.</p>

        <h3>Roots and Sound</h3>
        <p>Francina’s sound is born of fusion: the Merengue and Bachata echoes of her upbringing in the DR meet R&B, pop, and global rhythms she absorbed growing up in New York. She explains:</p>
        <blockquote>“It’s really like a fusion of Dominican artists and international artists I’ve listened to all my life.”</blockquote>
        <p>This blending of worlds gives her music a fresh edge. She doesn’t just sing — she tells stories of identity, femininity, and resilience through melody and groove.</p>

        <h3>About the Single — “La Nena de RD”</h3>
        <p>Produced by <strong>Zcottie</strong>, <em>“La Nena de RD”</em> is a high-energy track designed to empower. Francina shares:</p>
        <blockquote>“The next song is called ‘La Nena de RD’, produced by Zcottie. It’s dedicated to women — especially Dominican women — but really for all women to have fun, feel good, and feel like a mamacita.”</blockquote>
        <p>With its driving reggaetón heartbeat, playful brass accents, and confident vocals, the track is less about a love story and more about liberation: dancing for yourself, owning your story, and celebrating who you are.</p>

        <h3>The Creative Process</h3>
        <p>Francina and Zcottie’s chemistry in the studio brings out the best of both worlds — rhythmic energy and emotional storytelling. “Usually, when we have the beat, we create melodies first, then the lyrics, and we build the song piece by piece,” she says. The result is an intuitive, organic track that flows effortlessly from inspiration to execution.</p>

        <h3>From Challenges to Triumph</h3>
        <p>As a female artist navigating an ever-changing industry, Francina stays true to herself:</p>
        <blockquote>“When I want to do a genre that might not be popular, people say it won’t work. I just don’t listen to that.”</blockquote>
        <p>Her defiant creativity and independence define her artistry. For Francina, authenticity isn’t optional — it’s her brand.</p>
        <img src="../assets/images/blog-images/francina-head-shot.jpg" style="width:500px;height:500px;object-fit:cover;">
        <h3>Engaging the Fanbase</h3>
        <p>Francina leverages social media as a creative diary. “If the song has an emotion that resonates, I share that,” she says. Through performance clips and studio snippets, she brings fans closer to her artistic process — giving them a front-row seat to her evolution.</p>

        <h3>Looking Ahead</h3>
        <p>Francina’s sights are set on expanding her reach: Mexico, Chile, Argentina, Spain, and the United States are all in her touring plans. Her goal is to share her energy, her message, and her roots with audiences everywhere.</p>

        <h3>The Takeaway</h3>
        <p><em>“La Nena de RD”</em> is more than a single — it’s a celebration of culture and confidence. Francina’s message is clear: be bold, be proud, and keep creating. She’s not just representing Dominican women — she’s redefining what empowerment sounds like.</p>
        <p>Follow <a href="https://www.instagram.com/francinamusic/" target="_blank">@francinamusic</a> for updates on her releases and tour dates.</p>
      </section>
    `
  },

  {
    id: "zcottie-feature",
    title: "Zcottie: Engineering Sound and Soul in an AI-Driven Age",
    date: "2025-11-07",
    tags: ["Zcottie", "Music Producer", "AI in Music", "Feature"],
    excerpt: "Producer Zcottie opens up about his creative process, collaboration with Francina, and how AI is shaping the future of music production.",
    cover: "../assets/images/blog-images/scottie-studio.png",
    content: `
      <section>
        <h2>Zcottie: Engineering Sound and Soul in an AI-Driven Age</h2>
        <p>In a studio in New York, wires hum, monitors glow, and beats come alive. At the helm sits <strong>Zcottie</strong> — a producer and engineer who merges raw emotion with cutting-edge innovation. His recent collaborations with artists like <strong>Francina</strong> have placed him at the forefront of the evolving conversation about creativity and technology in music.</p>

        <h3>Backstory</h3>
        <p>For Zcottie, music started as a form of curiosity. “I actually started in Texas,” he recalls. “My dad gave me this old computer with some audio software. No internet, no games — just sound.” That constraint became his creative freedom. With no distractions, he taught himself recording, arrangement, and mixing — skills that would define his approach to sound today.</p>

        <h3>Collaboration Philosophy</h3>
        <p>When working with artists, Zcottie’s philosophy is simple: vibe first, rules later. “A lot of times artists come in with an idea; other times, it’s just vibing and seeing what happens,” he says. “The magic happens when no one’s trying too hard — when everyone’s just feeling the moment.”</p>

        <h3>Workflow and Method</h3>
        <p>Each project for Zcottie begins differently. “Sometimes it’s a sound I hear on a keyboard. Sometimes it’s a random drum loop,” he says. “The spark can come from anywhere — a texture, a voice, or even silence.” From that spark, he layers percussion, melody, and space to build fully realized soundscapes that balance structure and spontaneity.</p>

        <h3>AI: The Tool, Not the Replacement</h3>
        <p>In an era dominated by artificial intelligence, Zcottie remains grounded. “AI lowered the barrier to start making music,” he admits, “but it’s still just another tool. It can’t replace learning your craft.” He experiments with platforms like Suno and generative plugins but sees them as inspiration — not substitutes for skill.</p>

        <blockquote>“Technology gives us more colors to paint with, but the soul of the music still comes from the human behind the screen.”</blockquote>

        <h3>A Global Sound</h3>
        <p>Zcottie’s sessions often feature collaborators from around the world — brass sections recorded in Colombia, guitars from Brazil, and vocals tracked in New York. His attention to detail and willingness to bridge cultures create a sound both authentic and borderless.</p>

        <h3>Advice for Emerging Producers</h3>
        <p>“Keep creating. The more you experiment, the sharper your ears get,” he advises. “Don’t box yourself in by genre — explore old music, listen globally, and study emotion. Every sound teaches you something.”</p>

        <h3>What’s Next</h3>
        <p>Following the release of <em>“La Nena de RD”</em>, Zcottie is working on a new merengue track and exploring fusions that blend Latin rhythm with modern electronic textures. “We’re experimenting a lot,” he says. “It’s about keeping things fresh but rooted in who we are.”</p>

        <h3>Conclusion</h3>
        <p>In an age when automation threatens authenticity, Zcottie reminds us of the heart that drives every track. His sound is human, soulful, and evolving — proof that in music, technology is only as powerful as the hands that shape it.</p>
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

// ===== Swapped Prev / Next Logic (reversed placement, still future-proof) =====
const today = new Date().toISOString().split("T")[0];

// Filter out future posts for navigation
const visiblePosts = posts.filter(p => p.date <= today);

// Recalculate index from visible posts
const visibleIdx = visiblePosts.findIndex(p => p.id === id);

// Reversed logic:
// "prev" now points to the NEWER post (formerly next)
// "next" now points to the OLDER post (formerly prev)
const prev = visibleIdx < visiblePosts.length - 1 ? visiblePosts[visibleIdx + 1] : null; // newer
const next = visibleIdx > 0 ? visiblePosts[visibleIdx - 1] : null; // older

const prevLink = document.getElementById("prevLink");
const nextLink = document.getElementById("nextLink");
const prevTitle = document.getElementById("prevTitle");
const nextTitle = document.getElementById("nextTitle");

// "Previous" link now shows the newer post (right button)
if (prev && prev.date <= today) {
  prevLink.href = `./${prev.id}.html`;
  prevTitle.textContent = prev.title;
  prevLink.style.display = "flex";
} else {
  prevLink.style.display = "none";
}

// "Next" link now shows the older post (left button)
if (next && next.date <= today) {
  nextLink.href = `./${next.id}.html`;
  nextTitle.textContent = next.title;
  nextLink.style.display = "flex";
} else {
  nextLink.style.display = "none";
}
  // footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
