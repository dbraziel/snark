const NUM_TRACKS = 7;
const TRACK_PATH = 'music/track';
const audioElements = [];
const activeIndexes = new Set();
const fadeDuration = 2000;
let mixInterval = null;

function fadeAudio(audio, from, to, duration) {
  const stepTime = 50;
  const steps = duration / stepTime;
  let step = 0;
  const diff = to - from;
  const interval = setInterval(() => {
    step++;
    audio.volume = from + (diff * step / steps);
    if (step >= steps) {
      clearInterval(interval);
      audio.volume = to;
    }
  }, stepTime);
}

function playTracks(indexes) {
  if (!Array.isArray(indexes)) return;
  indexes.forEach(i => {
    const audio = audioElements[i];
    if (audio && audio.paused) {
      audio.play();
    }
    fadeAudio(audio, audio.volume, 0.2, fadeDuration);
    activeIndexes.add(i);
  });
}

function stopTracks(indexes) {
  if (!Array.isArray(indexes)) return;
  indexes.forEach(i => {
    const audio = audioElements[i];
    fadeAudio(audio, audio.volume, 0, fadeDuration);
    setTimeout(() => {
      if (audio) {
        audio.pause();
        activeIndexes.delete(i);
      }
    }, fadeDuration);
  });
}

function pickTwoNewIndexes(exclude = []) {
  let available = [...Array(NUM_TRACKS).keys()].filter(i => !exclude.includes(i));
  const a = available.splice(Math.floor(Math.random() * available.length), 1)[0];
  const b = available[Math.floor(Math.random() * available.length)];
  return [a, b];
}

function loopMix() {
  const current = [...activeIndexes];
  const changeTwo = Math.random() < 0.3;

  let toStop = [];
  let toStart = [];

  if (changeTwo || current.length < 2) {
    toStop = current;
    toStart = pickTwoNewIndexes(current);
  } else {
    const toReplace = current[Math.floor(Math.random() * current.length)];
    const remaining = current.filter(i => i !== toReplace);
    const replacement = pickTwoNewIndexes(remaining.concat(toReplace)).find(i => !current.includes(i));
    toStop = [toReplace];
    toStart = [replacement];
  }

  playTracks(toStart);
  stopTracks(toStop);
}

function initMixer() {
  for (let i = 0; i < NUM_TRACKS; i++) {
    const audio = new Audio(`${TRACK_PATH}${i + 1}.mp3`);
    audio.loop = true;
    audio.volume = 0;
    audioElements.push(audio);
  }
}

function startMixing() {
  if (!mixInterval) {
    const initial = pickTwoNewIndexes();
    playTracks(initial);
    mixInterval = setInterval(loopMix, 25000);
  }
}

function stopMixing() {
  clearInterval(mixInterval);
  mixInterval = null;
  stopTracks([...activeIndexes]);
}

function changeOneTrack() {
  const current = [...activeIndexes];
  if (current.length < 1) return;

  const toReplace = current[Math.floor(Math.random() * current.length)];
  const remaining = current.filter(i => i !== toReplace);
  const replacement = pickTwoNewIndexes(remaining.concat(toReplace)).find(i => !current.includes(i));
  if (replacement !== undefined) {
    playTracks([replacement]);
    stopTracks([toReplace]);
  }
}

initMixer();