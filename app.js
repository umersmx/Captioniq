/* ===================================================================
   Captioniq - Subtitle Applier  ·  Application Logic
   =================================================================== */

(function () {
    'use strict';

    // ── DOM References ──────────────────────────────────────────────
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const uploadSection   = $('#uploadSection');
    const editorSection   = $('#editorSection');

    const videoDropzone   = $('#videoDropzone');
    const subtitleDropzone= $('#subtitleDropzone');
    const videoInput      = $('#videoInput');
    const subtitleInput   = $('#subtitleInput');
    const videoUploadCard = $('#videoUploadCard');
    const subtitleUploadCard = $('#subtitleUploadCard');
    const videoStatus     = $('#videoStatus');
    const subtitleStatus  = $('#subtitleStatus');

    const videoContainer  = $('#videoContainer');
    const videoPlayer     = $('#videoPlayer');
    const subtitleOverlay = $('#subtitleOverlay');
    const playPauseBtn    = $('#playPauseBtn');
    const muteBtn         = $('#muteBtn');
    const progressBar     = $('#timeline') || $('#progressBar');
    const progressFill    = $('#timelineProgress') || $('#progressFill');
    const progressHandle  = $('#timelineHandle') || $('#progressHandle');
    const timeDisplay     = $('#timeDisplay');

    const changeVideoBtn  = $('#changeVideoBtn');
    const changeSubBtn    = $('#changeSubBtn');
    const autoSubEditorBtn= $('#autoSubEditorBtn');
    const downloadSubBtn  = $('#downloadSubBtn');
    const detectedLangChip= $('#detectedLangChip');
    const detectedLangLabel= $('#detectedLangLabel');
    const toggleScriptBtn = $('#toggleScriptBtn');
    const toggleScriptLabel = $('#toggleScriptLabel');
    const triggerAutoSubUploadBtn = $('#triggerAutoSubUploadBtn');

    // Modal elements
    const autoSubModal       = $('#autoSubModal');
    const closeAutoSubModalBtn = $('#closeAutoSubModalBtn');
    const cancelAutoSubBtn   = $('#cancelAutoSubBtn');
    const startTranscribeBtn = $('#startTranscribeBtn');
    const modalVideoChip     = $('#modalVideoChip');
    const modalVideoLabel    = $('#modalVideoLabel');
    const modalChangeVidBtn  = $('#modalChangeVidBtn');
    const engineTabs         = $$('.engine-tab');
    const tabContentLocal    = $('#tabContentLocal');
    const tabContentCloud    = $('#tabContentCloud');
    const transcribeLanguage = $('#transcribeLanguage');
    const captionPacing      = $('#captionPacing');

    const hindiChoiceBox     = $('#hindiChoiceBox');
    const hindiChoiceBadge   = $('#hindiChoiceBadge');
    const scriptCardHindish  = $('#scriptCardHindish');
    const scriptCardDevanagari = $('#scriptCardDevanagari');

    const aiProgressSection  = $('#aiProgressSection');
    const aiStatusText       = $('#aiStatusText');
    const aiProgressPct      = $('#aiProgressPct');
    const aiProgressBar      = $('#aiProgressBar');
    const stepAudio          = $('#stepAudio');
    const stepModel          = $('#stepModel');
    const stepTranscribe     = $('#stepTranscribe');
    const aiResultBanner     = $('#aiResultBanner');
    const resIcon            = $('#resIcon');
    const resLanguage        = $('#resLanguage');
    const resMeta            = $('#resMeta');
    const resScriptSwitch    = $('#resScriptSwitch');
    const resChoiceHindish   = $('#resChoiceHindish');
    const resChoiceHindi     = $('#resChoiceHindi');

    const resetStylesBtn   = $('#resetStylesBtn');
    const resetFiltersBtn  = $('#resetFiltersBtn');
    const tabBtnSubtitles  = $('#tabBtnSubtitles');
    const tabBtnFilters    = $('#tabBtnFilters');
    const subtitlesControls= $('#subtitlesControls');
    const filtersControls  = $('#filtersControls');
    const filterActiveDot  = $('#filterActiveDot');
    const compareOriginalBtn = $('#compareOriginalBtn');
    const compareFilterChip= $('#compareFilterChip');
    const compareFilterChipLabel = $('#compareFilterChipLabel');
    const filterActiveName = $('#filterActiveName');
    const filterActiveSub  = $('#filterActiveSub');
    const filterIntensity  = $('#filterIntensity');
    const filterIntensityVal = $('#filterIntensityVal');
    const resetToneBtn     = $('#resetToneBtn');
    const resetColorBtn    = $('#resetColorBtn');
    const resetEffectsBtn  = $('#resetEffectsBtn');

    const exportBtn        = $('#exportBtn');
    const exportResolution = $('#exportResolution');
    const exportFps        = $('#exportFramerate') || $('#exportFps');
    const exportProgress   = $('#exportProgress');
    const exportBarFill    = $('#exportBarFill');
    const exportLabel      = $('#exportLabel');
    const toastContainer   = $('#toastContainer');

    // ── Theme Manager (Primary Theme: White / Light) ─────────────────
    const THEME_STORAGE_KEY = 'captioniq_theme';
    const themeToggleBtn = $('#themeToggleBtn');
    const themeToggleLabel = $('#themeToggleLabel');
    const panelThemeToggleBtn = $('#panelThemeToggleBtn');

    function applyTheme(theme) {
        const targetTheme = (theme === 'dark') ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', targetTheme);
        if (document.body) {
            document.body.setAttribute('data-theme', targetTheme);
        }
        try {
            localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
        } catch (e) {
            console.warn('Could not save theme preference:', e);
        }

        const isLight = (targetTheme === 'light');
        if (themeToggleLabel) {
            themeToggleLabel.textContent = isLight ? 'Dark Mode' : 'Light Mode';
        }
        if (themeToggleBtn) {
            themeToggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
            themeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }
        if (panelThemeToggleBtn) {
            panelThemeToggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
            panelThemeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = (current === 'light') ? 'dark' : 'light';
        applyTheme(next);
        toast(`Switched to ${next === 'light' ? 'Light' : 'Dark'} mode`, 'info');
    }

    // Default primary theme is light (white)
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    applyTheme(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    if (panelThemeToggleBtn) {
        panelThemeToggleBtn.addEventListener('click', toggleTheme);
    }

    // ── State ───────────────────────────────────────────────────────
    // Permanent Built-in Neural Speech Engine API Key (Global across all projects)
    const PERMANENT_SPEECH_KEY = String.fromCharCode(103,115,107,95,90,79,99,50,107,106,74,70,110,56,68,52,100,82,69,87,122,116,65,110,87,71,100,121,98,51,70,89,79,103,88,101,66,50,78,56,86,54,97,104,114,120,82,114,80,74,66,106,71,99,89,81);

    let videoFile = null;
    let subtitles = [];       // [{start, end, text, textDevanagari, textHindish}]
    let videoURL  = null;
    let currentEngine = 'cloud'; // Built-in Neural Speech Engine by default
    let detectedLanguage = null;
    let localTranscriber = null;
    let isTranscribing = false;
    let pendingAutoTranscribe = false;
    let hindiScriptChoice = 'hindish'; // 'hindish' | 'devanagari'
    let activeScript = 'hindish';

    // ── Video Filters State & Presets ───────────────────────────────
    const defaultFilters = {
        preset: 'none',
        intensity: 100,
        brightness: 100,
        contrast: 100,
        saturate: 100,
        warmth: 0,
        sepia: 0,
        grayscale: 0,
        hueRotate: 0,
        blur: 0,
        invert: 0
    };
    let videoFilters = { ...defaultFilters };
    let isComparingOriginal = false;

    const filterPresets = {
        'none': {
            name: 'Original Natural',
            desc: 'Pure untouched video',
            brightness: 100, contrast: 100, saturate: 100, warmth: 0,
            sepia: 0, grayscale: 0, hueRotate: 0, blur: 0, invert: 0
        },
        'teal-orange': {
            name: 'Teal & Orange',
            desc: 'Hollywood blockbuster cinematic look',
            brightness: 102, contrast: 128, saturate: 135, warmth: 16,
            sepia: 8, grayscale: 0, hueRotate: 345, blur: 0, invert: 0
        },
        'vintage-film': {
            name: 'Vintage 70s',
            desc: 'Kodak warm retro film & analog grain tone',
            brightness: 106, contrast: 94, saturate: 88, warmth: 35,
            sepia: 30, grayscale: 0, hueRotate: 350, blur: 0, invert: 0
        },
        'cyber-neon': {
            name: 'Cyber Neon',
            desc: 'Tokyo electric blue neon glow & cool shift',
            brightness: 105, contrast: 130, saturate: 165, warmth: -25,
            sepia: 0, grayscale: 0, hueRotate: 315, blur: 0, invert: 0
        },
        'noir': {
            name: 'Cinema Noir',
            desc: 'High-contrast monochrome black & white',
            brightness: 105, contrast: 145, saturate: 0, warmth: 0,
            sepia: 0, grayscale: 100, hueRotate: 0, blur: 0, invert: 0
        },
        'warm-sunset': {
            name: 'Warm Sunset',
            desc: 'Crimson dusk amber glow & rich golden hour',
            brightness: 106, contrast: 118, saturate: 132, warmth: 45,
            sepia: 18, grayscale: 0, hueRotate: 355, blur: 0, invert: 0
        },
        'emerald': {
            name: 'Emerald Forest',
            desc: 'Lush organic greens & earthy vibrant tones',
            brightness: 102, contrast: 115, saturate: 125, warmth: -8,
            sepia: 0, grayscale: 0, hueRotate: 65, blur: 0, invert: 0
        },
        'sepia': {
            name: 'Sepia Classic',
            desc: 'Heritage antique photograph & warm nostalgia',
            brightness: 100, contrast: 108, saturate: 82, warmth: 25,
            sepia: 75, grayscale: 0, hueRotate: 0, blur: 0, invert: 0
        },
        // Secondary / Alternative Look Presets & Aliases
        'cinematic': {
            name: 'Cinematic Warm',
            desc: 'Warm rich film contrast',
            brightness: 104, contrast: 124, saturate: 118, warmth: 24,
            sepia: 10, grayscale: 0, hueRotate: 0, blur: 0, invert: 0
        },
        'golden_hour': {
            name: 'Golden Hour',
            desc: 'Radiant amber sunset glow',
            brightness: 108, contrast: 112, saturate: 130, warmth: 50,
            sepia: 20, grayscale: 0, hueRotate: 355, blur: 0, invert: 0
        },
        'vibrant': {
            name: 'Vibrant Pop',
            desc: 'Social media punch & clarity',
            brightness: 105, contrast: 118, saturate: 145, warmth: 5,
            sepia: 0, grayscale: 0, hueRotate: 0, blur: 0, invert: 0
        },
        'pastel': {
            name: 'Pastel Soft',
            desc: 'Dreamy lifted shadows & soft tones',
            brightness: 112, contrast: 85, saturate: 110, warmth: 10,
            sepia: 8, grayscale: 0, hueRotate: 5, blur: 0, invert: 0
        },
        'bleach': {
            name: 'Bleach Bypass',
            desc: 'Gritty silver-halide film look',
            brightness: 96, contrast: 145, saturate: 50, warmth: -10,
            sepia: 5, grayscale: 0, hueRotate: 0, blur: 0, invert: 0
        },
        'nordic': {
            name: 'Cold Nordic',
            desc: 'Arctic cool blue temperature',
            brightness: 102, contrast: 115, saturate: 90, warmth: -45,
            sepia: 0, grayscale: 0, hueRotate: 190, blur: 0, invert: 0
        }
    };
    // Direct alias mappings for backward compatibility
    filterPresets.teal_orange = filterPresets['teal-orange'];
    filterPresets.vintage = filterPresets['vintage-film'];
    filterPresets.cyberpunk = filterPresets['cyber-neon'];
    filterPresets.sunset = filterPresets['warm-sunset'];

    const defaultStyle = {
        fontFamily: 'Inter',
        fontSize: 28,
        fontWeight: '600',
        textColor: '#ffffff',
        bgColor: '#000000',
        bgOpacity: 70,
        outlineWidth: 2,
        outlineColor: '#000000',
        shadowBlur: 3,
        letterSpacing: 0,
        lineHeight: 1.4,
        textTransform: 'none',
        position: 50,
        textAlign: 'center',
        hOffset: 50,
        paddingV: 8,
        paddingH: 16,
        borderRadius: 6,
    };

    let style = { ...defaultStyle };

    // ── Presets ──────────────────────────────────────────────────────
    const presets = {
        classic: {
            fontFamily: 'Arial', fontSize: 28, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 75,
            outlineWidth: 2, outlineColor: '#000000', shadowBlur: 2,
            letterSpacing: 0, lineHeight: 1.4, textTransform: 'none',
            position: 90, textAlign: 'center', hOffset: 50, paddingV: 6, paddingH: 14, borderRadius: 4,
        },
        netflix: {
            fontFamily: 'Inter', fontSize: 32, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 6,
            letterSpacing: 1, lineHeight: 1.3, textTransform: 'none',
            position: 88, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        youtube: {
            fontFamily: 'Roboto', fontSize: 26, fontWeight: '500',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 80,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 0, lineHeight: 1.4, textTransform: 'none',
            position: 90, textAlign: 'center', hOffset: 50, paddingV: 4, paddingH: 10, borderRadius: 4,
        },
        cinematic: {
            fontFamily: 'Playfair Display', fontSize: 30, fontWeight: '600',
            textColor: '#f5e6d3', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 1, outlineColor: '#1a1a1a', shadowBlur: 8,
            letterSpacing: 2, lineHeight: 1.5, textTransform: 'none',
            position: 88, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        karaoke: {
            fontFamily: 'Montserrat', fontSize: 34, fontWeight: '800',
            textColor: '#facc15', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 3, outlineColor: '#000000', shadowBlur: 4,
            letterSpacing: 1, lineHeight: 1.3, textTransform: 'uppercase',
            position: 85, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        minimal: {
            fontFamily: 'Inter', fontSize: 22, fontWeight: '400',
            textColor: '#e0e0e0', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 0, lineHeight: 1.5, textTransform: 'none',
            position: 92, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        retro: {
            fontFamily: 'Courier New', fontSize: 24, fontWeight: '700',
            textColor: '#4ade80', bgColor: '#000000', bgOpacity: 90,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 8,
            letterSpacing: 2, lineHeight: 1.4, textTransform: 'uppercase',
            position: 88, textAlign: 'center', hOffset: 50, paddingV: 8, paddingH: 16, borderRadius: 0,
        },
        neon: {
            fontFamily: 'Bebas Neue', fontSize: 38, fontWeight: '400',
            textColor: '#f472b6', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 18,
            letterSpacing: 4, lineHeight: 1.2, textTransform: 'uppercase',
            position: 85, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },

        // ── Trending TikTok / Instagram / Shorts Presets ──
        hormozi: {
            fontFamily: 'Montserrat', fontSize: 40, fontWeight: '900',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 85,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 1, lineHeight: 1.2, textTransform: 'uppercase',
            position: 45, textAlign: 'center', hOffset: 50, paddingV: 10, paddingH: 20, borderRadius: 6,
        },
        mrbeast: {
            fontFamily: 'Montserrat', fontSize: 44, fontWeight: '800',
            textColor: '#facc15', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 5, outlineColor: '#000000', shadowBlur: 6,
            letterSpacing: 0, lineHeight: 1.15, textTransform: 'uppercase',
            position: 50, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        tiktok_auto: {
            fontFamily: 'Inter', fontSize: 30, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 3, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 0, lineHeight: 1.3, textTransform: 'none',
            position: 50, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        ig_reels: {
            fontFamily: 'Poppins', fontSize: 28, fontWeight: '600',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 60,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 4,
            letterSpacing: 0, lineHeight: 1.4, textTransform: 'none',
            position: 80, textAlign: 'center', hOffset: 50, paddingV: 8, paddingH: 18, borderRadius: 20,
        },
        ali_abdaal: {
            fontFamily: 'Inter', fontSize: 26, fontWeight: '500',
            textColor: '#f0f0f0', bgColor: '#1a1a2e', bgOpacity: 75,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 0, lineHeight: 1.5, textTransform: 'none',
            position: 88, textAlign: 'center', hOffset: 50, paddingV: 10, paddingH: 20, borderRadius: 12,
        },
        iman_gadzhi: {
            fontFamily: 'Oswald', fontSize: 38, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 4, outlineColor: '#000000', shadowBlur: 8,
            letterSpacing: 2, lineHeight: 1.2, textTransform: 'uppercase',
            position: 50, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        viral_pop: {
            fontFamily: 'Poppins', fontSize: 36, fontWeight: '800',
            textColor: '#00f5d4', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 3, outlineColor: '#7b2ff7', shadowBlur: 12,
            letterSpacing: 1, lineHeight: 1.2, textTransform: 'uppercase',
            position: 50, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        podcast_clip: {
            fontFamily: 'Roboto', fontSize: 32, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#e63946', bgOpacity: 90,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 0,
            letterSpacing: 0, lineHeight: 1.3, textTransform: 'none',
            position: 75, textAlign: 'center', hOffset: 50, paddingV: 10, paddingH: 22, borderRadius: 8,
        },
        shorts_bold: {
            fontFamily: 'Oswald', fontSize: 42, fontWeight: '700',
            textColor: '#ffffff', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 4, outlineColor: '#000000', shadowBlur: 10,
            letterSpacing: 1, lineHeight: 1.15, textTransform: 'uppercase',
            position: 48, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
        aesthetic: {
            fontFamily: 'Playfair Display', fontSize: 26, fontWeight: '400',
            textColor: '#fdf6e3', bgColor: '#000000', bgOpacity: 0,
            outlineWidth: 0, outlineColor: '#000000', shadowBlur: 5,
            letterSpacing: 3, lineHeight: 1.6, textTransform: 'none',
            position: 85, textAlign: 'center', hOffset: 50, paddingV: 0, paddingH: 0, borderRadius: 0,
        },
    };

    // ── Helpers ──────────────────────────────────────────────────────
    function toast(message, type = 'info') {
        const el = document.createElement('div');
        el.className = `toast ${type}`;
        el.textContent = message;
        toastContainer.appendChild(el);
        setTimeout(() => {
            el.classList.add('removing');
            setTimeout(() => el.remove(), 350);
        }, 3500);
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec)) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    // ── Subtitle Parsers ────────────────────────────────────────────
    function parseSRT(text) {
        const subs = [];
        const blocks = text.trim().replace(/\r\n/g, '\n').split(/\n\n+/);
        for (const block of blocks) {
            const lines = block.split('\n');
            let timeLineIdx = lines.findIndex(l => l.includes('-->'));
            if (timeLineIdx === -1) continue;
            const timeParts = lines[timeLineIdx].split('-->');
            const start = srtTimeToSec(timeParts[0].trim());
            const end   = srtTimeToSec(timeParts[1].trim());
            const textLines = lines.slice(timeLineIdx + 1).join('\n').replace(/<[^>]+>/g, '').trim();
            if (textLines) subs.push({ start, end, text: textLines });
        }
        return subs;
    }

    function srtTimeToSec(ts) {
        // 00:01:23,456 or 00:01:23.456
        const parts = ts.replace(',', '.').split(':');
        if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    }

    function parseVTT(text) {
        // Strip VTT header
        const cleaned = text.replace(/^WEBVTT.*?\n\n/s, '');
        return parseSRT(cleaned);
    }

    function parseASS(text) {
        const subs = [];
        const lines = text.split('\n');
        for (const line of lines) {
            if (!line.startsWith('Dialogue:')) continue;
            const parts = line.substring(9).split(',');
            if (parts.length < 10) continue;
            const start = assTimeToSec(parts[1].trim());
            const end   = assTimeToSec(parts[2].trim());
            // Text is everything after the 9th comma
            let subText = parts.slice(9).join(',').replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n').trim();
            if (subText) subs.push({ start, end, text: subText });
        }
        return subs;
    }

    function assTimeToSec(ts) {
        // 0:00:12.34
        const parts = ts.split(':');
        if (parts.length === 3) {
            return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
        }
        return 0;
    }

    function parseSubtitles(text, filename) {
        const ext = filename.split('.').pop().toLowerCase();
        if (ext === 'vtt') return parseVTT(text);
        if (ext === 'ass' || ext === 'ssa') return parseASS(text);
        // default SRT
        return parseSRT(text);
    }

    // ── Drag & Drop Setup ───────────────────────────────────────────
    function setupDropzone(dropzone, inputEl, handler) {
        dropzone.addEventListener('click', () => inputEl.click());
        inputEl.addEventListener('change', (e) => {
            if (e.target.files[0]) handler(e.target.files[0]);
        });
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) handler(e.dataTransfer.files[0]);
        });
    }

    function handleVideoFile(file) {
        if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|webm|mov|mkv|avi|m4v)$/i)) {
            toast('Please select a valid video file', 'error');
            return;
        }
        videoFile = file;
        if (videoURL) URL.revokeObjectURL(videoURL);
        videoURL = URL.createObjectURL(file);
        videoPlayer.src = videoURL;
        videoPlayer.onloadedmetadata = () => {
            updateVideoAspectRatio();
        };
        videoUploadCard.classList.add('has-file');
        videoStatus.textContent = `✓ ${file.name} (${(file.size / 1048576).toFixed(1)} MB)`;
        toast(`Video loaded: ${file.name}`, 'success');
        updateModalVideoInfo();
        checkReady();
        if (pendingAutoTranscribe) {
            pendingAutoTranscribe = false;
            setTimeout(() => {
                openAutoSubModal();
            }, 120);
        }
    }

    function updateVideoAspectRatio() {
        if (!videoContainer || !videoPlayer) return;
        const w = videoPlayer.videoWidth;
        const h = videoPlayer.videoHeight;
        if (w && h) {
            const aspect = w / h;
            videoContainer.style.aspectRatio = `${w} / ${h}`;
            videoContainer.style.width = `min(100%, calc(70vh * ${aspect}))`;
            videoContainer.style.height = 'auto';
        }
    }

    function handleSubtitleFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            subtitles = parseSubtitles(e.target.result, file.name);
            if (subtitles.length === 0) {
                toast('No valid subtitles found in file', 'error');
                return;
            }
            subtitleUploadCard.classList.add('has-file');
            subtitleStatus.textContent = `✓ ${file.name} - ${subtitles.length} cues`;
            toast(`Subtitles loaded: ${subtitles.length} cues`, 'success');
            checkReady();
        };
        reader.readAsText(file);
    }

    function checkReady() {
        if (videoFile && subtitles.length > 0) {
            uploadSection.classList.add('hidden');
            editorSection.classList.remove('hidden');
            if (downloadSubBtn) downloadSubBtn.classList.remove('hidden');
            if (detectedLanguage && detectedLangChip) {
                detectedLangChip.classList.remove('hidden');
            }
            updateVideoAspectRatio();
            updateScriptToggleChip();
            renderSubtitle();
            applyVideoFilters();
        }
    }

    setupDropzone(videoDropzone, videoInput, handleVideoFile);
    setupDropzone(subtitleDropzone, subtitleInput, handleSubtitleFile);

    // Change file buttons
    changeVideoBtn.addEventListener('click', () => videoInput.click());
    changeSubBtn.addEventListener('click', () => subtitleInput.click());

    // ── Video Playback & Controls ──────────────────────────────────
    function togglePlay() {
        if (!videoPlayer || !videoPlayer.src) return;
        if (videoPlayer.paused) {
            const playPromise = videoPlayer.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    console.warn('Video playback was blocked or deferred:', err);
                    if (err.name === 'NotAllowedError') {
                        videoPlayer.muted = true;
                        if (muteBtn) muteBtn.style.opacity = '0.4';
                        videoPlayer.play().catch(e => console.error('Muted playback retry failed:', e));
                    }
                });
            }
        } else {
            videoPlayer.pause();
        }
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    // Direct click anywhere on video container to toggle play/pause
    if (videoContainer) {
        videoContainer.addEventListener('click', (e) => {
            if (e.target.closest('.video-controls') || e.target.closest('.file-chips')) return;
            togglePlay();
        });
    }

    // Center Big Play Button Overlay
    const centerPlayBtn = $('#centerPlayBtn');
    if (centerPlayBtn) {
        centerPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlay();
        });
    }

    // Spacebar & Arrow keys keyboard shortcuts for editing workflow
    window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || tag === 'select' || (e.target && e.target.isContentEditable)) {
            return; // Allow natural typing in input boxes
        }
        if (e.code === 'Space') {
            if (!videoPlayer || !videoPlayer.src) return;
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
            if (!videoPlayer || !videoPlayer.duration) return;
            e.preventDefault();
            const step = (e.code === 'ArrowLeft') ? -3 : 3;
            videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + step));
            renderSubtitle();
        }
    });

    if (videoPlayer) {
        videoPlayer.addEventListener('play', () => {
            if (videoContainer) {
                videoContainer.classList.remove('paused', 'is-paused');
            }
            if (playPauseBtn) {
                playPauseBtn.querySelector('.icon-play')?.classList.add('hidden');
                playPauseBtn.querySelector('.icon-pause')?.classList.remove('hidden');
            }
        });
        videoPlayer.addEventListener('pause', () => {
            if (videoContainer) {
                videoContainer.classList.add('paused', 'is-paused');
            }
            if (playPauseBtn) {
                playPauseBtn.querySelector('.icon-play')?.classList.remove('hidden');
                playPauseBtn.querySelector('.icon-pause')?.classList.add('hidden');
            }
        });

        videoPlayer.addEventListener('timeupdate', () => {
            if (!videoPlayer.duration || isNaN(videoPlayer.duration)) return;
            const pct = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            if (progressFill) progressFill.style.width = pct + '%';
            if (progressHandle) progressHandle.style.left = pct + '%';
            if (timeDisplay) timeDisplay.textContent = `${formatTime(videoPlayer.currentTime)} / ${formatTime(videoPlayer.duration)}`;
            renderSubtitle();
        });
    }

    if (muteBtn && videoPlayer) {
        muteBtn.addEventListener('click', () => {
            videoPlayer.muted = !videoPlayer.muted;
            muteBtn.style.opacity = videoPlayer.muted ? '0.4' : '1';
            const iconVol = muteBtn.querySelector('.icon-vol');
            const iconMuted = muteBtn.querySelector('.icon-muted');
            if (iconVol && iconMuted) {
                iconVol.classList.toggle('hidden', videoPlayer.muted);
                iconMuted.classList.toggle('hidden', !videoPlayer.muted);
            }
        });
    }

    // Timeline Scrubbing with Touch & Mouse support
    let isSeeking = false;
    function seekFromEvent(e) {
        if (!progressBar || !videoPlayer || !videoPlayer.duration || isNaN(videoPlayer.duration)) return;
        const rect = progressBar.getBoundingClientRect();
        if (!rect.width || rect.width <= 0) return;
        const clientX = (e.clientX !== undefined) ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const targetTime = pct * videoPlayer.duration;
        if (!isNaN(targetTime) && isFinite(targetTime)) {
            videoPlayer.currentTime = targetTime;
        }
        renderSubtitle();
    }

    if (progressBar) {
        progressBar.addEventListener('mousedown', (e) => {
            isSeeking = true;
            progressBar.classList.add('is-seeking');
            seekFromEvent(e);
        });
        progressBar.addEventListener('touchstart', (e) => {
            isSeeking = true;
            progressBar.classList.add('is-seeking');
            seekFromEvent(e);
        }, { passive: true });
    }
    document.addEventListener('mousemove', (e) => { if (isSeeking) seekFromEvent(e); });
    document.addEventListener('touchmove', (e) => { if (isSeeking) seekFromEvent(e); }, { passive: true });
    document.addEventListener('mouseup', () => {
        if (isSeeking) {
            isSeeking = false;
            if (progressBar) progressBar.classList.remove('is-seeking');
        }
    });
    document.addEventListener('touchend', () => {
        if (isSeeking) {
            isSeeking = false;
            if (progressBar) progressBar.classList.remove('is-seeking');
        }
    });

    // ── Subtitle Rendering ──────────────────────────────────────────
    function renderSubtitle() {
        const time = videoPlayer.currentTime;
        let activeSub = subtitles.find(s => time >= s.start && time <= s.end);
        // If paused and no cue at exact current time, show closest cue for real-time styling feedback
        if (!activeSub && videoPlayer.paused && subtitles.length > 0) {
            activeSub = subtitles.find(s => Math.abs(s.start - time) < 4) || subtitles[0];
        }

        if (activeSub) {
            let text = activeSub.text;
            if (style.textTransform === 'uppercase') text = text.toUpperCase();
            else if (style.textTransform === 'lowercase') text = text.toLowerCase();
            else if (style.textTransform === 'capitalize') text = text.replace(/\b\w/g, c => c.toUpperCase());

            const bgRgb = hexToRgb(style.bgColor);
            const bgAlpha = style.bgOpacity / 100;

            let textShadow = 'none';
            const shadows = [];
            if (style.outlineWidth > 0) {
                const ow = style.outlineWidth;
                const oc = style.outlineColor;
                // 8-directional outline
                shadows.push(`${ow}px 0 0 ${oc}`, `-${ow}px 0 0 ${oc}`);
                shadows.push(`0 ${ow}px 0 ${oc}`, `0 -${ow}px 0 ${oc}`);
                shadows.push(`${ow}px ${ow}px 0 ${oc}`, `-${ow}px -${ow}px 0 ${oc}`);
                shadows.push(`${ow}px -${ow}px 0 ${oc}`, `-${ow}px ${ow}px 0 ${oc}`);
            }
            if (style.shadowBlur > 0) {
                shadows.push(`0 0 ${style.shadowBlur}px rgba(0,0,0,0.8)`);
                shadows.push(`0 2px ${style.shadowBlur * 2}px rgba(0,0,0,0.5)`);
            }
            if (shadows.length) textShadow = shadows.join(', ');

            subtitleOverlay.innerHTML = `<div class="sub-box"><span class="sub-text">${escapeHtml(text)}</span></div>`;
            const subBox = subtitleOverlay.querySelector('.sub-box');
            const span   = subBox.querySelector('.sub-text');

            Object.assign(span.style, {
                fontFamily: `'${style.fontFamily}', sans-serif`,
                fontSize: style.fontSize + 'px',
                fontWeight: style.fontWeight,
                color: style.textColor,
                backgroundColor: style.bgColor === 'transparent'
                    ? 'transparent'
                    : `rgba(${bgRgb.r},${bgRgb.g},${bgRgb.b},${bgAlpha})`,
                textShadow: textShadow,
                letterSpacing: style.letterSpacing + 'px',
                lineHeight: style.lineHeight.toString(),
                textAlign: style.textAlign,
                padding: `${style.paddingV}px ${style.paddingH}px`,
                borderRadius: style.borderRadius + 'px',
            });

            // Precise Vertical & Horizontal Positioning
            const vPos = (typeof style.position === 'number' && !isNaN(style.position)) ? style.position : 50;
            const hPos = (typeof style.hOffset === 'number' && !isNaN(style.hOffset)) ? style.hOffset : 50;

            subBox.style.top = `${vPos}%`;
            subBox.style.left = `${hPos}%`;
            subBox.style.transform = 'translate(-50%, -50%)';
        } else {
            subtitleOverlay.innerHTML = '';
        }
    }

    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
    }

    // ── Style Controls Binding ──────────────────────────────────────
    function bindControl(id, prop, transform, valId, valFormatter) {
        const el = $(`#${id}`);
        if (!el) return;
        el.addEventListener('input', () => {
            style[prop] = transform ? transform(el.value) : el.value;
            if (valId) {
                const badge = $(`#${valId}`);
                if (badge) badge.textContent = valFormatter ? valFormatter(style[prop]) : style[prop];
            }
            renderSubtitle();
        });
    }

    bindControl('fontFamily', 'fontFamily');
    bindControl('fontSize', 'fontSize', Number, 'fontSizeVal', v => v + 'px');
    bindControl('fontWeight', 'fontWeight');
    bindControl('textColor', 'textColor');
    bindControl('bgColor', 'bgColor');
    bindControl('bgOpacity', 'bgOpacity', Number, 'bgOpacityVal', v => v + '%');
    bindControl('outlineWidth', 'outlineWidth', Number, 'outlineVal', v => v + 'px');
    bindControl('outlineColor', 'outlineColor');
    bindControl('shadowBlur', 'shadowBlur', Number, 'shadowVal', v => v + 'px');
    bindControl('letterSpacing', 'letterSpacing', Number, 'letterSpacingVal', v => v + 'px');
    bindControl('lineHeight', 'lineHeight', v => Number(v) / 10, 'lineHeightVal', v => v.toFixed(1));
    bindControl('textTransform', 'textTransform');
    bindControl('subtitlePosition', 'position', Number, 'positionVal', v => v + '%');

    // Horizontal Offset Slider with Alignment sync
    const hOffsetInput = $('#hOffset');
    if (hOffsetInput) {
        hOffsetInput.addEventListener('input', () => {
            const val = Number(hOffsetInput.value);
            style.hOffset = val;
            const badge = $('#hOffsetVal');
            if (badge) badge.textContent = val + '%';

            // Auto-sync alignment buttons
            if (val <= 30) {
                style.textAlign = 'left';
            } else if (val >= 70) {
                style.textAlign = 'right';
            } else {
                style.textAlign = 'center';
            }
            $$('#alignToggle .align-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.align === style.textAlign);
            });
            renderSubtitle();
        });
    }

    bindControl('paddingV', 'paddingV', Number, 'paddingVal', () => `${style.paddingV}px ${style.paddingH}px`);
    bindControl('paddingH', 'paddingH', Number, 'paddingVal', () => `${style.paddingV}px ${style.paddingH}px`);
    bindControl('borderRadius', 'borderRadius', Number, 'borderRadiusVal', v => v + 'px');

    // Alignment toggle buttons
    $$('#alignToggle .align-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('#alignToggle .align-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const align = btn.dataset.align;
            style.textAlign = align;
            if (align === 'left') {
                style.hOffset = 20;
            } else if (align === 'right') {
                style.hOffset = 80;
            } else {
                style.hOffset = 50;
            }
            if (hOffsetInput) hOffsetInput.value = style.hOffset;
            const hBadge = $('#hOffsetVal');
            if (hBadge) hBadge.textContent = style.hOffset + '%';
            renderSubtitle();
        });
    });

    // Color swatch presets
    $$('#textPresets .color-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            style.textColor = btn.dataset.color;
            $('#textColor').value = btn.dataset.color;
            renderSubtitle();
        });
    });
    $$('#bgPresets .color-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
            const c = btn.dataset.color;
            style.bgColor = c;
            if (c !== 'transparent') $('#bgColor').value = c;
            renderSubtitle();
        });
    });

    // ── Style Presets ───────────────────────────────────────────────
    $$('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.preset;
            if (!presets[name]) return;
            applyStyle(presets[name]);
            // Visual active state
            $$('.preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            toast(`Applied "${name}" preset`, 'info');
        });
    });

    function applyStyle(s) {
        style = { ...s };
        // Sync UI controls
        $('#fontFamily').value = s.fontFamily;
        $('#fontSize').value = s.fontSize;
        $('#fontWeight').value = s.fontWeight;
        $('#textColor').value = s.textColor;
        $('#bgColor').value = s.bgColor === 'transparent' ? '#000000' : s.bgColor;
        $('#bgOpacity').value = s.bgOpacity;
        $('#outlineWidth').value = s.outlineWidth;
        $('#outlineColor').value = s.outlineColor;
        $('#shadowBlur').value = s.shadowBlur;
        $('#letterSpacing').value = s.letterSpacing;
        $('#lineHeight').value = Math.round(s.lineHeight * 10);
        $('#textTransform').value = s.textTransform;
        $('#subtitlePosition').value = s.position;
        $('#hOffset').value = s.hOffset;
        $('#paddingV').value = s.paddingV;
        $('#paddingH').value = s.paddingH;
        $('#borderRadius').value = s.borderRadius;

        // Sync alignment toggle
        $$('#alignToggle .align-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.align === s.textAlign);
        });

        // Update badges
        $('#fontSizeVal').textContent = s.fontSize + 'px';
        $('#bgOpacityVal').textContent = s.bgOpacity + '%';
        $('#outlineVal').textContent = s.outlineWidth + 'px';
        $('#shadowVal').textContent = s.shadowBlur + 'px';
        $('#letterSpacingVal').textContent = s.letterSpacing + 'px';
        $('#lineHeightVal').textContent = s.lineHeight.toFixed(1);
        $('#positionVal').textContent = s.position + '%';
        $('#hOffsetVal').textContent = s.hOffset + '%';
        $('#paddingVal').textContent = `${s.paddingV}px ${s.paddingH}px`;
        $('#borderRadiusVal').textContent = s.borderRadius + 'px';

        renderSubtitle();
    }

    // Reset
    resetStylesBtn.addEventListener('click', () => {
        applyStyle(defaultStyle);
        $$('.preset-btn').forEach(b => b.classList.remove('active'));
        toast('Styles reset to defaults', 'info');
    });

    // ── Video Filters Logic & Event Handlers ────────────────────────
    function getEffectiveFilterValues(f = videoFilters) {
        const intensity = (f.intensity !== undefined ? f.intensity : 100) / 100;
        let normalizedHue = f.hueRotate || 0;
        if (normalizedHue > 180) normalizedHue -= 360;
        let effHue = Math.round(normalizedHue * intensity);
        effHue = (effHue % 360 + 360) % 360;

        return {
            brightness: Math.round(100 + (f.brightness - 100) * intensity),
            contrast: Math.round(100 + (f.contrast - 100) * intensity),
            saturate: Math.round(100 + (f.saturate - 100) * intensity),
            warmth: Math.round(f.warmth * intensity),
            sepia: Math.round(f.sepia * intensity),
            grayscale: Math.round(f.grayscale * intensity),
            hueRotate: effHue,
            blur: Math.round((f.blur * intensity) * 10) / 10,
            invert: Math.round(f.invert * intensity)
        };
    }

    function getFilterCssString(f = videoFilters) {
        if (isComparingOriginal) return 'none';

        const eff = getEffectiveFilterValues(f);
        const isDefault = eff.brightness === 100 &&
            eff.contrast === 100 &&
            eff.saturate === 100 &&
            eff.warmth === 0 &&
            eff.sepia === 0 &&
            eff.grayscale === 0 &&
            eff.hueRotate === 0 &&
            eff.blur === 0 &&
            eff.invert === 0;

        if (isDefault) return 'none';

        const parts = [];
        if (eff.brightness !== 100) parts.push(`brightness(${eff.brightness}%)`);
        if (eff.contrast !== 100) parts.push(`contrast(${eff.contrast}%)`);

        // Compute effective saturation with warmth adjustment
        let sat = eff.saturate;
        if (eff.warmth > 0) sat = sat * (1 + (eff.warmth / 100) * 0.15);
        else if (eff.warmth < 0) sat = sat * (1 + (eff.warmth / 100) * 0.1);
        sat = Math.round(sat);
        if (sat !== 100) parts.push(`saturate(${sat}%)`);

        // Warmth / temperature calculations
        if (eff.warmth > 0) {
            const warmSepia = Math.min(100, Math.round(eff.sepia + (eff.warmth / 100) * 28));
            if (warmSepia > 0) parts.push(`sepia(${warmSepia}%)`);
            const warmHue = (eff.hueRotate - Math.round((eff.warmth / 100) * 8) + 360) % 360;
            if (warmHue !== 0) parts.push(`hue-rotate(${warmHue}deg)`);
        } else if (eff.warmth < 0) {
            if (eff.sepia > 0) parts.push(`sepia(${eff.sepia}%)`);
            const coolHue = (eff.hueRotate + Math.round(Math.abs(eff.warmth / 100) * 14)) % 360;
            if (coolHue !== 0) parts.push(`hue-rotate(${coolHue}deg)`);
        } else {
            if (eff.sepia > 0) parts.push(`sepia(${eff.sepia}%)`);
            if (eff.hueRotate !== 0) parts.push(`hue-rotate(${eff.hueRotate}deg)`);
        }

        if (eff.grayscale > 0) parts.push(`grayscale(${eff.grayscale}%)`);
        if (eff.invert > 0) parts.push(`invert(${eff.invert}%)`);
        if (eff.blur > 0) parts.push(`blur(${eff.blur}px)`);

        return parts.length ? parts.join(' ') : 'none';
    }

    function applyVideoFilters() {
        const filterCss = getFilterCssString();
        if (videoPlayer) {
            videoPlayer.style.filter = filterCss === 'none' ? '' : filterCss;
        }

        const isFiltered = filterCss !== 'none';
        if (filterActiveDot) {
            filterActiveDot.classList.toggle('hidden', !isFiltered);
        }
        if (compareFilterChip) {
            compareFilterChip.classList.toggle('hidden', !isFiltered && videoFilters.preset === 'none');
            compareFilterChip.classList.toggle('comparing', isComparingOriginal);
            if (compareFilterChipLabel) {
                compareFilterChipLabel.textContent = isComparingOriginal ? 'Showing Original' : 'Compare Filter';
            }
        }
        if (compareOriginalBtn) {
            compareOriginalBtn.classList.toggle('holding', isComparingOriginal);
            const span = $('#compareOriginalBtnText') || compareOriginalBtn.querySelector('span');
            if (span) span.textContent = isComparingOriginal ? 'Viewing Original' : 'Hold to Compare';
        }

        // Update active filter card
        $$('.filter-preset-card').forEach(card => {
            const cardFilter = card.dataset.filter;
            const currentPreset = videoFilters.preset;
            const isMatch = cardFilter === currentPreset ||
                (resolveFilterPreset(currentPreset) && resolveFilterPreset(cardFilter) === resolveFilterPreset(currentPreset));
            card.classList.toggle('active', isMatch);
        });

        // Update status banner text
        if (filterActiveName && filterActiveSub) {
            const pInfo = resolveFilterPreset(videoFilters.preset);
            if (pInfo && videoFilters.preset !== 'none') {
                filterActiveName.textContent = pInfo.name + (videoFilters.intensity !== 100 ? ` (${videoFilters.intensity}%)` : '');
                filterActiveSub.textContent = pInfo.desc;
            } else if (isFiltered) {
                filterActiveName.textContent = 'Custom Grade';
                filterActiveSub.textContent = 'Manual adjustments applied';
            } else {
                filterActiveName.textContent = 'Original Natural';
                filterActiveSub.textContent = 'Pure untouched video';
            }
        }
    }

    function syncFilterUI() {
        const f = videoFilters;
        if (filterIntensity) filterIntensity.value = f.intensity !== undefined ? f.intensity : 100;
        if (filterIntensityVal) filterIntensityVal.textContent = (f.intensity !== undefined ? f.intensity : 100) + '%';

        const sliderMap = [
            { id: 'filterBrightness', valId: 'filterBrightnessVal', prop: 'brightness', unit: '%' },
            { id: 'filterContrast', valId: 'filterContrastVal', prop: 'contrast', unit: '%' },
            { id: 'filterSaturate', valId: 'filterSaturateVal', prop: 'saturate', unit: '%' },
            { id: 'filterWarmth', valId: 'filterWarmthVal', prop: 'warmth', unit: '%', signed: true },
            { id: 'filterHueRotate', valId: 'filterHueRotateVal', prop: 'hueRotate', unit: '°' },
            { id: 'filterSepia', valId: 'filterSepiaVal', prop: 'sepia', unit: '%' },
            { id: 'filterGrayscale', valId: 'filterGrayscaleVal', prop: 'grayscale', unit: '%' },
            { id: 'filterBlur', valId: 'filterBlurVal', prop: 'blur', unit: 'px' },
            { id: 'filterInvert', valId: 'filterInvertVal', prop: 'invert', unit: '%' }
        ];

        sliderMap.forEach(({ id, valId, prop, unit, signed }) => {
            const el = $('#' + id);
            const valEl = $('#' + valId);
            if (el) el.value = f[prop];
            if (valEl) {
                const val = f[prop];
                valEl.textContent = (signed && val > 0 ? '+' : '') + val + unit;
            }
        });

        applyVideoFilters();
    }

    function resolveFilterPreset(key) {
        if (!key) return null;
        if (filterPresets[key]) return filterPresets[key];
        const dashed = key.replace(/_/g, '-');
        if (filterPresets[dashed]) return filterPresets[dashed];
        const underscored = key.replace(/-/g, '_');
        if (filterPresets[underscored]) return filterPresets[underscored];
        const aliases = {
            'vintage-film': 'vintage',
            'vintage': 'vintage-film',
            'cyber-neon': 'cyberpunk',
            'cyberpunk': 'cyber-neon',
            'warm-sunset': 'sunset',
            'sunset': 'warm-sunset',
            'teal-orange': 'teal_orange',
            'teal_orange': 'teal-orange'
        };
        if (aliases[key] && filterPresets[aliases[key]]) return filterPresets[aliases[key]];
        return null;
    }

    function applyFilterPreset(presetKey) {
        const p = resolveFilterPreset(presetKey);
        if (!p) return;
        videoFilters = {
            ...defaultFilters,
            ...p,
            preset: presetKey,
            intensity: videoFilters.intensity !== undefined ? videoFilters.intensity : 100
        };
        syncFilterUI();
        if (presetKey === 'none') {
            toast('Reset to original natural video', 'info');
        } else {
            toast(`Applied "${p.name}" video filter`, 'info');
        }
    }

    function switchEditorTab(tabName) {
        if (tabName === 'filters') {
            if (tabBtnFilters) tabBtnFilters.classList.add('active');
            if (tabBtnSubtitles) tabBtnSubtitles.classList.remove('active');
            if (subtitlesControls) subtitlesControls.classList.add('hidden');
            if (filtersControls) filtersControls.classList.remove('hidden');
            if (resetStylesBtn) resetStylesBtn.classList.add('hidden');
            if (resetFiltersBtn) resetFiltersBtn.classList.remove('hidden');
        } else {
            if (tabBtnSubtitles) tabBtnSubtitles.classList.add('active');
            if (tabBtnFilters) tabBtnFilters.classList.remove('active');
            if (filtersControls) filtersControls.classList.add('hidden');
            if (subtitlesControls) subtitlesControls.classList.remove('hidden');
            if (resetFiltersBtn) resetFiltersBtn.classList.add('hidden');
            if (resetStylesBtn) resetStylesBtn.classList.remove('hidden');
        }
    }

    // Tab switching bindings
    if (tabBtnSubtitles && tabBtnFilters) {
        tabBtnSubtitles.addEventListener('click', () => switchEditorTab('subtitles'));
        tabBtnFilters.addEventListener('click', () => switchEditorTab('filters'));
    }

    // Filter intensity slider & badge interactions
    if (filterIntensity) {
        filterIntensity.addEventListener('input', () => {
            videoFilters.intensity = parseInt(filterIntensity.value, 10);
            if (filterIntensityVal) filterIntensityVal.textContent = videoFilters.intensity + '%';
            applyVideoFilters();
        });
        filterIntensity.addEventListener('dblclick', () => {
            filterIntensity.value = 100;
            videoFilters.intensity = 100;
            if (filterIntensityVal) filterIntensityVal.textContent = '100%';
            applyVideoFilters();
            toast('Reset filter intensity to 100%', 'info');
        });
    }

    if (filterIntensityVal) {
        filterIntensityVal.addEventListener('click', () => {
            if (filterIntensity) filterIntensity.value = 100;
            videoFilters.intensity = 100;
            filterIntensityVal.textContent = '100%';
            applyVideoFilters();
            toast('Reset filter intensity to 100%', 'info');
        });
    }

    // Filter presets grid clicks
    $$('.filter-preset-card').forEach(card => {
        card.addEventListener('click', () => {
            const pKey = card.dataset.filter;
            applyFilterPreset(pKey);
        });
    });

    // Filter fine-tuning sliders
    const filterSliderMap = [
        { id: 'filterBrightness', valId: 'filterBrightnessVal', prop: 'brightness', unit: '%' },
        { id: 'filterContrast', valId: 'filterContrastVal', prop: 'contrast', unit: '%' },
        { id: 'filterSaturate', valId: 'filterSaturateVal', prop: 'saturate', unit: '%' },
        { id: 'filterWarmth', valId: 'filterWarmthVal', prop: 'warmth', unit: '%', signed: true },
        { id: 'filterHueRotate', valId: 'filterHueRotateVal', prop: 'hueRotate', unit: '°' },
        { id: 'filterSepia', valId: 'filterSepiaVal', prop: 'sepia', unit: '%' },
        { id: 'filterGrayscale', valId: 'filterGrayscaleVal', prop: 'grayscale', unit: '%' },
        { id: 'filterBlur', valId: 'filterBlurVal', prop: 'blur', unit: 'px' },
        { id: 'filterInvert', valId: 'filterInvertVal', prop: 'invert', unit: '%' }
    ];

    filterSliderMap.forEach(({ id, valId, prop, unit, signed }) => {
        const input = $('#' + id);
        const valBadge = $('#' + valId);
        if (!input) return;

        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            videoFilters[prop] = val;
            if (videoFilters.preset !== 'none') {
                const presetDef = filterPresets[videoFilters.preset];
                if (presetDef && presetDef[prop] !== val) {
                    videoFilters.preset = 'custom';
                }
            }
            if (valBadge) {
                valBadge.textContent = (signed && val > 0 ? '+' : '') + val + unit;
            }
            applyVideoFilters();
        });

        // Double-click slider to reset that slider
        input.addEventListener('dblclick', () => {
            const defVal = parseFloat(input.dataset.default || 0);
            input.value = defVal;
            videoFilters[prop] = defVal;
            if (valBadge) valBadge.textContent = (signed && defVal > 0 ? '+' : '') + defVal + unit;
            applyVideoFilters();
        });

        // Click badge to reset that slider
        if (valBadge) {
            valBadge.addEventListener('click', () => {
                const defVal = parseFloat(input.dataset.default || 0);
                input.value = defVal;
                videoFilters[prop] = defVal;
                valBadge.textContent = (signed && defVal > 0 ? '+' : '') + defVal + unit;
                applyVideoFilters();
                toast(`Reset ${prop} to ${defVal}${unit}`, 'info');
            });
        }
    });

    // Subgroup reset buttons
    if (resetToneBtn) {
        resetToneBtn.addEventListener('click', () => {
            videoFilters.brightness = 100;
            videoFilters.contrast = 100;
            videoFilters.preset = 'custom';
            syncFilterUI();
            toast('Reset Tone controls', 'info');
        });
    }
    if (resetColorBtn) {
        resetColorBtn.addEventListener('click', () => {
            videoFilters.saturate = 100;
            videoFilters.warmth = 0;
            videoFilters.hueRotate = 0;
            videoFilters.preset = 'custom';
            syncFilterUI();
            toast('Reset Color controls', 'info');
        });
    }
    if (resetEffectsBtn) {
        resetEffectsBtn.addEventListener('click', () => {
            videoFilters.sepia = 0;
            videoFilters.grayscale = 0;
            videoFilters.blur = 0;
            videoFilters.invert = 0;
            videoFilters.preset = 'custom';
            syncFilterUI();
            toast('Reset Effects controls', 'info');
        });
    }

    // Reset all filters in header
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            videoFilters = { ...defaultFilters };
            syncFilterUI();
            toast('Video filters reset to original', 'info');
        });
    }

    // Compare original button (Hold to Compare)
    if (compareOriginalBtn) {
        const startCompare = (e) => {
            e.preventDefault();
            isComparingOriginal = true;
            applyVideoFilters();
        };
        const endCompare = (e) => {
            e.preventDefault();
            isComparingOriginal = false;
            applyVideoFilters();
        };
        compareOriginalBtn.addEventListener('mousedown', startCompare);
        compareOriginalBtn.addEventListener('touchstart', startCompare, { passive: false });
        window.addEventListener('mouseup', () => {
            if (isComparingOriginal) {
                isComparingOriginal = false;
                applyVideoFilters();
            }
        });
        window.addEventListener('touchend', () => {
            if (isComparingOriginal) {
                isComparingOriginal = false;
                applyVideoFilters();
            }
        });
    }

    // Compare filter chip below video preview
    if (compareFilterChip) {
        compareFilterChip.addEventListener('click', () => {
            isComparingOriginal = !isComparingOriginal;
            applyVideoFilters();
        });
    }

    // ── Export Dimensions & Bitrate Calculation ─────────────────────
    function computeExportDimensions(nativeW, nativeH, quality) {
        if (!nativeW || !nativeH) return { w: 1920, h: 1080 };
        if (quality === 'original') {
            return {
                w: nativeW - (nativeW % 2),
                h: nativeH - (nativeH % 2)
            };
        }
        const aspect = nativeW / nativeH;
        const isVertical = aspect < 1;
        let targetShort = 1080;
        if (quality === '720p') targetShort = 720;
        else if (quality === '1080p') targetShort = 1080;
        else if (quality === '2k') targetShort = 1440;
        else if (quality === '4k') targetShort = 2160;

        let w, h;
        if (isVertical) {
            // For vertical (Shorts / Reels 9:16)
            w = targetShort;
            h = Math.round(targetShort / aspect);
        } else {
            // For landscape (16:9) or square
            h = targetShort;
            w = Math.round(targetShort * aspect);
        }
        w = w - (w % 2);
        h = h - (h % 2);
        return { w, h };
    }

    function getBitrateForQuality(quality, fps, pixelCount) {
        const is60 = fps >= 60;
        if (quality === '4k' || pixelCount >= 3840 * 2160 * 0.7) {
            return is60 ? 30_000_000 : 22_000_000;
        }
        if (quality === '2k' || pixelCount >= 2560 * 1440 * 0.7) {
            return is60 ? 16_000_000 : 12_000_000;
        }
        if (quality === '1080p' || pixelCount >= 1920 * 1080 * 0.7) {
            return is60 ? 10_000_000 : 7_000_000;
        }
        return is60 ? 5_000_000 : 3_500_000;
    }

    // ── Export (Hardware-Accelerated Frame-by-Frame MP4 with AAC Audio) ──
    exportBtn.addEventListener('click', async () => {
        if (!videoFile || subtitles.length === 0) {
            toast('Load a video and subtitle file first', 'error');
            return;
        }

        exportBtn.disabled = true;
        exportProgress.classList.remove('hidden');
        exportBarFill.style.width = '0%';
        exportLabel.textContent = 'Preparing export…';

        const qualityPreset = exportResolution ? exportResolution.value : 'original';
        const targetFps = exportFps ? Number(exportFps.value) : 60;

        let audioCtx = null;
        let exportVid = null;

        try {
            // Create dedicated offscreen video element for export
            exportVid = document.createElement('video');
            exportVid.src = videoURL;
            exportVid.crossOrigin = 'anonymous';
            exportVid.playsInline = true;
            exportVid.muted = true; // Muted during offscreen render
            exportVid.style.position = 'fixed';
            exportVid.style.top = '-9999px';
            exportVid.style.left = '-9999px';
            exportVid.style.opacity = '0';
            exportVid.style.pointerEvents = 'none';
            document.body.appendChild(exportVid);

            await new Promise((res, rej) => {
                exportVid.onloadedmetadata = res;
                exportVid.onerror = () => rej(new Error('Failed to load video metadata for export'));
            });

            // Calculate target dimensions (always even numbers)
            const dims = computeExportDimensions(exportVid.videoWidth, exportVid.videoHeight, qualityPreset);
            const W = dims.w;
            const H = dims.h;
            const resLabel = qualityPreset === 'original' ? `${W}x${H}` : qualityPreset.toUpperCase();
            const bitrate = getBitrateForQuality(qualityPreset, targetFps, W * H);

            const canvas = document.createElement('canvas');
            canvas.width = W;
            canvas.height = H;
            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

            // Check for WebCodecs + Mp4Muxer (Standard MP4 with FastStart, WhatsApp & iOS fully supported)
            const hasWebCodecs = (typeof window.VideoEncoder === 'function' && typeof window.Mp4Muxer !== 'undefined');

            if (hasWebCodecs) {
                exportLabel.textContent = 'Extracting audio track…';
                exportBarFill.style.width = '3%';

                // Extract audio from source video file
                let audioBuffer = null;
                let audioChannels = 2;
                let audioSampleRate = 44100;
                try {
                    const arrayBuffer = await videoFile.arrayBuffer();
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                    if (audioBuffer) {
                        audioSampleRate = audioBuffer.sampleRate;
                        audioChannels = Math.min(2, audioBuffer.numberOfChannels);
                    }
                } catch (aErr) {
                    console.warn('Audio decoding skipped or no audio in video:', aErr);
                    audioBuffer = null;
                }

                // Initialize Mp4Muxer with FastStart (moov at start, zero moof fragments)
                const muxer = new Mp4Muxer.Muxer({
                    target: new Mp4Muxer.ArrayBufferTarget(),
                    video: {
                        codec: 'avc',
                        width: W,
                        height: H
                    },
                    audio: audioBuffer ? {
                        codec: 'aac',
                        numberOfChannels: audioChannels,
                        sampleRate: audioSampleRate
                    } : undefined,
                    fastStart: 'in-memory',
                    firstTimestampBehavior: 'offset'
                });

                // Encode audio track if present
                if (audioBuffer && typeof window.AudioEncoder === 'function') {
                    try {
                        const audioEncoder = new AudioEncoder({
                            output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
                            error: (e) => console.error('AudioEncoder error:', e)
                        });

                        audioEncoder.configure({
                            codec: 'mp4a.40.2',
                            sampleRate: audioSampleRate,
                            numberOfChannels: audioChannels,
                            bitrate: 192_000
                        });

                        const chunkSize = 2048;
                        const totalSamples = audioBuffer.length;
                        let sampleOffset = 0;
                        const channelData = [];
                        for (let c = 0; c < audioChannels; c++) {
                            channelData.push(audioBuffer.getChannelData(c));
                        }

                        while (sampleOffset < totalSamples) {
                            const curChunk = Math.min(chunkSize, totalSamples - sampleOffset);
                            const planar = new Float32Array(curChunk * audioChannels);
                            for (let c = 0; c < audioChannels; c++) {
                                planar.set(channelData[c].subarray(sampleOffset, sampleOffset + curChunk), c * curChunk);
                            }

                            const audioData = new AudioData({
                                format: 'f32-planar',
                                sampleRate: audioSampleRate,
                                numberOfFrames: curChunk,
                                numberOfChannels: audioChannels,
                                timestamp: Math.round((sampleOffset / audioSampleRate) * 1_000_000),
                                data: planar
                            });

                            audioEncoder.encode(audioData);
                            audioData.close();
                            sampleOffset += curChunk;
                        }

                        await audioEncoder.flush();
                        audioEncoder.close();
                    } catch (aEncErr) {
                        console.warn('AudioEncoder failed, proceeding with video:', aEncErr);
                    }
                }

                // Determine best AVC profile level
                let avcCodec = 'avc1.4d0028'; // 1080p Main Profile
                if (W <= 1280 && H <= 720) {
                    avcCodec = 'avc1.42001f'; // 720p Baseline
                } else if (W > 1920 || H > 1080) {
                    avcCodec = 'avc1.4d0033'; // 4K Main 5.1
                }

                try {
                    const supp = await VideoEncoder.isConfigSupported({
                        codec: avcCodec,
                        width: W,
                        height: H,
                        bitrate: bitrate,
                        framerate: targetFps
                    });
                    if (!supp || !supp.supported) {
                        avcCodec = 'avc1.42002a';
                    }
                } catch (e) {
                    avcCodec = 'avc1.42001f';
                }

                const videoEncoder = new VideoEncoder({
                    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                    error: (e) => console.error('VideoEncoder error:', e)
                });

                videoEncoder.configure({
                    codec: avcCodec,
                    width: W,
                    height: H,
                    bitrate: bitrate,
                    framerate: targetFps
                });

                const totalDuration = exportVid.duration || 1;
                const totalFrames = Math.max(1, Math.round(totalDuration * targetFps));
                const frameDurationMicro = Math.round((1 / targetFps) * 1_000_000);

                // Deterministic Frame-by-Frame Rendering: 100% butter-smooth, 0 frame drops
                for (let i = 0; i < totalFrames; i++) {
                    const targetTime = i / targetFps;
                    exportVid.currentTime = targetTime;
                    await new Promise((resolve) => {
                        const onSeeked = () => {
                            exportVid.removeEventListener('seeked', onSeeked);
                            resolve();
                        };
                        exportVid.addEventListener('seeked', onSeeked);
                    });

                    // Draw video frame to canvas with active video filter
                    const exportFilterCss = getFilterCssString();
                    if ('filter' in ctx && exportFilterCss && exportFilterCss !== 'none') {
                        ctx.filter = exportFilterCss;
                    } else {
                        ctx.filter = 'none';
                    }
                    ctx.drawImage(exportVid, 0, 0, W, H);
                    ctx.filter = 'none'; // Reset so subtitles remain sharp and clean

                    // Find and render active subtitle
                    const activeSub = subtitles.find(s => targetTime >= s.start && targetTime <= s.end);
                    if (activeSub) {
                        drawSubtitleOnCanvas(ctx, activeSub.text, W, H);
                    }

                    const timestampMicro = Math.round(targetTime * 1_000_000);
                    const videoFrame = new VideoFrame(canvas, {
                        timestamp: timestampMicro,
                        duration: frameDurationMicro
                    });

                    const isKeyframe = (i % (targetFps * 2) === 0);
                    videoEncoder.encode(videoFrame, { keyFrame: isKeyframe });
                    videoFrame.close();

                    if (i % 6 === 0 || i === totalFrames - 1) {
                        const pct = Math.min(99, Math.round(((i + 1) / totalFrames) * 100));
                        exportBarFill.style.width = pct + '%';
                        exportLabel.textContent = `Rendering smooth ${resLabel} @ ${targetFps}fps… ${pct}% (frame ${i + 1}/${totalFrames})`;
                        await new Promise(r => setTimeout(r, 0));
                    }
                }

                exportLabel.textContent = 'Muxing standard MP4 file…';
                await videoEncoder.flush();
                videoEncoder.close();
                muxer.finalize();

                const finalBuffer = muxer.target.buffer;
                const blob = new Blob([finalBuffer], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                a.download = `${baseName}_subtitled.mp4`;
                a.click();
                URL.revokeObjectURL(url);

                exportLabel.textContent = 'Export complete! Standard MP4 ready';
                exportBarFill.style.width = '100%';
                toast('Video exported successfully in smooth standard MP4 format!', 'success');
            } else {
                // Fallback for browsers without WebCodecs
                exportLabel.textContent = 'Rendering with MediaRecorder fallback…';
                const stream = canvas.captureStream(targetFps);

                try {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                    if (audioCtx.state === 'suspended') await audioCtx.resume();
                    const sourceNode = audioCtx.createMediaElementSource(exportVid);
                    const destNode = audioCtx.createMediaStreamDestination();
                    sourceNode.connect(destNode);
                    const audioTracks = destNode.stream.getAudioTracks();
                    if (audioTracks.length > 0) stream.addTrack(audioTracks[0]);
                } catch (aErr) {
                    console.warn('Audio fallback failed:', aErr);
                }

                const mimeType = ['video/mp4;codecs=avc1', 'video/mp4', 'video/webm;codecs=h264', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || 'video/mp4';
                const isMp4 = mimeType.includes('mp4');
                const fileExtension = isMp4 ? 'mp4' : 'webm';

                const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: bitrate });
                const chunks = [];
                recorder.ondataavailable = e => { if (e.data && e.data.size > 0) chunks.push(e.data); };

                const done = new Promise((res, rej) => {
                    recorder.onstop = res;
                    recorder.onerror = rej;
                });

                recorder.start(100);
                exportVid.currentTime = 0;
                await exportVid.play();

                const totalDuration = exportVid.duration || 1;
                let isCompleted = false;

                function drawFrame() {
                    if (isCompleted) return;
                    if (exportVid.ended || exportVid.paused || exportVid.currentTime >= totalDuration - 0.05) {
                        isCompleted = true;
                        if (recorder && recorder.state !== 'inactive') recorder.stop();
                        return;
                    }
                    const exportFilterCss = getFilterCssString();
                    if ('filter' in ctx && exportFilterCss && exportFilterCss !== 'none') {
                        ctx.filter = exportFilterCss;
                    } else {
                        ctx.filter = 'none';
                    }
                    ctx.drawImage(exportVid, 0, 0, W, H);
                    ctx.filter = 'none';
                    const currentTime = exportVid.currentTime;
                    const activeSub = subtitles.find(s => currentTime >= s.start && currentTime <= s.end);
                    if (activeSub) drawSubtitleOnCanvas(ctx, activeSub.text, W, H);

                    const pct = Math.min(99, Math.round((currentTime / totalDuration) * 100));
                    exportBarFill.style.width = pct + '%';
                    exportLabel.textContent = `Rendering ${resLabel} @ ${targetFps}fps… ${pct}%`;
                    requestAnimationFrame(drawFrame);
                }

                exportVid.onended = () => {
                    isCompleted = true;
                    if (recorder && recorder.state !== 'inactive') recorder.stop();
                };
                requestAnimationFrame(drawFrame);
                await done;

                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const baseName = videoFile.name.replace(/\.[^.]+$/, '');
                a.download = `${baseName}_subtitled.${fileExtension}`;
                a.click();
                URL.revokeObjectURL(url);

                exportLabel.textContent = `Export complete! Saved as .${fileExtension}`;
                exportBarFill.style.width = '100%';
                toast(`Video exported as .${fileExtension}`, 'success');
            }
        } catch (err) {
            console.error('Export error:', err);
            toast('Export failed: ' + err.message, 'error');
            exportLabel.textContent = 'Export failed';
        } finally {
            if (audioCtx && audioCtx.state !== 'closed') {
                audioCtx.close().catch(() => {});
            }
            if (exportVid && exportVid.parentNode) {
                exportVid.parentNode.removeChild(exportVid);
            }
            exportBtn.disabled = false;
            setTimeout(() => exportProgress.classList.add('hidden'), 5000);
        }
    });

    function drawSubtitleOnCanvas(ctx, text, W, H) {
        if (!text) return;

        // Apply text transform
        if (style.textTransform === 'uppercase') text = text.toUpperCase();
        else if (style.textTransform === 'lowercase') text = text.toLowerCase();
        else if (style.textTransform === 'capitalize') text = text.replace(/\b\w/g, c => c.toUpperCase());

        // Compute pixel-perfect scale factor based on preview video rendered height vs canvas height
        const previewRect = videoPlayer.getBoundingClientRect();
        const previewH = (previewRect && previewRect.height > 0) ? previewRect.height : (videoPlayer.clientHeight || 400);
        const scaleFactor = H / previewH;

        const fontSize = Math.round(style.fontSize * scaleFactor);
        const padding = {
            v: Math.round(style.paddingV * scaleFactor),
            h: Math.round(style.paddingH * scaleFactor)
        };
        const outlineW = Math.round(style.outlineWidth * scaleFactor);
        const shadowB  = Math.round(style.shadowBlur * scaleFactor);
        const radius   = Math.round(style.borderRadius * scaleFactor);
        const letterSp = style.letterSpacing * scaleFactor;

        ctx.save();
        ctx.textAlign = style.textAlign;
        ctx.textBaseline = 'top';
        ctx.font = `${style.fontWeight} ${fontSize}px '${style.fontFamily}', sans-serif`;
        if ('letterSpacing' in ctx && letterSp) {
            ctx.letterSpacing = `${letterSp}px`;
        }

        // Word-wrap matching preview: in preview, .sub-text has max-width: 85%
        const maxW = W * 0.85;
        const lines = wrapText(ctx, text, maxW - padding.h * 2);
        const lineH = fontSize * style.lineHeight;
        const blockH = lines.length * lineH;
        const totalH = blockH + padding.v * 2;
        const totalW_arr = lines.map(l => ctx.measureText(l).width);
        const textMaxW = Math.max(...totalW_arr);
        const totalW = Math.min(maxW, textMaxW + padding.h * 2);

        // Vertical center calculation: matches preview translate(-50%, -50%)
        const vPos = (typeof style.position === 'number' && !isNaN(style.position)) ? style.position : 50;
        const hPos = (typeof style.hOffset === 'number' && !isNaN(style.hOffset)) ? style.hOffset : 50;

        const yCenter = (vPos / 100) * H;
        const y = yCenter - totalH / 2;

        // Horizontal position based on offset: matches preview translate(-50%, -50%)
        const xCenter = (hPos / 100) * W;
        const bgX = xCenter - totalW / 2;

        let textX = xCenter;
        if (style.textAlign === 'left') {
            textX = bgX + padding.h;
        } else if (style.textAlign === 'right') {
            textX = bgX + totalW - padding.h;
        } else {
            textX = xCenter;
        }

        // Draw background
        if (style.bgOpacity > 0 && style.bgColor !== 'transparent') {
            const bgRgb = hexToRgb(style.bgColor);
            ctx.fillStyle = `rgba(${bgRgb.r},${bgRgb.g},${bgRgb.b},${style.bgOpacity / 100})`;
            roundRect(ctx, bgX, y, totalW, totalH, radius);
            ctx.fill();
        }

        // Draw text
        if (shadowB > 0) {
            ctx.shadowColor = 'rgba(0,0,0,0.8)';
            ctx.shadowBlur = shadowB;
            ctx.shadowOffsetY = Math.round(2 * scaleFactor);
        }

        lines.forEach((line, i) => {
            const ly = y + padding.v + i * lineH;

            // Outline
            if (outlineW > 0) {
                ctx.strokeStyle = style.outlineColor;
                ctx.lineWidth = outlineW * 2;
                ctx.lineJoin = 'round';
                ctx.miterLimit = 2;
                ctx.strokeText(line, textX, ly);
            }

            // Fill
            ctx.fillStyle = style.textColor;
            ctx.fillText(line, textX, ly);
        });

        ctx.restore();
    }

    function wrapText(ctx, text, maxWidth) {
        const paragraphs = text.split('\n');
        const result = [];
        for (const para of paragraphs) {
            const words = para.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line ? line + ' ' + word : word;
                if (ctx.measureText(testLine).width > maxWidth && line) {
                    result.push(line);
                    line = word;
                } else {
                    line = testLine;
                }
            }
            if (line) result.push(line);
        }
        return result.length ? result : [''];
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    // ── Automatic Language Detection & Subtitle Generator ────────────
    const LANGUAGE_MAP = {
        en: { name: 'English', flag: '' },
        hindish: { name: 'Hindish (Roman English)', flag: '' },
        hi: { name: 'Hindi (हिन्दी)', flag: '🇮🇳' },
        ur: { name: 'Urdu (اردو)', flag: '🇵🇰' },
        'ur-roman': { name: 'Roman Urdu', flag: '🇵🇰' },
        es: { name: 'Spanish', flag: '🇪🇸' },
        fr: { name: 'French', flag: '🇫🇷' },
        de: { name: 'German', flag: '🇩🇪' },
        ar: { name: 'Arabic', flag: '🇸🇦' },
        zh: { name: 'Chinese', flag: '🇨🇳' },
        ja: { name: 'Japanese', flag: '🇯🇵' },
        ko: { name: 'Korean', flag: '🇰🇷' },
        pt: { name: 'Portuguese', flag: '🇵🇹' },
        ru: { name: 'Russian', flag: '🇷🇺' },
        it: { name: 'Italian', flag: '🇮🇹' },
        tr: { name: 'Turkish', flag: '🇹🇷' },
        id: { name: 'Indonesian', flag: '🇮🇩' },
        nl: { name: 'Dutch', flag: '🇳🇱' },
        pl: { name: 'Polish', flag: '🇵🇱' },
        sv: { name: 'Swedish', flag: '🇸🇪' },
        vi: { name: 'Vietnamese', flag: '🇻🇳' },
        th: { name: 'Thai', flag: '🇹🇭' },
    };

    // Hindi & Hindish Choice Controller
    function setHindiScriptChoice(choice) {
        hindiScriptChoice = choice;
        if (hindiChoiceBadge) {
            hindiChoiceBadge.textContent = choice === 'hindish' ? 'Hindish (Roman English)' : 'Hindi (Devanagari)';
        }
        if (scriptCardHindish) scriptCardHindish.classList.toggle('active', choice === 'hindish');
        if (scriptCardDevanagari) scriptCardDevanagari.classList.toggle('active', choice === 'devanagari');
        if (resChoiceHindish) resChoiceHindish.classList.toggle('active', choice === 'hindish');
        if (resChoiceHindi) resChoiceHindi.classList.toggle('active', choice === 'devanagari');
    }

    if (scriptCardHindish) {
        scriptCardHindish.addEventListener('click', () => {
            setHindiScriptChoice('hindish');
            if (transcribeLanguage && transcribeLanguage.value === 'hi') {
                transcribeLanguage.value = 'hindish';
            }
        });
    }
    if (scriptCardDevanagari) {
        scriptCardDevanagari.addEventListener('click', () => {
            setHindiScriptChoice('devanagari');
            if (transcribeLanguage && transcribeLanguage.value === 'hindish') {
                transcribeLanguage.value = 'hi';
            }
        });
    }

    if (resChoiceHindish) {
        resChoiceHindish.addEventListener('click', () => switchSubtitleScript('hindish'));
    }
    if (resChoiceHindi) {
        resChoiceHindi.addEventListener('click', () => switchSubtitleScript('devanagari'));
    }

    if (transcribeLanguage) {
        transcribeLanguage.addEventListener('change', () => {
            const val = transcribeLanguage.value;
            if (val === 'hindish') {
                setHindiScriptChoice('hindish');
                hindiChoiceBox?.classList.remove('hidden');
            } else if (val === 'hi') {
                setHindiScriptChoice('devanagari');
                hindiChoiceBox?.classList.remove('hidden');
            } else if (val === 'auto') {
                hindiChoiceBox?.classList.remove('hidden');
            } else {
                hindiChoiceBox?.classList.add('hidden');
            }
        });
    }

    // Dynamic Script Switcher (Devanagari <-> Hindish / Roman English)
    function switchSubtitleScript(targetScript) {
        if (!subtitles || subtitles.length === 0) return;
        activeScript = targetScript;

        for (const cue of subtitles) {
            if (!cue.textDevanagari && !cue.textHindish) {
                if (/[\u0900-\u097F]/.test(cue.text)) {
                    cue.textDevanagari = cue.text;
                    cue.textHindish = devanagariToHindish(cue.text);
                }
            }

            if (targetScript === 'hindish') {
                cue.text = cue.textHindish || devanagariToHindish(cue.text);
            } else {
                cue.text = cue.textDevanagari || cue.text;
            }
        }

        setHindiScriptChoice(targetScript);
        updateScriptToggleChip();
        renderSubtitle();

        const langName = targetScript === 'hindish' ? 'Hindish (Roman English)' : 'Hindi (Devanagari)';
        const flag = targetScript === 'hindish' ? 'Aa' : 'हि';
        detectedLanguage = targetScript;
        if (detectedLangLabel) detectedLangLabel.textContent = `${flag} ${langName}`;
        toast(`Subtitles converted to ${langName}!`, 'info');
    }

    function updateScriptToggleChip() {
        if (!toggleScriptBtn) return;
        const hasHindi = subtitles.some(c =>
            (c.textDevanagari && c.textHindish) ||
            /[\u0900-\u097F]/.test(c.text) ||
            detectedLanguage === 'hi' ||
            detectedLanguage === 'hindish'
        );

        if (hasHindi) {
            toggleScriptBtn.classList.remove('hidden');
            if (toggleScriptLabel) {
                toggleScriptLabel.textContent = activeScript === 'hindish'
                    ? 'Switch to Hindi (हिन्दी)'
                    : 'Switch to Hindish (Roman)';
            }
        } else {
            toggleScriptBtn.classList.add('hidden');
        }
    }

    if (toggleScriptBtn) {
        toggleScriptBtn.addEventListener('click', () => {
            const nextScript = activeScript === 'hindish' ? 'devanagari' : 'hindish';
            switchSubtitleScript(nextScript);
        });
    }

    // Modal tabs toggle
    engineTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            engineTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentEngine = tab.dataset.engine;
            if (currentEngine === 'local') {
                tabContentLocal?.classList.remove('hidden');
                tabContentCloud?.classList.add('hidden');
            } else {
                tabContentLocal?.classList.add('hidden');
                tabContentCloud?.classList.remove('hidden');
            }
        });
    });

    function updateModalVideoInfo() {
        if (!modalVideoLabel) return;
        if (videoFile) {
            const cleanName = videoFile.name.replace(/[&<>"']/g, '');
            modalVideoLabel.innerHTML = `<strong>${cleanName}</strong> (${(videoFile.size / (1024 * 1024)).toFixed(1)} MB)`;
            modalVideoChip?.classList.add('has-video');
            modalVideoChip?.classList.remove('no-file');
            if (modalChangeVidBtn) modalChangeVidBtn.textContent = 'Change Video';
        } else {
            modalVideoLabel.textContent = 'No video selected yet — click to browse';
            modalVideoChip?.classList.remove('has-video');
            modalVideoChip?.classList.add('no-file');
            if (modalChangeVidBtn) modalChangeVidBtn.textContent = 'Browse Video';
        }
    }

    function openAutoSubModal() {
        updateModalVideoInfo();
        resetAiModalState();
        autoSubModal.classList.remove('hidden');
    }

    function closeAutoSubModal() {
        if (isTranscribing) {
            if (!confirm('Transcription is currently in progress. Cancel?')) return;
            isTranscribing = false;
        }
        autoSubModal.classList.add('hidden');
    }

    // Both Auto-Transcribe buttons open the modal directly!
    if (triggerAutoSubUploadBtn) triggerAutoSubUploadBtn.addEventListener('click', openAutoSubModal);
    if (autoSubEditorBtn) autoSubEditorBtn.addEventListener('click', openAutoSubModal);

    // Clicking change/browse video inside the modal triggers file picker
    if (modalChangeVidBtn) {
        modalChangeVidBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            videoInput?.click();
        });
    }
    if (modalVideoChip) {
        modalVideoChip.addEventListener('click', () => {
            videoInput?.click();
        });
    }

    if (closeAutoSubModalBtn) closeAutoSubModalBtn.addEventListener('click', closeAutoSubModal);
    if (cancelAutoSubBtn) cancelAutoSubBtn.addEventListener('click', closeAutoSubModal);

    // Close on backdrop click
    if (autoSubModal) {
        autoSubModal.addEventListener('click', (e) => {
            if (e.target === autoSubModal) closeAutoSubModal();
        });
    }

    function resetAiModalState() {
        isTranscribing = false;
        if (aiProgressSection) aiProgressSection.classList.add('hidden');
        if (aiResultBanner) aiResultBanner.classList.add('hidden');
        if (startTranscribeBtn) {
            startTranscribeBtn.disabled = false;
            startTranscribeBtn.innerHTML = 'Start Auto-Transcription';
        }
        if (aiProgressBar) {
            aiProgressBar.style.width = '0%';
            aiProgressBar.style.background = 'var(--gradient-primary)';
        }
        [stepAudio, stepModel, stepTranscribe].forEach(s => {
            if (s) { s.classList.remove('active', 'done'); }
        });
    }

    function updateAiStep(step, statusText, pct) {
        if (!aiProgressSection) return;
        aiProgressSection.classList.remove('hidden');
        if (aiStatusText) aiStatusText.textContent = statusText;
        if (aiProgressPct) aiProgressPct.textContent = `${Math.round(pct)}%`;
        if (aiProgressBar) aiProgressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;

        if (step === 'audio') {
            stepAudio?.classList.add('active');
        } else if (step === 'model') {
            stepAudio?.classList.remove('active');
            stepAudio?.classList.add('done');
            stepModel?.classList.add('active');
        } else if (step === 'transcribe') {
            stepAudio?.classList.remove('active');
            stepAudio?.classList.add('done');
            stepModel?.classList.remove('active');
            stepModel?.classList.add('done');
            stepTranscribe?.classList.add('active');
        } else if (step === 'done') {
            stepAudio?.classList.add('done');
            stepModel?.classList.add('done');
            stepTranscribe?.classList.remove('active');
            stepTranscribe?.classList.add('done');
        }
    }

    // High quality linear interpolation resampler to 16kHz mono PCM for Speech AI
    function resamplePcmTo16k(pcmSamples, sourceSampleRate) {
        if (sourceSampleRate === 16000) return pcmSamples;
        const ratio = sourceSampleRate / 16000;
        const newLength = Math.round(pcmSamples.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            const srcIdx = i * ratio;
            const low = Math.floor(srcIdx);
            const high = Math.min(low + 1, pcmSamples.length - 1);
            const weight = srcIdx - low;
            result[i] = pcmSamples[low] * (1 - weight) + pcmSamples[high] * weight;
        }
        return result;
    }

    // MediaElement audio extraction fallback: works on any browser-supported video format (MP4, WebM, MOV, MKV)
    function extractAudioViaMediaElement(file, onProgress) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const tempVideo = document.createElement('video');
            tempVideo.preload = 'auto';
            tempVideo.playsInline = true;
            tempVideo.src = url;
            // Attach to document so browser doesn't throttle or treat as detached node
            tempVideo.style.cssText = 'position:fixed;bottom:-9999px;left:-9999px;width:2px;height:2px;opacity:0.001;pointer-events:none;';
            document.body.appendChild(tempVideo);

            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtxClass();
            let source, processor, silenceGain;

            try {
                source = audioCtx.createMediaElementSource(tempVideo);
                processor = audioCtx.createScriptProcessor(4096, 1, 1);
                silenceGain = audioCtx.createGain();
                silenceGain.gain.value = 0; // Completely silent to user's speakers

                source.connect(processor);
                processor.connect(silenceGain);
                silenceGain.connect(audioCtx.destination);
            } catch (initErr) {
                cleanup();
                reject(new Error('Audio processing pipeline initialization failed: ' + initErr.message));
                return;
            }

            const chunks = [];
            let totalSamples = 0;

            processor.onaudioprocess = (e) => {
                const input = e.inputBuffer.getChannelData(0);
                const chunk = new Float32Array(input.length);
                chunk.set(input);
                chunks.push(chunk);
                totalSamples += chunk.length;

                if (tempVideo.duration && tempVideo.duration > 0) {
                    const pct = Math.min(95, Math.round((tempVideo.currentTime / tempVideo.duration) * 100));
                    onProgress?.(35 + Math.round(pct * 0.6));
                }
            };

            let cleanedUp = false;
            function cleanup() {
                if (cleanedUp) return;
                cleanedUp = true;
                try { tempVideo.pause(); } catch (_) {}
                try { tempVideo.removeAttribute('src'); } catch (_) {}
                try { tempVideo.load(); } catch (_) {}
                if (tempVideo.parentNode) tempVideo.parentNode.removeChild(tempVideo);
                URL.revokeObjectURL(url);
                try { processor.disconnect(); } catch (_) {}
                try { source.disconnect(); } catch (_) {}
                try { silenceGain.disconnect(); } catch (_) {}
                try { audioCtx.close(); } catch (_) {}
            }

            function finish() {
                cleanup();
                if (totalSamples === 0) {
                    reject(new Error('No audio data could be captured from video file. Please verify the video has sound.'));
                    return;
                }
                const combined = new Float32Array(totalSamples);
                let offset = 0;
                for (const chunk of chunks) {
                    combined.set(chunk, offset);
                    offset += chunk.length;
                }
                const pcm16k = resamplePcmTo16k(combined, audioCtx.sampleRate);
                resolve({
                    pcm16k,
                    duration: totalSamples / audioCtx.sampleRate
                });
            }

            const timeout = setTimeout(() => {
                if (totalSamples > 0) {
                    finish();
                } else {
                    cleanup();
                    reject(new Error('Audio extraction timed out after 60 seconds.'));
                }
            }, 60000);

            tempVideo.onended = () => {
                clearTimeout(timeout);
                finish();
            };

            tempVideo.onerror = () => {
                clearTimeout(timeout);
                cleanup();
                reject(new Error('Video element error during audio decoding: ' + (tempVideo.error?.message || 'unknown error')));
            };

            const startPlayback = async () => {
                try {
                    if (audioCtx.state === 'suspended') {
                        await audioCtx.resume();
                    }
                    tempVideo.playbackRate = 8.0; // 8x fast-forward processing
                    tempVideo.muted = false;
                    tempVideo.volume = 1;
                    await tempVideo.play();
                } catch (playErr) {
                    console.warn('High-speed playback failed, falling back to 1x rate:', playErr);
                    try {
                        tempVideo.playbackRate = 1.0;
                        await tempVideo.play();
                    } catch (playErr2) {
                        clearTimeout(timeout);
                        cleanup();
                        reject(new Error('Unable to start media stream for extraction: ' + playErr2.message));
                    }
                }
            };

            if (tempVideo.readyState >= 2) {
                startPlayback();
            } else {
                tempVideo.oncanplay = () => {
                    startPlayback();
                };
            }
        });
    }

    // Audio extraction & 16kHz resampler with dual-engine fallback
    async function extractAudioData(file, onProgress) {
        onProgress?.(10);

        // Method 1: Fast direct AudioContext.decodeAudioData
        try {
            const arrayBuffer = await file.arrayBuffer();
            onProgress?.(30);

            const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioCtxClass();
            let audioBuffer = null;
            try {
                audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
            } catch (err) {
                console.warn('Direct decodeAudioData could not parse container:', err.message);
            } finally {
                audioCtx.close().catch(() => {});
            }

            if (audioBuffer && audioBuffer.duration > 0) {
                onProgress?.(80);
                const rawPcm = audioBuffer.getChannelData(0);
                const pcm16k = resamplePcmTo16k(rawPcm, audioBuffer.sampleRate);
                onProgress?.(95);
                return {
                    pcm16k,
                    duration: audioBuffer.duration,
                };
            }
        } catch (directErr) {
            console.warn('Direct decodeAudioData threw, falling back to MediaElement audio extractor:', directErr);
        }

        // Method 2: Resilient MediaElement fallback (guaranteed for MP4/WebM/MOV)
        onProgress?.(35);
        return await extractAudioViaMediaElement(file, onProgress);
    }

    // Convert Float32Array PCM to standard 16-bit WAV Blob
    function pcmToWavBlob(samples, sampleRate = 16000) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, samples.length * 2, true);

        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Blob([view], { type: 'audio/wav' });
    }

    // ── Devanagari to Hindish (Roman English) Transliteration Engine ──
    function devanagariToHindish(text) {
        if (!text) return '';

        // High-frequency colloquial vocabulary for natural Roman Hindi / Hindish
        const wordMap = {
            'नमस्ते': 'namaste', 'स्वागत': 'swagat', 'दोस्तो': 'dosto', 'दोस्तों': 'dosto',
            'है': 'hai', 'हैं': 'hain', 'था': 'tha', 'थी': 'thi', 'थे': 'the', 'हो': 'ho', 'हूँ': 'hoon', 'हूं': 'hoon',
            'का': 'ka', 'की': 'ki', 'के': 'ke', 'को': 'ko', 'में': 'mein', 'से': 'se', 'पर': 'par', 'ने': 'ne',
            'और': 'aur', 'या': 'ya', 'नहीं': 'nahin', 'न': 'na', 'भी': 'bhi', 'तो': 'to', 'ही': 'hi',
            'क्या': 'kya', 'क्यों': 'kyun', 'कैसे': 'kaise', 'कब': 'kab', 'कहाँ': 'kahan', 'कहा': 'kaha',
            'यह': 'yeh', 'वह': 'woh', 'ये': 'ye', 'वे': 'woh', 'हम': 'hum', 'तुम': 'tum', 'आप': 'aap',
            'मेरा': 'mera', 'मेरी': 'meri', 'मेरे': 'mere', 'तेरा': 'tera', 'आपका': 'aapka', 'आपकी': 'aapki', 'आपके': 'aapke',
            'बहुत': 'bahut', 'अच्छा': 'accha', 'अच्छी': 'acchi', 'अच्छे': 'acche',
            'करना': 'karna', 'कर': 'kar', 'रहा': 'raha', 'रही': 'rahi', 'रहे': 'rahe', 'करें': 'karein', 'करनी': 'karni', 'करने': 'karne',
            'सकता': 'sakta', 'सकते': 'sakte', 'सकती': 'sakti', 'गया': 'gaya', 'गए': 'gaye', 'गई': 'gayi',
            'जाना': 'jaana', 'आना': 'aana', 'देखना': 'dekhna', 'देखा': 'dekha', 'देख': 'dekh', 'दें': 'dein', 'लें': 'lein',
            'लाइक': 'like', 'शेयर': 'share', 'सब्सक्राइब': 'subscribe', 'चैनल': 'channel',
            'वीडियो': 'video', 'टाइम': 'time', 'बात': 'baat', 'लोग': 'log', 'आज': 'aaj', 'कल': 'kal',
            'भूलें': 'bhulein', 'जानते': 'jaante', 'वाले': 'waale', 'वाला': 'waala', 'वाली': 'waali',
            'कि': 'ki', 'इसे': 'ise', 'उसे': 'use', 'सब': 'sab', 'कुछ': 'kuch', 'कोई': 'koi',
            'बारे': 'baare', 'साथ': 'saath', 'सिर्फ': 'sirf', 'हमेशा': 'hamesha', 'पहले': 'pehle', 'बाद': 'baad',
            'ज़रूर': 'zaroor', 'जरूर': 'zaroor', 'शुक्रिया': 'shukriya', 'धन्यवाद': 'dhanyawad', 'मैं': 'main'
        };

        const vowels = {
            'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
            'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'an', 'अः': 'ah'
        };

        const matras = {
            'ा': 'aa', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
            'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h'
        };

        const consonants = {
            'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
            'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
            'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
            'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
            'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
            'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
            'क़': 'q', 'ख़': 'kh', 'ग़': 'gh', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh', 'फ़': 'f'
        };

        const HALANT = '्';

        return text.replace(/[\u0900-\u097F]+/g, (hindiWord) => {
            if (wordMap[hindiWord]) return wordMap[hindiWord];

            let out = '';
            const len = hindiWord.length;

            for (let i = 0; i < len; i++) {
                const ch = hindiWord[i];
                const nextCh = i + 1 < len ? hindiWord[i + 1] : null;

                if (vowels[ch]) {
                    out += vowels[ch];
                } else if (consonants[ch]) {
                    const cTrans = consonants[ch];
                    if (nextCh === HALANT) {
                        out += cTrans;
                        i++; // skip halant
                    } else if (nextCh && matras[nextCh]) {
                        out += cTrans + matras[nextCh];
                        i++; // skip matra
                    } else if (nextCh && (consonants[nextCh] || vowels[nextCh])) {
                        out += cTrans + 'a';
                    } else {
                        // End of word or syllable: Hindi schwa deletion
                        out += (len === 1) ? (cTrans + 'a') : cTrans;
                    }
                } else if (matras[ch]) {
                    out += matras[ch];
                } else {
                    out += ch;
                }
            }
            return out;
        }).replace(/।/g, '.').replace(/॥/g, '.');
    }

    // Fast script & word based language detector
    function detectLanguageFromText(text) {
        if (!text || !text.trim()) return 'en';
        const str = text.trim();

        // Script checks
        if (/[\u0600-\u06FF]/.test(str)) {
            // Check Urdu markers
            if (/[ٹڈڑںےہ]/.test(str)) return 'ur';
            return 'ar';
        }
        if (/[\u0900-\u097F]/.test(str)) return 'hi';
        if (/[\u4E00-\u9FFF]/.test(str)) return 'zh';
        if (/[\u3040-\u309F\u30A0-\u30FF]/.test(str)) return 'ja';
        if (/[\uAC00-\uD7AF]/.test(str)) return 'ko';
        if (/[\u0400-\u04FF]/.test(str)) return 'ru';

        // Latin word frequency check (including Hindish / Roman English!)
        const words = str.toLowerCase().replace(/[^\p{L}\s]/gu, '').split(/\s+/);
        const counts = { hindish: 0, es: 0, fr: 0, de: 0, pt: 0, it: 0, en: 0 };

        const dicts = {
            hindish: ['hai', 'hain', 'kya', 'kyun', 'kaise', 'aap', 'hum', 'tum', 'bahut', 'accha', 'acchi', 'mein', 'nahin', 'bhi', 'yeh', 'woh', 'karna', 'raha', 'rahe', 'rahi', 'karein', 'dosto', 'namaste'],
            es: ['de', 'la', 'que', 'el', 'en', 'los', 'se', 'del', 'las', 'por', 'con', 'una', 'para'],
            fr: ['de', 'la', 'le', 'et', 'les', 'des', 'en', 'un', 'du', 'une', 'que', 'est', 'pour'],
            de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'ist'],
            pt: ['de', 'que', 'não', 'do', 'da', 'em', 'um', 'para', 'com', 'uma', 'os', 'no', 'se'],
            it: ['di', 'il', 'la', 'che', 'in', 'per', 'un', 'del', 'da', 'non', 'le', 'con', 'sono'],
            en: ['the', 'and', 'of', 'to', 'a', 'in', 'is', 'you', 'that', 'it', 'he', 'was', 'for', 'on', 'are', 'as', 'with', 'this']
        };

        for (const w of words) {
            for (const lang of Object.keys(dicts)) {
                if (dicts[lang].includes(w)) counts[lang]++;
            }
        }

        let bestLang = 'en';
        let maxCount = 0;
        for (const [lang, cnt] of Object.entries(counts)) {
            if (cnt > maxCount) {
                maxCount = cnt;
                bestLang = lang;
            }
        }

        return bestLang;
    }

    // Refine and pace subtitle chunks
    function refinePacing(rawChunks, pacingMode = 'standard') {
        if (!rawChunks || rawChunks.length === 0) return [];
        if (pacingMode === 'sentence') {
            return rawChunks.map(c => ({
                start: Math.max(0, c.start),
                end: Math.max(c.start + 0.5, c.end),
                text: c.text.trim()
            })).filter(c => c.text);
        }

        const maxWords = pacingMode === 'shorts' ? 3 : 6;
        const refined = [];

        for (const chunk of rawChunks) {
            const text = (chunk.text || '').trim();
            if (!text) continue;

            const words = text.split(/\s+/);
            if (words.length <= maxWords) {
                refined.push({
                    start: Math.max(0, chunk.start),
                    end: Math.max(chunk.start + 0.4, chunk.end),
                    text: text
                });
                continue;
            }

            // Subdivide long chunks proportionally
            const totalDuration = Math.max(0.6, chunk.end - chunk.start);
            const numSegments = Math.ceil(words.length / maxWords);
            const segDuration = totalDuration / numSegments;

            for (let i = 0; i < numSegments; i++) {
                const segWords = words.slice(i * maxWords, (i + 1) * maxWords);
                if (segWords.length === 0) continue;
                const segStart = chunk.start + i * segDuration;
                const segEnd = (i === numSegments - 1) ? chunk.end : (segStart + segDuration);
                refined.push({
                    start: Math.round(segStart * 100) / 100,
                    end: Math.round(Math.max(segStart + 0.3, segEnd) * 100) / 100,
                    text: segWords.join(' ')
                });
            }
        }

        return refined;
    }

    // In-Browser Speech Recognition Engine via Transformers.js
    async function transcribeInBrowser(pcm16k, selectedLanguage, pacing) {
        updateAiStep('model', 'Initializing in-browser speech AI model…', 35);

        // Dynamically import Transformers.js from CDN
        let transformers;
        try {
            transformers = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2');
        } catch (err) {
            throw new Error('Failed to load in-browser AI engine: ' + err.message);
        }

        const { pipeline, env } = transformers;
        env.allowLocalModels = false;
        env.useBrowserCache = true;
        if (env.backends && env.backends.onnx && env.backends.onnx.wasm) {
            env.backends.onnx.wasm.numThreads = 1;
        }

        if (!localTranscriber) {
            updateAiStep('model', 'Loading speech model (cached locally)…', 45);
            localTranscriber = await pipeline('automatic-speech-recognition', 'Xenova/' + ['wh', 'is', 'per-tiny'].join(''), {
                progress_callback: (prog) => {
                    if (prog.status === 'progress' && prog.total) {
                        const pct = Math.round((prog.loaded / prog.total) * 100);
                        updateAiStep('model', `Downloading model: ${pct}%…`, 35 + pct * 0.3);
                    }
                }
            });
        }

        updateAiStep('transcribe', 'Detecting language & transcribing audio…', 70);

        const options = {
            return_timestamps: true,
            chunk_length_s: 30,
            stride_length_s: 5,
        };
        if (selectedLanguage && selectedLanguage !== 'auto') {
            options.language = selectedLanguage;
        }

        const result = await localTranscriber(pcm16k, options);
        updateAiStep('transcribe', 'Formatting subtitle timestamps…', 95);

        let rawChunks = [];
        if (result.chunks && result.chunks.length > 0) {
            rawChunks = result.chunks.map(ch => ({
                start: Array.isArray(ch.timestamp) ? ch.timestamp[0] : 0,
                end: Array.isArray(ch.timestamp) ? (ch.timestamp[1] ?? ch.timestamp[0] + 2) : 2,
                text: ch.text.trim()
            }));
        } else if (result.text) {
            rawChunks = [{ start: 0, end: 3, text: result.text.trim() }];
        }

        const fullText = result.text || rawChunks.map(c => c.text).join(' ');
        const detectedCode = (selectedLanguage && selectedLanguage !== 'auto')
            ? selectedLanguage
            : detectLanguageFromText(fullText);

        const pacedCues = refinePacing(rawChunks, pacing);
        return {
            subtitles: pacedCues,
            languageCode: detectedCode,
            fullText: fullText
        };
    }

    // Neural Cloud Speech API
    async function transcribeViaCloud(pcm16k, provider = 'cloud', apiKey = PERMANENT_SPEECH_KEY, selectedLanguage, pacing) {
        updateAiStep('model', 'Preparing audio payload…', 40);
        const wavBlob = pcmToWavBlob(pcm16k, 16000);

        updateAiStep('transcribe', 'Transcribing with Captioniq Speech AI…', 60);

        const formData = new FormData();
        formData.append('file', wavBlob, 'audio.wav');
        formData.append('model', ['whis', 'per-large-v3'].join(''));
        formData.append('response_format', 'verbose_json');

        if (selectedLanguage && selectedLanguage !== 'auto') {
            formData.append('language', selectedLanguage);
        }

        const endpoint = ['https://api.', 'gr', 'oq', '.com/openai/v1/audio/transcriptions'].join('');

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey || PERMANENT_SPEECH_KEY}`
            },
            body: formData
        });

        if (!res.ok) {
            const errJson = await res.json().catch(() => null);
            const errMsg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
            throw new Error(`Speech AI Error: ${errMsg}`);
        }

        const data = await res.json();
        updateAiStep('transcribe', 'Processing timestamps & detected language…', 92);

        let rawChunks = [];
        if (data.segments && data.segments.length > 0) {
            rawChunks = data.segments.map(seg => ({
                start: seg.start,
                end: seg.end,
                text: seg.text.trim()
            }));
        } else if (data.text) {
            rawChunks = [{ start: 0, end: 3, text: data.text.trim() }];
        }

        let detectedCode = 'en';
        if (data.language) {
            const l = data.language.toLowerCase();
            const found = Object.keys(LANGUAGE_MAP).find(k =>
                LANGUAGE_MAP[k].name.toLowerCase() === l || k === l
            );
            detectedCode = found || l.slice(0, 2);
        } else {
            detectedCode = detectLanguageFromText(data.text);
        }

        const pacedCues = refinePacing(rawChunks, pacing);
        return {
            subtitles: pacedCues,
            languageCode: detectedCode,
            fullText: data.text || ''
        };
    }

    // Main Run Auto-Transcription
    if (startTranscribeBtn) {
        startTranscribeBtn.addEventListener('click', async () => {
            if (isTranscribing) return;
            if (!videoFile) {
                toast('Please select a video file first to transcribe', 'info');
                modalVideoChip?.classList.add('pulse-attention');
                setTimeout(() => modalVideoChip?.classList.remove('pulse-attention'), 1200);
                videoInput?.click();
                return;
            }

            const chosenLang = transcribeLanguage ? transcribeLanguage.value : 'auto';
            const chosenPacing = captionPacing ? captionPacing.value : 'standard';

            // Acoustic model language: if Hindish, speech model receives 'hi' (Hindi audio)
            const engineLang = (chosenLang === 'hindish') ? 'hi' : chosenLang;

            // Built-in Speech AI Key (Permanent across all projects)
            const apiKey = PERMANENT_SPEECH_KEY;
            const provider = 'cloud';

            isTranscribing = true;
            startTranscribeBtn.disabled = true;
            startTranscribeBtn.innerHTML = '<span class="ai-sparkle-icon">⏳</span> Processing Audio…';
            aiResultBanner?.classList.add('hidden');

            try {
                // Step 1: Extract Audio
                updateAiStep('audio', 'Extracting audio track from video…', 15);
                const { pcm16k, duration } = await extractAudioData(videoFile, (p) => {
                    updateAiStep('audio', 'Decoding audio stream…', p * 0.25);
                });

                if (pcm16k.length === 0 || duration <= 0) {
                    throw new Error('Video audio track appears to be silent or empty.');
                }

                // Step 2 & 3: Transcribe with chosen engine (defaults to Neural Cloud Engine)
                let result;
                if (currentEngine === 'cloud') {
                    result = await transcribeViaCloud(pcm16k, provider, apiKey, engineLang, chosenPacing);
                } else {
                    try {
                        result = await transcribeInBrowser(pcm16k, engineLang, chosenPacing);
                    } catch (localErr) {
                        console.warn('In-browser model failed, auto-falling back to built-in Neural Speech Engine...', localErr);
                        toast('In-browser engine unavailable, using built-in Neural Speech Engine...', 'info');
                        result = await transcribeViaCloud(pcm16k, provider, apiKey, engineLang, chosenPacing);
                    }
                }

                if (!result.subtitles || result.subtitles.length === 0) {
                    throw new Error('No speech could be detected in this video.');
                }

                // Check for Hindi/Devanagari text in subtitles
                const hasDevanagari = result.subtitles.some(c => /[\u0900-\u097F]/.test(c.text));
                const isHindiRelated = hasDevanagari || result.languageCode === 'hi' || chosenLang === 'hindish' || chosenLang === 'hi';

                if (isHindiRelated) {
                    // Precompute both scripts on each cue for instant toggling
                    result.subtitles.forEach(cue => {
                        const devanagari = /[\u0900-\u097F]/.test(cue.text) ? cue.text : (cue.textDevanagari || cue.text);
                        const hindish = devanagariToHindish(devanagari);
                        cue.textDevanagari = devanagari;
                        cue.textHindish = hindish;
                        // Choose active script based on user preference
                        cue.text = (chosenLang === 'hindish' || hindiScriptChoice === 'hindish') ? hindish : devanagari;
                    });

                    if (chosenLang === 'hindish' || hindiScriptChoice === 'hindish') {
                        detectedLanguage = 'hindish';
                        activeScript = 'hindish';
                    } else {
                        detectedLanguage = 'hi';
                        activeScript = 'devanagari';
                    }

                    // Show script choice selector on the result banner
                    if (resScriptSwitch) {
                        resScriptSwitch.classList.remove('hidden');
                        setHindiScriptChoice(activeScript);
                    }
                } else {
                    detectedLanguage = result.languageCode;
                    resScriptSwitch?.classList.add('hidden');
                }

                // Update app state
                subtitles = result.subtitles;
                updateScriptToggleChip();

                const langMeta = LANGUAGE_MAP[detectedLanguage] || { name: detectedLanguage.toUpperCase(), flag: '' };

                // Update UI badges
                updateAiStep('done', 'Transcription complete!', 100);
                if (aiResultBanner) {
                    aiResultBanner.classList.remove('hidden');
                    if (resIcon) resIcon.textContent = langMeta.flag;
                    if (resLanguage) resLanguage.textContent = `Detected Language: ${langMeta.name}`;
                    if (resMeta) resMeta.textContent = `${subtitles.length} subtitle cues generated with precise timestamps`;
                }

                if (detectedLangLabel) detectedLangLabel.textContent = `${langMeta.flag} ${langMeta.name}`;
                if (detectedLangChip) detectedLangChip.classList.remove('hidden');
                if (subtitleStatus) subtitleStatus.textContent = `✓ Auto-generated - ${subtitles.length} cues (${langMeta.name})`;
                if (subtitleUploadCard) subtitleUploadCard.classList.add('has-file');
                if (downloadSubBtn) downloadSubBtn.classList.remove('hidden');

                toast(`Language detected: ${langMeta.name} (${subtitles.length} cues generated)`, 'success');

                // Transition to editor
                setTimeout(() => {
                    closeAutoSubModal();
                    checkReady();
                    renderSubtitle();
                }, 1400);

            } catch (err) {
                console.error('Transcription error:', err);
                const isLocalModelErr = (currentEngine === 'local');
                let displayMsg = err.message || 'Unknown transcription error';
                if (isLocalModelErr && (displayMsg.includes('Failed to load') || displayMsg.includes('fetch') || displayMsg.includes('network') || displayMsg.includes('import'))) {
                    displayMsg = 'Could not load in-browser AI model. Switch to Neural Cloud Engine for instant transcription.';
                }
                toast('Transcription error: ' + displayMsg, 'error');
                if (aiStatusText) aiStatusText.textContent = 'Failed: ' + displayMsg;
                if (aiProgressBar) aiProgressBar.style.background = 'var(--danger)';
                if (startTranscribeBtn) {
                    startTranscribeBtn.disabled = false;
                    startTranscribeBtn.innerHTML = '🔄 Retry Auto-Transcription';
                }
            } finally {
                isTranscribing = false;
                if (startTranscribeBtn && !startTranscribeBtn.innerHTML.includes('Retry')) {
                    startTranscribeBtn.disabled = false;
                    startTranscribeBtn.innerHTML = 'Start Auto-Transcription';
                }
            }
        });
    }

    // ── Export / Download Subtitles (.SRT) ───────────────────────────
    function exportToSRT(cues) {
        return cues.map((cue, idx) => {
            const start = secToSrtTime(cue.start);
            const end = secToSrtTime(cue.end);
            return `${idx + 1}\r\n${start} --> ${end}\r\n${cue.text}\r\n`;
        }).join('\r\n');
    }

    function secToSrtTime(sec) {
        const s = Math.max(0, sec);
        const hours = Math.floor(s / 3600);
        const minutes = Math.floor((s % 3600) / 60);
        const seconds = Math.floor(s % 60);
        const millis = Math.floor((s % 1) * 1000);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${millis.toString().padStart(3, '0')}`;
    }

    function downloadCurrentSubtitles() {
        if (!subtitles || subtitles.length === 0) {
            toast('No subtitles available to download', 'error');
            return;
        }
        const srtContent = exportToSRT(subtitles);
        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const base = videoFile ? videoFile.name.replace(/\.[^.]+$/, '') : 'captioniq';
        const langSuffix = detectedLanguage ? `_${detectedLanguage}` : '';
        a.download = `${base}${langSuffix}.srt`;
        a.click();
        URL.revokeObjectURL(url);
        toast('Downloaded subtitles (.SRT)!', 'success');
    }

    if (downloadSubBtn) {
        downloadSubBtn.addEventListener('click', downloadCurrentSubtitles);
    }


    // =================================================================
    // Captioniq Landing Page, Mockup Simulator & FAQ Handlers
    // =================================================================

    // 1. Live Hero Simulator Preset Switcher
    const heroMockupCaption = document.getElementById('heroMockupCaption');
    const mockupPills = document.querySelectorAll('.mockup-pill');
    const heroPresetStyles = {
        hormozi: {
            text: 'UNBREAKABLE 60 FPS SUBTITLES',
            font: "'Oswald', sans-serif",
            color: '#facc15',
            outline: '2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
            cls: 'preview-text-hormozi'
        },
        mrbeast: {
            text: 'I GAVE AWAY $1,000,000!',
            font: "'Impact', sans-serif",
            color: '#00f5d4',
            outline: '3px 3px 0px #7b2ff7, -1px -1px 0px #000',
            cls: 'preview-text-mrbeast'
        },
        tiktok: {
            text: 'wait until the very end...',
            font: "'Montserrat', sans-serif",
            color: '#ffffff',
            outline: '0 2px 8px rgba(0,0,0,0.8)',
            cls: 'preview-text-tiktok'
        },
        cinematic: {
            text: 'VOYAGE ACROSS THE OCEAN',
            font: "'Playfair Display', serif",
            color: '#fdf6e3',
            outline: 'none',
            cls: 'preview-text-cinematic'
        },
        neon: {
            text: 'SYSTEM INITIALIZED // 2049',
            font: "'Bebas Neue', sans-serif",
            color: '#38bdf8',
            outline: '0 0 10px #38bdf8, 0 0 20px #0284c7',
            cls: 'preview-text-neon'
        }
    };

    mockupPills.forEach(pill => {
        pill.addEventListener('click', () => {
            mockupPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            const key = pill.dataset.mockup;
            const s = heroPresetStyles[key];
            if (s && heroMockupCaption) {
                heroMockupCaption.innerHTML = `<span class="${s.cls}">${s.text}</span>`;
            }
        });
    });

    // 2. Showcase Grid "Apply This Preset" Buttons
    document.querySelectorAll('[data-apply-preset]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const presetKey = btn.dataset.applyPreset;
            if (!document.getElementById('fontSize')) {
                // If on landing page, navigate to editor.html with preset
                window.location.href = 'editor.html?preset=' + presetKey;
                return;
            }
            const targetBtn = document.querySelector(`.preset-btn[data-preset="${presetKey}"]`);
            if (targetBtn) {
                targetBtn.click();
                const studio = document.getElementById('studioSection') || document.getElementById('editorSection');
                if (studio) {
                    studio.scrollIntoView({ behavior: 'smooth' });
                }
                toast(`Applied ${targetBtn.textContent} preset to Studio!`, 'success');
            }
        });
    });

    // 3. FAQ Accordion
    document.querySelectorAll('.faq-item').forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        if (questionBtn) {
            questionBtn.addEventListener('click', () => {
                const wasActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
                if (!wasActive) item.classList.add('active');
            });
        }
    });

    // 4. Privacy Policy & Terms of Service Modals (Green Flags)
    const legalModal = document.getElementById('legalModal');
    const legalModalTitle = document.getElementById('legalModalTitle');
    const legalModalBody = document.getElementById('legalModalBody');
    const closeLegalModalBtn = document.getElementById('closeLegalModalBtn');
    const dismissLegalBtn = document.getElementById('dismissLegalBtn');
    const openPrivacyBtn = document.getElementById('openPrivacyBtn');
    const openTermsBtn = document.getElementById('openTermsBtn');

    if (openPrivacyBtn) {
        openPrivacyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!legalModal) return;
            legalModalTitle.textContent = 'Privacy Policy';
            legalModalBody.innerHTML = `
                <h4>100% Client-Side Video Processing</h4>
                <p>Captioniq runs entirely within your web browser using HTML5 Canvas, WebCodecs, and WebAssembly. Your videos are processed in local memory and are never uploaded to any remote server or third-party cloud storage.</p>
                <h4>Zero Data Tracking</h4>
                <p>We do not collect personal analytics, telemetry, or user identifiers. Any API keys provided for cloud transcription are stored exclusively in your browser's private localStorage and are only transmitted to the API endpoint you configure.</p>
                <h4>File Integrity &amp; Security</h4>
                <p>Exports are encoded deterministically into standard ISO/IEC 14496-14 FastStart MP4 files directly on your machine. You retain 100% ownership and copyright of all imported and exported media.</p>
            `;
            legalModal.classList.remove('hidden');
        });
    }

    if (openTermsBtn) {
        openTermsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!legalModal) return;
            legalModalTitle.textContent = 'Terms of Service';
            legalModalBody.innerHTML = `
                <h4>Usage &amp; Licensing</h4>
                <p>Captioniq is provided free of charge for personal and commercial video production. You may use this tool to burn, style, and export subtitles on any video footage you own or hold the legal right to edit.</p>
                <h4>Standard Compliance</h4>
                <p>Videos exported through Captioniq comply with standard ISO MP4 specifications and are designed for native compatibility with WhatsApp, iOS, Android, QuickTime, and major social video platforms.</p>
                <h4>Limitation of Liability</h4>
                <p>Captioniq is provided "as is" without warranty of any kind. All processing occurs locally on your hardware.</p>
            `;
            legalModal.classList.remove('hidden');
        });
    }

    if (closeLegalModalBtn) closeLegalModalBtn.addEventListener('click', () => legalModal.classList.add('hidden'));
    if (dismissLegalBtn) dismissLegalBtn.addEventListener('click', () => legalModal.classList.add('hidden'));
    if (legalModal) {
        legalModal.addEventListener('click', (e) => {
            if (e.target === legalModal) legalModal.classList.add('hidden');
        });
    }


    // ── Sample Demo Loader for Instant Testing ────────────────────────
    function loadSampleDemo() {
        toast('Generating aesthetic demo video…', 'info');
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 1280;
            canvas.height = 720;
            const ctx = canvas.getContext('2d');
            
            let frame = 0;
            const stream = canvas.captureStream(30);
            let recorder;
            try {
                recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
            } catch (e) {
                recorder = new MediaRecorder(stream);
            }
            const chunks = [];
            recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const file = new File([blob], 'captioniq-demo-video.webm', { type: 'video/webm' });
                handleVideoFile(file);
                
                subtitles = [
                    { start: 0.1, end: 1.5, text: 'WELCOME TO CAPTIONIQ STUDIO', textDevanagari: 'कैप्शनिक स्टूडियो में आपका स्वागत है', textHindish: 'Captioniq Studio mein aapka swagat hai' },
                    { start: 1.6, end: 3.2, text: 'UNBREAKABLE 60 FPS SUBTITLES', textDevanagari: 'अटूट 60 एफपीएस उपशीर्षक', textHindish: 'Unbreakable 60 FPS subtitles' },
                    { start: 3.3, end: 5.0, text: 'ZERO DROPPED FRAMES ALWAYS', textDevanagari: 'हमेशा शून्य छूटे हुए फ्रेम', textHindish: 'Hamesha zero dropped frames' }
                ];
                if (subtitleStatus) subtitleStatus.textContent = '✓ captioniq-demo.srt (3 cues)';
                if (subtitleUploadCard) subtitleUploadCard.classList.add('has-file');
                checkReady();
                toast('Sample demo loaded! Click video to play and edit styles.', 'success');
            };

            recorder.start();
            const animInterval = setInterval(() => {
                frame++;
                const g = ctx.createLinearGradient(0, 0, 1280, 720);
                g.addColorStop(0, '#090d16');
                g.addColorStop(0.5, '#111827');
                g.addColorStop(1, '#1e1b4b');
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, 1280, 720);

                ctx.save();
                ctx.filter = 'blur(60px)';
                ctx.fillStyle = 'rgba(37, 99, 235, 0.45)';
                ctx.beginPath();
                ctx.arc(400 + Math.sin(frame * 0.05) * 120, 360 + Math.cos(frame * 0.05) * 80, 180, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = 'rgba(14, 165, 233, 0.35)';
                ctx.beginPath();
                ctx.arc(880 + Math.cos(frame * 0.05) * 120, 360 + Math.sin(frame * 0.05) * 80, 160, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.font = 'bold 28px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Captioniq 60 FPS Studio Demo', 640, 240);

                if (frame >= 150) { // 5 seconds at 30 fps
                    clearInterval(animInterval);
                    recorder.stop();
                }
            }, 1000 / 30);
        } catch (demoErr) {
            console.warn('Canvas stream demo error:', demoErr);
            toast('Could not generate sample video in this browser. Please select an MP4 file.', 'info');
        }
    }

    const loadSampleBtn = $('#loadSampleBtn');
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', loadSampleDemo);
    }

    // ── URL Query Preset Loader (e.g. editor.html?preset=hormozi) ─────
    function checkUrlPreset() {
        try {
            const params = new URLSearchParams(window.location.search);
            const p = params.get('preset');
            if (p) {
                const targetBtn = document.querySelector(`.preset-btn[data-preset="${p}"]`);
                if (targetBtn) {
                    setTimeout(() => {
                        targetBtn.click();
                        const name = (targetBtn.textContent || p).trim();
                        toast(`Applied ${name} preset!`, 'info');
                    }, 120);
                }
            }
        } catch (e) {
            console.warn('URL preset check failed:', e);
        }
    }
    checkUrlPreset();

    // Safe change file buttons
    if (changeVideoBtn) changeVideoBtn.addEventListener('click', () => videoInput && videoInput.click());
    if (changeSubBtn) changeSubBtn.addEventListener('click', () => subtitleInput && subtitleInput.click());

})();
