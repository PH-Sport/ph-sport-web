import puppeteer from 'puppeteer';

async function captureAnimationPrecisely() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🚀 Precise Animation Capture Test\n');
  
  // First, inject a mutation observer BEFORE navigation
  await page.evaluateOnNewDocument(() => {
    window.__animationLog = [];
    window.__observerStarted = false;
    
    // Log function
    window.__log = (msg) => {
      window.__animationLog.push({
        time: Date.now(),
        message: msg
      });
    };
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        window.__log('DOMContentLoaded fired');
        startObserver();
      });
    } else {
      startObserver();
    }
    
    function startObserver() {
      if (window.__observerStarted) return;
      window.__observerStarted = true;
      
      window.__log('Observer starting');
      
      // Check immediately
      checkForOverlay('immediate check');
      
      // Set up mutation observer
      const observer = new MutationObserver((mutations) => {
        checkForOverlay('mutation detected');
      });
      
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
      });
      
      // Also check periodically
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        checkForOverlay(`periodic check ${checkCount}`);
        if (checkCount > 50) clearInterval(interval); // Stop after 5 seconds
      }, 100);
    }
    
    function checkForOverlay(source) {
      // Check for overlay by multiple methods
      const byStyle = document.querySelector('[style*="z-index: 9999"]') || 
                      document.querySelector('[style*="z-index:9999"]');
      const byFixed = document.querySelector('[style*="position: fixed"]');
      const allDivs = document.querySelectorAll('div');
      
      let foundOverlay = null;
      allDivs.forEach(div => {
        const style = window.getComputedStyle(div);
        if (style.position === 'fixed' && style.zIndex === '9999') {
          foundOverlay = div;
        }
      });
      
      if (foundOverlay || byStyle) {
        const overlay = foundOverlay || byStyle;
        const computed = window.getComputedStyle(overlay);
        window.__log(`OVERLAY FOUND (${source}): display=${computed.display}, opacity=${computed.opacity}, visible=${computed.visibility}`);
      }
    }
  });
  
  console.log('Navigating to page...');
  const startTime = Date.now();
  await page.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
  console.log(`Page loaded in ${Date.now() - startTime}ms\n`);
  
  // Wait for animation to complete
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Get the log
  const log = await page.evaluate(() => window.__animationLog);
  
  console.log('=== ANIMATION LOG ===');
  if (log && log.length > 0) {
    const firstTime = log[0].time;
    log.forEach(entry => {
      const relativeTime = entry.time - firstTime;
      console.log(`[+${relativeTime}ms] ${entry.message}`);
    });
  } else {
    console.log('❌ No log entries captured');
  }
  
  // Final state check
  const finalState = await page.evaluate(() => {
    return {
      sessionStorage: sessionStorage.getItem('ph-logo-revealed'),
      overlayExists: !!document.querySelector('[style*="z-index: 9999"]') ||
                     !!document.querySelector('[style*="z-index:9999"]'),
      gsapInWindow: typeof window.gsap !== 'undefined',
      allFixedElements: Array.from(document.querySelectorAll('*')).filter(el => {
        return window.getComputedStyle(el).position === 'fixed';
      }).length
    };
  });
  
  console.log('\n=== FINAL STATE ===');
  console.log(JSON.stringify(finalState, null, 2));
  
  await browser.close();
}

captureAnimationPrecisely().catch(console.error);
