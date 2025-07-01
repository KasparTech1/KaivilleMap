// Debug script to diagnose road visibility issues
// Run this in the browser console when the road is not visible

(function debugRoad() {
  console.log('=== ROAD DEBUG ANALYSIS ===');
  
  // Check for buildings grid
  const grids = document.querySelectorAll('.buildings-grid');
  console.log('Buildings grids found:', grids.length);
  
  grids.forEach((grid, index) => {
    const rect = grid.getBoundingClientRect();
    const isDesktop = window.getComputedStyle(grid.parentElement).display !== 'none';
    console.log(`Grid ${index} (${isDesktop ? 'Desktop' : 'Mobile'}):`, {
      width: rect.width,
      height: rect.height,
      display: window.getComputedStyle(grid).display,
      position: window.getComputedStyle(grid).position,
      visible: rect.width > 0 && rect.height > 0
    });
  });
  
  // Check for road SVG
  const roadSvgs = document.querySelectorAll('svg.absolute.inset-0.pointer-events-none.z-0');
  console.log('Road SVGs found:', roadSvgs.length);
  
  roadSvgs.forEach((svg, index) => {
    const rect = svg.getBoundingClientRect();
    const viewBox = svg.getAttribute('viewBox');
    const paths = svg.querySelectorAll('path');
    console.log(`Road SVG ${index}:`, {
      width: rect.width,
      height: rect.height,
      viewBox: viewBox,
      numberOfPaths: paths.length,
      display: window.getComputedStyle(svg).display,
      visibility: window.getComputedStyle(svg).visibility,
      opacity: window.getComputedStyle(svg).opacity,
      parent: svg.parentElement?.className
    });
    
    // Check main path
    paths.forEach((path, pathIndex) => {
      const d = path.getAttribute('d');
      if (d && d.length > 0) {
        console.log(`  Path ${pathIndex}: ${d.substring(0, 50)}...`);
      }
    });
  });
  
  // Check z-index layering
  const buildings = document.querySelectorAll('[data-building-id]');
  console.log('\nZ-index analysis:');
  console.log('Buildings with z-20:', buildings.length);
  
  // Check window width
  console.log('\nWindow dimensions:', {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768
  });
  
  // Check for any CSS rules that might hide the road
  const styles = window.getComputedStyle(document.querySelector('.buildings-grid') || document.body);
  console.log('\nGrid container styles:', {
    overflow: styles.overflow,
    position: styles.position,
    minHeight: styles.minHeight
  });
})();