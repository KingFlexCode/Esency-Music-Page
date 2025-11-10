// scripts/music-player.js
const tracks = [
  {
    title: "Nada Personal",
    artist: "Esency",
    file: "../assets/music/nada_personal.mp3",
    cover: "../assets/covers/nada_personal.jpg",
  },
  {
    title: "Red Lips",
    artist: "Esency",
    file: "../assets/music/red_lips.mp3",
    cover: "../assets/covers/red_lips.jpg",
  },
  {
    title: "Midnight Drive",
    artist: "Esency",
    file: "../assets/music/midnight_drive.mp3",
    cover: "../assets/covers/midnight_drive.jpg",
  },
];

let currentTrack = 0;
const audio = new Audio(tracks[currentTrack].file);
const playBtn = document.getElementById("play-btn");
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
const progressBar = document.getElementById("progress-bar");
const trackTitle = document.getElementById("track-title");
const trackArtist = document.getElementById("track-artist");
const coverArt = document.querySelector(".cover-art");
const playlist = document.getElementById("playlist");

function loadTrack(index) {
  const track = tracks[index];
  audio.src = track.file;
  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist;
  coverArt.src = track.cover;
  document.getElementById("blur-bg").style.backgroundImage = `url('${track.cover}')`;

  document.querySelectorAll("#playlist li").forEach(li => li.classList.remove("active"));
  playlist.children[index].classList.add("active");
}

function togglePlay() {
  const icon = playBtn.querySelector("i");
  if (audio.paused) {
    audio.play();
    icon.classList.replace("fa-play", "fa-pause");
    coverArt.classList.add("playing");
  } else {
    audio.pause();
    icon.classList.replace("fa-pause", "fa-play");
    coverArt.classList.remove("playing");
  }
}

function nextTrack() {
  currentTrack = (currentTrack + 1) % tracks.length;
  loadTrack(currentTrack);
  audio.play();
}

function prevTrack() {
  currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrack);
  audio.play();
}

function updateProgress() {
  progressBar.value = (audio.currentTime / audio.duration) * 100 || 0;
}

progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

audio.addEventListener("timeupdate", updateProgress);
audio.addEventListener("ended", nextTrack);

playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);

playlist.innerHTML = ""; // clear

tracks.forEach((t, i) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <div>${i + 1}</div>
    <img src="${t.cover}" alt="${t.title}" />
    <div class="song-info">
      <div class="song-title">${t.title}</div>
      <div class="song-artist">${t.artist}</div>
    </div>
    <div class="song-duration">3:00</div>
  `;

  li.addEventListener("click", () => {
    currentTrack = i;
    loadTrack(currentTrack);
    audio.play();
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  });

  playlist.appendChild(li);
});

document.getElementById("song-count").textContent = `${tracks.length} songs`;

loadTrack(currentTrack);
