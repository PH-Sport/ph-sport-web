import puppeteer from 'puppeteer';

async function testLogoReveal() {
  console.log('🚀 Starting LogoReveal Animation Test...\n');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    consoleMessages.push({ type, text });
    if (type === 'error') {
      console.log(`❌ Console Error: ${text}`);
    }
  });
  
  // Step 1: Navigate to the page
  console.log('Step 1: Navigating to http://localhost:4321/');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2' });
  
  // Step 2: Wait 2 seconds
  console.log('Step 2: Waiting 2 seconds...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 3: Check sessionStorage
  console.log('Step 3: Checking sessionStorage...');
  const sessionValue = await page.evaluate(() => {
    return sessionStorage.getItem('ph-logo-revealed');
  });
  console.log(`   sessionStorage.getItem('ph-logo-revealed') = ${JSON.stringify(sessionValue)}\n`);
  
  // Take snapshot of current state
  const overlayBeforeClear = await page.evaluate(() => {
    const overlay = document.querySelector('[style*="position: fixed"][style*="z-index: 9999"]');
    return overlay ? {
      exists: true,
      display: window.getComputedStyle(overlay).display,
      opacity: window.getComputedStyle(overlay).opacity,
      zIndex: window.getComputedStyle(overlay).zIndex
    } : { exists: false };
  });
  console.log('   Overlay state before clear:', overlayBeforeClear);
  
  // Step 4: Clear sessionStorage
  console.log('Step 4: Clearing sessionStorage...');
  await page.evaluate(() => {
    sessionStorage.removeItem('ph-logo-revealed');
  });
  
  // Step 5: Reload page
  console.log('Step 5: Reloading page...');
  const reloadStartTime = Date.now();
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  
  // Step 6: Immediately capture animation state
  console.log('Step 6: Taking immediate snapshot (during animation)...');
  await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure DOM is ready
  
  const duringAnimation = await page.evaluate(() => {
    const overlay = document.querySelector('[style*="position: fixed"][style*="z-index: 9999"]');
    const polygons = document.querySelectorAll('svg polygon');
    const body = window.getComputedStyle(document.body);
    
    return {
      timestamp: Date.now(),
      overlay: overlay ? {
        exists: true,
        display: window.getComputedStyle(overlay).display,
        opacity: window.getComputedStyle(overlay).opacity,
        visibility: window.getComputedStyle(overlay).visibility,
        zIndex: window.getComputedStyle(overlay).zIndex,
        backgroundColor: window.getComputedStyle(overlay).backgroundColor
      } : { exists: false },
      polygons: polygons.length,
      polygonStyles: Array.from(polygons).map((p, i) => ({
        index: i,
        strokeDasharray: window.getComputedStyle(p).strokeDasharray,
        strokeDashoffset: window.getComputedStyle(p).strokeDashoffset
      })),
      bodyOverflow: body.overflow,
      gsapLoaded: typeof window.gsap !== 'undefined'
    };
  });
  
  console.log('\n📸 During Animation Snapshot:');
  console.log(JSON.stringify(duringAnimation, null, 2));
  
  // Step 7: Wait 4 seconds for animation to complete
  console.log('\nStep 7: Waiting 4 seconds for animation to complete...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Step 8: Take final snapshot
  console.log('Step 8: Taking final snapshot (after animation)...');
  const afterAnimation = await page.evaluate(() => {
    const overlay = document.querySelector('[style*="position: fixed"][style*="z-index: 9999"]');
    const polygons = document.querySelectorAll('svg polygon');
    const body = window.getComputedStyle(document.body);
    const sessionValue = sessionStorage.getItem('ph-logo-revealed');
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    return {
      timestamp: Date.now(),
      sessionStorage: sessionValue,
      overlay: overlay ? {
        exists: true,
        display: window.getComputedStyle(overlay).display,
        opacity: window.getComputedStyle(overlay).opacity,
        visibility: window.getComputedStyle(overlay).visibility
      } : { exists: false },
      polygonsExist: polygons.length > 0,
      bodyOverflow: body.overflow,
      heroVisible: hero ? {
        display: window.getComputedStyle(hero).display,
        opacity: window.getComputedStyle(hero).opacity
      } : null,
      heroContentVisible: heroContent ? {
        opacity: window.getComputedStyle(heroContent).opacity
      } : null,
      pageTitle: document.title
    };
  });
  
  console.log('\n📸 After Animation Snapshot:');
  console.log(JSON.stringify(afterAnimation, null, 2));
  
  // Check for console errors
  const errors = consoleMessages.filter(m => m.type === 'error');
  console.log(`\n🔍 Console Errors: ${errors.length} error(s) found`);
  if (errors.length > 0) {
    errors.forEach(err => console.log(`   - ${err.text}`));
  }
  
  // Take a screenshot
  console.log('\n📷 Taking screenshot...');
  await page.screenshot({ path: 'logo-reveal-test.png', fullPage: true });
  console.log('   Screenshot saved to: logo-reveal-test.png');
  
  await browser.close();
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n✓ Step 3 - sessionStorage value: ${JSON.stringify(sessionValue)}`);
  console.log(`✓ Step 6 - Overlay during animation: ${duringAnimation.overlay.exists ? 'EXISTS' : 'NOT FOUND'}`);
  if (duringAnimation.overlay.exists) {
    console.log(`  - Display: ${duringAnimation.overlay.display}`);
    console.log(`  - Opacity: ${duringAnimation.overlay.opacity}`);
    console.log(`  - Background: ${duringAnimation.overlay.backgroundColor}`);
  }
  console.log(`✓ Step 8 - Overlay after animation: ${afterAnimation.overlay.exists ? 'STILL EXISTS' : 'REMOVED (✓ Expected)'}`);
  if (afterAnimation.overlay.exists) {
    console.log(`  - Display: ${afterAnimation.overlay.display}`);
  }
  console.log(`✓ Step 8 - sessionStorage after animation: ${afterAnimation.sessionStorage}`);
  console.log(`✓ Step 8 - Hero content visible: ${afterAnimation.heroContentVisible ? 'opacity=' + afterAnimation.heroContentVisible.opacity : 'NOT FOUND'}`);
  console.log(`✓ Console errors: ${errors.length}`);
  console.log(`✓ GSAP loaded: ${duringAnimation.gsapLoaded ? 'YES' : 'NO'}`);
  
  const animationWorked = 
    sessionValue !== null && // Had sessionStorage set initially
    duringAnimation.overlay.exists && // Overlay appeared during animation
    duringAnimation.overlay.display !== 'none' && // Was visible
    (!afterAnimation.overlay.exists || afterAnimation.overlay.display === 'none') && // Got removed
    afterAnimation.sessionStorage === '1' && // SessionStorage was set
    errors.length === 0; // No errors
  
  console.log('\n' + '='.repeat(60));
  console.log(`RESULT: ${animationWorked ? '✅ ANIMATION WORKING CORRECTLY!' : '❌ ISSUES DETECTED'}`);
  console.log('='.repeat(60) + '\n');
}

testLogoReveal().catch(console.error);
