const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: false }); // Headless: false to see if it helps with anti-bot
    const page = await browser.newPage();

    const requests = [];
    page.on('request', request => requests.push(request.url()));

    try {
        console.log('Navigating...');
        await page.goto('https://www.farfetch.com/shopping/men/items.aspx', { waitUntil: 'networkidle', timeout: 60000 });

        console.log('Scrolling...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(5000);

        console.log('Extracting data...');
        const data = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script')).map(s => ({
                id: s.id,
                type: s.type,
                content: s.innerHTML.substring(0, 500) // Truncate for sanity
            }));

            const windowKeys = Object.keys(window);

            // Check for common data stores
            const nextData = window.__NEXT_DATA__;
            const initialState = window.__INITIAL_STATE__;
            const universalVar = window.universal_variable;

            return {
                scripts,
                windowKeys,
                nextData,
                initialState,
                universalVar
            };
        });

        const output = {
            requests: requests.filter(u => u.includes('api') || u.includes('json') || u.includes('products')),
            pageData: data
        };

        fs.writeFileSync('farfetch-debug.json', JSON.stringify(output, null, 2));
        console.log('Done. Saved to farfetch-debug.json');

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await browser.close();
    }
})();
