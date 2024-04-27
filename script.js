const playlistSongs = document.getElementById("playlist-songs");
const playButton = document.getElementById("play");
const pauseButton = document.getElementById("pause");
const nextButton = document.getElementById("next");
const previousButton = document.getElementById("previous");
const shuffleButton = document.getElementById("shuffle");
const repeatButton = document.getElementById("repeat");
let isPlaying = false;
let intervalId;
const trackProgress = document.querySelector("#track-progress");
const spanProgressCurrentTime = document.querySelector(
  "#progress-current-time"
);
const spanProgressDuration = document.querySelector("#progress-duration");
let repeatActive = null;
let idSongToRepeat = null;

const allSongs = [
  {
    id: 0,
    title: "Scratching The Surface",
    artist: "Quincy Larson",
    duration: "4:25",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/scratching-the-surface.mp3",
  },
  {
    id: 1,
    title: "Can't Stay Down",
    artist: "Quincy Larson",
    duration: "4:15",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stay-down.mp3",
  },
  {
    id: 2,
    title: "Still Learning",
    artist: "Quincy Larson",
    duration: "3:51",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/still-learning.mp3",
  },
  {
    id: 3,
    title: "Cruising for a Musing",
    artist: "Quincy Larson",
    duration: "3:34",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cruising-for-a-musing.mp3",
  },
  {
    id: 4,
    title: "Never Not Favored",
    artist: "Quincy Larson",
    duration: "3:35",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/never-not-favored.mp3",
  },
  {
    id: 5,
    title: "From the Ground Up",
    artist: "Quincy Larson",
    duration: "3:12",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/from-the-ground-up.mp3",
  },
  {
    id: 6,
    title: "Walking on Air",
    artist: "Quincy Larson",
    duration: "3:25",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/walking-on-air.mp3",
  },
  {
    id: 7,
    title: "Can't Stop Me. Can't Even Slow Me Down.",
    artist: "Quincy Larson",
    duration: "3:52",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/cant-stop-me-cant-even-slow-me-down.mp3",
  },
  {
    id: 8,
    title: "The Surest Way Out is Through",
    artist: "Quincy Larson",
    duration: "3:10",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/the-surest-way-out-is-through.mp3",
  },
  {
    id: 9,
    title: "Chasing That Feeling",
    artist: "Quincy Larson",
    duration: "2:43",
    src: "https://s3.amazonaws.com/org.freecodecamp.mp3-player-project/chasing-that-feeling.mp3",
  },
];

const audio = new Audio();
let userData = {
  songs: [...allSongs],
  currentSong: null,
  songCurrentTime: 0,
};

const playPauseToggle = (buttonToShow, buttonToHide) => {
  buttonToShow.classList.replace("d-none", "d-block");
  buttonToHide.classList.replace("d-block", "d-none");
};

const playSong = (id) => {
  const song = userData?.songs.find((song) => song.id === id);
  audio.src = song.src;
  audio.title = song.title;

  if (userData?.currentSong === null || userData?.currentSong.id !== song.id) {
    audio.currentTime = 0;
  } else {
    audio.currentTime = userData?.songCurrentTime;
  }
  userData.currentSong = song;
  playButton.classList.add("playing");
  playPauseToggle(pauseButton, playButton);
  isPlaying = true;
  intervalId = setInterval(updateProgress, 1000);

  highlightCurrentSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
  audio.play();
};

const pauseSong = () => {
  userData.songCurrentTime = audio.currentTime;

  playButton.classList.remove("playing");
  playPauseToggle(playButton, pauseButton);
  isPlaying = false;
  clearInterval(intervalId);
  audio.pause();
};

const playNextSong = () => {
  repeatReset();

  if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    const currentSongIndex = getCurrentSongIndex();
    const nextSong = userData?.songs[currentSongIndex + 1];

    playSong(nextSong.id);
  }
};

const playPreviousSong = () => {
  repeatReset();

  if (userData?.currentSong === null) return;
  else {
    const currentSongIndex = getCurrentSongIndex();
    const previousSong = userData?.songs[currentSongIndex - 1];

    playSong(previousSong.id);
  }
};

const shuffle = () => {
  userData?.songs.sort(() => Math.random() - 0.5);
  userData.currentSong = null;
  userData.songCurrentTime = 0;

  renderSongs(userData?.songs);
  pauseSong();
  setPlayerDisplay();
  setPlayButtonAccessibleText();
};

const repeatAll = () => {
  repeatButton.classList.replace("no-repeat", "repeat-all");
  repeatButton.innerHTML = `<i class="bi bi-repeat"></i>`; // repeat-all
  repeatActive = "playlist";
};

const repeatOne = () => {
  repeatButton.classList.replace("repeat-all", "repeat-one");
  repeatButton.innerHTML = `<i class="bi bi-repeat-1"></i>`; // repeat-one
  repeatActive = "song";

  if (userData?.currentSong === null) {
    idSongToRepeat = userData?.songs[0].id;
  } else {
    idSongToRepeat = userData?.currentSong.id;
  }
};

const repeatReset = () => {
  repeatButton.classList.remove("repeat-one", "repeat-all");
  repeatButton.classList.add("no-repeat");
  repeatButton.innerHTML = `<i class="bi bi-repeat"></i>`; // no-repeat
  repeatActive = null;
  idSongToRepeat = null;
};

const deleteSong = (id) => {
  if (userData?.currentSong?.id === id) {
    userData.currentSong = null;
    userData.songCurrentTime = 0;

    pauseSong();
    setPlayerDisplay();
  }

  if (idSongToRepeat === id) {
    repeatReset();
  }

  userData.songs = userData?.songs.filter((song) => song.id !== id);
  renderSongs(userData?.songs);
  highlightCurrentSong();
  setPlayButtonAccessibleText();

  if (userData?.songs.length === 0) {
    const resetButton = document.createElement("button");
    const resetText = document.createTextNode("Reset Playlist");

    resetButton.id = "reset";
    resetButton.ariaLabel = "Reset playlist";
    resetButton.appendChild(resetText);
    playlistSongs.appendChild(resetButton);

    resetButton.addEventListener("click", () => {
      userData.songs = [...allSongs];

      renderSongs(sortSongs());
      setPlayButtonAccessibleText();
      resetButton.remove();
    });
  }
};

const setPlayerDisplay = () => {
  let song = userData?.currentSong || userData?.songs[0];

  const playingSong = document.getElementById("player-song-title");
  const songArtist = document.getElementById("player-song-artist");

  const currentTitle = song?.title || "";
  const currentArtist = song?.artist || "";
  const currentSongTime = song?.songCurrentTime || 0;
  const currentSongDuration = song?.duration || 0;

  playingSong.textContent = currentTitle;
  songArtist.textContent = currentArtist;

  spanProgressCurrentTime.innerText = formatTime(currentSongTime);
  updateProgress();
  // spanProgressDuration.innerText = formatTime(currentSongDuration);
};

const highlightCurrentSong = () => {
  const playlistSongElements = document.querySelectorAll(".playlist-song");
  const songToHighlight = document.getElementById(
    `song-${userData?.currentSong?.id}`
  );

  playlistSongElements.forEach((songEl) => {
    songEl.removeAttribute("aria-current");
  });

  if (songToHighlight) songToHighlight.setAttribute("aria-current", "true");
};

const renderSongs = (array) => {
  const songsHTML = array
    .map((song) => {
      return `
      <li id="song-${song.id}" class="playlist-song">
      <button class="playlist-song-info" onclick="repeatReset(); playSong(${song.id})">
          <span class="playlist-song-title">${song.title}</span>
          <span class="playlist-song-artist">${song.artist}</span>
          <span class="playlist-song-duration">${song.duration}</span>
      </button>
      <button onclick="deleteSong(${song.id})" class="playlist-song-delete" aria-label="Delete ${song.title}">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="8" fill="#4d4d62"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M5.32587 5.18571C5.7107 4.90301 6.28333 4.94814 6.60485 5.28651L8 6.75478L9.39515 5.28651C9.71667 4.94814 10.2893 4.90301 10.6741 5.18571C11.059 5.4684 11.1103 5.97188 10.7888 6.31026L9.1832 7.99999L10.7888 9.68974C11.1103 10.0281 11.059 10.5316 10.6741 10.8143C10.2893 11.097 9.71667 11.0519 9.39515 10.7135L8 9.24521L6.60485 10.7135C6.28333 11.0519 5.7107 11.097 5.32587 10.8143C4.94102 10.5316 4.88969 10.0281 5.21121 9.68974L6.8168 7.99999L5.21122 6.31026C4.8897 5.97188 4.94102 5.4684 5.32587 5.18571Z" fill="white"/></svg>
        </button>
      </li>
      `;
    })
    .join("");

  playlistSongs.innerHTML = songsHTML;
};

const setPlayButtonAccessibleText = () => {
  const song = userData?.currentSong || userData?.songs[0];

  playButton.setAttribute(
    "aria-label",
    song?.title ? `Play ${song.title}` : "Play"
  );
};

const getCurrentSongIndex = () =>
  userData?.songs.indexOf(userData?.currentSong);

playButton.addEventListener("click", () => {
  if (userData?.currentSong === null) {
    playSong(userData?.songs[0].id);
  } else {
    playSong(userData?.currentSong.id);
  }
});

pauseButton.addEventListener("click", pauseSong);

nextButton.addEventListener("click", playNextSong);

previousButton.addEventListener("click", playPreviousSong);

shuffleButton.addEventListener("click", shuffle);

repeatButton.addEventListener("click", () => {
  switch (true) {
    case repeatButton.classList.contains("no-repeat"):
      repeatAll();
      break;

    case repeatButton.classList.contains("repeat-all"):
      repeatOne();
      break;

    case repeatButton.classList.contains("repeat-one"):
      repeatReset();
      break;

    default:
      break;
  }
});

audio.addEventListener("ended", handleSongEnd);

function handleSongEnd() {
  const currentSongIndex = getCurrentSongIndex();
  const nextSongExists = userData?.songs[currentSongIndex + 1] !== undefined;

  if (repeatActive === "song") {
    playSong(idSongToRepeat);
  } else {
    if (nextSongExists) {
      playNextSong();
    } else {
      handleEndOfPlaylist();
    }
  }
}

function handleEndOfPlaylist() {
  if (repeatActive === "playlist") {
    let firstSongId = userData?.songs[0].id;
    playSong(firstSongId);
  } else {
    userData.currentSong = null;
    userData.songCurrentTime = 0;
    pauseSong();
    setPlayerDisplay();
    highlightCurrentSong();
    setPlayButtonAccessibleText();
  }
}

const sortSongs = () => {
  userData?.songs.sort((a, b) => {
    if (a.title < b.title) {
      return -1;
    }

    if (a.title > b.title) {
      return 1;
    }

    return 0;
  });

  return userData?.songs;
};

// CONTROLS
// volume

// duration
// define o valor máximo do controle deslizante como a duração da musica
audio.addEventListener("loadedmetadata", () => {
  trackProgress.value = audio.currentTime;
  trackProgress.max = audio.duration;

  // spanProgressCurrentTime.innerText = formatTime(trackProgress.value);
  spanProgressDuration.innerText = formatTime(trackProgress.max);
});

// interação com o track progress da musica
trackProgress.addEventListener(
  "input",
  () => {
    let newValue = trackProgress.value;
    updateProgress(newValue);
  },
  false
);

function updateProgress(newValue) {
  if (newValue) {
    audio.currentTime = newValue;
  }

  trackProgress.value = audio.currentTime;

  spanProgressCurrentTime.innerText = formatTime(audio.currentTime);
  spanProgressDuration.innerText = formatTime(trackProgress.max);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// modal
const modal = document.getElementById("myModal");
const closeModal = document.getElementsByClassName("close")[0];

function openModal(content) {
  modal.style.display = "block";

  let modalContent = document.getElementsByClassName("modal-content");
  if (content === "playlists") {
    modalContent.innerHTML = renderSongs(sortSongs());
  }
}

closeModal.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// toggle expandir playlist
function playlistToggle() {
  let playlistHTML = document.getElementById("playlist-songs");

  if (playlistHTML.classList.contains("show")) {
    playlistHTML.classList.remove("show");
  } else {
    playlistHTML.classList.add("show");
    var playlistPosition = playlistHTML.offsetTop;

    window.scrollTo({
      top: playlistPosition,
      behavior: "smooth",
    });
  }
}

renderSongs(sortSongs());
setPlayButtonAccessibleText();
setPlayerDisplay();
