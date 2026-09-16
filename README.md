# Captioniq — Studio Subtitle Editor & 60 FPS Burner

> **Burn beautiful, viral subtitles into video at a constant 60 FPS with zero dropped frames. 100% in-browser, privacy-first, and natively compatible with WhatsApp, iOS, and Instagram.**

---

## ⚡ The Problems Captioniq Solves

### 1. WhatsApp "Unusual Format or Corrupted" Error
Traditional browser export tools rely on the native `MediaRecorder` API, which streams fragmented MP4 files (`fMP4`) made of sequential `moof` and `mdat` chunks without a top-level duration header. WhatsApp's security scanner strictly flags fragmented streams as potentially corrupted or dangerous. 

**Captioniq Solution:** Muxes a strict, compliant **FastStart ISO MP4 container** with the metadata index (`moov` atom) front-loaded before the media payload (`mdat`). WhatsApp, QuickTime, iOS, and Android open and play exported files natively with zero warnings.

### 2. Choppy, Stuttering Video at 1080p & 4K
Standard tools capture a live `<canvas>` stream at 1x real-time playback. When canvas drawing exceeds 16.6ms per frame, the browser drops frames, resulting in stuttering and desynchronized audio.

**Captioniq Solution:** Uses hardware-accelerated **WebCodecs (`VideoEncoder`)** with deterministic time-step seeking. Every frame is mathematically sampled (`currentTime = frameIndex / fps`), drawn, and encoded with **zero dropped frames** at true 30 or 60 FPS.

---

## ✨ Features

- **🔥 Trending Creator Presets:** One-click presets modeled after top creators:
  - **Hormozi Viral:** High-contrast bold yellow fill with thick black stroke and uppercase impact.
  - **MrBeast Punch:** Ultra-bold cyan/yellow typography with heavy contrast borders.
  - **TikTok & Reels:** Centered punchy narrative text with subtle drop shadow.
  - **Ali Abdaal Clean:** Minimalist modern typography with frosted glass background capsule.
  - **Cinematic 2.35:1:** Elegant serif typography with expanded letter spacing.
  - **Cyberpunk Neon:** Electric cyan/magenta glow for gaming and tech content.
- **🎙️ Speech-to-Text & Auto-Transcription:**
  - In-browser speech engine powered by WebAssembly (100% private, zero data leaves machine).
  - Fast cloud Whisper integration (Groq / OpenAI) transcribing long videos in 1–2 seconds.
- **🇮🇳 Hindi & Roman Hindish Transliteration:**
  - Choose between authentic **Devanagari Hindi** (`आप कैसे हैं`) and popular **Roman Hindish** (`Aap kaise hain`).
- **🎨 Comprehensive Customization Panel:**
  - 14+ curated Google Fonts (Inter, Oswald, Bebas Neue, Montserrat, Poppins, Playfair Display, etc.).
  - Micro-adjustable font size, stroke outline width, text shadow blur, and padding.
  - Vertical (5%–95%) and Horizontal (5%–95%) positioning with 1:1 viewport export matching.
- **🔒 100% Client-Side Privacy:**
  - All video frames, audio tracks, and subtitles are processed entirely in local memory.
  - Zero server queues, zero subscriptions, zero watermarks.

---

## 🛠️ Tech Stack & Architecture

- **Core:** Modern Vanilla JavaScript (ES2024), Semantic HTML5, CSS Grid & Flexbox
- **Video Decoding & Encoding:** [WebCodecs API](`VideoEncoder`, `VideoFrame`)
- **Container Muxing:** [mp4-muxer](`Mp4Muxer`) FastStart in-memory ISO/IEC 14496-14 writer
- **Audio Extraction & Sync:** Web Audio API (`AudioContext`, `decodeAudioData`) with standard AAC (`mp4a.40.2`) encoding
- **Speech Recognition:** Whisper WebAssembly & Groq Whisper Large V3

---

## 🚀 Getting Started

Clone the repository and run any local HTTP server:

```bash
# Clone the repository
git clone https://github.com/umersmx/captioniq.git

# Navigate to project folder
cd captioniq

# Start a local static server (using Python or Live Server)
python -m http.server 5500
# or
npx serve .
```

Open your browser at `http://127.0.0.1:5500` and start subtitling!

---

## 📄 License

MIT License © 2026 Muhammad Umer Farooq. Free for personal and commercial video production.
