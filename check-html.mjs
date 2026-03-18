import puppeteer from 'puppeteer';

async function checkHTML() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle2' });
  
  const html = await page.content();
  
  console.log('=== SEARCHING FOR REACT/LOGO REVEAL MARKERS ===\n');
  
  // Check for React markers
  console.log('React markers:');
  console.log('  data-reactroot:', html.includes('data-reactroot'));
  console.log('  data-react:', html.includes('data-react'));
  console.log('  LogoReveal:', html.includes('LogoReveal'));
  console.log('  astro-island:', html.includes('astro-island'));
  
  // Extract astro-island tags
  const islandMatches = html.match(/<astro-island[^>]*>/g);
  if (islandMatches) {
    console.log('\n=== ASTRO ISLANDS FOUND ===');
    islandMatches.forEach(match => console.log(match));
  } else {
    console.log('\n❌ NO ASTRO ISLANDS FOUND');
  }
  
  // Check script tags with islands
  const scriptMatches = html.match(/<script type="module"[^>]*astro[^>]*>/g);
  if (scriptMatches) {
    console.log('\n=== ASTRO SCRIPTS ===');
    scriptMatches.forEach(match => console.log(match));
  }
  
  await browser.close();
}

checkHTML().catch(console.error);
