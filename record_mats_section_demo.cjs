const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRAMES_DIR = path.join(__dirname, 'temp_mats_frames');
const FFMPEG_BIN = '/Library/Frameworks/Python.framework/Versions/3.14/lib/python3.14/site-packages/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';
const OUTPUT_MP4 = path.join(__dirname, 'torqmax_mats_section_demo.mp4');
const ARTIFACT_MP4 = '/Users/prajapatishivamkanubhai/.gemini/antigravity-ide/brain/bcf078f1-8dbe-4f3f-a1fa-429fbdd8931e/torqmax_mats_section_demo.mp4';
const ARTIFACT_WEBP = '/Users/prajapatishivamkanubhai/.gemini/antigravity-ide/brain/bcf078f1-8dbe-4f3f-a1fa-429fbdd8931e/torqmax_mats_section_demo.webp';

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

async function smoothScroll(page, containerSelector, targetY, stepSize = 16, delayMs = 12) {
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
  console.log('🚀 Launching Chrome for dedicated Mats Section recording...');
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
  // Standard high-res iPhone Retina viewport (390 x 844 @ 2x = 780 x 1688)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('📱 Navigating to http://localhost:5174/ ...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  // Wait past initial splash screen
  await new Promise(r => setTimeout(r, 3200));

  // Navigate directly into Mats Section
  console.log('🚗 Entering Mats Customizer Section...');
  await page.click('#nav-products');
  await new Promise(r => setTimeout(r, 600));

  // 1. TOP HEADER & CATEGORY CHIPS
  console.log('✨ Showing Header & Category Filters (All, Small, Medium, Big)...');
  // Hold on initial top view
  await capture(page, 20);

  // 2. DEMONSTRATE CATEGORY FILTER (Click Medium Vehicles)
  console.log('🔘 Selecting "Medium Vehicles" Category Filter...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.scroll-page button'));
    const medBtn = btns.find(b => b.textContent.includes('Medium'));
    if (medBtn) {
      medBtn.style.transform = 'scale(0.95)';
      medBtn.click();
    }
  });
  await capture(page, 12);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('.scroll-page button'));
    const medBtn = btns.find(b => b.textContent.includes('Medium'));
    if (medBtn) medBtn.style.transform = 'none';
  });
  await capture(page, 10);

  // 3. CHOOSE VEHICLE MODEL (Thar Roxx / Creta)
  console.log('🚙 Selecting Vehicle Model: THAR ROXX AT 2024 (ONWARDS)...');
  await page.evaluate(() => {
    const sel = document.getElementById('vehicle-select-dropdown');
    if (sel) {
      const opt = Array.from(sel.options).find(o => o.text.includes('THAR ROXX') || o.text.includes('CRETA'));
      if (opt) {
        sel.value = opt.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  // Hold to showcase the Active Vehicle Card updating with "MEDIUM VEHICLE" and "CUSTOM FIT"
  await capture(page, 22);

  // 4. SCROLL SMOOTHLY TO STEP 2 (DESIGN STYLE) & STEP 3 (COLOUR)
  console.log('📜 Scrolling to Style and Colour Selection...');
  await smoothScroll(page, '.scroll-page', 240, 14, 15);
  await capture(page, 15);

  // 5. DEMONSTRATE STYLE SWITCHING (Checkmate -> Exotic)
  console.log('🎨 Switching Style from Checkmate to Exotic (Executive Fluid Ribbed)...');
  await page.evaluate(() => {
    const exoticCard = document.getElementById('style-card-exotic') ||
      Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('EXOTIC') && d.textContent.includes('Fluid Ribbed'));
    if (exoticCard) {
      exoticCard.style.transform = 'scale(0.97)';
      exoticCard.click();
    }
  });
  await capture(page, 10);
  await page.evaluate(() => {
    const exoticCard = document.getElementById('style-card-exotic') ||
      Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('EXOTIC') && d.textContent.includes('Fluid Ribbed'));
    if (exoticCard) exoticCard.style.transform = 'none';
  });
  await capture(page, 20);

  // 6. DEMONSTRATE COLOUR SWITCHING (Choose Beige)
  console.log('🎨 Selecting Beige Premium Shade...');
  await smoothScroll(page, '.scroll-page', 420, 14, 15);
  await capture(page, 12);

  await page.evaluate(() => {
    const beigeCard = document.getElementById('color-card-beige') ||
      Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Beige') && d.textContent.includes('cream beige'));
    if (beigeCard) {
      beigeCard.style.transform = 'scale(0.97)';
      beigeCard.click();
    }
  });
  await capture(page, 10);
  await page.evaluate(() => {
    const beigeCard = document.getElementById('color-card-beige') ||
      Array.from(document.querySelectorAll('div')).find(d => d.textContent.includes('Beige') && d.textContent.includes('cream beige'));
    if (beigeCard) beigeCard.style.transform = 'none';
  });
  await capture(page, 20);

  // 7. SCROLL TO INTERACTIVE 3D MAT VISUALIZER
  console.log('🔍 Viewing Live 3D Mat Visualizer in Beige Fluid Ribbed...');
  await smoothScroll(page, '.scroll-page', 700, 14, 15);
  await capture(page, 20);

  // Switch view angle to Co-Driver then Rear
  console.log('🔄 Switching Mat Visualizer angle to Co-Driver & Rear...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const codriverBtn = btns.find(b => b.textContent.trim() === 'Codriver');
    if (codriverBtn) codriverBtn.click();
  });
  await capture(page, 16);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const rearBtn = btns.find(b => b.textContent.trim() === 'Rear');
    if (rearBtn) rearBtn.click();
  });
  await capture(page, 16);

  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const driverBtn = btns.find(b => b.textContent.trim() === 'Driver');
    if (driverBtn) driverBtn.click();
  });
  await capture(page, 18);

  // 8. SCROLL TO STEP 5: ORDER CONFIGURATION & 1-TAP WHATSAPP BUTTON
  console.log('📱 Scrolling to Step 5: Order Configuration & WhatsApp action...');
  await smoothScroll(page, '.scroll-page', 1200, 16, 15);
  await capture(page, 25);

  // Highlight the WhatsApp Order Button
  console.log('⚡ Highlighting 1-Tap WhatsApp Direct Order button...');
  await page.evaluate(() => {
    const waBtn = document.getElementById('whatsapp-order-button');
    if (waBtn) {
      waBtn.style.transform = 'scale(1.03)';
      waBtn.style.boxShadow = '0 0 25px rgba(37,211,102,0.7)';
    }
  });
  await capture(page, 18);
  await page.evaluate(() => {
    const waBtn = document.getElementById('whatsapp-order-button');
    if (waBtn) {
      waBtn.style.transform = 'none';
      waBtn.style.boxShadow = '0 4px 20px rgba(37,211,102,0.3)';
    }
  });
  await capture(page, 20);

  // 9. SMOOTH SCROLL BACK TO TOP OF MATS SECTION
  console.log('⬆️ Smoothly scrolling back to top of Mats Studio...');
  await smoothScroll(page, '.scroll-page', 0, 22, 10);
  await capture(page, 22);

  await browser.close();

  console.log(`✅ Captured ${frameCount} frames in total!`);
  console.log('🎥 Encoding high-definition MP4 video with FFmpeg...');

  // 10. ENCODE HIGH QUALITY MP4
  const { execFileSync } = require('child_process');

  execFileSync(FFMPEG_BIN, [
    '-y',
    '-framerate', '18',
    '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', 'medium',
    '-crf', '19',
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    OUTPUT_MP4
  ], { stdio: 'inherit' });
  console.log(`📁 Video created: ${OUTPUT_MP4}`);

  // Copy to Artifact MP4
  fs.copyFileSync(OUTPUT_MP4, ARTIFACT_MP4);
  console.log(`📁 Copied to Artifact: ${ARTIFACT_MP4}`);

  // 11. ENCODE LIGHTWEIGHT WEBP FOR ARTIFACT PREVIEW
  console.log('🖼️ Generating companion WebP animation preview...');
  try {
    execFileSync(FFMPEG_BIN, [
      '-y',
      '-framerate', '12',
      '-i', path.join(FRAMES_DIR, 'frame_%05d.jpg'),
      '-vf', 'scale=390:-1:flags=lanczos',
      '-c:v', 'libwebp',
      '-lossless', '0',
      '-q:v', '65',
      '-loop', '0',
      ARTIFACT_WEBP
    ], { stdio: 'inherit' });
    console.log(`📁 WebP preview created: ${ARTIFACT_WEBP}`);
  } catch (err) {
    console.log('WebP generation note:', err.message);
  }

  // Cleanup temporary frames
  if (fs.existsSync(FRAMES_DIR)) {
    fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  }

  console.log('🎉 Done! Mats section video walkthrough is ready.');
})();
