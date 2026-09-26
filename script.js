// Each box plays the file in its data-sound attribute.
// Until real sound files are added to /sounds, a cheerful placeholder
// tune is played instead so the page still works.

const SPARKLES = ["⭐", "✨", "🌟", "💖", "🎵"];

// Placeholder melodies (note frequencies in Hz), one per box.
const FALLBACK_TUNES = [
  [523, 659, 784],        // C E G
  [784, 659, 523, 659],   // G E C E
  [392, 523, 392, 659],   // G C G E
];

let audioCtx;

function playFallback(index) {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  const now = audioCtx.currentTime;
  FALLBACK_TUNES[index].forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.value = freq;
    const start = now + i * 0.12;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(start);
    osc.stop(start + 0.3);
  });
}

function burst(x, y) {
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = SPARKLES[Math.floor(Math.random() * SPARKLES.length)];
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 80 + Math.random() * 60;
    s.style.left = `${x}px`;
    s.style.top = `${y}px`;
    s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}

document.querySelectorAll(".box").forEach((box) => {
  const audio = new Audio(box.dataset.sound);
  let hasFile = true;
  audio.addEventListener("error", () => { hasFile = false; });

  box.addEventListener("click", (e) => {
    if (hasFile) {
      audio.currentTime = 0;
      audio.play().catch(() => playFallback(Number(box.dataset.fallback)));
    } else {
      playFallback(Number(box.dataset.fallback));
    }

    // Keyboard clicks have no pointer position, so burst from the box center.
    const rect = box.getBoundingClientRect();
    const x = e.clientX || rect.left + rect.width / 2;
    const y = e.clientY || rect.top + rect.height / 2;
    burst(x, y);

    box.classList.remove("playing");
    void box.offsetWidth; // restart the animation
    box.classList.add("playing");
  });
});
