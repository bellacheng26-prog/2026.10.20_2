const questionsData = [
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["高興", "悲傷", "憤怒", "害羞"],
    answer: 0,
    explanation: "嘴角上揚、眼睛笑成彎月，這代表高興的心情。",
    animType: "happy"
  },
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["緊張", "悲傷", "疲倦", "害羞"],
    answer: 1,
    explanation: "眼中泛著淚光、嘴角向下，這代表悲傷的心情。",
    animType: "sad"
  },
  {
    type: "audio",
    badge: "聽聲音（點擊重播）",
    title: "聽聽看，這是什麼情緒聲音？",
    options: ["大笑聲", "大哭聲", "生氣憤怒", "緊張喘息"],
    answer: 0,
    explanation: "開懷且連續起伏的笑聲，這是大笑的聲音。",
    animType: "laugh",
    audioType: "laugh"
  },
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["害羞", "憤怒", "高興", "緊張"],
    answer: 1,
    explanation: "眉頭深鎖、臉頰漲紅，這代表憤怒的心情。",
    animType: "angry"
  },
  {
    type: "audio",
    badge: "聽聲音（點擊重播）",
    title: "聽聽看，這是什麼情緒聲音？",
    options: ["大笑聲", "大哭聲", "疲倦打哈欠", "害羞竊笑"],
    answer: 1,
    explanation: "伴隨抽泣與悲傷的聲音，這是大哭的聲音。",
    animType: "cry",
    audioType: "cry"
  },
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["害羞", "疲倦", "緊張", "高興"],
    answer: 0,
    explanation: "雙頰通紅、眼神害羞閃爍，這代表害羞的心情。",
    animType: "shy"
  },
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["疲倦", "緊張", "悲傷", "憤怒"],
    answer: 1,
    explanation: "額頭冒汗、眼神緊張不安，這代表緊張的心情。",
    animType: "nervous"
  },
  {
    type: "anim",
    badge: "看動畫",
    title: "表情裡是什麼心情？",
    options: ["高興", "害羞", "疲倦", "憤怒"],
    answer: 2,
    explanation: "眼神半閉、頭頂漂浮著 Zzz 睡意，這代表疲倦的心情。",
    animType: "tired"
  }
];

let currentIdx = 0;
let score = 0;
let userAnswers = [];
let isAnswered = false;
let isMuted = false;
let animationFrameId = null;
let audioContext = null;

function startQuiz() {
  initAudio();
  currentIdx = 0;
  score = 0;
  userAnswers = [];
  showScreen("quiz-screen");
  renderQuestion();
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function toggleMute() {
  isMuted = !isMuted;
  const button = document.querySelector(".sound-btn");
  button.title = isMuted ? "開啟音效" : "關閉音效";
  button.setAttribute("aria-pressed", String(isMuted));
}

function renderQuestion() {
  isAnswered = false;
  const question = questionsData[currentIdx];
  document.getElementById("question-count").innerText = `第 ${currentIdx + 1} / ${questionsData.length} 題`;
  document.getElementById("correct-count").innerText = `答對 ${score} 題`;
  document.getElementById("media-badge").innerText = question.badge;
  document.getElementById("question-text").innerText = question.title;

  const progress = document.getElementById("progress-segments");
  progress.replaceChildren();
  questionsData.forEach((_, index) => {
    const segment = document.createElement("div");
    segment.className = "segment";
    if (index < currentIdx) segment.classList.add("completed");
    if (index === currentIdx) segment.classList.add("active");
    progress.appendChild(segment);
  });

  const optionsContainer = document.getElementById("options-container");
  optionsContainer.replaceChildren();
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.className = "option-btn";
    button.innerHTML = `<span class="option-num">${index + 1}</span><span>${option}</span>`;
    button.addEventListener("click", () => selectOption(index));
    optionsContainer.appendChild(button);
  });

  const banner = document.getElementById("feedback-banner");
  banner.style.display = "none";
  banner.classList.remove("correct-bg");
  startCanvasAnim(question.animType, question.type === "audio");

  if (question.type === "audio") {
    window.setTimeout(() => playSound(question.audioType), 250);
  }
}

function handleCanvasClick() {
  const question = questionsData[currentIdx];
  if (question?.type === "audio") playSound(question.audioType);
}

function selectOption(selectedIndex) {
  if (isAnswered) return;
  isAnswered = true;

  const question = questionsData[currentIdx];
  const isCorrect = selectedIndex === question.answer;
  if (isCorrect) score++;
  userAnswers.push({
    question: question.title,
    isCorrect,
    correctAnswer: question.options[question.answer]
  });

  document.querySelectorAll(".option-btn").forEach((button, index) => {
    button.disabled = true;
    if (index === question.answer) {
      button.classList.add("correct");
      button.querySelector(".option-num").innerText = "✓";
    } else if (index === selectedIndex) {
      button.classList.add("incorrect");
      button.querySelector(".option-num").innerText = "✕";
    }
  });

  const banner = document.getElementById("feedback-banner");
  banner.classList.toggle("correct-bg", isCorrect);
  document.getElementById("feedback-title").innerText = isCorrect
    ? "答對了！恭喜你！"
    : `答錯了，正確答案是「${question.options[question.answer]}」`;
  document.getElementById("feedback-text").innerText = question.explanation;
  banner.style.display = "flex";
  document.getElementById("correct-count").innerText = `答對 ${score} 題`;
}

function nextQuestion() {
  currentIdx++;
  if (currentIdx < questionsData.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  stopCanvasAnim();
  showScreen("result-screen");
  const totalScore = Math.round((score / questionsData.length) * 100);
  document.getElementById("final-score").innerText = `總答對 ${score} / ${questionsData.length} 題（${totalScore} 分）`;
  document.getElementById("star-rating").innerText = score >= 7 ? "★★★" : score >= 4 ? "★★☆" : "★☆☆";

  const summary = document.getElementById("summary-list");
  summary.replaceChildren();
  userAnswers.forEach((answer, index) => {
    const row = document.createElement("div");
    row.className = "summary-item";
    const result = document.createElement("span");
    result.textContent = `第 ${index + 1} 題：${answer.isCorrect ? "正確" : "錯誤"}`;
    result.style.color = answer.isCorrect ? "#137333" : "#c5221f";
    const correctAnswer = document.createElement("span");
    correctAnswer.textContent = `正確答案：${answer.correctAnswer}`;
    row.append(result, correctAnswer);
    summary.appendChild(row);
  });
}

function initAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return audioContext;
}

function playSound(type) {
  if (isMuted) return;
  const context = initAudio();
  if (!context || (type !== "laugh" && type !== "cry")) return;

  const isLaugh = type === "laugh";
  const now = context.currentTime;
  const pulseCount = isLaugh ? 6 : 4;
  const interval = isLaugh ? 0.16 : 0.32;
  const duration = isLaugh ? 0.14 : 0.28;

  for (let index = 0; index < pulseCount; index++) {
    const start = now + index * interval;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = isLaugh ? "triangle" : "sine";
    oscillator.frequency.setValueAtTime(isLaugh ? 250 + (index % 3) * 45 : 480 - index * 35, start);
    oscillator.frequency.linearRampToValueAtTime(isLaugh ? 390 : 270, start + duration);
    filter.type = "lowpass";
    filter.frequency.value = isLaugh ? 1400 : 850;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(isLaugh ? 0.08 : 0.06, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.01);
  }
}

function startCanvasAnim(animType, isAudioWave) {
  stopCanvasAnim();
  const canvas = document.getElementById("animCanvas");
  const context = canvas.getContext("2d");
  let frame = 0;

  function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (isAudioWave) {
      drawAudioWave(context, frame);
    } else {
      drawMoodFace(context, animType, frame);
    }
    frame++;
    animationFrameId = requestAnimationFrame(render);
  }

  render();
}

function stopCanvasAnim() {
  if (animationFrameId !== null) cancelAnimationFrame(animationFrameId);
  animationFrameId = null;
}

function drawAudioWave(context, frame) {
  context.fillStyle = "#1e293b";
  context.fillRect(0, 0, 480, 270);
  context.strokeStyle = "#38bdf8";
  context.lineWidth = 3;
  context.beginPath();
  for (let x = 0; x <= 480; x += 5) {
    const amplitude = 28 + Math.sin(frame * 0.04) * 12;
    const y = 135 + Math.sin((x + frame * 5) * 0.055) * amplitude * Math.cos(frame * 0.04);
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.stroke();
  context.fillStyle = "#fff";
  context.font = "15px sans-serif";
  context.textAlign = "center";
  context.fillText("🔊 點擊畫面可重新播放音效", 240, 220);
}

function drawMoodFace(context, mood, frame) {
  const cx = 240;
  const cy = 132 + Math.sin(frame * 0.08) * 4;
  const colors = {
    happy: "#facc15",
    sad: "#93c5fd",
    angry: "#f87171",
    shy: "#f9a8d4",
    nervous: "#fde047",
    tired: "#cbd5e1"
  };

  context.fillStyle = colors[mood] || "#facc15";
  context.beginPath();
  context.arc(cx, cy, 62, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#3f2933";
  context.fillStyle = "#3f2933";
  context.lineWidth = 4;
  context.lineCap = "round";

  if (mood === "happy") {
    context.beginPath();
    context.moveTo(cx - 32, cy - 10);
    context.quadraticCurveTo(cx - 22, cy - 22, cx - 12, cy - 10);
    context.stroke();
    context.beginPath();
    context.moveTo(cx + 12, cy - 10);
    context.quadraticCurveTo(cx + 22, cy - 22, cx + 32, cy - 10);
    context.stroke();
    context.beginPath();
    context.arc(cx, cy + 5, 28, 0.15, Math.PI - 0.15);
    context.stroke();
  } else if (mood === "sad") {
    context.beginPath();
    context.arc(cx - 22, cy - 3, 9, Math.PI, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(cx + 22, cy - 3, 9, Math.PI, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.arc(cx, cy + 39, 23, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
    context.fillStyle = "#38bdf8";
    context.beginPath();
    context.ellipse(cx - 28, cy + 26 + (frame % 28), 5, 9, 0, 0, Math.PI * 2);
    context.fill();
  } else if (mood === "angry") {
    context.beginPath();
    context.moveTo(cx - 35, cy - 25);
    context.lineTo(cx - 10, cy - 16);
    context.moveTo(cx + 35, cy - 25);
    context.lineTo(cx + 10, cy - 16);
    context.stroke();
    context.beginPath();
    context.arc(cx - 22, cy - 2, 4, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(cx + 22, cy - 2, 4, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(cx, cy + 40, 22, Math.PI * 1.15, Math.PI * 1.85);
    context.stroke();
  } else if (mood === "shy") {
    context.strokeStyle = "#9d174d";
    context.beginPath();
    context.arc(cx - 22, cy - 5, 8, 0.15, Math.PI - 0.15);
    context.stroke();
    context.beginPath();
    context.arc(cx + 22, cy - 5, 8, 0.15, Math.PI - 0.15);
    context.stroke();
    context.fillStyle = "#fb7185";
    context.beginPath();
    context.ellipse(cx - 38, cy + 18, 12, 7, 0, 0, Math.PI * 2);
    context.ellipse(cx + 38, cy + 18, 12, 7, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#9d174d";
    context.beginPath();
    context.arc(cx, cy + 22, 4, 0, Math.PI * 2);
    context.fill();
  } else if (mood === "nervous") {
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(cx - 22, cy - 3, 11, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(cx + 22, cy - 3, 11, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#3f2933";
    context.beginPath();
    context.arc(cx - 22, cy - 3, 4, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.arc(cx + 22, cy - 3, 4, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.moveTo(cx - 14, cy + 36);
    context.lineTo(cx - 5, cy + 28);
    context.lineTo(cx + 4, cy + 38);
    context.lineTo(cx + 14, cy + 30);
    context.stroke();
    context.fillStyle = "#38bdf8";
    context.beginPath();
    context.ellipse(cx + 42, cy - 18 + (frame % 24), 5, 8, 0, 0, Math.PI * 2);
    context.fill();
  } else {
    context.beginPath();
    context.moveTo(cx - 32, cy - 3);
    context.lineTo(cx - 12, cy - 3);
    context.stroke();
    context.beginPath();
    context.moveTo(cx + 12, cy - 3);
    context.lineTo(cx + 32, cy - 3);
    context.stroke();
    context.fillStyle = "#475569";
    context.beginPath();
    context.ellipse(cx, cy + 28, 12, 17 + Math.sin(frame * 0.08) * 3, 0, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#64748b";
    context.font = "bold 24px sans-serif";
    context.fillText("Zzz", cx + 55, cy - 48 - (frame % 40));
  }
}

window.addEventListener("load", () => {
  const canvas = document.getElementById("animCanvas");
  canvas.addEventListener("click", handleCanvasClick);
});
