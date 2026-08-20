/**
 * Petal Instrument Panel: an asymmetric, calm security workspace with frosted tactile cards.
 * Light pastel imagery always carries dark slate type; dark mode uses equal visual depth, never neon.
 * The in-app Low motion preference keeps analysis controls immediate while making decorative motion optional.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Eye,
  EyeOff,
  Gauge,
  KeyRound,
  Lightbulb,
  LockKeyhole,
  Shield,
  Moon,
  Pause,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Sun,
  UnlockKeyhole,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Palette = { name: string; color: string; soft: string };
type TransitionKind = "palette" | "theme";
type TransitionState = { id: number; kind: TransitionKind; color: string; x: number; y: number };
type DeviceClass = "phone" | "tablet" | "desktop";

const palettes: Palette[] = [
  { name: "Petal Blue", color: "#7DA7D8", soft: "#DDEEFF" },
  { name: "Red", color: "#F66D68", soft: "#FFE0DF" },
  { name: "Grey", color: "#7D818A", soft: "#E6E8EB" },
  { name: "Purple", color: "#A871D6", soft: "#EEE0FA" },
  { name: "Green", color: "#39B866", soft: "#DDF5E5" },
  { name: "Cyan", color: "#3BA7C9", soft: "#DDF4FA" },
  { name: "Orange", color: "#E89B2B", soft: "#FDECCF" },
  { name: "Teal", color: "#318D9B", soft: "#DDF2F3" },
  { name: "Yellow", color: "#C8AE35", soft: "#FCF5CE" },
  { name: "Magenta", color: "#CD5B8F", soft: "#F9DFEB" },
];

const contexts = [
  { id: "email", label: "Email", note: "Account recovery & personal records", target: 68, icon: "✉" },
  { id: "phone", label: "Phone", note: "Device unlock & private messages", target: 76, icon: "◉" },
  { id: "app", label: "App", note: "Everyday services & saved settings", target: 62, icon: "▦" },
  { id: "instagram", label: "Instagram", note: "Social identity & connected accounts", target: 70, icon: "◎" },
  { id: "tiktok", label: "TikTok", note: "Social content & creator access", target: 66, icon: "◌" },
  { id: "banking", label: "Banking", note: "Financial and identity data", target: 88, icon: "◇" },
];

const commonPasswords = ["1234", "12345", "123456", "12345678", "password", "password1", "qwerty", "qwerty123", "letmein", "admin", "iloveyou", "welcome", "abc123"];

function analysePassword(password: string) {
  const lower = password.toLowerCase();
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);
  const unique = new Set(password).size;
  const common = commonPasswords.some((item) => lower === item || lower.includes(item));
  const sequence = /(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|abcd|bcde|cdef|defg|qwerty|asdf|zxcv)/i.test(password);
  const repetition = /(.)\1\1/.test(password);
  const types = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  const lengthScore = Math.min(38, length * 3.1);
  const varietyScore = types * 11;
  const uniquenessScore = length ? Math.min(18, (unique / length) * 20) : 0;
  let score = Math.round(lengthScore + varietyScore + uniquenessScore - (common ? 44 : 0) - (sequence ? 18 : 0) - (repetition ? 10 : 0));
  if (length === 0) score = 0;
  score = Math.max(0, Math.min(100, score));
  const label = score < 35 ? "Very weak" : score < 55 ? "Needs work" : score < 75 ? "Solid start" : score < 90 ? "Strong" : "Excellent";
  const status = score < 35 ? "weak" : score < 75 ? "medium" : "strong";
  const alphabet = (hasLower ? 26 : 0) + (hasUpper ? 26 : 0) + (hasNumber ? 10 : 0) + (hasSymbol ? 32 : 0);
  const bits = alphabet && length ? Math.round(length * Math.log2(alphabet)) : 0;
  const crackTime = score < 25 ? "less than a second" : score < 45 ? "a few minutes" : score < 60 ? "several days" : score < 75 ? "months" : score < 88 ? "centuries" : "many lifetimes";

  const checks = [
    { label: "12+ characters", pass: length >= 12, value: `${length}/12` },
    { label: "Upper & lower case", pass: hasLower && hasUpper, value: hasLower && hasUpper ? "mixed" : "missing" },
    { label: "Numbers with intent", pass: hasNumber && !sequence, value: hasNumber && !sequence ? "present" : "missing" },
    { label: "Special characters", pass: hasSymbol, value: hasSymbol ? "present" : "missing" },
  ];

  const issues: string[] = [];
  if (common) issues.push("It matches a common pattern attackers try immediately.");
  if (sequence) issues.push("A predictable sequence makes the characters easier to guess.");
  if (repetition) issues.push("Repeated characters reduce the number of meaningful combinations.");
  if (length < 12) issues.push(`At ${length || 0} characters, it needs more room for unpredictability.`);
  if (!hasSymbol) issues.push("One or two unusual separators can make a phrase much less predictable.");
  if (!issues.length) issues.push("No obvious common pattern was detected in this local check.");

  return { score, label, status, bits, crackTime, checks, issues, types, length, hasSymbol, hasNumber, hasUpper, hasLower };
}

const generatorWords = ["petal", "ripple", "candle", "violet", "harbor", "lantern", "moss", "orbit", "paper", "mural", "drift", "bramble", "meadow", "signal", "marble", "raven"];
const specialChoices = ["!", "#", "?", "+", "=", "@", "$", "%"];
const tutorialSubtitles = [
  { start: 0, end: 7, text: "Welcome to Monolith Vault. Your password is checked locally, so nothing leaves this screen." },
  { start: 7, end: 15, text: "Choose what the password protects, then read its score, character mix, pattern resistance, and context fit." },
  { start: 15, end: 23, text: "Use the builder to choose a length, your own keyword and number, and one or more symbols." },
  { start: 23, end: 30.5, text: "Build a stronger password, keep it unique, and use a password manager with two-step sign-in." },
];

function secureIndex(max: number) {
  if (!globalThis.crypto?.getRandomValues) return Math.floor(Math.random() * max);
  const maxUint32 = 0xffffffff;
  const limit = Math.floor(maxUint32 / max) * max;
  const value = new Uint32Array(1);
  do globalThis.crypto.getRandomValues(value); while (value[0] >= limit);
  return value[0] % max;
}

function pick<T>(items: T[]) {
  return items[secureIndex(items.length)];
}

function titleCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}` : "";
}

function generatePassword({ keyword, numeric, specials, length }: { keyword: string; numeric: string; specials: string[]; length: number }) {
  const cleanKeyword = keyword.replace(/[^a-zA-Z]/g, "").slice(0, 22);
  const cleanNumeric = numeric.replace(/\D/g, "").slice(0, 12);
  const selectedSpecials = specials.filter((character) => /[^A-Za-z0-9\s]/.test(character));
  const chooseSpecial = () => pick(selectedSpecials.length ? selectedSpecials : ["!"]);
  const firstWord = titleCase(cleanKeyword || pick(generatorWords));
  const secondWord = titleCase(pick(generatorWords));
  const numberPart = cleanNumeric || String(10 + secureIndex(90));
  let nextPassword = `${firstWord}${chooseSpecial()}${secondWord}${chooseSpecial()}${numberPart}`;
  const target = Math.max(12, Math.min(32, length));

  while (nextPassword.length < target) {
    const filler = pick(generatorWords);
    nextPassword = `${nextPassword}${chooseSpecial()}${secureIndex(2) ? titleCase(filler) : filler}`;
  }

  return nextPassword;
}

function ScoreRing({ score, color }: { score: number; color: string }) {
  const circumference = 301.6;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative grid h-[96px] w-[96px] place-items-center sm:h-[110px] sm:w-[110px]" aria-label={`Password score ${score} out of 100`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="7" className="text-slate-200/70 dark:text-slate-600/50" />
        <circle cx="56" cy="56" r="48" fill="none" stroke={color} strokeLinecap="round" strokeWidth="7" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 550ms cubic-bezier(0.23,1,0.32,1)" }} />
      </svg>
      <div className="text-center">
        <div className="display-face text-2xl leading-none text-slate-800 sm:text-3xl dark:text-slate-100">{score}</div>
        <div className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">score / 100</div>
      </div>
    </div>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const [password, setPassword] = useState("m0on!drift/2026");
  const [shown, setShown] = useState(false);
  const [context, setContext] = useState("email");
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [moreOpen, setMoreOpen] = useState(false);
  const [generatorLength, setGeneratorLength] = useState(18);
  const [generatorKeyword, setGeneratorKeyword] = useState("");
  const [generatorNumber, setGeneratorNumber] = useState("");
  const [generatorSpecials, setGeneratorSpecials] = useState(["!"]);
  const [transitionState, setTransitionState] = useState<TransitionState | null>(null);
  const [pageScrollProgress, setPageScrollProgress] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialPlaying, setTutorialPlaying] = useState(false);
  const [tutorialMuted, setTutorialMuted] = useState(false);
  const [tutorialTime, setTutorialTime] = useState(0);
  const [deviceClass, setDeviceClass] = useState<DeviceClass>("desktop");
  const [lowMotion, setLowMotion] = useState(() => window.localStorage.getItem("monolith-vault-low-motion") === "true");
  const transitionTimer = useRef<number | undefined>(undefined);
  const tutorialVideo = useRef<HTMLVideoElement | null>(null);
  const tutorialNarration = useRef<HTMLAudioElement | null>(null);
  const tutorialAmbient = useRef<HTMLAudioElement | null>(null);
  const insight = useMemo(() => analysePassword(password), [password]);
  const activeContext = contexts.find((item) => item.id === context) ?? contexts[0];
  const activePalette = palettes[paletteIndex];
  const contextGap = Math.max(0, activeContext.target - insight.score);
  const ringColor = insight.status === "weak" ? "#E6817B" : insight.status === "medium" ? "#D5A333" : activePalette.color;
  const style = { "--brand": activePalette.color, "--brand-soft": activePalette.soft } as React.CSSProperties;
  const motifRowCount = deviceClass === "phone" ? 18 : deviceClass === "tablet" ? 22 : 26;
  const distributedMotifRows = Array.from({ length: motifRowCount }, (_, index) => index);

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    toast.success("Copied locally — paste it where you need it.");
  };

  const makePassword = () => {
    const nextPassword = generatePassword({ keyword: generatorKeyword, numeric: generatorNumber, specials: generatorSpecials, length: generatorLength });
    setPassword(nextPassword);
    setShown(true);
    toast.success(`Your ${nextPassword.length}-character password is ready to review.`);
  };

  const toggleSpecial = (character: string) => {
    setGeneratorSpecials((current) => current.includes(character) ? current.filter((item) => item !== character) : [...current, character]);
  };

  useEffect(() => () => window.clearTimeout(transitionTimer.current), []);

  useEffect(() => {
    if (lowMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPageScrollProgress(1);
      return;
    }

    const updatePageProgress = () => {
      const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setPageScrollProgress(Math.max(0, Math.min(1, window.scrollY / available)));
    };

    updatePageProgress();
    window.addEventListener("scroll", updatePageProgress, { passive: true });
    window.addEventListener("resize", updatePageProgress);
    return () => {
      window.removeEventListener("scroll", updatePageProgress);
      window.removeEventListener("resize", updatePageProgress);
    };
  }, [lowMotion]);

  useEffect(() => {
    window.localStorage.setItem("monolith-vault-low-motion", String(lowMotion));
  }, [lowMotion]);

  useEffect(() => {
    const classifyViewport = () => {
      const width = window.innerWidth;
      setDeviceClass(width < 640 ? "phone" : width < 1024 ? "tablet" : "desktop");
    };

    classifyViewport();
    window.addEventListener("resize", classifyViewport);
    return () => window.removeEventListener("resize", classifyViewport);
  }, []);

  const playTransition = (kind: TransitionKind, color: string, source: HTMLElement) => {
    if (lowMotion) return;
    const bounds = source.getBoundingClientRect();
    window.clearTimeout(transitionTimer.current);
    setTransitionState({ id: Date.now(), kind, color, x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
    transitionTimer.current = window.setTimeout(() => setTransitionState(null), 760);
  };

  const switchTheme = (source: HTMLButtonElement) => {
    playTransition("theme", activePalette.color, source);
    toggleTheme?.();
  };

  const pauseTutorial = () => {
    tutorialVideo.current?.pause();
    tutorialNarration.current?.pause();
    tutorialAmbient.current?.pause();
    setTutorialPlaying(false);
  };

  const closeTutorial = () => {
    pauseTutorial();
    setTutorialTime(0);
    if (tutorialVideo.current) tutorialVideo.current.currentTime = 0;
    if (tutorialNarration.current) tutorialNarration.current.currentTime = 0;
    if (tutorialAmbient.current) tutorialAmbient.current.currentTime = 0;
    setTutorialOpen(false);
  };

  const toggleTutorialPlayback = async () => {
    if (tutorialPlaying) {
      pauseTutorial();
      return;
    }
    try {
      await Promise.all([tutorialVideo.current?.play(), tutorialNarration.current?.play(), tutorialAmbient.current?.play()].filter(Boolean));
      setTutorialPlaying(true);
    } catch {
      toast.error("Your browser prevented audio playback. Tap play again to start the guide.");
    }
  };

  const toggleTutorialMute = () => {
    const nextMuted = !tutorialMuted;
    if (tutorialNarration.current) tutorialNarration.current.muted = nextMuted;
    if (tutorialAmbient.current) tutorialAmbient.current.muted = nextMuted;
    setTutorialMuted(nextMuted);
  };

  const activeSubtitle = tutorialSubtitles.find((subtitle) => tutorialTime >= subtitle.start && tutorialTime < subtitle.end) ?? tutorialSubtitles[tutorialSubtitles.length - 1];

  useEffect(() => () => pauseTutorial(), []);

  return (
    <div className={`atlas-shell relative overflow-x-hidden device-${deviceClass} ${lowMotion ? "motion-reduced" : ""}`} data-device={deviceClass} style={style}>
      {transitionState && <div key={transitionState.id} aria-hidden="true" className={`vault-shift vault-shift--${transitionState.kind}`} style={{ "--transition-color": transitionState.color, "--transition-x": `${transitionState.x}px`, "--transition-y": `${transitionState.y}px` } as React.CSSProperties}><span className="vault-shift__orbit" /><span className="vault-shift__pixels" /></div>}
      <aside className="scroll-security-rail" style={{ "--rail-brand": activePalette.color, "--scroll-progress": pageScrollProgress } as React.CSSProperties} aria-hidden="true">
        <div className="security-rail__halo" />
        <div className="security-rail__label">PROTECTION<br />DNA</div>
        <div className="security-rail__helix">
          <svg className="security-rail__trace" viewBox="0 0 100 1000" preserveAspectRatio="none">
            <path className="security-ribbon security-ribbon--primary" pathLength="1" d="M18 -40 C96 55 96 150 50 242 S4 420 50 515 S96 700 50 792 S4 965 50 1050" style={{ strokeDasharray: 1, strokeDashoffset: 0.72 - pageScrollProgress * 0.72 }} />
            <path className="security-ribbon security-ribbon--secondary" pathLength="1" d="M82 -40 C4 55 4 150 50 242 S96 420 50 515 S4 700 50 792 S96 965 50 1050" style={{ strokeDasharray: 1, strokeDashoffset: 0.72 - pageScrollProgress * 0.72 }} />
          </svg>
          {distributedMotifRows.map((row) => {
            const curvePhase = (row / (distributedMotifRows.length - 1)) * Math.PI * 2;
            const phase = row * 0.66 + pageScrollProgress * 8;
            const xPosition = 50 + Math.sin(curvePhase) * 33;
            const offset = Math.sin(phase) * (11 + pageScrollProgress * 27);
            const turn = Math.sin(phase) * (12 + pageScrollProgress * 24);
            const Motif = row % 4 === 0 ? KeyRound : row % 4 === 1 ? LockKeyhole : row % 4 === 2 ? ShieldCheck : Sparkles;
            return <div key={`rail-${row}`} className="security-rail__step" style={{ top: `${1 + row * (98 / (distributedMotifRows.length - 1))}%`, left: `${xPosition}%`, opacity: 0.58 + pageScrollProgress * 0.42 }}><span className="security-rail__rung" style={{ transform: `translateX(-50%) rotate(${turn}deg) scaleX(${0.54 + pageScrollProgress * 0.46})` }} /><span className="security-rail__bead" style={{ transform: `translateX(-50%) scale(${0.72 + pageScrollProgress * 0.28})` }} /><span className="security-rail__motif security-rail__motif--left" style={{ transform: `translateX(calc(-50% + ${offset}px)) rotate(${-turn}deg) scale(${0.72 + pageScrollProgress * 0.28})` }}><Motif className="h-3.5 w-3.5" /></span><span className="security-rail__motif security-rail__motif--right" style={{ transform: `translateX(calc(-50% - ${offset}px)) rotate(${turn}deg) scale(${0.72 + pageScrollProgress * 0.28})` }}><Motif className="h-3.5 w-3.5" /></span></div>;
          })}
        </div>
      </aside>
      {tutorialOpen && <div className="tutorial-drawer" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
        <button className="tutorial-backdrop" onClick={closeTutorial} aria-label="Close tutorial" />
        <section className="tutorial-player">
          <video ref={tutorialVideo} className="tutorial-video" src="/assets/tutorial-visual.mp4" loop muted={false} playsInline preload="metadata" onEnded={pauseTutorial} />
          <audio ref={tutorialNarration} src="/assets/tutorial-narration.wav" preload="metadata" onTimeUpdate={(event) => setTutorialTime(event.currentTarget.currentTime)} onEnded={pauseTutorial} />
          <audio ref={tutorialAmbient} src="/assets/tutorial-ambient.wav" preload="metadata" />
          <div className="tutorial-sheen" />
          <div className="tutorial-content">
            <div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/70">A quick orientation</p><h2 id="tutorial-title" className="display-face mt-1 text-2xl leading-tight text-white sm:text-3xl">How Monolith Vault works.</h2></div><button onClick={closeTutorial} className="grid h-9 w-9 place-items-center rounded-xl border border-white/30 bg-slate-950/25 text-white transition hover:bg-white/20" aria-label="Close tutorial"><X className="h-4 w-4" /></button></div>
            {tutorialPlaying && <div className="tutorial-subtitles" aria-live="polite"><p className="tutorial-subtitles__label">Monolith Vault guide</p><p className="tutorial-subtitles__line display-face">{activeSubtitle.text}</p></div>}
            <div className="tutorial-footer"><div className="max-w-xs text-[11px] leading-5 text-white/84">A short visual teaser with a 30-second audio guide covering local analysis, context, and custom password building.</div><div className="tutorial-actions"><button onClick={toggleTutorialMute} className="tutorial-icon-button grid h-12 w-12 place-items-center rounded-xl border border-white/30 bg-slate-950/35 text-white transition hover:bg-white/20" aria-label={tutorialMuted ? "Unmute tutorial" : "Mute tutorial"}>{tutorialMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button><button onClick={toggleTutorialPlayback} className="tutorial-play inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-extrabold text-slate-900" style={{ backgroundColor: activePalette.soft }}>{tutorialPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" fill="currentColor" />} {tutorialPlaying ? "Pause guide" : "Play guide"}</button></div></div>
          </div>
        </section>
      </div>}
      <div className="relative z-10 mx-auto max-w-[1480px] px-3 pb-6 pt-2 sm:px-6 sm:pb-8 sm:pt-3 lg:px-8">
        <header className="glass-card float-in flex items-center justify-between rounded-[1.35rem] px-3 py-2.5 sm:rounded-[1.5rem] sm:px-5 sm:py-3">
          <a href="#top" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label="Monolith Vault home">
            <span className="brand-seal grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl p-1 sm:h-12 sm:w-12 sm:rounded-2xl dark:bg-slate-100/10">
              <span className="star-lock-brand" style={{ transform: `rotate(${pageScrollProgress * 220}deg)` }}><span className="star-lock-brand__core"><LockKeyhole className="h-4 w-4 sm:h-5 sm:w-5" /></span></span>
            </span>
            <span>
              <span className="display-face block text-[17px] leading-none text-slate-800 sm:text-xl dark:text-slate-100">Monolith Vault</span>
              <span className="mt-1 block truncate text-[8px] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[9px] sm:tracking-[0.18em] dark:text-slate-400">Private strength reading</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/35 p-1 text-xs font-bold text-slate-600 shadow-inner dark:border-white/10 dark:bg-slate-950/20 dark:text-slate-300 md:flex">
              <ShieldCheck className="ml-2 h-3.5 w-3.5" style={{ color: activePalette.color }} />
              <span className="mr-2">Nothing leaves this screen</span>
            </div>
            <div className="motion-switch flex h-10 items-center gap-1.5 rounded-xl border border-white/70 bg-white/40 px-2 text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
              <Gauge className="h-3.5 w-3.5" style={{ color: lowMotion ? activePalette.color : undefined }} aria-hidden="true" />
              <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.1em] sm:inline">Low motion</span>
              <Switch checked={lowMotion} onCheckedChange={setLowMotion} aria-label="Enable low motion" className="data-[state=checked]:bg-slate-800 dark:data-[state=checked]:bg-white" />
            </div>
            <button onClick={(event) => switchTheme(event.currentTarget)} className={`theme-toggle grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/70 bg-white/40 text-slate-700 shadow-sm transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-100 ${transitionState?.kind === "theme" ? "theme-toggle--spinning" : ""}`} aria-label="Toggle light or dark mode">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </header>

        <main id="top" className="pt-3 sm:pt-6">
          <section className="relative overflow-hidden rounded-[1.45rem] border border-white/75 bg-[#e9e7eb] px-4 py-4 shadow-[14px_16px_34px_rgba(71,73,106,0.10)] sm:rounded-[1.75rem] sm:px-6 sm:py-5 lg:px-8">
            <img src="/assets/monolith-vault-hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-multiply dark:opacity-25 dark:mix-blend-screen" />
            <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/72 to-white/28 dark:from-[#191d2a]/92 dark:via-[#191d2a]/74 dark:to-[#191d2a]/36" />
            <div className="relative grid gap-3 sm:gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="float-in flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-600 sm:text-[11px] sm:tracking-[0.17em] dark:text-slate-300"><span className="h-px w-6 bg-current sm:w-8" />Password intelligence, in context</p>
                <h1 className="display-face float-in delay-1 mt-2 max-w-[15ch] text-[2.25rem] leading-[0.94] text-slate-800 sm:mt-3 sm:text-5xl lg:text-6xl dark:text-white">Read the signals before you reuse a secret.</h1>
                <p className="float-in delay-2 mt-3 max-w-xl text-[12px] leading-5 text-slate-600 sm:text-sm dark:text-slate-300">A private, on-device reading for the password you are considering — measured against the importance of what it protects.</p>
              </div>
              <div className="float-in delay-3 flex items-end justify-between gap-3 rounded-[1.2rem] border border-white/70 bg-white/40 p-3 shadow-[inset_1px_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md sm:gap-4 sm:rounded-[1.4rem] dark:border-white/10 dark:bg-slate-950/20">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Today’s principle</p>
                  <p className="display-face mt-1 max-w-[24ch] text-base leading-tight text-slate-800 sm:text-lg dark:text-white">A memorable phrase is stronger than a clever-looking pattern.</p>
                </div>
                <img src="/assets/monolith-vault-orb.png" alt="Abstract frosted security orb" className="h-12 w-12 shrink-0 object-contain drop-shadow-[0_9px_9px_rgba(80,92,124,0.18)] sm:h-16 sm:w-16" />
              </div>
            </div>
          </section>

          <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.8fr)]">
            <article className="glass-card petal-grid float-in delay-1 rounded-[1.45rem] p-3 sm:rounded-[1.7rem] sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">01 / read your password</p>
                  <h2 className="display-face mt-1 text-2xl text-slate-800 sm:text-3xl dark:text-white">Place the password in the lens.</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/40 px-2.5 py-1.5 text-[10px] font-bold text-slate-600 dark:border-white/10 dark:bg-black/15 dark:text-slate-300"><LockKeyhole className="h-3 w-3" style={{ color: activePalette.color }} />Local-only analysis</span><button onClick={() => setTutorialOpen(true)} className="tutorial-trigger tutorial-trigger--panel inline-flex h-9 items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-3 text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-700 transition hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-100" aria-label="Open the Monolith Vault tutorial"><span className="grid h-5 w-5 place-items-center rounded-md text-white" style={{ backgroundColor: activePalette.color }}><Play className="h-3 w-3" fill="currentColor" /></span><span>Watch tutorial</span></button></div>
              </div>

              <div className="inset-well mt-3 flex min-h-[52px] items-center gap-2 rounded-[1.1rem] border border-white/65 px-2.5 py-2 sm:gap-3 sm:rounded-[1.3rem] sm:px-3 dark:border-white/10">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/60 shadow-sm dark:bg-white/10"><KeyRound className="h-4 w-4" style={{ color: activePalette.color }} /></span>
                <label className="sr-only" htmlFor="password-input">Password to analyse</label>
                <input id="password-input" value={password} onChange={(event) => setPassword(event.target.value)} type={shown ? "text" : "password"} placeholder="Try a password…" autoComplete="off" spellCheck="false" className="min-w-0 flex-1 bg-transparent text-base font-bold tracking-[0.08em] text-slate-800 outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 dark:text-slate-100" />
                <button onClick={() => setShown((value) => !value)} aria-label={shown ? "Hide password" : "Show password"} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white">{shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={copyPassword} aria-label="Copy password" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-white/60 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"><Copy className="h-4 w-4" /></button>
              </div>

              <div className="strength-meter mt-3 rounded-xl border border-white/70 bg-white/30 px-3 py-2.5 dark:border-white/10 dark:bg-black/10" aria-label={`Password strength: ${insight.label}, ${insight.score} out of 100`}>
                <div className="flex items-center justify-between gap-3"><span className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Password strength</span><span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-100">{insight.label} <span className="font-normal text-slate-400 dark:text-slate-500">{insight.score}/100</span></span></div>
                <div className="relative mt-2.5 h-3 rounded-full bg-gradient-to-r from-rose-500 via-orange-400 via-yellow-300 to-emerald-500 shadow-[inset_0_1px_2px_rgba(0,0,0,.16)]"><span className="absolute top-1/2 h-5 w-5 rounded-full border-2 border-white bg-slate-900 shadow-[0_3px_8px_rgba(15,23,42,.3)] transition-[left] duration-500 ease-out dark:bg-white" style={{ left: `clamp(2px, calc(${insight.score}% - 10px), calc(100% - 22px))`, transform: "translateY(-50%)" }}><span className="absolute inset-[3px] rounded-full" style={{ backgroundColor: ringColor }} /></span></div>
                <div className="mt-1.5 flex justify-between text-[8px] font-extrabold uppercase tracking-[0.1em] text-slate-400 dark:text-slate-500"><span>Weak</span><span>Okay</span><span>Strong</span></div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1 sm:gap-1.5">
                {insight.checks.map((check) => <span key={check.label} className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold ${check.pass ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200" : "bg-slate-200/65 text-slate-500 dark:bg-white/8 dark:text-slate-400"}`}><span className={`grid h-3.5 w-3.5 place-items-center rounded-full ${check.pass ? "bg-emerald-500 text-white" : "border border-current"}`}>{check.pass && <Check className="h-2.5 w-2.5" />}</span>{check.label}</span>)}
              </div>

              <div className="mt-4 grid gap-2.5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="data-lens rounded-[1.25rem] border border-white/70 p-3 dark:border-white/10">
                  <div className="flex items-center justify-between"><span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Signal breakdown</span><CircleHelp className="h-4 w-4 text-slate-400" /></div>
                  <div className="mt-3 space-y-2.5">
                    {[{ label: "Length", value: Math.min(100, insight.length * 8.33) }, { label: "Character mix", value: insight.types * 25 }, { label: "Pattern resistance", value: Math.max(8, insight.score - 10) }].map((item) => <div key={item.label}><div className="mb-1 flex justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300"><span>{item.label}</span><span>{Math.round(item.value)}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/65 shadow-inner dark:bg-black/20"><div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: activePalette.color, transition: "width 500ms cubic-bezier(0.23,1,0.32,1)" }} /></div></div>)}
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[1.25rem] border border-white/70 bg-slate-900 p-3 text-white shadow-[inset_1px_1px_0_rgba(255,255,255,0.12)]">
                  <img src="/assets/monolith-vault-texture.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-screen" />
                  <div className="relative"><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-300">Straight answer</p><p className="display-face mt-1 text-lg leading-tight">{insight.issues[0]}</p><p className="mt-2 text-[10px] leading-4 text-slate-300">This reading catches familiar weak patterns. It does not send, save, or validate your password anywhere.</p></div>
                </div>
              </div>

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/75 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400"><UnlockKeyhole className="h-3.5 w-3.5" style={{ color: activePalette.color }} />If reused, change it where risk is highest.</p>
                <button onClick={makePassword} className="tactile-button inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-extrabold text-white sm:min-h-0 sm:w-auto" style={{ backgroundColor: activePalette.color }}><RefreshCw className="h-3.5 w-3.5" />Generate from preferences</button>
              </div>
              <section className="data-lens mt-3 rounded-[1.25rem] border border-white/70 p-3 dark:border-white/10" aria-labelledby="builder-heading">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">Password builder</p><h3 id="builder-heading" className="display-face mt-0.5 text-xl text-slate-800 dark:text-white">Make it yours, not obvious.</h3></div><span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 shadow-sm dark:bg-white/10 dark:text-slate-300">Target {generatorLength} chars</span></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <label className="rounded-xl border border-white/75 bg-white/45 p-2.5 dark:border-white/10 dark:bg-white/5"><span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Keyword / character</span><input value={generatorKeyword} onChange={(event) => setGeneratorKeyword(event.target.value)} maxLength={22} autoComplete="off" spellCheck="false" placeholder="e.g. Harbor" className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-slate-100" /><span className="mt-0.5 block text-[9px] leading-3.5 text-slate-500 dark:text-slate-400">Avoid names or birthdays.</span></label>
                  <label className="rounded-xl border border-white/75 bg-white/45 p-2.5 dark:border-white/10 dark:bg-white/5"><span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Numeric value</span><input value={generatorNumber} onChange={(event) => setGeneratorNumber(event.target.value.replace(/\D/g, "").slice(0, 12))} inputMode="numeric" maxLength={12} autoComplete="off" placeholder="e.g. 47" className="mt-1 w-full bg-transparent text-sm font-bold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 dark:text-slate-100" /><span className="mt-0.5 block text-[9px] leading-3.5 text-slate-500 dark:text-slate-400">Avoid a familiar date.</span></label>
                  <label className="rounded-xl border border-white/75 bg-white/45 p-2.5 dark:border-white/10 dark:bg-white/5"><span className="block text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Special characters</span><input value={generatorSpecials.join("")} onChange={(event) => setGeneratorSpecials(Array.from(event.target.value).filter((character, index, characters) => /[^A-Za-z0-9\s]/.test(character) && characters.indexOf(character) === index).slice(0, 8))} maxLength={8} autoComplete="off" placeholder="!#?" className="mt-1 w-full bg-transparent text-sm font-bold tracking-[0.18em] text-slate-800 outline-none placeholder:font-medium placeholder:tracking-normal placeholder:text-slate-400 dark:text-slate-100" /><span className="mt-0.5 block text-[9px] leading-3.5 text-slate-500 dark:text-slate-400">One or several separators.</span></label>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                  <div><div className="flex items-center justify-between gap-4"><label htmlFor="password-length" className="text-[11px] font-extrabold text-slate-700 dark:text-slate-100">Password length</label><span className="text-[11px] font-extrabold" style={{ color: activePalette.color }}>{generatorLength} characters</span></div><input id="password-length" type="range" min="12" max="32" step="1" value={generatorLength} onChange={(event) => setGeneratorLength(Number(event.target.value))} className="mt-1.5 w-full" style={{ accentColor: activePalette.color }} /><div className="mt-1 flex justify-between text-[9px] font-bold text-slate-500 dark:text-slate-400"><span>12</span><span>16</span><span>20</span><span>24</span><span>32</span></div></div>
                  <div className="flex flex-wrap gap-1" aria-label="Select one or more special characters">{specialChoices.map((character) => <button key={character} onClick={() => toggleSpecial(character)} aria-pressed={generatorSpecials.includes(character)} className={`grid h-8 w-8 place-items-center rounded-lg border text-xs font-extrabold transition ${generatorSpecials.includes(character) ? "border-transparent bg-slate-800 text-white shadow-md dark:bg-white dark:text-slate-900" : "border-white/75 bg-white/55 text-slate-600 hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}>{character}</button>)}</div>
                </div>
                <div className="mt-3 flex flex-col gap-2 border-t border-slate-200/70 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10"><p className="text-[10px] leading-4 text-slate-500 dark:text-slate-400">Selected: <strong className="text-slate-700 dark:text-slate-200">{generatorSpecials.length ? generatorSpecials.join(" ") : "default !"}</strong>. Vault rotates through them.</p><button onClick={makePassword} className="tactile-button inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-3 py-2 text-[11px] font-extrabold text-white" style={{ backgroundColor: activePalette.color }}><Sparkles className="h-3.5 w-3.5" />Build password</button></div>
              </section>
              <div className="mt-6 hidden grid-cols-3 gap-3 border-t border-slate-200/60 pt-5 xl:grid dark:border-white/10">
                {[{ label: "Reusable?", value: "Avoid it", note: "Keep this password unique." }, { label: "Sensitive use", value: activeContext.label, note: `${activeContext.target}+ is the right target.` }, { label: "Next move", value: insight.score < activeContext.target ? "Strengthen it" : "Store it", note: insight.score < activeContext.target ? "Add length before complexity." : "Use a password manager." }].map((item) => <div key={item.label} className="rounded-2xl border border-white/60 bg-white/25 p-4 dark:border-white/10 dark:bg-white/5"><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-2 text-sm font-extrabold text-slate-800 dark:text-slate-100">{item.value}</p><p className="mt-1 text-[11px] leading-4 text-slate-500 dark:text-slate-400">{item.note}</p></div>)}
              </div>
            </article>

            <aside className="space-y-3 sm:space-y-4">
              <section className="glass-card petal-grid float-in delay-2 rounded-[1.45rem] p-3 sm:rounded-[1.7rem] sm:p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">02 / choose what it protects</p>
                <h2 className="display-face mt-1 text-2xl text-slate-800 dark:text-white">Context changes the bar.</h2>
                <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3 xl:grid-cols-2">
                  {contexts.map((item) => <button key={item.id} onClick={() => setContext(item.id)} className={`min-h-[68px] rounded-xl border p-2 text-left transition ${context === item.id ? "border-transparent bg-[color:var(--brand-soft)]/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_14px_rgba(70,75,108,0.11)]" : "border-white/65 bg-white/25 hover:-translate-y-0.5 hover:bg-white/60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"}`}><span className="mb-1 block text-base" aria-hidden="true">{item.icon}</span><span className="block text-[11px] font-extrabold text-slate-700 dark:text-slate-100">{item.label}</span><span className="mt-0.5 block text-[9px] leading-3 text-slate-500 dark:text-slate-400">Target {item.target}</span></button>)}
                </div>
                <div className="mt-3 rounded-xl border border-white/70 bg-white/35 p-2.5 dark:border-white/10 dark:bg-black/10"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-100">{activeContext.label}</p><p className="mt-0.5 text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">{activeContext.note}</p></div><span className="rounded-full px-2 py-0.5 text-[9px] font-extrabold" style={{ backgroundColor: activePalette.soft, color: activePalette.color }}>{activeContext.target}+</span></div></div>
              </section>

              <section className="glass-card float-in delay-3 rounded-[1.45rem] p-3 sm:rounded-[1.7rem] sm:p-4">
                <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">03 / your reading</p><h2 className="display-face mt-1 text-2xl text-slate-800 dark:text-white">{insight.label}</h2></div><span className="grid h-8 w-8 place-items-center rounded-xl bg-white/55 shadow-sm dark:bg-white/10"><Sparkles className="h-4 w-4" style={{ color: ringColor }} /></span></div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-2"><ScoreRing score={insight.score} color={ringColor} /><div className="min-w-[130px] flex-1"><p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">Guess resistance</p><p className="display-face mt-0.5 text-lg text-slate-800 sm:text-xl dark:text-white">{insight.crackTime}</p><p className="mt-1 text-[10px] leading-3.5 text-slate-500 dark:text-slate-400">About {insight.bits} bits from length and variety.</p></div></div>
                <div className="data-lens mt-3 rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-white"><div className="flex items-center justify-between text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-300"><span>Context fit</span><span>{contextGap ? `${contextGap} points short` : "meets target"}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full" style={{ width: `${Math.min(100, (insight.score / activeContext.target) * 100)}%`, backgroundColor: ringColor, transition: "width 500ms cubic-bezier(0.23,1,0.32,1)" }} /></div></div>
              </section>
            </aside>
          </section>

          <section className="mt-3 grid gap-3 sm:mt-4 sm:gap-4 lg:grid-cols-[0.8fr_1.2fr]">
            <article className="glass-card petal-grid rounded-[1.45rem] p-3 sm:rounded-[1.7rem] sm:p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">A small principle</p><h2 className="display-face mt-2 text-3xl leading-tight text-slate-800 dark:text-white">Mixing is useful when it has a job.</h2></div><Lightbulb className="h-6 w-6 shrink-0" style={{ color: activePalette.color }} /></div>
              <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">Instead of swapping <strong>e</strong> for <strong>3</strong> in a short word, use a long phrase with purposeful punctuation. Length creates room; variety prevents predictable guessing.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="inset-well rounded-xl p-2.5"><div className="flex items-center justify-between"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Predictable</p><span className="h-1 w-7 rounded-full bg-rose-300" /></div><p className="mt-0.5 text-sm font-bold text-rose-500">Summer123!</p><p className="mt-0.5 text-[9px] text-slate-500">Common word + sequence</p></div><div className="data-lens rounded-xl p-2.5"><div className="flex items-center justify-between"><p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Thoughtful</p><span className="h-1 w-7 rounded-full" style={{ backgroundColor: activePalette.color }} /></div><p className="mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-100">Moss!Lantern47</p><p className="mt-0.5 text-[9px] text-slate-500">Longer, mixed, personal</p></div></div>
            </article>

            <article className="glass-card petal-grid rounded-[1.45rem] p-3 sm:rounded-[1.7rem] sm:p-4">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Your safer routine</p><h2 className="display-face mt-2 text-3xl text-slate-800 dark:text-white">Make the strong choice easier to repeat.</h2></div><button onClick={() => setMoreOpen((value) => !value)} className="inline-flex items-center gap-1 rounded-xl border border-white/70 bg-white/30 px-3 py-2 text-xs font-extrabold text-slate-600 transition hover:bg-white/65 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">Details <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? "rotate-180" : ""}`} /></button></div>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">{[{ n: "01", t: "Use a manager", d: "Let it remember unique long passwords." }, { n: "02", t: "Keep secrets unique", d: "One leaked password should stay isolated." }, { n: "03", t: "Add two-step sign-in", d: "A second proof reduces takeover risk." }].map((item) => <div key={item.n} className="data-lens rounded-xl border border-white/65 p-2.5 dark:border-white/10"><div className="flex items-center justify-between"><span className="text-[10px] font-extrabold" style={{ color: activePalette.color }}>{item.n}</span><span className="h-1 w-5 rounded-full" style={{ backgroundColor: activePalette.color }} /></div><p className="mt-2 text-xs font-extrabold text-slate-700 dark:text-slate-100">{item.t}</p><p className="mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">{item.d}</p></div>)}</div>
              {moreOpen && <div className="mt-4 rounded-2xl border border-dashed border-slate-300/80 bg-white/30 p-4 text-xs leading-5 text-slate-600 dark:border-slate-600 dark:bg-black/10 dark:text-slate-300">Monolith Vault does not replace a password manager’s breach monitoring. Its purpose is to help you spot easy-to-avoid patterns before you use a password.</div>}
            </article>
          </section>

        </main>

        <footer className="mt-3 flex flex-col gap-2 border-t border-slate-300/60 py-4 text-[10px] text-slate-500 sm:mt-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-slate-400"><p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: activePalette.color }} />Passwords are analysed in your browser. They are never submitted.</p><div className="flex flex-wrap items-center gap-1.5"><span className="mr-1 font-bold uppercase tracking-[0.14em]">Accent</span>{palettes.map((palette, index) => <button key={palette.name} onClick={(event) => { playTransition("palette", palette.color, event.currentTarget); setPaletteIndex(index); }} title={`${palette.name} palette`} aria-label={`Use ${palette.name} palette`} className={`palette-dot h-4 w-4 rounded-full border-2 transition hover:scale-110 ${paletteIndex === index ? "palette-dot--active scale-125 border-slate-700 opacity-100 shadow-[0_0_0_3px_rgba(125,167,216,0.22)] dark:border-white" : "border-white/80 opacity-55 hover:opacity-100 dark:border-white/20"}`} style={{ backgroundColor: palette.color }} />)}</div><p>Made for mindful secrets.</p></footer>
      </div>
    </div>
  );
}
