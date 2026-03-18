import puppeteer from 'puppeteer';

async function quickGsapCheck() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Collect all console messages
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  
  console.log('Loading page...');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2' });
  
  console.log('\nChecking GSAP and component state after load:');
  const check = await page.evaluate(() => {
    return {
      gsapInWindow: typeof window.gsap !== 'undefined',
      gsapVersion: typeof window.gsap !== 'undefined' ? window.gsap.version : null,
      reactMounted: document.querySelector('[data-reactroot]') !== null,
      overlayInDOM: document.querySelectorAll('div[style*="position: fixed"]').length,
      allScripts: Array.from(document.querySelectorAll('script')).map(s => ({
        src: s.src,
        type: s.type,
        hasGsap: s.textContent?.includes('gsap') || s.src?.includes('gsap')
      }))
    };
  });
  
  console.log(JSON.stringify(check, null, 2));
  
  await browser.close();
}

quickGsapCheck().catch(console.error);
