import puppeteer from 'puppeteer';

async function checkNetworkAndHydration() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = [];
  const responses = [];
  const failedRequests = [];
  
  page.on('request', req => {
    if (req.url().includes('LogoReveal') || req.url().includes('react') || req.url().includes('gsap')) {
      requests.push({
        url: req.url(),
        method: req.method()
      });
    }
  });
  
  page.on('response', resp => {
    const url = resp.url();
    if (url.includes('LogoReveal') || url.includes('react') || url.includes('gsap')) {
      responses.push({
        url,
        status: resp.status(),
        statusText: resp.statusText()
      });
    }
  });
  
  page.on('requestfailed', req => {
    if (req.url().includes('LogoReveal') || req.url().includes('react') || req.url().includes('gsap')) {
      failedRequests.push({
        url: req.url(),
        failure: req.failure()
      });
    }
  });
  
  // Collect console messages
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('error') || text.includes('Error') || text.includes('failed') || text.includes('Failed')) {
      console.log(`[CONSOLE ${msg.type()}]:`, text);
    }
  });
  
  console.log('Loading page and monitoring network...\n');
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2' });
  
  // Wait a bit more
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('=== RELEVANT REQUESTS ===');
  console.log(JSON.stringify(requests, null, 2));
  
  console.log('\n=== RELEVANT RESPONSES ===');
  console.log(JSON.stringify(responses, null, 2));
  
  if (failedRequests.length > 0) {
    console.log('\n=== FAILED REQUESTS ===');
    console.log(JSON.stringify(failedRequests, null, 2));
  }
  
  // Check if the component actually loaded
  const componentCheck = await page.evaluate(() => {
    const island = document.querySelector('astro-island[component-url*="LogoReveal"]');
    return {
      islandExists: !!island,
      islandHTML: island ? island.outerHTML.substring(0, 300) : null,
      islandChildren: island ? island.innerHTML.substring(0, 300) : null,
      customElementDefined: !!customElements.get('astro-island')
    };
  });
  
  console.log('\n=== COMPONENT CHECK ===');
  console.log(JSON.stringify(componentCheck, null, 2));
  
  await browser.close();
}

checkNetworkAndHydration().catch(console.error);
