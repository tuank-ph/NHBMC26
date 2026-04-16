const SVG_NS = "http://www.w3.org/2000/svg";
const GAME_DURATION_SECONDS = 67;
const FEVER_DURATION_MS = 15000;
const COMBO_WINDOW_MS = 20000;
const STAGE_INTRO_DURATION_MS = 1500;
const TUTORIAL_IDLE_DELAY_MS = 100;
const TUTORIAL_HINT_RESTART_MS = 1700;
const TUTORIAL_EXIT_FLASH_MS = 800;
const TUTORIAL_STAGE_BANNER_DURATION_MS = 1500;
const CORRECT_SCORE = 100;
const WRONG_SCORE = 50;
const MASTER_VOLUME = 3.0;
const LEADERBOARD_KEY = "truy-tim-an-so.top10";
const VALUE_BANK = [1, 2, 3, -0.5, 0, 0.5, -3, -2, -1];
const X_MIN = -4;
const X_MAX = 4;
const Y_MIN = -4;
const Y_MAX = 4;
const PLOT_LEFT = 8;
const PLOT_RIGHT = 632;
const PLOT_TOP = 8;
const PLOT_BOTTOM = 632;
const PLOT_WIDTH = PLOT_RIGHT - PLOT_LEFT;
const PLOT_HEIGHT = PLOT_BOTTOM - PLOT_TOP;

const STAGE_META = {
  1: {
    title: "Giai đoạn 1",
    name: "Làm quen với hệ số góc",
    description: "Chọn hệ số a để đường thẳng y = ax đi qua đúng điểm mục tiêu."
  },
  2: {
    title: "Giai đoạn 2",
    name: "Căn chỉnh cao độ",
    description: "Kết hợp a và b để đường thẳng xuất phát đúng vị trí và chui qua cổng."
  },
  3: {
    title: "Giai đoạn 3",
    name: "Bẻ cong quỹ đạo",
    description: "Chọn a để parabol y = ax² đi qua các sao theo đúng đường cong."
  }
};

const TUTORIAL_STAGE_DATA = {
  1: {
    formula: "linearOrigin",
    prompt: "Hướng dẫn: Tìm hệ số a để đường thẳng đi qua điểm A(1; 2).",
    lead: "Màn hướng dẫn này giúp bạn làm quen với cách kéo số từ kho số vào ô phương trình.",
    solution: {
      a: 2
    },
    targets: [{ x: 1, y: 2, label: "A", style: "star" }],
    steps: [
      {
        sourceValue: 2,
        slot: "a",
        value: 2,
        message: "Kéo số 2 từ kho số vào ô a để đổi hệ số góc của đường thẳng."
      }
    ]
  },
  2: {
    formula: "linear",
    prompt: "Hướng dẫn: Kéo a = 1 và b = 2 để đường bắn đi qua S(0; 2) và cổng G(1; 3).",
    lead: "Sang giai đoạn 2, bạn cần điền cả a và b để dựng đúng đường thẳng.",
    solution: {
      a: 1,
      b: 2
    },
    targets: [
      { x: 0, y: 2, label: "S", style: "anchor" },
      { x: 1, y: 3, label: "G", style: "center" }
    ],
    gate: { x: 1, y: 3, width: 1, height: 1, label: "G" },
    steps: [
      {
        sourceValue: 1,
        slot: "a",
        value: 1,
        message: "Bước 1: Kéo số 1 vào ô a để tạo hệ số góc của đường thẳng."
      },
      {
        sourceValue: 2,
        slot: "b",
        value: 2,
        message: "Bước 2: Kéo tiếp số 2 vào ô b để nâng đường thẳng lên đúng vị trí."
      }
    ]
  },
  3: {
    formula: "quadratic",
    prompt: "Hướng dẫn: chọn a = 1 để parabol đi qua ba điểm tại (-1; 1), (0; 0), (1; 1).",
    lead: "Ở giai đoạn 3, bạn chỉ cần kéo hệ số a vào trước x² để chỉnh độ cong của parabol.",
    solution: {
      a: 1
    },
    targets: [
      { x: -1, y: 1, label: "A", style: "star" },
      { x: 0, y: 0, label: "B", style: "star" },
      { x: 1, y: 1, label: "C", style: "star" }
    ],
    steps: [
      {
        sourceValue: 1,
        slot: "a",
        value: 1,
        message: "Kéo số 1 vào ô a để parabol đi qua các ngôi sao."
      }
    ]
  }
};

const LEVEL_COUNT = 15;
const STAGE_SEQUENCE = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3];
const LINEAR_A_VALUES = [-3, -2, -1, -0.5, 0.5, 1, 2, 3];
const QUADRATIC_A_VALUES = [-2, -1, -0.5, 0.5, 1, 2];
const GATE_LABELS = ["G", "H", "K", "M", "N", "P"];
const STAR_LABELS = ["A", "B", "C", "D", "E", "F"];

const state = {
  started: false,
  running: false,
  currentLevelIndex: 0,
  currentLevel: null,
  playerName: "",
  leaderboard: [],
  placements: {},
  score: 0,
  solvedCount: 0,
  deadline: 0,
  timerHandle: null,
  countdownHandle: null,
  isPaused: false,
  pauseStartedAt: 0,
  pausedRemainingMs: 0,
  pausedFeverMs: 0,
  recentSolveTimes: [],
  feverUntil: 0,
  drag: null,
  lockAdvance: false,
  ignoreSlotClickUntil: 0,
  finalCompletionMs: GAME_DURATION_SECONDS * 1000,
  pendingConfirmAction: null,
  confirmResumeOnCancel: false,
  confirmReturnOverlay: null,
  tutorialEnabled: true,
  tutorialShownStages: {},
  tutorialPendingTimerStart: false,
  tutorialPendingResume: false,
  tutorialDemoTimeouts: [],
  tutorialIdleHandle: null,
  stageIntroHandle: null,
  tutorialStageBannerHandle: null,
  graphFrameSyncHandle: 0,
  guidanceClockFrozen: false,
  guidanceClockRemainingMs: 0,
  guidancePauseStartedAt: 0,
  guidanceFeverRemainingMs: 0,
  feverInfoShown: false,
  pendingSolvedAdvance: false,
  screenFlashHandle: null
};

const refs = {};
let scoreBannerTimeout = null;
const audioSystem = createAudioSystem();

document.addEventListener("DOMContentLoaded", init);

function createAudioSystem() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return {
      unlock: async () => false,
      syncMusic() {},
      startMusic() {},
      pauseMusic() {},
      stopMusic() {},
      playCountdownCue() {},
      playScoreSfx() {},
      playPenaltySfx() {},
      playFeverStinger() {}
    };
  }

  const BAR_STEPS = 16;
  const LOOKAHEAD_SECONDS = 0.18;
  const SCHEDULER_INTERVAL_MS = 80;
  const PATTERNS = {
    normal: {
      bpm: 108,
      gain: 0.5,
      kick: [0, 8],
      snare: [4, 12],
      hat: [0, 2, 4, 6, 8, 10, 12, 14],
      bass: [45, null, 45, null, 48, null, 50, null, 45, null, 52, null, 48, null, 50, null],
      lead: [69, null, 72, null, 74, null, 72, null, 69, null, 76, null, 74, null, 72, null]
    },
    fever: {
      bpm: 152,
      gain: 0.52,
      kick: [0, 3, 6, 8, 10, 12, 15],
      snare: [4, 12],
      hat: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      bass: [45, 45, 48, 45, 50, 48, 52, 50, 45, 45, 57, 55, 52, 50, 48, 50],
      lead: [81, 84, 86, 88, 86, 84, 81, 79, 84, 86, 88, 91, 88, 86, 84, 83]
    }
  };

  const system = {
    context: null,
    masterGain: null,
    musicBus: null,
    sfxBus: null,
    noiseBuffer: null,
    schedulerId: null,
    currentMode: "normal",
    currentStep: 0,
    nextStepTime: 0,

    ensureContext() {
      if (this.context) {
        return this.context;
      }

      const context = new AudioContextClass();
      const masterGain = context.createGain();
      const musicBus = context.createGain();
      const sfxBus = context.createGain();

      masterGain.gain.value = MASTER_VOLUME;
      musicBus.gain.value = 0.0001;
      sfxBus.gain.value = 1;

      musicBus.connect(masterGain);
      sfxBus.connect(masterGain);
      masterGain.connect(context.destination);

      this.context = context;
      this.masterGain = masterGain;
      this.musicBus = musicBus;
      this.sfxBus = sfxBus;
      this.noiseBuffer = createNoiseBuffer(context);

      return context;
    },

    async unlock() {
      const context = this.ensureContext();
      if (!context) {
        return false;
      }

      if (context.state === "suspended") {
        try {
          await context.resume();
        } catch (error) {
          return false;
        }
      }

      return context.state === "running";
    },

    syncMusic({ running, fever }) {
      if (!running) {
        if (this.context) {
          this.pauseMusic();
        }
        return;
      }

      const context = this.ensureContext();
      if (!context || context.state !== "running") {
        this.pauseMusic();
        return;
      }

      const nextMode = fever ? "fever" : "normal";
      if (!this.schedulerId) {
        this.startMusic(nextMode);
        return;
      }

      if (this.currentMode !== nextMode) {
        this.currentMode = nextMode;
        this.currentStep = 0;
        this.nextStepTime = context.currentTime + 0.04;
      }

      this.setMusicGain(nextMode);
    },

    startMusic(mode = "normal") {
      const context = this.ensureContext();
      if (!context || context.state !== "running") {
        return;
      }

      this.currentMode = mode === "fever" ? "fever" : "normal";
      this.currentStep = 0;
      this.nextStepTime = context.currentTime + 0.06;
      this.setMusicGain(this.currentMode);

      if (this.schedulerId) {
        return;
      }

      this.schedulerId = window.setInterval(() => {
        this.scheduleUpcomingNotes();
      }, SCHEDULER_INTERVAL_MS);
    },

    pauseMusic() {
      if (this.schedulerId) {
        window.clearInterval(this.schedulerId);
        this.schedulerId = null;
      }

      if (!this.context || !this.musicBus) {
        return;
      }

      const now = this.context.currentTime;
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setValueAtTime(Math.max(this.musicBus.gain.value, 0.0001), now);
      this.musicBus.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    },

    stopMusic() {
      this.pauseMusic();
      this.currentStep = 0;
      this.nextStepTime = 0;
    },

    setMusicGain(mode) {
      if (!this.context || !this.musicBus) {
        return;
      }

      const target = PATTERNS[mode].gain;
      const now = this.context.currentTime;
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setValueAtTime(Math.max(this.musicBus.gain.value, 0.0001), now);
      this.musicBus.gain.exponentialRampToValueAtTime(target, now + 0.18);
    },

    scheduleUpcomingNotes() {
      if (!this.context || this.context.state !== "running") {
        return;
      }

      while (this.nextStepTime < this.context.currentTime + LOOKAHEAD_SECONDS) {
        this.scheduleStep(this.currentStep, this.nextStepTime);
        const stepDuration = 60 / PATTERNS[this.currentMode].bpm / 4;
        this.nextStepTime += stepDuration;
        this.currentStep = (this.currentStep + 1) % BAR_STEPS;
      }
    },

    scheduleStep(step, time) {
      const pattern = PATTERNS[this.currentMode];

      if (pattern.kick.includes(step)) {
        this.playKick(time);
      }
      if (pattern.snare.includes(step)) {
        this.playSnare(time);
      }
      if (pattern.hat.includes(step)) {
        this.playHiHat(time);
      }

      const bassNote = pattern.bass[step];
      const leadNote = pattern.lead[step];

      if (bassNote !== null) {
        this.playBass(time, bassNote);
      }
      if (leadNote !== null) {
        this.playLead(time, leadNote);
      }
    },

    playKick(time) {
      const peak = this.currentMode === "fever" ? 0.34 : 0.26;
      playTone(this.musicBus, {
        time,
        type: "sine",
        frequency: this.currentMode === "fever" ? 160 : 130,
        endFrequency: 42,
        volume: peak,
        attack: 0.003,
        hold: 0.02,
        release: 0.16
      });
    },

    playSnare(time) {
      const peak = this.currentMode === "fever" ? 0.22 : 0.16;
      playNoise(this.musicBus, {
        time,
        volume: peak,
        attack: 0.001,
        release: 0.11,
        filterType: "highpass",
        filterFrequency: this.currentMode === "fever" ? 1800 : 1400
      });
      playTone(this.musicBus, {
        time,
        type: "triangle",
        frequency: this.currentMode === "fever" ? 220 : 180,
        endFrequency: 90,
        volume: peak * 0.45,
        attack: 0.001,
        hold: 0.02,
        release: 0.08
      });
    },

    playHiHat(time) {
      playNoise(this.musicBus, {
        time,
        volume: this.currentMode === "fever" ? 0.085 : 0.05,
        attack: 0.001,
        release: this.currentMode === "fever" ? 0.035 : 0.026,
        filterType: "highpass",
        filterFrequency: 6500
      });
    },

    playBass(time, midi) {
      playTone(this.musicBus, {
        time,
        type: this.currentMode === "fever" ? "sawtooth" : "triangle",
        frequency: midiToFrequency(midi),
        endFrequency: midiToFrequency(midi) * 0.98,
        volume: this.currentMode === "fever" ? 0.095 : 0.065,
        attack: 0.01,
        hold: 0.03,
        release: this.currentMode === "fever" ? 0.15 : 0.22,
        filterType: "lowpass",
        filterFrequency: this.currentMode === "fever" ? 1100 : 700
      });
    },

    playLead(time, midi) {
      playTone(this.musicBus, {
        time,
        type: this.currentMode === "fever" ? "square" : "triangle",
        frequency: midiToFrequency(midi),
        endFrequency: midiToFrequency(midi) * 1.015,
        volume: this.currentMode === "fever" ? 0.08 : 0.045,
        attack: 0.008,
        hold: 0.02,
        release: this.currentMode === "fever" ? 0.11 : 0.16,
        filterType: "lowpass",
        filterFrequency: this.currentMode === "fever" ? 2200 : 1500
      });
    },

    playCountdownCue(label) {
      if (!this.context || this.context.state !== "running") {
        return;
      }

      const now = this.context.currentTime;
      if (label === "Bắt đầu!") {
        [659, 831, 988].forEach((frequency, index) => {
          playTone(this.sfxBus, {
            time: now + index * 0.07,
            type: "square",
            frequency,
            endFrequency: frequency * 1.02,
            volume: 0.22,
            attack: 0.004,
            hold: 0.03,
            release: 0.12,
            filterType: "lowpass",
            filterFrequency: 2800
          });
        });
        return;
      }

      const frequencyMap = {
        3: 740,
        2: 784,
        1: 880
      };

      playTone(this.sfxBus, {
        time: now,
        type: "triangle",
        frequency: frequencyMap[label] || 760,
        endFrequency: (frequencyMap[label] || 760) * 0.98,
        volume: 0.19,
        attack: 0.005,
        hold: 0.04,
        release: 0.12,
        filterType: "lowpass",
        filterFrequency: 2200
      });
    },

    playScoreSfx(options = {}) {
      if (!this.context || this.context.state !== "running") {
        return;
      }

      const fever = Boolean(options.fever);
      const now = this.context.currentTime;
      const notes = fever ? [76, 81, 88, 93] : [72, 76, 79];

      notes.forEach((note, index) => {
        playTone(this.sfxBus, {
          time: now + index * 0.045,
          type: fever ? "sawtooth" : "triangle",
          frequency: midiToFrequency(note),
          endFrequency: midiToFrequency(note) * 1.03,
          volume: fever ? 0.38 : 0.32,
          attack: 0.004,
          hold: 0.025,
          release: 0.14,
          filterType: "lowpass",
          filterFrequency: fever ? 3200 : 2400
        });
      });
    },

    playPenaltySfx() {
      if (!this.context || this.context.state !== "running") {
        return;
      }

      const now = this.context.currentTime;
      [62, 57, 50].forEach((note, index) => {
        playTone(this.sfxBus, {
          time: now + index * 0.05,
          type: "square",
          frequency: midiToFrequency(note),
          endFrequency: midiToFrequency(note) * 0.88,
          volume: 0.15,
          attack: 0.003,
          hold: 0.02,
          release: 0.12,
          filterType: "lowpass",
          filterFrequency: 1800
        });
      });
      playNoise(this.sfxBus, {
        time: now,
        volume: 0.1,
        attack: 0.001,
        release: 0.1,
        filterType: "bandpass",
        filterFrequency: 900
      });
    },

    playFeverStinger() {
      if (!this.context || this.context.state !== "running") {
        return;
      }

      const now = this.context.currentTime;
      playTone(this.sfxBus, {
        time: now,
        type: "sawtooth",
        frequency: 260,
        endFrequency: 1240,
        volume: 0.24,
        attack: 0.01,
        hold: 0.05,
        release: 0.28,
        filterType: "lowpass",
        filterFrequency: 3600
      });
      playNoise(this.sfxBus, {
        time: now + 0.02,
        volume: 0.12,
        attack: 0.001,
        release: 0.2,
        filterType: "highpass",
        filterFrequency: 2400
      });
    }
  };

  function midiToFrequency(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function createNoiseBuffer(context) {
    const durationSeconds = 0.25;
    const buffer = context.createBuffer(1, context.sampleRate * durationSeconds, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  function playTone(destination, {
    time,
    type = "sine",
    frequency,
    endFrequency = frequency,
    volume = 0.12,
    attack = 0.005,
    hold = 0.02,
    release = 0.12,
    filterType = null,
    filterFrequency = 1800
  }) {
    const context = system.context;
    if (!context) {
      return;
    }

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    let outputNode = oscillator;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(frequency, 1), time);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFrequency, 1), time + attack + hold + release);

    if (filterType) {
      const filter = context.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFrequency, time);
      oscillator.connect(filter);
      outputNode = filter;
    }

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + attack + hold + release);

    outputNode.connect(gainNode);
    gainNode.connect(destination);

    oscillator.start(time);
    oscillator.stop(time + attack + hold + release + 0.03);
  }

  function playNoise(destination, {
    time,
    volume = 0.08,
    attack = 0.001,
    release = 0.08,
    filterType = "highpass",
    filterFrequency = 2400
  }) {
    const context = system.context;
    if (!context || !system.noiseBuffer) {
      return;
    }

    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gainNode = context.createGain();

    source.buffer = system.noiseBuffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(filterFrequency, time);

    gainNode.gain.setValueAtTime(0.0001, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + attack);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, time + attack + release);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(destination);

    source.start(time);
    source.stop(time + attack + release + 0.03);
  }

  return system;
}

function init() {
  cacheRefs();
  buildGrid();
  renderPalette();
  state.leaderboard = loadLeaderboard();
  bindEvents();
  state.currentLevel = null;
  renderLevel();
  renderLeaderboard();
  refreshStartScreen();
  refreshTutorialModeUI();
  updateFeverInfoCopy();
  updateHud();
}

function cacheRefs() {
  refs.body = document.body;
  refs.app = document.getElementById("app");
  refs.timeValue = document.getElementById("timeValue");
  refs.scoreValue = document.getElementById("scoreValue");
  refs.comboValue = document.getElementById("comboValue");
  refs.feverValue = document.getElementById("feverValue");
  refs.recordScore = document.getElementById("recordScore");
  refs.recordOwner = document.getElementById("recordOwner");
  refs.levelBadge = document.getElementById("levelBadge");
  refs.stageTitle = document.getElementById("stageTitle");
  refs.levelInstruction = document.getElementById("levelInstruction");
  refs.formulaArea = document.getElementById("formulaArea");
  refs.graphPanel = document.querySelector(".graph-panel");
  refs.graphHeader = document.querySelector(".graph-header");
  refs.graphFrame = document.querySelector(".graph-frame");
  refs.palette = document.getElementById("palette");
  refs.gameRestartBtn = document.getElementById("gameRestartBtn");
  refs.homeBtn = document.getElementById("homeBtn");
  refs.pauseBtn = document.getElementById("pauseBtn");
  refs.resetBtn = document.getElementById("resetBtn");
  refs.statusLine = document.getElementById("statusLine");
  refs.gridLayer = document.getElementById("gridLayer");
  refs.decorLayer = document.getElementById("decorLayer");
  refs.curvePath = document.getElementById("curvePath");
  refs.previewPath = document.getElementById("previewPath");
  refs.startOverlay = document.getElementById("startOverlay");
  refs.nameOverlay = document.getElementById("nameOverlay");
  refs.endOverlay = document.getElementById("endOverlay");
  refs.pauseOverlay = document.getElementById("pauseOverlay");
  refs.leaderboardOverlay = document.getElementById("leaderboardOverlay");
  refs.confirmOverlay = document.getElementById("confirmOverlay");
  refs.countdownOverlay = document.getElementById("countdownOverlay");
  refs.stageIntroOverlay = document.getElementById("stageIntroOverlay");
  refs.stageIntroTitle = document.getElementById("stageIntroTitle");
  refs.stageIntroSubtitle = document.getElementById("stageIntroSubtitle");
  refs.stageIntroLead = document.getElementById("stageIntroLead");
  refs.tutorialStageBannerOverlay = document.getElementById("tutorialStageBannerOverlay");
  refs.tutorialStageBannerTitle = document.getElementById("tutorialStageBannerTitle");
  refs.tutorialStageBannerSubtitle = document.getElementById("tutorialStageBannerSubtitle");
  refs.feverInfoOverlay = document.getElementById("feverInfoOverlay");
  refs.feverInfoLead = document.getElementById("feverInfoLead");
  refs.feverInfoDuration = document.getElementById("feverInfoDuration");
  refs.feverInfoTrigger = document.getElementById("feverInfoTrigger");
  refs.feverInfoContinueBtn = document.getElementById("feverInfoContinueBtn");
  refs.tutorialHintLayer = document.getElementById("tutorialHintLayer");
  refs.tutorialHintBubble = document.getElementById("tutorialHintBubble");
  refs.tutorialHintText = document.getElementById("tutorialHintText");
  refs.tutorialHintGhost = document.getElementById("tutorialHintGhost");
  refs.screenFlashOverlay = document.getElementById("screenFlashOverlay");
  refs.startBtn = document.getElementById("startBtn");
  refs.restartBtn = document.getElementById("restartBtn");
  refs.endExitBtn = document.getElementById("endExitBtn");
  refs.resumeBtn = document.getElementById("resumeBtn");
  refs.leaderboardBtn = document.getElementById("leaderboardBtn");
  refs.endLeaderboardBtn = document.getElementById("endLeaderboardBtn");
  refs.closeLeaderboardBtn = document.getElementById("closeLeaderboardBtn");
  refs.nameBackBtn = document.getElementById("nameBackBtn");
  refs.confirmStartBtn = document.getElementById("confirmStartBtn");
  refs.playerNameInput = document.getElementById("playerNameInput");
  refs.nameError = document.getElementById("nameError");
  refs.tutorialModeBtn = document.getElementById("tutorialModeBtn");
  refs.tutorialModeHint = document.getElementById("tutorialModeHint");
  refs.endTutorialModeBtn = document.getElementById("endTutorialModeBtn");
  refs.endTutorialModeHint = document.getElementById("endTutorialModeHint");
  refs.confirmTutorialToggleCard = document.getElementById("confirmTutorialToggleCard");
  refs.confirmTutorialModeBtn = document.getElementById("confirmTutorialModeBtn");
  refs.confirmTutorialModeHint = document.getElementById("confirmTutorialModeHint");
  refs.leaderboardList = document.getElementById("leaderboardList");
  refs.countdownValue = document.getElementById("countdownValue");
  refs.countdownName = document.getElementById("countdownName");
  refs.endTitle = document.getElementById("endTitle");
  refs.endSummary = document.getElementById("endSummary");
  refs.finalScore = document.getElementById("finalScore");
  refs.finalSolved = document.getElementById("finalSolved");
  refs.finalTime = document.getElementById("finalTime");
  refs.confirmKicker = document.getElementById("confirmKicker");
  refs.confirmTitle = document.getElementById("confirmTitle");
  refs.confirmMessage = document.getElementById("confirmMessage");
  refs.confirmCancelBtn = document.getElementById("confirmCancelBtn");
  refs.confirmAcceptBtn = document.getElementById("confirmAcceptBtn");
  refs.tutorialOverlay = document.getElementById("tutorialOverlay");
  refs.tutorialStageKicker = document.getElementById("tutorialStageKicker");
  refs.tutorialTitle = document.getElementById("tutorialTitle");
  refs.tutorialLead = document.getElementById("tutorialLead");
  refs.tutorialFormulaLabel = document.getElementById("tutorialFormulaLabel");
  refs.tutorialPlayground = document.getElementById("tutorialPlayground");
  refs.tutorialFormulaArea = document.getElementById("tutorialFormulaArea");
  refs.tutorialPalette = document.getElementById("tutorialPalette");
  refs.tutorialCallout = document.getElementById("tutorialCallout");
  refs.tutorialCalloutText = document.getElementById("tutorialCalloutText");
  refs.tutorialGhostChip = document.getElementById("tutorialGhostChip");
  refs.tutorialContinueBtn = document.getElementById("tutorialContinueBtn");
  refs.scoreBanner = document.getElementById("scoreBanner");
}

function bindEvents() {
  refs.startBtn.addEventListener("click", openNameOverlay);
  refs.restartBtn.addEventListener("click", confirmRestartAfterFinish);
  refs.gameRestartBtn.addEventListener("click", confirmRestartCurrentGame);
  refs.endExitBtn.addEventListener("click", () => confirmExitToStart(refs.endOverlay));
  refs.resumeBtn.addEventListener("click", resumeGame);
  refs.homeBtn.addEventListener("click", () => confirmExitToStart());
  refs.pauseBtn.addEventListener("click", togglePause);
  refs.resetBtn.addEventListener("click", resetCurrentLevel);
  refs.leaderboardBtn.addEventListener("click", () => openLeaderboardOverlay("start"));
  refs.endLeaderboardBtn.addEventListener("click", () => openLeaderboardOverlay("end"));
  refs.closeLeaderboardBtn.addEventListener("click", closeLeaderboardOverlay);
  refs.confirmCancelBtn.addEventListener("click", () => closeConfirmOverlay(false));
  refs.confirmAcceptBtn.addEventListener("click", () => closeConfirmOverlay(true));
  refs.nameBackBtn.addEventListener("click", returnToStart);
  refs.confirmStartBtn.addEventListener("click", confirmPlayerAndStart);
  [refs.tutorialModeBtn, refs.endTutorialModeBtn, refs.confirmTutorialModeBtn]
    .filter(Boolean)
    .forEach((button) => button.addEventListener("click", toggleTutorialMode));
  refs.tutorialContinueBtn.addEventListener("click", closeTutorialOverlay);
  refs.feverInfoContinueBtn.addEventListener("click", closeFeverInfoOverlay);
  refs.playerNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmPlayerAndStart();
    }
  });

  refs.palette.addEventListener("pointerdown", (event) => {
    const chip = event.target.closest(".number-chip");
    if (!chip || !state.running || state.lockAdvance) {
      return;
    }
    beginDrag(event, Number(chip.dataset.value));
  });

  refs.formulaArea.addEventListener("click", (event) => {
    const slot = event.target.closest(".drop-slot");
    if (!slot || !state.running || state.lockAdvance) {
      return;
    }
    if (Date.now() < state.ignoreSlotClickUntil) {
      return;
    }
    clearSlot(slot.dataset.slot);
  });

  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", cancelDrag);
  window.addEventListener("blur", cancelDrag);
}

function toggleTutorialMode() {
  state.tutorialEnabled = !state.tutorialEnabled;
  refreshTutorialModeUI();
}

function refreshTutorialModeUI() {
  if (!refs.tutorialModeBtn || !refs.tutorialModeHint) {
    return;
  }

  refs.tutorialModeBtn.textContent = state.tutorialEnabled ? "Bật" : "Tắt";
  refs.tutorialModeBtn.setAttribute("aria-pressed", state.tutorialEnabled ? "true" : "false");
  refs.tutorialModeBtn.classList.toggle("is-off", !state.tutorialEnabled);
  refs.tutorialModeHint.textContent = state.tutorialEnabled
    ? "Mỗi giai đoạn sẽ có màn hướng dẫn tương tác ngay trên bàn chơi."
    : "Tắt nếu bạn muốn bỏ qua các màn hướng dẫn và vào thẳng màn chính.";
}

function refreshTutorialModeUI() {
  if (!refs.tutorialModeBtn) {
    return;
  }

  const buttons = [refs.tutorialModeBtn, refs.endTutorialModeBtn, refs.confirmTutorialModeBtn].filter(Boolean);
  const pressed = state.tutorialEnabled ? "true" : "false";
  const label = state.tutorialEnabled ? "Tắt chế độ hướng dẫn" : "Bật chế độ hướng dẫn";

  document.querySelectorAll(".tutorial-toggle-copy strong").forEach((node) => {
    node.textContent = "Chế độ hướng dẫn";
  });

  buttons.forEach((button) => {
    button.innerHTML = '<span class="tutorial-toggle-btn__track"><span class="tutorial-toggle-btn__thumb"></span></span>';
    button.setAttribute("aria-pressed", pressed);
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-off", !state.tutorialEnabled);
  });

  if (refs.tutorialModeHint) {
    refs.tutorialModeHint.textContent = state.tutorialEnabled
      ? "Mỗi giai đoạn sẽ có màn hướng dẫn tương tác ngay trên bàn chơi."
      : "Tắt nếu bạn muốn vào thẳng màn chính mà không hiện hướng dẫn.";
  }

  if (refs.endTutorialModeHint) {
    refs.endTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván sau sẽ tiếp tục hiện màn hướng dẫn ở từng giai đoạn."
      : "Ván sau sẽ bỏ qua các màn hướng dẫn giai đoạn.";
  }

  if (refs.confirmTutorialModeHint) {
    refs.confirmTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván chơi lại sẽ hiện hướng dẫn ở các giai đoạn."
      : "Ván chơi lại sẽ bỏ qua các màn hướng dẫn.";
  }
}

function refreshTutorialModeUI() {
  if (!refs.tutorialModeBtn) {
    return;
  }

  const buttons = [refs.tutorialModeBtn, refs.endTutorialModeBtn, refs.confirmTutorialModeBtn].filter(Boolean);
  const pressed = state.tutorialEnabled ? "true" : "false";
  const label = state.tutorialEnabled ? "Tắt chế độ hướng dẫn" : "Bật chế độ hướng dẫn";

  document.querySelectorAll(".tutorial-toggle-copy strong").forEach((node) => {
    node.textContent = "Chế độ hướng dẫn";
  });

  buttons.forEach((button) => {
    button.innerHTML = '<span class="tutorial-toggle-btn__track"><span class="tutorial-toggle-btn__thumb"></span></span>';
    button.setAttribute("aria-pressed", pressed);
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-off", !state.tutorialEnabled);
  });

  if (refs.tutorialModeHint) {
    refs.tutorialModeHint.textContent = state.tutorialEnabled
      ? "Mỗi giai đoạn sẽ có màn hướng dẫn tương tác ngay trên bàn chơi."
      : "Tắt nếu bạn muốn vào thẳng màn chính mà không hiện hướng dẫn.";
  }

  if (refs.endTutorialModeHint) {
    refs.endTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván sau sẽ tiếp tục hiện màn hướng dẫn ở từng giai đoạn."
      : "Ván sau sẽ bỏ qua các màn hướng dẫn giai đoạn.";
  }

  if (refs.confirmTutorialModeHint) {
    refs.confirmTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván chơi lại sẽ hiện hướng dẫn ở các giai đoạn."
      : "Ván chơi lại sẽ bỏ qua các màn hướng dẫn.";
  }
}

function refreshTutorialModeUI() {
  if (!refs.tutorialModeBtn) {
    return;
  }

  const buttons = [refs.tutorialModeBtn, refs.endTutorialModeBtn, refs.confirmTutorialModeBtn].filter(Boolean);
  const pressed = state.tutorialEnabled ? "true" : "false";
  const checked = state.tutorialEnabled ? "true" : "false";
  const label = state.tutorialEnabled ? "Tắt chế độ hướng dẫn" : "Bật chế độ hướng dẫn";

  document.querySelectorAll(".tutorial-toggle-copy strong").forEach((node) => {
    node.textContent = "Chế độ hướng dẫn";
  });

  buttons.forEach((button) => {
    button.innerHTML = '<span class="tutorial-toggle-btn__track"><span class="tutorial-toggle-btn__thumb"></span></span>';
    button.setAttribute("role", "switch");
    button.setAttribute("aria-pressed", pressed);
    button.setAttribute("aria-checked", checked);
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-off", !state.tutorialEnabled);
  });

  if (refs.tutorialModeHint) {
    refs.tutorialModeHint.textContent = state.tutorialEnabled
      ? "Mỗi giai đoạn sẽ có màn hướng dẫn tương tác ngay trên bàn chơi."
      : "Tắt nếu bạn muốn vào thẳng màn chính mà không hiện hướng dẫn.";
  }

  if (refs.endTutorialModeHint) {
    refs.endTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván sau sẽ tiếp tục hiện màn hướng dẫn ở từng giai đoạn."
      : "Ván sau sẽ bỏ qua các màn hướng dẫn giai đoạn.";
  }

  if (refs.confirmTutorialModeHint) {
    refs.confirmTutorialModeHint.textContent = state.tutorialEnabled
      ? "Ván chơi lại sẽ hiện hướng dẫn ở các giai đoạn."
      : "Ván chơi lại sẽ bỏ qua các màn hướng dẫn.";
  }
}

function resetTutorialProgress() {
  state.tutorialShownStages = {};
  state.tutorialPendingTimerStart = false;
  state.tutorialPendingResume = false;
  state.guidanceClockFrozen = false;
  state.guidanceClockRemainingMs = 0;
  state.guidancePauseStartedAt = 0;
  state.guidanceFeverRemainingMs = 0;
  state.feverInfoShown = false;
  state.pendingSolvedAdvance = false;
  setTutorialVisualState(false);
  clearStageIntroTimer();
  clearTutorialStageBannerTimer();
  clearTutorialIdleTimer();
  hideScreenFlash();
  clearTutorialDemoTimers();
  hideTutorialHint();
  if (refs.stageIntroOverlay) {
    showOverlay(refs.stageIntroOverlay, false);
  }
  if (refs.tutorialStageBannerOverlay) {
    showOverlay(refs.tutorialStageBannerOverlay, false);
  }
  if (refs.feverInfoOverlay) {
    showOverlay(refs.feverInfoOverlay, false);
  }
  if (refs.tutorialOverlay) {
    showOverlay(refs.tutorialOverlay, false);
  }
}

function clearStageIntroTimer() {
  if (state.stageIntroHandle) {
    window.clearTimeout(state.stageIntroHandle);
    state.stageIntroHandle = null;
  }
}

function clearTutorialStageBannerTimer() {
  if (state.tutorialStageBannerHandle) {
    window.clearTimeout(state.tutorialStageBannerHandle);
    state.tutorialStageBannerHandle = null;
  }
}

function clearTutorialIdleTimer() {
  if (state.tutorialIdleHandle) {
    window.clearTimeout(state.tutorialIdleHandle);
    state.tutorialIdleHandle = null;
  }
}

function clearScreenFlashTimer() {
  if (state.screenFlashHandle) {
    window.clearTimeout(state.screenFlashHandle);
    state.screenFlashHandle = null;
  }
}

function requestGraphFrameSync() {
  if (state.graphFrameSyncHandle) {
    window.cancelAnimationFrame(state.graphFrameSyncHandle);
  }
  state.graphFrameSyncHandle = window.requestAnimationFrame(() => {
    state.graphFrameSyncHandle = 0;
    syncGraphFrameHeight();
  });
}

function syncGraphFrameHeight() {
  if (!refs.graphPanel || !refs.graphFrame) {
    return;
  }
  refs.graphPanel.style.height = "";
  refs.graphFrame.style.height = "";
}

function hideScreenFlash() {
  clearScreenFlashTimer();
  if (!refs.screenFlashOverlay) {
    return;
  }
  refs.screenFlashOverlay.classList.remove("is-visible");
  refs.screenFlashOverlay.setAttribute("aria-hidden", "true");
}

function playScreenFlash(onComplete) {
  if (!refs.screenFlashOverlay) {
    if (typeof onComplete === "function") {
      onComplete();
    }
    return;
  }

  clearScreenFlashTimer();
  refs.screenFlashOverlay.classList.add("is-visible");
  refs.screenFlashOverlay.setAttribute("aria-hidden", "false");
  state.screenFlashHandle = window.setTimeout(() => {
    state.screenFlashHandle = null;
    refs.screenFlashOverlay.classList.remove("is-visible");
    refs.screenFlashOverlay.setAttribute("aria-hidden", "true");
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, TUTORIAL_EXIT_FLASH_MS);
}

function setTutorialVisualState(active) {
  refs.body.classList.toggle("tutorial-active", Boolean(active));
}

function clearTutorialDemoTimers() {
  state.tutorialDemoTimeouts.forEach((handle) => window.clearTimeout(handle));
  state.tutorialDemoTimeouts = [];
}

function queueTutorialTimeout(callback, delay) {
  const handle = window.setTimeout(() => {
    state.tutorialDemoTimeouts = state.tutorialDemoTimeouts.filter((item) => item !== handle);
    callback();
  }, delay);
  state.tutorialDemoTimeouts.push(handle);
  return handle;
}

function isFirstLevelOfStage(index) {
  return index === 0 || getStageForIndex(index) !== getStageForIndex(index - 1);
}

function isTutorialLevel(level = state.currentLevel) {
  return Boolean(level && level.isTutorial);
}

function getRemainingTimeMs() {
  if (state.isPaused) {
    return state.pausedRemainingMs;
  }
  if (state.guidanceClockFrozen) {
    return state.guidanceClockRemainingMs;
  }
  return Math.max(0, state.deadline - Date.now());
}

function freezeClockForGuidance() {
  if (state.guidanceClockFrozen) {
    return;
  }
  const now = Date.now();
  state.guidanceClockRemainingMs = Math.max(0, state.deadline - now);
  state.guidancePauseStartedAt = now;
  state.guidanceFeverRemainingMs = Math.max(0, state.feverUntil - now);
  state.feverUntil = 0;
  state.guidanceClockFrozen = true;
  clearTimer();
  updateHud(state.guidanceClockRemainingMs);
}

function resumeClockAfterGuidance() {
  if (!state.guidanceClockFrozen) {
    if (state.running && !state.isPaused && !state.timerHandle) {
      startTimerLoop();
    }
    return;
  }

  const remainingMs = state.guidanceClockRemainingMs;
  const pauseDuration = state.guidancePauseStartedAt ? Date.now() - state.guidancePauseStartedAt : 0;
  state.recentSolveTimes = state.recentSolveTimes.map((time) => time + pauseDuration);
  state.guidanceClockFrozen = false;
  state.guidanceClockRemainingMs = 0;
  state.guidancePauseStartedAt = 0;
  state.deadline = Date.now() + remainingMs;
  state.feverUntil = state.guidanceFeverRemainingMs > 0 ? Date.now() + state.guidanceFeverRemainingMs : 0;
  state.guidanceFeverRemainingMs = 0;
  updateHud(remainingMs);

  if (state.running && !state.isPaused) {
    startTimerLoop();
  }
}

function createTutorialLevel(stage) {
  const stageMeta = STAGE_META[stage];
  const tutorial = TUTORIAL_STAGE_DATA[stage];
  if (!stageMeta || !tutorial) {
    return createRandomLevel(stage);
  }

  return {
    id: `T-${stage}-${Date.now()}-${Math.random()}`,
    stage,
    formula: tutorial.formula,
    slots: Object.keys(tutorial.solution),
    prompt: tutorial.prompt,
    targets: tutorial.targets.map((target) => ({ ...target })),
    gate: tutorial.gate ? { ...tutorial.gate } : undefined,
    isTutorial: true,
    tutorialLead: tutorial.lead,
    tutorialSteps: tutorial.steps.map((step) => ({ ...step })),
    solution: { ...tutorial.solution },
    baseScore: 0
  };
}

function updateFeverInfoCopy() {
  if (refs.feverInfoLead) {
    refs.feverInfoLead.textContent = "";
  }
  if (refs.feverInfoDuration) {
    refs.feverInfoDuration.textContent = `Fever kéo dài ${FEVER_DURATION_MS / 1000} giây.`;
  }
}

function showStageIntro(stage, onComplete) {
  const stageMeta = STAGE_META[stage];
  if (!stageMeta || !refs.stageIntroOverlay) {
    if (typeof onComplete === "function") {
      onComplete();
    }
    return;
  }

  clearStageIntroTimer();
  refs.stageIntroTitle.textContent = stageMeta.title.toUpperCase();
  refs.stageIntroSubtitle.textContent = stageMeta.name;
  refs.stageIntroLead.textContent = state.tutorialEnabled && !state.tutorialShownStages[stage]
    ? `${stageMeta.description} Màn hướng dẫn ngắn sẽ xuất hiện ngay sau đây.`
    : stageMeta.description;
  showOverlay(refs.stageIntroOverlay, true);

  state.stageIntroHandle = window.setTimeout(() => {
    state.stageIntroHandle = null;
    showOverlay(refs.stageIntroOverlay, false);
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, STAGE_INTRO_DURATION_MS);
}

function beginStageSequence(stage, options = {}) {
  const { freezeClock = true } = options;

  clearStageIntroTimer();
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  setTutorialVisualState(false);
  audioSystem.pauseMusic();

  if (freezeClock) {
    freezeClockForGuidance();
  }

  showStageIntro(stage, () => {
    if (!state.running || state.currentLevelIndex >= LEVEL_COUNT) {
      return;
    }
    finishStageSequence(stage);
  });
}

function finishStageSequence(stage) {
  const stageMeta = STAGE_META[stage];
  const shouldRunTutorial = state.tutorialEnabled && !state.tutorialShownStages[stage];

  if (shouldRunTutorial) {
    state.tutorialShownStages[stage] = true;
    state.currentLevel = createTutorialLevel(stage);
    setTutorialVisualState(true);
    renderLevel();
    updateHud(getRemainingTimeMs());
    setStatus(`Màn hướng dẫn ${stageMeta.title.toLowerCase()} đã sẵn sàng. Hãy kéo số đúng vào phương trình.`, "neutral");
    scheduleTutorialHint(260);
    return;
  }

  state.currentLevel = createRandomLevel(stage);
  setTutorialVisualState(false);
  renderLevel();
  updateHud(getRemainingTimeMs());
  resumeClockAfterGuidance();

  if (stage === 1) {
    setStatus(`90 giây bắt đầu cho ${formatPlayerName(state.playerName)}. Kéo số để tìm quỹ đạo đường bắn.`, "neutral");
  } else {
    setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Kéo số để giải màn chính.`, "neutral");
  }
}

function hideTutorialHint() {
  refs.formulaArea.querySelectorAll(".tutorial-drop-target").forEach((slot) => {
    slot.classList.remove("tutorial-drop-target");
  });

  if (refs.tutorialHintBubble) {
    refs.tutorialHintBubble.classList.remove("is-visible");
    refs.tutorialHintBubble.style.left = "";
    refs.tutorialHintBubble.style.top = "";
    refs.tutorialHintBubble.style.setProperty("--tutorial-hint-arrow-offset", "50%");
  }

  if (refs.tutorialHintGhost) {
    refs.tutorialHintGhost.classList.remove("is-visible", "is-animating");
    refs.tutorialHintGhost.style.transform = "translate(-999px, -999px)";
  }

  if (!refs.tutorialHintLayer) {
    return;
  }

  refs.tutorialHintLayer.classList.remove("is-visible");
  refs.tutorialHintLayer.setAttribute("aria-hidden", "true");
}

function shouldShowTutorialHint() {
  return state.running && !state.isPaused && state.tutorialEnabled && isTutorialLevel() && Boolean(refs.tutorialHintLayer);
}

function findPaletteChipByValue(value) {
  return refs.palette.querySelector(`[data-value="${String(value)}"]`);
}

function getCurrentTutorialStep(level = getCurrentLevel()) {
  if (!level || !level.tutorialSteps) {
    return null;
  }

  return level.tutorialSteps.find((step) => state.placements[step.slot] !== step.value) || null;
}

function scheduleTutorialHint(delay = TUTORIAL_IDLE_DELAY_MS) {
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();

  if (!shouldShowTutorialHint()) {
    return;
  }

  state.tutorialIdleHandle = window.setTimeout(() => {
    state.tutorialIdleHandle = null;
    if (!shouldShowTutorialHint()) {
      return;
    }
    if (state.drag) {
      scheduleTutorialHint(420);
      return;
    }
    runTutorialHintCycle();
  }, delay);
}

function noteTutorialInteraction() {
  if (!shouldShowTutorialHint()) {
    return;
  }
  scheduleTutorialHint();
}

function runTutorialHintCycle() {
  clearTutorialDemoTimers();

  if (!shouldShowTutorialHint()) {
    return;
  }

  const step = getCurrentTutorialStep();
  if (!step) {
    hideTutorialHint();
    return;
  }

  const sourceChip = findPaletteChipByValue(step.sourceValue !== undefined ? step.sourceValue : step.value);
  const targetSlot = refs.formulaArea.querySelector(`[data-slot="${step.slot}"]`);
  if (!sourceChip || !targetSlot || !refs.tutorialHintGhost || !refs.tutorialHintBubble) {
    scheduleTutorialHint(260);
    return;
  }

  refs.tutorialHintText.textContent = step.message;
  refs.tutorialHintGhost.textContent = formatNumber(step.value);
  refs.tutorialHintLayer.classList.add("is-visible");
  refs.tutorialHintLayer.setAttribute("aria-hidden", "false");
  refs.tutorialHintBubble.classList.add("is-visible");
  targetSlot.classList.add("tutorial-drop-target");
  positionTutorialHintBubble(sourceChip);
  placeTutorialHintGhost(sourceChip, false);
  refs.tutorialHintGhost.classList.add("is-visible");

  queueTutorialTimeout(() => {
    placeTutorialHintGhost(targetSlot, true);
  }, 70);

  queueTutorialTimeout(() => {
    if (!shouldShowTutorialHint() || state.drag) {
      return;
    }
    runTutorialHintCycle();
  }, TUTORIAL_HINT_RESTART_MS);
}

function positionTutorialHintBubble(sourceChip) {
  if (!refs.tutorialHintBubble) {
    return;
  }

  const chipRect = sourceChip.getBoundingClientRect();
  const bubbleWidth = refs.tutorialHintBubble.offsetWidth || 300;
  const chipCenter = chipRect.left + chipRect.width / 2;
  const top = Math.max(12, chipRect.top - 92);
  const left = clamp(chipCenter - bubbleWidth / 2, 8, window.innerWidth - bubbleWidth - 8);
  const arrowOffset = clamp(chipCenter - left, 24, bubbleWidth - 24);

  refs.tutorialHintBubble.style.left = `${left}px`;
  refs.tutorialHintBubble.style.top = `${top}px`;
  refs.tutorialHintBubble.style.setProperty("--tutorial-hint-arrow-offset", `${arrowOffset}px`);
}

function placeTutorialHintGhost(targetEl, animate) {
  if (!refs.tutorialHintGhost) {
    return;
  }

  const targetRect = targetEl.getBoundingClientRect();
  const ghostRect = refs.tutorialHintGhost.getBoundingClientRect();
  const x = targetRect.left + targetRect.width / 2 - ghostRect.width / 2;
  const y = targetRect.top + targetRect.height / 2 - ghostRect.height / 2;

  refs.tutorialHintGhost.classList.toggle("is-animating", animate);
  if (!animate) {
    refs.tutorialHintGhost.style.transform = `translate(${x}px, ${y}px)`;
    void refs.tutorialHintGhost.getBoundingClientRect();
    return;
  }
  refs.tutorialHintGhost.style.transform = `translate(${x}px, ${y}px)`;
}

function openFeverInfoOverlay() {
  updateFeverInfoCopy();
  hideTutorialHint();
  showOverlay(refs.feverInfoOverlay, true);
}

async function closeFeverInfoOverlay() {
  showOverlay(refs.feverInfoOverlay, false);
  if (state.isPaused) {
    await resumeGame();
  }
  if (state.pendingSolvedAdvance) {
    state.pendingSolvedAdvance = false;
    continueSolvedAdvance();
  }
}

function closeTutorialOverlay() {
  if (refs.tutorialOverlay) {
    showOverlay(refs.tutorialOverlay, false);
  }
}

function openNameOverlay() {
  clearCountdown();
  resetConfirmState();
  clearStageIntroTimer();
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  refs.nameError.classList.remove("is-visible");
  refs.nameError.textContent = "Hãy nhập tên trước khi bắt đầu.";
  refs.playerNameInput.value = "";
  refreshTutorialModeUI();

  showOverlay(refs.startOverlay, false);
  showOverlay(refs.endOverlay, false);
  showOverlay(refs.pauseOverlay, false);
  showOverlay(refs.leaderboardOverlay, false);
  showOverlay(refs.confirmOverlay, false);
  showOverlay(refs.countdownOverlay, false);
  showOverlay(refs.stageIntroOverlay, false);
  showOverlay(refs.tutorialStageBannerOverlay, false);
  showOverlay(refs.feverInfoOverlay, false);
  hideScreenFlash();
  showOverlay(refs.tutorialOverlay, false);
  setTutorialVisualState(false);
  showOverlay(refs.nameOverlay, true);

  window.setTimeout(() => {
    refs.playerNameInput.focus();
    refs.playerNameInput.select();
  }, 0);
}

async function confirmPlayerAndStart() {
  const playerName = refs.playerNameInput.value.trim();
  if (!playerName) {
    refs.nameError.classList.add("is-visible");
    refs.nameError.textContent = "Bạn phải nhập tên thì mới bắt đầu được.";
    refs.playerNameInput.focus();
    return;
  }

  state.playerName = playerName;
  refs.nameError.classList.remove("is-visible");
  showOverlay(refs.nameOverlay, false);
  await audioSystem.unlock();
  beginCountdown();
}

function confirmRestartCurrentGame() {
  if (!state.playerName) {
    openNameOverlay();
    return;
  }
  requestConfirmation({
    title: "Chơi lại ván này?",
    message: "Tiến trình hiện tại sẽ được làm mới và trò chơi sẽ quay về đếm ngược 3 giây.",
    acceptLabel: "Chơi lại",
    acceptTone: "primary",
    resumeOnCancel: state.running,
    onConfirm: restartWithCurrentPlayer
  });
  if (refs.confirmTutorialToggleCard) {
    refs.confirmTutorialToggleCard.classList.remove("is-hidden");
  }
  refreshTutorialModeUI();
}

function confirmRestartAfterFinish() {
  if (!state.playerName) {
    openNameOverlay();
    return;
  }

  requestConfirmation({
    title: "Chơi lại ván mới?",
    message: "Bạn sẽ quay về đếm ngược 3 giây và bắt đầu lại từ giai đoạn 1.",
    acceptLabel: "Chơi lại",
    acceptTone: "primary",
    resumeOnCancel: false,
    returnOverlay: refs.endOverlay,
    onConfirm: restartWithCurrentPlayer
  });
  if (refs.confirmTutorialToggleCard) {
    refs.confirmTutorialToggleCard.classList.remove("is-hidden");
  }
  refreshTutorialModeUI();
}

async function restartWithCurrentPlayer() {
  if (!state.playerName) {
    openNameOverlay();
    return;
  }
  await audioSystem.unlock();
  prepareReplayCountdown();
}

function confirmExitToStart(returnOverlay = null) {
  const targetOverlay = returnOverlay && typeof returnOverlay === "object" && "nodeType" in returnOverlay
    ? returnOverlay
    : null;
  requestConfirmation({
    title: "Thoát về màn hình đầu?",
    message: "Tiến trình hiện tại sẽ kết thúc và bạn sẽ quay lại trang bắt đầu.",
    acceptLabel: "Thoát",
    acceptTone: "danger",
    resumeOnCancel: state.running,
    returnOverlay: targetOverlay,
    onConfirm: returnToStart
  });
  if (refs.confirmTutorialToggleCard) {
    refs.confirmTutorialToggleCard.classList.add("is-hidden");
  }
}

function prepareReplayCountdown() {
  clearTimer();
  cancelDrag();
  clearCountdown();
  hideScoreBanner();
  resetConfirmState();
  resetTutorialProgress();
  audioSystem.stopMusic();

  state.running = false;
  state.isPaused = false;
  state.pauseStartedAt = 0;
  state.pausedRemainingMs = 0;
  state.pausedFeverMs = 0;
  state.lockAdvance = false;

  refs.pauseBtn.textContent = "Tạm dừng";
  showOverlay(refs.startOverlay, false);
  showOverlay(refs.nameOverlay, false);
  showOverlay(refs.endOverlay, false);
  showOverlay(refs.pauseOverlay, false);
  showOverlay(refs.leaderboardOverlay, false);
  showOverlay(refs.countdownOverlay, false);
  setStatus(`Chuẩn bị chơi lại cho ${formatPlayerName(state.playerName)}.`, "neutral");
  beginCountdown();
}

function requestConfirmation({
  title,
  message,
  acceptLabel,
  acceptTone = "primary",
  resumeOnCancel = false,
  returnOverlay = null,
  onConfirm
}) {
  if (resumeOnCancel && state.running) {
    pauseGame({ showPauseOverlay: false, updateStatusLine: false });
  }

  if (returnOverlay) {
    showOverlay(returnOverlay, false);
  }

  state.pendingConfirmAction = onConfirm;
  state.confirmResumeOnCancel = resumeOnCancel;
  state.confirmReturnOverlay = returnOverlay;

  refs.confirmKicker.textContent = "Xác nhận";
  refs.confirmTitle.textContent = title;
  refs.confirmMessage.textContent = message;
  refs.confirmAcceptBtn.textContent = acceptLabel;
  refs.confirmAcceptBtn.classList.toggle("danger-btn", acceptTone === "danger");
  showOverlay(refs.confirmOverlay, true);
}

function closeConfirmOverlay(confirmed) {
  const pendingAction = state.pendingConfirmAction;
  const shouldResume = state.confirmResumeOnCancel;
  const returnOverlay = state.confirmReturnOverlay;

  resetConfirmState();

  if (confirmed) {
    if (typeof pendingAction === "function") {
      pendingAction();
    }
    return;
  }

  if (returnOverlay) {
    showOverlay(returnOverlay, true);
  }

  if (shouldResume && state.isPaused) {
    resumeGame();
  }
}

function resetConfirmState() {
  state.pendingConfirmAction = null;
  state.confirmResumeOnCancel = false;
  state.confirmReturnOverlay = null;
  if (refs.confirmTutorialToggleCard) {
    refs.confirmTutorialToggleCard.classList.add("is-hidden");
  }
  if (refs.confirmAcceptBtn) {
    refs.confirmAcceptBtn.classList.remove("danger-btn");
    refs.confirmAcceptBtn.textContent = "Xác nhận";
  }
  if (refs.confirmOverlay) {
    showOverlay(refs.confirmOverlay, false);
  }
}

function beginCountdown() {
  clearCountdown();
  resetConfirmState();
  audioSystem.stopMusic();
  showOverlay(refs.countdownOverlay, true);
  refs.countdownName.innerHTML = `Người chơi: ${formatPlayerName(state.playerName)}`;

  const steps = ["3", "2", "1", "Bắt đầu!"];
  let index = 0;

  const tick = () => {
    const cue = steps[index];
    refs.countdownValue.textContent = cue;
    audioSystem.playCountdownCue(cue);
    if (index === steps.length - 1) {
      state.countdownHandle = window.setTimeout(() => {
        showOverlay(refs.countdownOverlay, false);
        startGame();
      }, 650);
      return;
    }

    index += 1;
    state.countdownHandle = window.setTimeout(tick, 1000);
  };

  tick();
}

function clearCountdown() {
  if (state.countdownHandle) {
    window.clearTimeout(state.countdownHandle);
    state.countdownHandle = null;
  }
}

function startGame() {
  clearTimer();
  cancelDrag();
  clearCountdown();
  hideScoreBanner();
  resetConfirmState();
  resetTutorialProgress();

  state.started = true;
  state.running = true;
  state.isPaused = false;
  state.currentLevelIndex = 0;
  state.currentLevel = null;
  state.placements = {};
  state.score = 0;
  state.solvedCount = 0;
  state.pausedRemainingMs = 0;
  state.pausedFeverMs = 0;
  state.pauseStartedAt = 0;
  state.recentSolveTimes = [];
  state.feverUntil = 0;
  state.lockAdvance = false;
  state.ignoreSlotClickUntil = 0;
  state.deadline = Date.now() + GAME_DURATION_SECONDS * 1000;

  showOverlay(refs.startOverlay, false);
  showOverlay(refs.nameOverlay, false);
  showOverlay(refs.endOverlay, false);
  showOverlay(refs.pauseOverlay, false);
  showOverlay(refs.leaderboardOverlay, false);
  showOverlay(refs.confirmOverlay, false);
  showOverlay(refs.countdownOverlay, false);
  showOverlay(refs.stageIntroOverlay, false);
  showOverlay(refs.tutorialStageBannerOverlay, false);
  showOverlay(refs.feverInfoOverlay, false);
  hideScreenFlash();
  refs.pauseBtn.textContent = "Tạm dừng";
  setStatus(`120 giây bắt đầu cho ${formatPlayerName(state.playerName)}. Kéo số để tìm quỹ đạo đường bắn.`, "neutral");
  updateHud(GAME_DURATION_SECONDS * 1000);
  beginStageSequence(getStageForIndex(0), { freezeClock: true });
}

function startTimerLoop() {
  if (state.guidanceClockFrozen || state.isPaused || !state.running) {
    return;
  }
  clearTimer();
  state.timerHandle = window.setInterval(() => {
    const remainingMs = getRemainingTimeMs();
    trimRecentSolveTimes();
    updateHud(remainingMs);
    if (remainingMs <= 0) {
      endGame(false);
    }
  }, 100);
}

function returnToStart() {
  clearTimer();
  cancelDrag();
  clearCountdown();
  hideScoreBanner();
  resetConfirmState();
  resetTutorialProgress();
  audioSystem.stopMusic();

  state.started = false;
  state.running = false;
  state.isPaused = false;
  state.currentLevelIndex = 0;
  state.currentLevel = createRandomLevel(getStageForIndex(0));
  state.placements = {};
  state.score = 0;
  state.solvedCount = 0;
  state.pausedRemainingMs = 0;
  state.pausedFeverMs = 0;
  state.pauseStartedAt = 0;
  state.recentSolveTimes = [];
  state.feverUntil = 0;
  state.lockAdvance = false;
  state.ignoreSlotClickUntil = 0;
  state.deadline = Date.now() + GAME_DURATION_SECONDS * 1000;

  renderLevel();
  refreshStartScreen();
  updateHud(GAME_DURATION_SECONDS * 1000);
  refs.pauseBtn.textContent = "Tạm dừng";
  setStatus("Nhấn Bắt đầu để chơi.", "neutral");
  showOverlay(refs.endOverlay, false);
  showOverlay(refs.nameOverlay, false);
  showOverlay(refs.pauseOverlay, false);
  showOverlay(refs.leaderboardOverlay, false);
  showOverlay(refs.confirmOverlay, false);
  showOverlay(refs.countdownOverlay, false);
  showOverlay(refs.stageIntroOverlay, false);
  showOverlay(refs.tutorialStageBannerOverlay, false);
  showOverlay(refs.tutorialOverlay, false);
  showOverlay(refs.startOverlay, true);
}

function openLeaderboardOverlay(source = "start") {
  renderLeaderboard();
  showOverlay(refs.leaderboardOverlay, true);
  refs.leaderboardOverlay.dataset.source = source;
}

function closeLeaderboardOverlay() {
  const source = refs.leaderboardOverlay.dataset.source || "start";
  showOverlay(refs.leaderboardOverlay, false);

  if (source === "end" && refs.endOverlay.getAttribute("aria-hidden") === "false") {
    showOverlay(refs.endOverlay, true);
    return;
  }

  if (refs.nameOverlay.getAttribute("aria-hidden") === "false") {
    showOverlay(refs.nameOverlay, true);
    return;
  }

  showOverlay(refs.startOverlay, true);
}

function refreshStartScreen() {
  const topEntry = state.leaderboard[0];
  refs.recordScore.textContent = topEntry ? String(topEntry.score) : "0";
  refs.recordOwner.innerHTML = topEntry
    ? `${formatPlayerName(topEntry.name)} đang giữ vị trí số 1 với thời gian hoàn thành ${formatTimeMs(topEntry.completionMs)}`
    : "Chưa có người giữ kỷ lục";
}

function renderLeaderboard() {
  if (!refs.leaderboardList) {
    return;
  }

  refs.leaderboardList.innerHTML = "";
  if (state.leaderboard.length === 0) {
    const empty = document.createElement("li");
    empty.className = "leaderboard-empty";
    empty.textContent = "Chưa có điểm nào được lưu. Hãy trở thành người đầu tiên lên bảng xếp hạng.";
    refs.leaderboardList.appendChild(empty);
    return;
  }

  state.leaderboard.forEach((entry, index) => {
    const item = document.createElement("li");
    item.className = "leaderboard-item";
    item.innerHTML = `
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-name">${escapeHtml(entry.name)}</span>
      <span class="leaderboard-score">${entry.score}</span>
      <span class="leaderboard-time">${formatTimeMs(entry.completionMs)}</span>
    `;
    refs.leaderboardList.appendChild(item);
  });
}

function loadLeaderboard() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return normalizeLeaderboardEntries(parsed).slice(0, 10);
  } catch {
    return [];
  }
}

function saveLeaderboard(entries) {
  state.leaderboard = entries;
  try {
    window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
  } catch {
    // Bỏ qua lỗi localStorage để game vẫn chơi được.
  }
}

function updateLeaderboard(name, score, completionMs) {
  const normalizedName = normalizeName(name);
  if (!normalizedName) {
    return { rank: null, kept: false, improved: false };
  }

  const existingBest = state.leaderboard.find((entry) => normalizeName(entry.name) === normalizedName);
  const entries = normalizeLeaderboardEntries([
    ...state.leaderboard,
    { name, score, completionMs, elapsedMs: completionMs, updatedAt: Date.now() }
  ]).slice(0, 10);

  saveLeaderboard(entries);

  const keptEntry = entries.find((entry) => normalizeName(entry.name) === normalizedName);
  const existingBestCompletionMs = existingBest
    ? Number.isFinite(Number(existingBest.completionMs))
      ? Number(existingBest.completionMs)
      : Number(existingBest.elapsedMs)
    : completionMs;
  return {
    rank: keptEntry ? entries.indexOf(keptEntry) + 1 : null,
    kept: Boolean(keptEntry),
    improved: !existingBest || score > existingBest.score || (score === existingBest.score && completionMs < existingBestCompletionMs),
    bestScore: keptEntry ? keptEntry.score : existingBest ? existingBest.score : score,
    bestElapsedMs: keptEntry ? keptEntry.elapsedMs : existingBestCompletionMs,
    bestCompletionMs: keptEntry ? keptEntry.completionMs : existingBestCompletionMs
  };
}

function normalizeLeaderboardEntries(entries) {
  const bestByName = new Map();

  entries.forEach((entry) => {
    const name = typeof entry.name === "string" ? entry.name.trim() : "";
    const score = Number(entry.score);
    if (!name || !Number.isFinite(score)) {
      return;
    }

    const key = normalizeName(name);
    const current = bestByName.get(key);
    const completionMs = Number(entry.completionMs);
    const elapsedMs = Number(entry.elapsedMs);
    const normalizedCompletionMs = clamp(
      Number.isFinite(completionMs)
        ? completionMs
        : Number.isFinite(elapsedMs)
          ? GAME_DURATION_SECONDS * 1000 - elapsedMs
          : GAME_DURATION_SECONDS * 1000,
      0,
      GAME_DURATION_SECONDS * 1000
    );
    const candidate = {
      name,
      score: Math.max(0, Math.round(score)),
      elapsedMs: normalizedCompletionMs,
      completionMs: normalizedCompletionMs,
      updatedAt: Number(entry.updatedAt) || Date.now()
    };

    if (
      !current ||
      candidate.score > current.score ||
      (candidate.score === current.score && candidate.completionMs < current.completionMs) ||
      (candidate.score === current.score && candidate.completionMs === current.completionMs && candidate.updatedAt < current.updatedAt)
    ) {
      bestByName.set(key, candidate);
    }
  });

  return Array.from(bestByName.values())
    .sort((a, b) => b.score - a.score || a.completionMs - b.completionMs || a.updatedAt - b.updatedAt);
}

function buildLeaderboardSummary(result) {
  if (!state.playerName) {
    return "";
  }
  if (result.kept && result.rank) {
    return `${formatPlayerName(state.playerName)} hiện đứng hạng #${result.rank} với ${result.bestScore} điểm và hoàn thành trong ${formatTimeMs(result.bestCompletionMs)}.`;
  }
  return `${formatPlayerName(state.playerName)} chưa vào được Top 10 lần này.`;
}

function normalizeName(name) {
  return name.trim().toLocaleLowerCase("vi-VN");
}

function togglePause() {
  if (state.isPaused) {
    resumeGame();
    return;
  }
  pauseGame();
}

function pauseGame(options = {}) {
  if (!state.running) {
    return;
  }

  const { showPauseOverlay = true, updateStatusLine = true } = options;

  state.pausedRemainingMs = getRemainingTimeMs();
  state.pausedFeverMs = state.guidanceClockFrozen
    ? state.guidanceFeverRemainingMs
    : Math.max(0, state.feverUntil - Date.now());
  state.pauseStartedAt = Date.now();
  state.running = false;
  state.isPaused = true;
  state.feverUntil = 0;

  clearTimer();
  cancelDrag();
  clearStageIntroTimer();
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  audioSystem.pauseMusic();
  updateHud(state.pausedRemainingMs);
  refs.pauseBtn.textContent = "Tiếp tục";
  if (updateStatusLine) {
    setStatus("Trò chơi đang tạm dừng.", "neutral");
  }
  if (showPauseOverlay) {
    showOverlay(refs.pauseOverlay, true);
  }
}

async function resumeGame() {
  if (!state.isPaused) {
    return;
  }

  await audioSystem.unlock();

  const pauseDuration = state.pauseStartedAt ? Date.now() - state.pauseStartedAt : 0;
  state.recentSolveTimes = state.recentSolveTimes.map((time) => time + pauseDuration);
  state.deadline = Date.now() + state.pausedRemainingMs;
  state.feverUntil = state.pausedFeverMs > 0 ? Date.now() + state.pausedFeverMs : 0;
  state.running = true;
  state.isPaused = false;
  state.pauseStartedAt = 0;
  if (state.guidanceClockFrozen) {
    state.guidanceClockRemainingMs = state.pausedRemainingMs;
    state.guidanceFeverRemainingMs = state.pausedFeverMs;
  }

  showOverlay(refs.pauseOverlay, false);
  refs.pauseBtn.textContent = "Tạm dừng";
  setStatus("Đã tiếp tục.", "neutral");
  updateHud(getRemainingTimeMs());
  audioSystem.syncMusic({ running: true, fever: isFeverActive() });
  if (!state.guidanceClockFrozen) {
    startTimerLoop();
  } else if (isTutorialLevel()) {
    scheduleTutorialHint(420);
  }
}

function endGame(clearedAll) {
  if (!state.running) {
    return;
  }

  const remainingMs = getRemainingTimeMs();
  const completionMs = getCompletionTimeMs(remainingMs);
  state.running = false;
  state.isPaused = false;
  state.pauseStartedAt = 0;
  state.finalCompletionMs = completionMs;
  clearTimer();
  cancelDrag();
  hideScoreBanner();
  audioSystem.stopMusic();
  resetTutorialProgress();
  trimRecentSolveTimes();
  updateHud(0);
  const leaderboardResult = updateLeaderboard(state.playerName, state.score, completionMs);
  renderLeaderboard();
  refreshStartScreen();

  refs.endTitle.textContent = clearedAll ? "HOÀN THÀNH" : "HẾT GIỜ";
  const baseSummary = clearedAll
    ? "Bạn đã chinh phục đủ cả 3 giai đoạn trước khi hết thời gian. Có thể nhấn chơi lại để đạt điểm cao hơn."
    : "Thời gian đã hết. Nhấn chơi lại, thử tối ưu combo và về đích nhanh hơn.";
  refs.endSummary.innerHTML = `${baseSummary} ${buildLeaderboardSummary(leaderboardResult)}`.trim();
  refs.finalScore.textContent = String(state.score);
  refs.finalSolved.textContent = `${state.solvedCount} / ${LEVEL_COUNT}`;
  refs.finalTime.textContent = formatTimeMs(completionMs);

  refs.pauseBtn.textContent = "Tạm dừng";
  showOverlay(refs.pauseOverlay, false);
  showOverlay(refs.confirmOverlay, false);
  showOverlay(refs.endOverlay, true);
}

function clearTimer() {
  if (state.timerHandle) {
    window.clearInterval(state.timerHandle);
    state.timerHandle = null;
  }
}

function renderPalette() {
  refs.palette.innerHTML = "";
  VALUE_BANK.forEach((value) => {
    const chip = document.createElement("div");
    chip.className = "number-chip";
    chip.dataset.value = String(value);
    chip.textContent = formatNumber(value);
    refs.palette.appendChild(chip);
  });
}

function renderLevel() {
  const level = getCurrentLevel();
  const stage = STAGE_META[level.stage];
  const tutorialLevel = isTutorialLevel(level);
  setTutorialVisualState(tutorialLevel);

  state.placements = {};
  state.lockAdvance = false;
  state.drag = null;

  refs.app.dataset.stage = String(level.stage);
  refs.levelBadge.textContent = `Màn ${state.currentLevelIndex + 1} / ${LEVEL_COUNT}`;
  refs.stageTitle.textContent = stage.title;
  refs.levelInstruction.textContent = level.prompt;
  if (tutorialLevel) {
    refs.levelBadge.textContent = `Hướng dẫn ${stage.title.toLowerCase()}`;
    refs.stageTitle.textContent = `${stage.title} - Hướng dẫn`;
  }

  refs.formulaArea.innerHTML = buildFormulaMarkup(level);
  syncFormulaSlots();
  renderDecorations(level);
  renderCurve();
  if (!tutorialLevel) {
    hideTutorialHint();
  }
  updateHud(getRemainingTimeMs());
  requestGraphFrameSync();
}

function buildFormulaMarkup(level) {
  if (level.formula === "linearOrigin") {
    return `
      <div class="formula-line">
        <span class="formula-token">y =</span>
        <button class="drop-slot" type="button" data-slot="a" aria-label="Ô hệ số a">a</button>
        <span class="formula-token">x</span>
      </div>
    `;
  }

  if (level.formula === "linear") {
    return `
      <div class="formula-line">
        <span class="formula-token">y =</span>
        <button class="drop-slot" type="button" data-slot="a" aria-label="Ô hệ số a">a</button>
        <span class="formula-token">x +</span>
        <button class="drop-slot" type="button" data-slot="b" aria-label="Ô hệ số b">b</button>
      </div>
    `;
  }

  return `
    <div class="formula-line">
      <span class="formula-token">y =</span>
      <button class="drop-slot" type="button" data-slot="a" aria-label="Ô hệ số a">a</button>
      <span class="formula-token">x<sup>2</sup></span>
    </div>
  `;
}

function syncFormulaSlots() {
  const slots = refs.formulaArea.querySelectorAll(".drop-slot");
  slots.forEach((slotEl) => {
    const slot = slotEl.dataset.slot;
    const value = state.placements[slot];
    const previewValue = state.drag && state.drag.hoveredSlot === slot ? state.drag.value : undefined;
    const shownValue = previewValue !== undefined ? previewValue : value;

    slotEl.classList.toggle("filled", value !== undefined);
    slotEl.classList.toggle("previewing", previewValue !== undefined);
    slotEl.textContent = shownValue !== undefined ? formatNumber(shownValue) : slot;
    slotEl.title = value !== undefined
      ? `Đang đặt ${slot} = ${formatNumber(value)}. Bấm để xóa riêng ô này.`
      : `Ô hệ số ${slot}. Kéo số vào đây.`;
  });

}

function buildGrid() {
  refs.gridLayer.innerHTML = "";

  for (let i = X_MIN; i <= X_MAX; i += 1) {
    const x = xToSvg(i);
    refs.gridLayer.appendChild(svgEl("line", {
      x1: x,
      y1: PLOT_TOP,
      x2: x,
      y2: PLOT_BOTTOM,
      class: i === 0 ? "axis-line" : "grid-line"
    }));
  }

  for (let i = Y_MIN; i <= Y_MAX; i += 1) {
    const y = yToSvg(i);
    refs.gridLayer.appendChild(svgEl("line", {
      x1: PLOT_LEFT,
      y1: y,
      x2: PLOT_RIGHT,
      y2: y,
      class: i === 0 ? "axis-line" : "grid-line"
    }));
  }

  for (let i = X_MIN; i <= X_MAX; i += 1) {
    if (i === 0) {
      continue;
    }
    const isMinTick = i === X_MIN;
    const isMaxTick = i === X_MAX;
    refs.gridLayer.appendChild(svgEl("text", {
      x: xToSvg(i) + (isMinTick ? 6 : isMaxTick ? -6 : 0),
      y: yToSvg(0) + 30,
      class: "tick-label",
      "text-anchor": isMinTick ? "start" : isMaxTick ? "end" : "middle"
    }, String(i)));
  }

  for (let i = Y_MIN; i <= Y_MAX; i += 1) {
    if (i === 0) {
      continue;
    }
    refs.gridLayer.appendChild(svgEl("text", {
      x: xToSvg(0) - 18,
      y: yToSvg(i) + 5,
      class: "tick-label",
      "text-anchor": "end"
    }, String(i)));
  }

  refs.gridLayer.appendChild(svgEl("text", {
    x: PLOT_RIGHT - 16,
    y: yToSvg(0) - 14,
    class: "axis-label",
    "text-anchor": "end"
  }, "x"));

  refs.gridLayer.appendChild(svgEl("text", {
    x: xToSvg(0) + 16,
    y: PLOT_TOP + 18,
    class: "axis-label"
  }, "y"));

  refs.gridLayer.appendChild(svgEl("text", {
    x: xToSvg(0) + 12,
    y: yToSvg(0) + 24,
    class: "axis-label"
  }, "O"));
}

function renderDecorations(level) {
  refs.decorLayer.innerHTML = "";

  if (level.gate) {
    renderGate(level.gate);
  }

  level.targets.forEach((target) => {
    renderTarget(target);
  });
}

function renderGate(gate) {
  const width = toSvgWidth(gate.width);
  const height = toSvgHeight(gate.height);
  const x = xToSvg(gate.x) - width / 2;
  const y = yToSvg(gate.y) - height / 2;

  refs.decorLayer.appendChild(svgEl("rect", {
    x,
    y,
    width,
    height,
    rx: 0,
    class: "gate-body"
  }));

  refs.decorLayer.appendChild(svgEl("line", {
    x1: xToSvg(gate.x),
    y1: y,
    x2: xToSvg(gate.x),
    y2: y + height,
    class: "gate-core"
  }));

  refs.decorLayer.appendChild(svgEl("text", {
    x: xToSvg(gate.x),
    y: y - 12,
    class: "target-label",
    "text-anchor": "middle"
  }, gate.label));
}

function renderTarget(target) {
  const x = xToSvg(target.x);
  const y = yToSvg(target.y);
  const labelOnLeft = x > PLOT_RIGHT - 92;
  const labelX = labelOnLeft ? x - 18 : x + 18;
  const labelAnchor = labelOnLeft ? "end" : "start";
  const labelBelow = target.y >= 0;
  const labelY = labelBelow ? y + 34 : y - 18;

  if (target.style === "anchor") {
    refs.decorLayer.appendChild(svgEl("circle", {
      cx: x,
      cy: y,
      r: 13,
      class: "target-anchor"
    }));

    refs.decorLayer.appendChild(svgEl("line", {
      x1: x - 19,
      y1: y,
      x2: x + 19,
      y2: y,
      class: "target-anchor"
    }));

    refs.decorLayer.appendChild(svgEl("line", {
      x1: x,
      y1: y - 19,
      x2: x,
      y2: y + 19,
      class: "target-anchor"
    }));
  } else if (target.style === "center") {
    refs.decorLayer.appendChild(svgEl("circle", {
      cx: x,
      cy: y,
      r: 10,
      class: "target-center"
    }));
  } else {
    refs.decorLayer.appendChild(svgEl("polygon", {
      points: starPoints(x, y, 16, 8),
      class: "target-star"
    }));
  }

  refs.decorLayer.appendChild(svgEl("text", {
    x: labelX,
    y: labelY,
    class: "target-label",
    "text-anchor": labelAnchor
  }, `${target.label}(${formatNumber(target.x)}; ${formatNumber(target.y)})`));
}

function renderCurve() {
  const level = getCurrentLevel();
  const showCurrent = level.slots.some((slot) => state.placements[slot] !== undefined);
  const currentCoefficients = getCoefficients();

  refs.curvePath.setAttribute("d", showCurrent ? buildCurvePath(level, currentCoefficients) : "");

  if (state.drag && state.drag.hoveredSlot) {
    const previewCoefficients = getCoefficients({
      [state.drag.hoveredSlot]: state.drag.value
    });
    refs.previewPath.setAttribute("d", buildCurvePath(level, previewCoefficients));
  } else {
    refs.previewPath.setAttribute("d", "");
  }
}

function buildCurvePath(level, coefficients) {
  const range = level.formula === "quadratic"
    ? { min: -2.35, max: 2.35, step: 0.035 }
    : { min: -3.7, max: 3.7, step: 0.04 };
  const commands = [];

  for (let x = range.min; x <= range.max; x += range.step) {
    const y = evaluate(level, coefficients, x);
    const clampedY = clamp(y, Y_MIN - 0.7, Y_MAX + 0.7);
    const sx = xToSvg(x).toFixed(2);
    const sy = yToSvg(clampedY).toFixed(2);
    commands.push(`${commands.length === 0 ? "M" : "L"} ${sx} ${sy}`);
  }

  return commands.join(" ");
}

function evaluate(level, coefficients, x) {
  const a = coefficients.a || 0;
  const b = coefficients.b || 0;

  if (level.formula === "quadratic") {
    return a * x * x;
  }

  if (level.formula === "linear") {
    return a * x + b;
  }

  return a * x;
}

function getCoefficients(overrides = {}) {
  const level = getCurrentLevel();
  const result = {};
  level.slots.forEach((slot) => {
    if (overrides[slot] !== undefined) {
      result[slot] = overrides[slot];
      return;
    }
    result[slot] = state.placements[slot] !== undefined ? state.placements[slot] : 0;
  });
  return result;
}

function beginDrag(event, value) {
  event.preventDefault();
  cancelDrag();
  noteTutorialInteraction();

  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.textContent = formatNumber(value);
  document.body.appendChild(ghost);

  state.drag = {
    value,
    ghost,
    hoveredSlot: null
  };

  refs.body.classList.add("is-dragging");
  moveGhost(event.clientX, event.clientY);
  refreshHoveredSlot(event.clientX, event.clientY);
}

function onPointerMove(event) {
  if (!state.drag) {
    return;
  }
  moveGhost(event.clientX, event.clientY);
  refreshHoveredSlot(event.clientX, event.clientY);
}

function onPointerUp() {
  if (!state.drag) {
    return;
  }

  const hoveredSlot = state.drag.hoveredSlot;
  const droppedValue = state.drag.value;
  cancelDrag();

  if (!hoveredSlot || !state.running || state.lockAdvance) {
    return;
  }

  state.placements[hoveredSlot] = droppedValue;
  state.ignoreSlotClickUntil = Date.now() + 250;
  syncFormulaSlots();
  renderCurve();

  const level = getCurrentLevel();
  if (level.isTutorial && level.solution[hoveredSlot] !== droppedValue) {
    state.placements = {};
    syncFormulaSlots();
    renderCurve();
    setStatus("Chưa đúng. Màn hướng dẫn đã tự reset để bạn thử lại.", "warning");
    scheduleTutorialHint(520);
    return;
  }

  checkSolved();
}

function refreshHoveredSlot(clientX, clientY) {
  const nextSlot = findClosestSlot(clientX, clientY);
  const nextName = nextSlot ? nextSlot.dataset.slot : null;

  if (state.drag.hoveredSlot === nextName) {
    return;
  }

  state.drag.hoveredSlot = nextName;
  syncFormulaSlots();
  renderCurve();
}

function moveGhost(clientX, clientY) {
  if (!state.drag) {
    return;
  }
  state.drag.ghost.style.transform = `translate(${clientX + 16}px, ${clientY + 16}px)`;
}

function cancelDrag() {
  if (!state.drag) {
    refs.body.classList.remove("is-dragging");
    return;
  }

  if (state.drag.ghost && state.drag.ghost.parentNode) {
    state.drag.ghost.parentNode.removeChild(state.drag.ghost);
  }
  state.drag = null;
  refs.body.classList.remove("is-dragging");
  syncFormulaSlots();
  renderCurve();
}

function findClosestSlot(clientX, clientY) {
  const slots = Array.from(refs.formulaArea.querySelectorAll(".drop-slot"));
  let bestSlot = null;
  let bestDistance = Infinity;

  slots.forEach((slot) => {
    const rect = slot.getBoundingClientRect();
    const distance = distanceToRect(clientX, clientY, rect);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestSlot = slot;
    }
  });

  return bestDistance <= 82 ? bestSlot : null;
}

function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.sqrt(dx * dx + dy * dy);
}

function clearSlot(slot) {
  if (state.placements[slot] === undefined) {
    return;
  }
  noteTutorialInteraction();
  delete state.placements[slot];
  syncFormulaSlots();
  renderCurve();
  setStatus(`Đã xóa hệ số ${slot}. Kéo số khác vào để thử lại.`, "neutral");
}

function resetCurrentLevel() {
  if (!state.running || state.lockAdvance) {
    return;
  }
  noteTutorialInteraction();
  cancelDrag();
  state.placements = {};
  syncFormulaSlots();
  renderCurve();
  setStatus("Đã reset hàm số. Quỹ đạo trở về ban đầu.", "warning");
}

function checkSolved() {
  if (state.lockAdvance) {
    return;
  }

  const level = getCurrentLevel();
  const ready = level.slots.every((slot) => state.placements[slot] !== undefined);
  if (!ready) {
    return;
  }

  const coefficients = getCoefficients();
  const solved = level.targets.every((target) => {
    const y = evaluate(level, coefficients, target.x);
    return Math.abs(y - target.y) < 0.05;
  });

  if (!solved) {
    if (level.isTutorial) {
      state.placements = {};
      syncFormulaSlots();
      renderCurve();
      setStatus("Chưa đúng. Màn hướng dẫn đã tự reset để bạn thử lại.", "warning");
      scheduleTutorialHint(520);
      return;
    }

    state.recentSolveTimes = [];
    if (isFeverActive()) {
      applyScoreChange(0, "Fever bảo vệ: 0 điểm", "fever");
      setStatus("Chưa khớp mục tiêu nhưng FEVER đang bật nên bạn không bị trừ điểm.", "fever");
    } else {
      applyScoreChange(-WRONG_SCORE, `Sai rồi: -${WRONG_SCORE} điểm`, "loss");
      setStatus("Chưa khớp mục tiêu. Dùng đường dự báo nét đứt để chỉnh lại nhé.", "warning");
    }
    return;
  }

  handleSolved();
}

function handleSolved() {
  const now = Date.now();
  const level = getCurrentLevel();

  if (level.isTutorial) {
    handleTutorialSolved(level);
    return;
  }

  state.lockAdvance = true;
  trimRecentSolveTimes(now);
  state.recentSolveTimes.push(now);

  let triggeredFever = false;
  if (state.recentSolveTimes.length >= 3) {
    const lastThree = state.recentSolveTimes.slice(-3);
    if (lastThree[2] - lastThree[0] <= COMBO_WINDOW_MS) {
      state.feverUntil = now + FEVER_DURATION_MS;
      state.recentSolveTimes = [];
      triggeredFever = true;
      audioSystem.playFeverStinger();
      audioSystem.syncMusic({ running: state.running, fever: true });
    }
  }

  const feverScoring = triggeredFever || isFeverActive(now);
  const earned = feverScoring ? CORRECT_SCORE * 2 : CORRECT_SCORE;

  applyScoreChange(earned, feverScoring ? `FEVER: +${earned} điểm` : `Chính xác: +${earned} điểm`, feverScoring ? "fever" : "gain");
  state.solvedCount += 1;
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");

  if (triggeredFever) {
    setStatus(`FEVER kích hoạt! +${earned} điểm.`, "fever");
  } else if (feverScoring) {
    setStatus(`FEVER!! +${earned} điểm.`, "fever");
  } else {
    setStatus(`Chính xác! +${earned} điểm.`, "success");
  }

  updateHud(getRemainingTimeMs());

  const shouldShowFeverInfo = triggeredFever && !state.feverInfoShown;

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }

    if (shouldShowFeverInfo) {
      state.feverInfoShown = true;
      state.pendingSolvedAdvance = true;
      pauseGame({ showPauseOverlay: false, updateStatusLine: false });
      openFeverInfoOverlay();
      return;
    }

    continueSolvedAdvance();
  }, 1050);
}

function handleSolved() {
  const now = Date.now();
  const level = getCurrentLevel();

  if (level.isTutorial) {
    handleTutorialSolved(level);
    return;
  }

  state.lockAdvance = true;
  trimRecentSolveTimes(now);
  state.recentSolveTimes.push(now);

  let triggeredFever = false;
  if (state.recentSolveTimes.length >= 3) {
    const lastThree = state.recentSolveTimes.slice(-3);
    if (lastThree[2] - lastThree[0] <= COMBO_WINDOW_MS) {
      state.feverUntil = now + FEVER_DURATION_MS;
      state.recentSolveTimes = [];
      triggeredFever = true;
      audioSystem.playFeverStinger();
      audioSystem.syncMusic({ running: state.running, fever: true });
    }
  }

  const feverScoring = triggeredFever || isFeverActive(now);
  const earned = feverScoring ? CORRECT_SCORE * 2 : CORRECT_SCORE;
  const shouldShowFeverInfo = triggeredFever && !state.feverInfoShown;

  applyScoreChange(earned, feverScoring ? `FEVER: +${earned} điểm` : `Chính xác: +${earned} điểm`, feverScoring ? "fever" : "gain");
  state.solvedCount += 1;
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");

  if (triggeredFever) {
    setStatus(`FEVER kích hoạt! +${earned} điểm.`, "fever");
  } else if (feverScoring) {
    setStatus(`FEVER!! +${earned} điểm.`, "fever");
  } else {
    setStatus(`Chính xác! +${earned} điểm.`, "success");
  }

  updateHud(getRemainingTimeMs());

  if (shouldShowFeverInfo) {
    state.feverInfoShown = true;
    state.pendingSolvedAdvance = true;
    refs.curvePath.classList.remove("curve-solved");
    pauseGame({ showPauseOverlay: false, updateStatusLine: false });
    openFeverInfoOverlay();
    return;
  }

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }
    continueSolvedAdvance();
  }, 1050);
}

function handleSolved() {
  const now = Date.now();
  const level = getCurrentLevel();

  if (level.isTutorial) {
    handleTutorialSolved(level);
    return;
  }

  state.lockAdvance = true;
  trimRecentSolveTimes(now);
  state.recentSolveTimes.push(now);

  let triggeredFever = false;
  if (state.recentSolveTimes.length >= 3) {
    const lastThree = state.recentSolveTimes.slice(-3);
    if (lastThree[2] - lastThree[0] <= COMBO_WINDOW_MS) {
      state.feverUntil = now + FEVER_DURATION_MS;
      state.recentSolveTimes = [];
      triggeredFever = true;
      audioSystem.playFeverStinger();
      audioSystem.syncMusic({ running: state.running, fever: true });
    }
  }

  const feverScoring = triggeredFever || isFeverActive(now);
  const earned = feverScoring ? CORRECT_SCORE * 2 : CORRECT_SCORE;
  const shouldShowFeverInfo = triggeredFever && !state.feverInfoShown;

  applyScoreChange(
    earned,
    feverScoring ? `FEVER: +${earned} điểm` : `Chính xác: +${earned} điểm`,
    feverScoring ? "fever" : "gain"
  );
  state.solvedCount += 1;
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");

  if (triggeredFever) {
    setStatus(`FEVER kích hoạt! +${earned} điểm.`, "fever");
  } else if (feverScoring) {
    setStatus(`FEVER!! +${earned} điểm.`, "fever");
  } else {
    setStatus(`Chính xác! +${earned} điểm.`, "success");
  }

  updateHud(getRemainingTimeMs());

  if (shouldShowFeverInfo) {
    state.feverInfoShown = true;
    state.pendingSolvedAdvance = true;
    refs.curvePath.classList.remove("curve-solved");
    pauseGame({ showPauseOverlay: false, updateStatusLine: false });
    openFeverInfoOverlay();
    return;
  }

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }
    continueSolvedAdvance();
  }, 1050);
}

function handleTutorialSolved(level) {
  const stageMeta = STAGE_META[level.stage];

  state.lockAdvance = true;
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");
  setStatus(`Đã xong màn hướng dẫn. Chuẩn bị vào ${stageMeta.title.toLowerCase()}.`, "success");
  updateHud(getRemainingTimeMs());

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }

    state.currentLevel = createRandomLevel(level.stage);
    renderLevel();
    resumeClockAfterGuidance();
    setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Bạn đã vào màn chính.`, "neutral");
  }, 820);
}

function handleTutorialSolved(level) {
  const stageMeta = STAGE_META[level.stage];

  state.lockAdvance = true;
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");
  setStatus(`Đã xong màn hướng dẫn. Chuẩn bị vào ${stageMeta.title.toLowerCase()}.`, "success");
  updateHud(getRemainingTimeMs());

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }

    playScreenFlash(() => {
      if (!state.running) {
        return;
      }
      state.currentLevel = createRandomLevel(level.stage);
      setTutorialVisualState(false);
      renderLevel();
      resumeClockAfterGuidance();
      setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Bạn đã vào màn chính.`, "neutral");
    });
  }, 260);
}

function handleTutorialSolved(level) {
  const stageMeta = STAGE_META[level.stage];

  state.lockAdvance = true;
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");
  setStatus(`Đã xong màn hướng dẫn. Chuẩn bị vào ${stageMeta.title.toLowerCase()}.`, "success");
  updateHud(getRemainingTimeMs());

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }

    playScreenFlash(() => {
      if (!state.running) {
        return;
      }
      state.currentLevel = createRandomLevel(level.stage);
      setTutorialVisualState(false);
      renderLevel();
      resumeClockAfterGuidance();
      setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Bạn đã vào màn chính.`, "neutral");
    });
  }, 260);
}

function handleSolved() {
  const now = Date.now();
  const level = getCurrentLevel();

  if (level.isTutorial) {
    handleTutorialSolved(level);
    return;
  }

  state.lockAdvance = true;
  trimRecentSolveTimes(now);
  state.recentSolveTimes.push(now);

  let triggeredFever = false;
  if (state.recentSolveTimes.length >= 3) {
    const lastThree = state.recentSolveTimes.slice(-3);
    if (lastThree[2] - lastThree[0] <= COMBO_WINDOW_MS) {
      state.feverUntil = now + FEVER_DURATION_MS;
      state.recentSolveTimes = [];
      triggeredFever = true;
      audioSystem.playFeverStinger();
      audioSystem.syncMusic({ running: state.running, fever: true });
    }
  }

  const feverScoring = triggeredFever || isFeverActive(now);
  const earned = feverScoring ? CORRECT_SCORE * 2 : CORRECT_SCORE;
  const shouldShowFeverInfo = triggeredFever && !state.feverInfoShown;

  applyScoreChange(
    earned,
    feverScoring ? `FEVER: +${earned} điểm` : `Chính xác: +${earned} điểm`,
    feverScoring ? "fever" : "gain"
  );
  state.solvedCount += 1;
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");

  if (triggeredFever) {
    setStatus(`FEVER kích hoạt! +${earned} điểm.`, "fever");
  } else if (feverScoring) {
    setStatus(`FEVER!! +${earned} điểm.`, "fever");
  } else {
    setStatus(`Chính xác! +${earned} điểm.`, "success");
  }

  updateHud(getRemainingTimeMs());

  if (shouldShowFeverInfo) {
    state.feverInfoShown = true;
    state.pendingSolvedAdvance = true;
    refs.curvePath.classList.remove("curve-solved");
    pauseGame({ showPauseOverlay: false, updateStatusLine: false });
    openFeverInfoOverlay();
    return;
  }

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }
    continueSolvedAdvance();
  }, 1050);
}

function handleTutorialSolved(level) {
  const stageMeta = STAGE_META[level.stage];

  state.lockAdvance = true;
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");
  setStatus(`Đã xong màn hướng dẫn. Chuẩn bị vào ${stageMeta.title.toLowerCase()}.`, "success");
  updateHud(getRemainingTimeMs());

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }

    playScreenFlash(() => {
      if (!state.running) {
        return;
      }
      state.currentLevel = createRandomLevel(level.stage);
      setTutorialVisualState(false);
      renderLevel();
      resumeClockAfterGuidance();
      setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Bạn đã vào màn chính.`, "neutral");
    });
  }, 260);
}

function updateFeverInfoCopy() {
  if (refs.feverInfoLead) {
    refs.feverInfoLead.textContent = "";
  }
  if (refs.feverInfoDuration) {
    refs.feverInfoDuration.textContent = `Fever kéo dài ${FEVER_DURATION_MS / 1000} giây.`;
  }
  if (refs.feverInfoTrigger) {
    refs.feverInfoTrigger.textContent = `Ghép đúng 3 màn liên tiếp trong vòng ${COMBO_WINDOW_MS / 1000} giây để bật FEVER.`;
  }
}

function showTutorialStageBanner(stage, onComplete) {
  const stageMeta = STAGE_META[stage];
  if (!stageMeta || !refs.tutorialStageBannerOverlay) {
    if (typeof onComplete === "function") {
      onComplete();
    }
    return;
  }

  clearTutorialStageBannerTimer();
  refs.tutorialStageBannerTitle.textContent = `HƯỚNG DẪN ${stageMeta.title.toUpperCase()}`;
  refs.tutorialStageBannerSubtitle.textContent = stageMeta.name;
  showOverlay(refs.tutorialStageBannerOverlay, true);

  state.tutorialStageBannerHandle = window.setTimeout(() => {
    state.tutorialStageBannerHandle = null;
    showOverlay(refs.tutorialStageBannerOverlay, false);
    if (typeof onComplete === "function") {
      onComplete();
    }
  }, TUTORIAL_STAGE_BANNER_DURATION_MS);
}

function beginStageSequence(stage, options = {}) {
  const { freezeClock = true } = options;

  clearStageIntroTimer();
  clearTutorialStageBannerTimer();
  clearTutorialIdleTimer();
  clearTutorialDemoTimers();
  hideTutorialHint();
  setTutorialVisualState(false);
  audioSystem.pauseMusic();
  if (refs.tutorialStageBannerOverlay) {
    showOverlay(refs.tutorialStageBannerOverlay, false);
  }

  if (freezeClock) {
    freezeClockForGuidance();
  }

  showStageIntro(stage, () => {
    if (!state.running || state.currentLevelIndex >= LEVEL_COUNT) {
      return;
    }
    finishStageSequence(stage);
  });
}

function finishStageSequence(stage) {
  const stageMeta = STAGE_META[stage];
  const shouldRunTutorial = state.tutorialEnabled && !state.tutorialShownStages[stage];

  if (shouldRunTutorial) {
    state.tutorialShownStages[stage] = true;
    showTutorialStageBanner(stage, () => {
      if (!state.running || state.currentLevelIndex >= LEVEL_COUNT) {
        return;
      }
      state.currentLevel = createTutorialLevel(stage);
      setTutorialVisualState(true);
      renderLevel();
      updateHud(getRemainingTimeMs());
      setStatus(`Màn hướng dẫn ${stageMeta.title.toLowerCase()} đã sẵn sàng. Hãy kéo số đúng vào phương trình.`, "neutral");
      scheduleTutorialHint(260);
    });
    return;
  }

  state.currentLevel = createRandomLevel(stage);
  setTutorialVisualState(false);
  renderLevel();
  updateHud(getRemainingTimeMs());
  resumeClockAfterGuidance();

  if (stage === 1) {
    setStatus(`90 giây bắt đầu cho ${formatPlayerName(state.playerName)}. Kéo số để tìm quỹ đạo đường bắn.`, "neutral");
  } else {
    setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Kéo số để giải màn chính.`, "neutral");
  }
}

function refreshTutorialModeUI() {
  if (!refs.tutorialModeBtn) {
    return;
  }

  const buttons = [refs.tutorialModeBtn, refs.confirmTutorialModeBtn].filter(Boolean);
  const pressed = state.tutorialEnabled ? "true" : "false";
  const checked = state.tutorialEnabled ? "true" : "false";
  const label = state.tutorialEnabled ? "Tắt chế độ hướng dẫn" : "Bật chế độ hướng dẫn";

  document.querySelectorAll(".tutorial-toggle-copy strong").forEach((node) => {
    node.textContent = "CHẾ ĐỘ HƯỚNG DẪN";
  });

  buttons.forEach((button) => {
    button.innerHTML = '<span class="tutorial-toggle-btn__track"><span class="tutorial-toggle-btn__thumb"></span></span>';
    button.setAttribute("role", "switch");
    button.setAttribute("aria-pressed", pressed);
    button.setAttribute("aria-checked", checked);
    button.setAttribute("aria-label", label);
    button.classList.toggle("is-off", !state.tutorialEnabled);
  });

  if (refs.tutorialModeHint) {
    refs.tutorialModeHint.textContent = "";
  }

  if (refs.confirmTutorialModeHint) {
    refs.confirmTutorialModeHint.textContent = "";
  }
}

function updateFeverInfoCopy() {
  if (refs.feverInfoLead) {
    refs.feverInfoLead.textContent = "";
  }
  if (refs.feverInfoDuration) {
    refs.feverInfoDuration.textContent = `Fever kéo dài ${FEVER_DURATION_MS / 1000} giây.`;
  }
  if (refs.feverInfoTrigger) {
    refs.feverInfoTrigger.textContent = `Ghép đúng 3 màn liên tiếp trong vòng ${COMBO_WINDOW_MS / 1000} giây để bật FEVER.`;
  }
}

function renderLevel() {
  const level = getCurrentLevel();
  const stage = STAGE_META[level.stage];
  const tutorialLevel = isTutorialLevel(level);
  setTutorialVisualState(tutorialLevel);

  state.placements = {};
  state.lockAdvance = false;
  state.drag = null;

  refs.app.dataset.stage = String(level.stage);
  refs.levelBadge.textContent = `Màn ${state.currentLevelIndex + 1} / ${LEVEL_COUNT}`;
  refs.stageTitle.textContent = stage.title;
  refs.levelInstruction.textContent = level.prompt;

  if (tutorialLevel) {
    refs.levelBadge.textContent = "HƯỚNG DẪN";
    refs.stageTitle.textContent = stage.title.toUpperCase();
    refs.levelInstruction.textContent = level.stage === 1
      ? "Hướng dẫn: tìm hệ số a để đường thẳng đi qua điểm A(1; 2)."
      : level.prompt;
  }

  refs.formulaArea.innerHTML = buildFormulaMarkup(level);
  syncFormulaSlots();
  renderDecorations(level);
  renderCurve();
  if (!tutorialLevel) {
    hideTutorialHint();
  }
  updateHud(getRemainingTimeMs());
}

function handleSolved() {
  const now = Date.now();
  const level = getCurrentLevel();

  if (level.isTutorial) {
    handleTutorialSolved(level);
    return;
  }

  state.lockAdvance = true;
  trimRecentSolveTimes(now);
  state.recentSolveTimes.push(now);

  let triggeredFever = false;
  if (state.recentSolveTimes.length >= 3) {
    const lastThree = state.recentSolveTimes.slice(-3);
    if (lastThree[2] - lastThree[0] <= COMBO_WINDOW_MS) {
      state.feverUntil = now + FEVER_DURATION_MS;
      state.recentSolveTimes = [];
      triggeredFever = true;
      audioSystem.playFeverStinger();
      audioSystem.syncMusic({ running: state.running, fever: true });
    }
  }

  const feverScoring = triggeredFever || isFeverActive(now);
  const earned = feverScoring ? CORRECT_SCORE * 2 : CORRECT_SCORE;
  const shouldShowFeverInfo = triggeredFever && state.tutorialEnabled && !state.feverInfoShown;

  applyScoreChange(
    earned,
    feverScoring ? `FEVER: +${earned} điểm` : `Chính xác: +${earned} điểm`,
    feverScoring ? "fever" : "gain"
  );
  state.solvedCount += 1;
  refs.curvePath.classList.remove("curve-solved");
  void refs.curvePath.getBoundingClientRect();
  refs.curvePath.classList.add("curve-solved");

  if (triggeredFever) {
    setStatus(`FEVER kích hoạt! +${earned} điểm.`, "fever");
  } else if (feverScoring) {
    setStatus(`FEVER!! +${earned} điểm.`, "fever");
  } else {
    setStatus(`Chính xác! +${earned} điểm.`, "success");
  }

  updateHud(getRemainingTimeMs());

  if (shouldShowFeverInfo) {
    state.feverInfoShown = true;
    state.pendingSolvedAdvance = true;
    refs.curvePath.classList.remove("curve-solved");
    pauseGame({ showPauseOverlay: false, updateStatusLine: false });
    openFeverInfoOverlay();
    return;
  }

  window.setTimeout(() => {
    refs.curvePath.classList.remove("curve-solved");
    if (!state.running) {
      return;
    }
    continueSolvedAdvance();
  }, 1050);
}

function finishStageSequence(stage) {
  const stageMeta = STAGE_META[stage];
  const shouldRunTutorial = state.tutorialEnabled && !state.tutorialShownStages[stage];

  if (shouldRunTutorial) {
    state.tutorialShownStages[stage] = true;
    showTutorialStageBanner(stage, () => {
      if (!state.running || state.currentLevelIndex >= LEVEL_COUNT) {
        return;
      }
      state.currentLevel = createTutorialLevel(stage);
      setTutorialVisualState(true);
      renderLevel();
      updateHud(getRemainingTimeMs());
      setStatus("", "neutral");
      scheduleTutorialHint(260);
    });
    return;
  }

  state.currentLevel = createRandomLevel(stage);
  setTutorialVisualState(false);
  renderLevel();
  updateHud(getRemainingTimeMs());
  resumeClockAfterGuidance();

  if (stage === 1) {
    setStatus(`90 giây bắt đầu cho ${formatPlayerName(state.playerName)}. Tìm số để khóa quỹ đạo đường bắn.`, "neutral");
  } else {
    setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Tìm số để giải màn chính.`, "neutral");
  }
}

function continueSolvedAdvance() {
  if (!state.running) {
    return;
  }

  state.currentLevelIndex += 1;
  if (state.currentLevelIndex >= LEVEL_COUNT) {
    endGame(true);
    return;
  }

  const nextStage = getStageForIndex(state.currentLevelIndex);
  if (isFirstLevelOfStage(state.currentLevelIndex)) {
    beginStageSequence(nextStage, { freezeClock: true });
    return;
  }

  state.currentLevel = createRandomLevel(nextStage);
  renderLevel();
}

function renderLevel() {
  const level = getCurrentLevel();
  const stage = STAGE_META[level.stage];
  const tutorialLevel = isTutorialLevel(level);
  setTutorialVisualState(tutorialLevel);

  state.placements = {};
  state.lockAdvance = false;
  state.drag = null;

  refs.app.dataset.stage = String(level.stage);
  refs.levelBadge.textContent = `Màn ${state.currentLevelIndex + 1} / ${LEVEL_COUNT}`;
  refs.stageTitle.textContent = stage.title;
  refs.levelInstruction.textContent = level.prompt;

  if (tutorialLevel) {
    refs.levelBadge.textContent = "HƯỚNG DẪN";
    refs.stageTitle.textContent = stage.title.toUpperCase();
    refs.levelInstruction.textContent = level.stage === 1
      ? "Tìm hệ số a để đường thẳng đi qua điểm A(1; 2)."
      : level.prompt.replace(/^Hướng dẫn:\s*/i, "");
  }

  refs.formulaArea.innerHTML = buildFormulaMarkup(level);
  syncFormulaSlots();
  renderDecorations(level);
  renderCurve();
  if (!tutorialLevel) {
    hideTutorialHint();
  }
  updateHud(getRemainingTimeMs());
}

function finishStageSequence(stage) {
  const stageMeta = STAGE_META[stage];
  const shouldRunTutorial = state.tutorialEnabled && !state.tutorialShownStages[stage];

  if (shouldRunTutorial) {
    state.tutorialShownStages[stage] = true;
    showTutorialStageBanner(stage, () => {
      if (!state.running || state.currentLevelIndex >= LEVEL_COUNT) {
        return;
      }
      state.currentLevel = createTutorialLevel(stage);
      setTutorialVisualState(true);
      renderLevel();
      updateHud(getRemainingTimeMs());
      setStatus("", "neutral");
      scheduleTutorialHint(260);
    });
    return;
  }

  state.currentLevel = createRandomLevel(stage);
  setTutorialVisualState(false);
  renderLevel();
  updateHud(getRemainingTimeMs());
  resumeClockAfterGuidance();

  if (stage === 1) {
    setStatus(`120 giây bắt đầu cho ${formatPlayerName(state.playerName)}. Tìm số để khóa quỹ đạo đường bắn.`, "neutral");
  } else {
    setStatus(`Bắt đầu ${stageMeta.title.toLowerCase()}. Tìm số để giải màn chính.`, "neutral");
  }
}

function trimRecentSolveTimes(now = Date.now()) {
  state.recentSolveTimes = state.recentSolveTimes.filter((time) => now - time <= COMBO_WINDOW_MS);
}

function isFeverActive(now = Date.now()) {
  return now < state.feverUntil;
}

function updateHud(remainingMs = getRemainingTimeMs()) {
  const timeSeconds = state.running ? remainingMs / 1000 : Math.max(0, remainingMs / 1000);
  const quietMode = state.guidanceClockFrozen || isTutorialLevel();
  trimRecentSolveTimes();

  refs.timeValue.textContent = `${timeSeconds.toFixed(1)}s`;
  refs.scoreValue.textContent = String(state.score);
  refs.comboValue.textContent = `${Math.min(state.recentSolveTimes.length, 3)} / 3`;

  if (state.isPaused) {
    refs.feverValue.textContent = state.pausedFeverMs > 0 ? "Fever đang dừng" : "Đang dừng";
    refs.body.classList.remove("fever-active");
    audioSystem.syncMusic({ running: false, fever: false });
    return;
  }

  if (state.guidanceClockFrozen && state.guidanceFeverRemainingMs > 0) {
    refs.feverValue.textContent = `Tạm giữ ${(state.guidanceFeverRemainingMs / 1000).toFixed(1)}s`;
    refs.body.classList.add("fever-active");
    audioSystem.syncMusic({ running: false, fever: false });
    return;
  }

  if (isFeverActive()) {
    const feverLeft = Math.max(0, (state.feverUntil - Date.now()) / 1000);
    refs.feverValue.textContent = `Đang bật ${feverLeft.toFixed(1)}s`;
    refs.body.classList.add("fever-active");
  } else {
    refs.feverValue.textContent = state.running ? "Sẵn sàng" : "Tạm dừng";
    refs.body.classList.remove("fever-active");
  }

  audioSystem.syncMusic({ running: quietMode ? false : state.running, fever: quietMode ? false : isFeverActive() });
}

function setStatus(message, tone) {
  refs.statusLine.innerHTML = message;
  refs.statusLine.classList.remove("success", "warning", "fever");
  if (tone && tone !== "neutral") {
    refs.statusLine.classList.add(tone);
  }
}

function applyScoreChange(delta, bannerText, tone) {
  state.score = Math.max(0, state.score + delta);
  updateHud();
  showScoreBanner(bannerText, tone);
  if (delta > 0) {
    audioSystem.playScoreSfx({ fever: tone === "fever" });
  } else if (delta < 0) {
    audioSystem.playPenaltySfx();
  }
}

function showScoreBanner(message, tone) {
  if (!refs.scoreBanner) {
    return;
  }

  refs.scoreBanner.textContent = message;
  refs.scoreBanner.classList.remove("gain", "loss", "is-visible");
  refs.scoreBanner.classList.add(tone);
  void refs.scoreBanner.getBoundingClientRect();
  refs.scoreBanner.classList.add("is-visible");

  if (scoreBannerTimeout) {
    window.clearTimeout(scoreBannerTimeout);
  }

  scoreBannerTimeout = window.setTimeout(() => {
    refs.scoreBanner.classList.remove("is-visible");
  }, 1200);
}

function hideScoreBanner() {
  if (!refs.scoreBanner) {
    return;
  }
  if (scoreBannerTimeout) {
    window.clearTimeout(scoreBannerTimeout);
    scoreBannerTimeout = null;
  }
  refs.scoreBanner.classList.remove("is-visible");
}

function showOverlay(overlay, show) {
  overlay.classList.toggle("is-visible", show);
  overlay.setAttribute("aria-hidden", show ? "false" : "true");
}

function getCurrentLevel() {
  if (!state.currentLevel) {
    state.currentLevel = createRandomLevel(getStageForIndex(state.currentLevelIndex));
  }
  return state.currentLevel;
}

function getStageForIndex(index) {
  return STAGE_SEQUENCE[index] || STAGE_SEQUENCE[STAGE_SEQUENCE.length - 1];
}

function createRandomLevel(stage) {
  if (stage === 1) {
    return createStageOneLevel();
  }
  if (stage === 2) {
    return createStageTwoLevel();
  }
  return createStageThreeLevel();
}

function createStageOneLevel() {
  const options = [];
  LINEAR_A_VALUES.forEach((a) => {
    [-3, -2, -1, 1, 2, 3].forEach((x) => {
      const y = a * x;
      if (Math.abs(y) <= 4) {
        options.push({ a, x, y });
      }
    });
  });

  const pick = randomFrom(options);
  const label = randomFrom(STAR_LABELS);

  return {
    id: `S1-${Date.now()}-${Math.random()}`,
    stage: 1,
    formula: "linearOrigin",
    slots: ["a"],
    baseScore: 110,
    prompt: `Tìm hệ số a để đường thẳng đi qua điểm ${label}(${formatNumber(pick.x)}; ${formatNumber(pick.y)}).`,
    targets: [{ x: pick.x, y: pick.y, label, style: "star" }]
  };
}

function createStageTwoLevel() {
  const options = [];
  LINEAR_A_VALUES.forEach((a) => {
    VALUE_BANK.forEach((b) => {
      [-3, -2, -1, 1, 2, 3].forEach((gateX) => {
        const gateY = a * gateX + b;
        if (Math.abs(gateY) <= 3.5) {
          options.push({ a, b, gateX, gateY });
        }
      });
    });
  });

  const pick = randomFrom(options);
  const gateLabel = randomFrom(GATE_LABELS);

  return {
    id: `S2-${Date.now()}-${Math.random()}`,
    stage: 2,
    formula: "linear",
    slots: ["a", "b"],
    baseScore: 165,
    prompt: `Đường bay phải xuất phát tại S(0; ${formatNumber(pick.b)}) và xuyên qua tâm cổng ${gateLabel}(${formatNumber(pick.gateX)}; ${formatNumber(pick.gateY)}).`,
    targets: [
      { x: 0, y: pick.b, label: "S", style: "anchor" },
      { x: pick.gateX, y: pick.gateY, label: gateLabel, style: "center" }
    ],
    gate: { x: pick.gateX, y: pick.gateY, width: 1, height: 1, label: gateLabel }
  };
}

function createStageThreeLevel() {
  const options = [];
  QUADRATIC_A_VALUES.forEach((a) => {
    [1, 2].forEach((x) => {
      const y = a * x * x;
      if (Math.abs(y) <= 4) {
        options.push({ a, x, y });
      }
    });
  });

  const pick = randomFrom(options);
  const labels = shuffle([...STAR_LABELS]).slice(0, 3);

  return {
    id: `S3-${Date.now()}-${Math.random()}`,
    stage: 3,
    formula: "quadratic",
    slots: ["a"],
    baseScore: 220,
    prompt: `Chọn a để parabol đi qua ba sao tại (-${formatNumber(pick.x)}; ${formatNumber(pick.y)}), (0; 0), (${formatNumber(pick.x)}; ${formatNumber(pick.y)}).`,
    targets: [
      { x: -pick.x, y: pick.y, label: labels[0], style: "star" },
      { x: 0, y: 0, label: labels[1], style: "star" },
      { x: pick.x, y: pick.y, label: labels[2], style: "star" }
    ]
  };
}

function levelSignature(level) {
  if (!level) {
    return "";
  }

  return JSON.stringify({
    stage: level.stage,
    formula: level.formula,
    prompt: level.prompt,
    targets: level.targets,
    gate: level.gate,
    solution: level.solution
  });
}

function createRandomLevel(stage) {
  const factory = stage === 1
    ? createStageOneLevel
    : stage === 2
      ? createStageTwoLevel
      : createStageThreeLevel;
  const previousSignature = state.currentLevel && !state.currentLevel.isTutorial
    ? levelSignature(state.currentLevel)
    : "";

  let nextLevel = factory();
  let attempts = 0;

  while (previousSignature && levelSignature(nextLevel) === previousSignature && attempts < 24) {
    nextLevel = factory();
    attempts += 1;
  }

  return nextLevel;
}

function xToSvg(x) {
  return PLOT_LEFT + ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_WIDTH;
}

function yToSvg(y) {
  return PLOT_BOTTOM - ((y - Y_MIN) / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;
}

function toSvgWidth(value) {
  return (value / (X_MAX - X_MIN)) * PLOT_WIDTH;
}

function toSvgHeight(value) {
  return (value / (Y_MAX - Y_MIN)) * PLOT_HEIGHT;
}

function starPoints(cx, cy, outerRadius, innerRadius) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (Math.PI / 5) * i;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(2)},${(cy + Math.sin(angle) * radius).toFixed(2)}`);
  }
  return points.join(" ");
}

function svgEl(tag, attrs, text) {
  const node = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });
  if (text !== undefined) {
    node.textContent = text;
  }
  return node;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function formatNumber(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return value.toFixed(1).replace(/\.0$/, "");
}

function formatTimeMs(value) {
  const safeValue = clamp(Number(value) || 0, 0, GAME_DURATION_SECONDS * 1000);
  return `${(safeValue / 1000).toFixed(1)}s`;
}

function getCompletionTimeMs(remainingMs = Math.max(0, state.deadline - Date.now())) {
  return clamp(GAME_DURATION_SECONDS * 1000 - remainingMs, 0, GAME_DURATION_SECONDS * 1000);
}

function formatPlayerName(name) {
  return `<strong class="player-name">${escapeHtml(name)}</strong>`;
}
