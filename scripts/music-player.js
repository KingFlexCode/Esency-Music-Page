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
}

function togglePlay() {
  if (audio.paused) {
    audio.play();
    playBtn.textContent = "Pause";
  } else {
    audio.pause();
    playBtn.textContent = "Play";
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

tracks.forEach((t, i) => {
  const li = document.createElement("li");
  li.textContent = `${t.title} - ${t.artist}`;
  li.addEventListener("click", () => {
    currentTrack = i;
    loadTrack(currentTrack);
    audio.play();
    playBtn.textContent = "Pause";
  });
  playlist.appendChild(li);
});

loadTrack(currentTrack);
