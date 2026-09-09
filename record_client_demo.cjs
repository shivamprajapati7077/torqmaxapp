const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.join(__dirname, 'temp_frames');
const FFMPEG_BIN = '/Library/Frameworks/Python.framework/Versions/3.14/lib/python3.14/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';
const OUTPUT_MP4 = path.join(__dirname, 'torqmax_app_demo.mp4');
const ARTIFACT_MP4 = '/Users/prajapatishivamkanubhai/.gemini/antigravity-ide/brain/bcf078f1-8dbe-4f3f-a1fa-429fbdd8931e/torqmax_app_demo.mp4';
const ARTIFACT_WEBP = '/Users/prajapatishivamkanubhai/.gemini/antigravity-ide/brain/bcf078f1-8dbe-4f3f-a1fa-429fbdd8931e/torqmax_app_demo_clean.webp';

if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

let frameCount = 0;

async function capture(page, repeats = 1) {
  const filePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
  await page.screenshot({ path: filePath, type: 'jpeg', quality: 96 });
  frameCount++;
  for (let r = 1; r < repeats; r++) {
    const dupPath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
    fs.copyFileSync(filePath, dupPath);
    frameCount++;
  }
}

async function smoothScroll(page, containerSelector, targetY, stepSize = 18, delayMs = 15) {
  let currentY = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    return el ? el.scrollTop : window.scrollY;
  }, containerSelector);

  const direction = targetY > currentY ? 1 : -1;
  const distance = Math.abs(targetY - currentY);
  const steps = Math.ceil(distance / stepSize);

  for (let i = 0; i < steps; i++) {
    currentY += direction * stepSize;
    if ((direction === 1 && currentY > targetY) || (direction === -1 && currentY < targetY)) {
      currentY = targetY;
    }
    await page.evaluate((sel, y) => {
      const el = document.querySelector(sel);
      if (el) el.scrollTop = y;
      else window.scrollTo(0, y);
    }, containerSelector, currentY);

    if (delayMs > 0) {
      await new Promise(res => setTimeout(res, delayMs));
    }
    await capture(page, 1);
    if (currentY === targetY) break;
  }
}

(async () => {
  console.log('🚀 Launching Chrome for clean client recording (zero outlines)...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--hide-scrollbars',
      '--mute-audio',
      '--disable-notifications'
    ]
  });

  const page = await browser.newPage();
  // Standard iPhone screen aspect ratio (Retina 2x = 780 x 1688)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('📱 Navigating to http://localhost:5174/ ...');
  // Navigate with immediate capture
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });

  // 1. CAPTURE PROPER CINEMATIC INTRO & SPLASH SCREEN
  console.log('🎬 Recording Proper Cinematic Intro (TorqMax Emblem, Aura, Loading Bar)...');
  // Capture splash progress animation over 3.2 seconds
  for (let i = 0; i < 55; i++) {
    await capture(page, 1);
    await new Promise(r => setTimeout(r, 55));
  }

  // 2. HOME SCREEN TOP & CAROUSEL
  console.log('🏠 Home Screen: Top View & Budget Cars Carousel...');
  // Hold on initial hero view (Swift / Hatchbacks)
  await capture(page, 25);

  // Click next carousel slide dot or right arrow if present
  try {
    await page.evaluate(() => {
      const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('›') || b.textContent.includes('Sedans') || b.title?.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
  } catch (e) {}

  // Wait on carousel slide (Sedans / Compact SUVs)
  await capture(page, 25);

  // 3. SMOOTH SCROLL HOME SCREEN
  console.log('📜 Scrolling Home Screen to bottom...');
  const scrollSelector = '.scroll-page';
  const homeMaxScroll = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    return el ? el.scrollHeight - el.clientHeight : document.body.scrollHeight - window.innerHeight;
  }, scrollSelector);

  console.log('Home max scroll:', homeMaxScroll);
  await smoothScroll(page, scrollSelector, homeMaxScroll, 20, 10);
  // Hold at bottom
  await capture(page, 20);

  // 4. SWITCH TO ABOUT TAB
  console.log('ℹ️ Switching to About Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.bottom-nav button, .bottom-nav div, button'));
    const aboutBtn = btns.find(b => b.textContent.trim().toLowerCase() === 'about' || b.innerText.includes('ABOUT'));
    if (aboutBtn) aboutBtn.click();
  });
  // Page enter animation hold
  await capture(page, 25);

  // Scroll About Screen
  console.log('📜 Scrolling About Screen to bottom...');
  const aboutMaxScroll = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    return el ? el.scrollHeight - el.clientHeight : document.body.scrollHeight - window.innerHeight;
  }, scrollSelector);
  console.log('About max scroll:', aboutMaxScroll);
  await smoothScroll(page, scrollSelector, aboutMaxScroll, 20, 10);
  await capture(page, 20);

  // 5. SWITCH TO CONTACT TAB
  console.log('📞 Switching to Contact Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.bottom-nav button, .bottom-nav div, button'));
    const contactBtn = btns.find(b => b.textContent.trim().toLowerCase() === 'contact' || b.innerText.includes('CONTACT'));
    if (contactBtn) contactBtn.click();
  });
  await capture(page, 25);

  // Scroll Contact Screen
  console.log('📜 Scrolling Contact Screen to bottom...');
  const contactMaxScroll = await page.evaluate(sel => {
    const el = document.querySelector(sel);
    return el ? el.scrollHeight - el.clientHeight : document.body.scrollHeight - window.innerHeight;
  }, scrollSelector);
  console.log('Contact max scroll:', contactMaxScroll);
  await smoothScroll(page, scrollSelector, contactMaxScroll, 20, 10);
  await capture(page, 20);

  // 6. RETURN TO HOME (CLEAN OUTRO)
  console.log('🏁 Returning to Home Tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.bottom-nav button, .bottom-nav div, button'));
    const homeBtn = btns.find(b => b.textContent.trim().toLowerCase() === 'home' || b.innerText.includes('HOME'));
    if (homeBtn) homeBtn.click();
  });
  await capture(page, 15);

  // Scroll back up to top of Home
  console.log('⬆️ Scrolling back to top of Home...');
  await smoothScroll(page, scrollSelector, 0, 28, 8);
  // Hold on hero for a clean, stable finish
  await capture(page, 30);

  console.log(`✅ Captured ${frameCount} frames in total!`);
  await browser.close();

  // 7. ENCODE TO MP4 VIA FFMPEG
  console.log('🎥 Encoding MP4 with FFmpeg...');
  const fps = 22;
  const ffmpegCmd = `"${FFMPEG_BIN}" -y -framerate ${fps} -i "${path.join(FRAMES_DIR, 'frame_%05d.jpg')}" -c:v libx264 -pix_fmt yuv420p -preset slow -crf 16 -movflags +faststart "${OUTPUT_MP4}"`;
  execSync(ffmpegCmd, { stdio: 'inherit' });

  // Copy MP4 to artifacts
  fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
  console.log('📁 Copied MP4 to artifacts:', ARTIFACT_MP4);

  // Also create a lightweight preview WebP for embedding in markdown walkthrough
  console.log('🖼️ Creating preview WebP for markdown...');
  const ffmpegWebpCmd = `"${FFMPEG_BIN}" -y -framerate 12 -i "${path.join(FRAMES_DIR, 'frame_%05d.jpg')}" -vf "scale=390:-1:flags=lanczos,fps=10" -loop 0 -c:v libwebp -lossless 0 -compression_level 4 -q:v 70 "${ARTIFACT_WEBP}"`;
  try {
    execSync(ffmpegWebpCmd, { stdio: 'inherit' });
    console.log('📁 Created preview WebP:', ARTIFACT_WEBP);
  } catch (err) {
    console.warn('WebP preview conversion notice:', err.message);
  }

  // Clean up frames directory
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  console.log('🎉 Done! Clean video with proper intro and zero blue outlines ready.');
})();
