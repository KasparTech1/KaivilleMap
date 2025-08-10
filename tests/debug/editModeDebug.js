// Debug script to test the edit mode issue
const puppeteer = require('puppeteer');

async function debugEditMode() {
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true 
  });
  const page = await browser.newPage();
  
  // Enable console logging
  page.on('console', msg => console.log('Browser console:', msg.text()));
  page.on('pageerror', error => console.error('Browser error:', error));
  
  try {
    // Navigate to a research article detail page
    // You'll need to replace this with an actual article URL
    await page.goto('http://localhost:5173/research/your-article-slug');
    
    // Wait for the page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Log the current page state
    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log('Page loaded with title:', pageTitle);
    
    // Click the Edit button
    console.log('Clicking Edit button...');
    await page.click('button:has-text("Edit")');
    
    // Wait a moment for the edit mode to activate
    await page.waitForTimeout(2000);
    
    // Check if the page is blank
    const bodyContent = await page.$eval('body', el => el.innerHTML);
    if (bodyContent.trim() === '') {
      console.error('ERROR: Page is blank after clicking Edit!');
    } else {
      console.log('Page content exists after edit click');
      
      // Check for error messages
      const errors = await page.$$eval('.text-red-600', elements => 
        elements.map(el => el.textContent)
      );
      if (errors.length > 0) {
        console.error('Errors found on page:', errors);
      }
      
      // Check if MDEditor is present
      const mdEditor = await page.$('.w-md-editor');
      if (mdEditor) {
        console.log('MDEditor is present');
      } else {
        console.error('MDEditor is NOT present');
      }
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Keep browser open for manual inspection
    console.log('Test complete. Browser will remain open for inspection.');
  }
}

// Run the debug script
console.log('Starting edit mode debug...');
debugEditMode();