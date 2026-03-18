// LogoReveal Animation Test Script
// Copy and paste this into the browser console at http://localhost:4321/

console.log('=== LogoReveal Animation Test ===\n');

// 1. Check sessionStorage
const sessionKey = 'ph-logo-revealed';
const hasBeenRevealed = sessionStorage.getItem(sessionKey);
console.log('1. SessionStorage check:');
console.log(`   Key: ${sessionKey}`);
console.log(`   Value: ${hasBeenRevealed}`);
console.log(`   Status: ${hasBeenRevealed ? '⚠️  Animation will be skipped (already revealed)' : '✅ Animation should play'}\n`);

// 2. Check if overlay exists
const overlay = document.querySelector('[style*="position: fixed"][style*="z-index: 9999"]');
console.log('2. Overlay element:');
console.log(`   Found: ${overlay ? '✅ Yes' : '❌ No'}`);
if (overlay) {
  const styles = window.getComputedStyle(overlay);
  console.log(`   Display: ${styles.display}`);
  console.log(`   Position: ${styles.position}`);
  console.log(`   Z-index: ${styles.zIndex}`);
  console.log(`   Background: ${styles.backgroundColor}`);
  console.log(`   Visibility: ${styles.visibility}`);
  console.log(`   Opacity: ${styles.opacity}\n`);
} else {
  console.log('   ❌ Overlay not found in DOM\n');
}

// 3. Check SVG elements
const svgPolygons = document.querySelectorAll('svg polygon');
console.log('3. SVG polygon elements:');
console.log(`   Found: ${svgPolygons.length} polygons`);
if (svgPolygons.length >= 2) {
  svgPolygons.forEach((poly, i) => {
    const styles = window.getComputedStyle(poly);
    console.log(`   Polygon ${i + 1}:`);
    console.log(`     Stroke-dasharray: ${styles.strokeDasharray}`);
    console.log(`     Stroke-dashoffset: ${styles.strokeDashoffset}`);
  });
  console.log('');
}

// 4. Check for GSAP
console.log('4. GSAP library:');
console.log(`   Loaded: ${typeof gsap !== 'undefined' ? '✅ Yes' : '❌ No'}`);
if (typeof gsap !== 'undefined') {
  console.log(`   Version: ${gsap.version}\n`);
} else {
  console.log('   ❌ GSAP is not loaded\n');
}

// 5. Check console errors
console.log('5. Console errors:');
console.log('   Check the Console tab for any errors (red text)\n');

// 6. Provide reset instructions
console.log('=== RESET INSTRUCTIONS ===');
console.log('To test the animation again:');
console.log('1. Run: sessionStorage.removeItem("ph-logo-revealed")');
console.log('2. Run: location.reload()');
console.log('3. The animation should play\n');

// 7. Quick reset function
window.resetLogoReveal = function() {
  console.log('🔄 Resetting LogoReveal...');
  sessionStorage.removeItem('ph-logo-revealed');
  location.reload();
};

console.log('=== QUICK RESET ===');
console.log('Run: resetLogoReveal()');
console.log('This will clear sessionStorage and reload the page\n');
