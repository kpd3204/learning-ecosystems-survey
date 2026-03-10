/**
 * This script opens the React app at localhost:5173,
 * intercepts ALL outgoing network requests,
 * and records what actually gets sent when we submit the form.
 * This verifies the exact payload sent from the browser.
 */
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
    });
    const page = await browser.newPage();

    let allRequests = [];
    let googleFormRequests = [];

    await page.setRequestInterception(true);

    page.on('request', request => {
        const url = request.url();
        const method = request.method();
        const postData = request.postData();

        const entry = { url, method, postData: postData || null, headers: request.headers() };
        allRequests.push(entry);

        if (url.includes('formResponse') || url.includes('google.com/forms')) {
            googleFormRequests.push(entry);
            console.log(`\n>>> GOOGLE FORMS REQUEST: ${method} ${url}`);
            if (postData) {
                console.log('POST data:', postData.substring(0, 500));
            }
        }
        request.continue();
    });

    console.log("Loading React app...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Click Start Survey
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.textContent.includes('Start')) { btn.click(); return; }
        }
    });
    await new Promise(r => setTimeout(r, 1000));

    // Answer Age Group (first MCQ option)
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.textContent.trim() === 'A') { btn.click(); return; }
        }
        // Fallback: click any motion.button
        const options = document.querySelectorAll('[class*="rounded-2xl"]');
        if (options[0]) options[0].click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click through remaining questions - just click Next 20 times
    for (let i = 0; i < 20; i++) {
        await page.evaluate(() => {
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const t = btn.textContent.trim();
                if (t.includes('Next') || t.includes('Submit')) {
                    btn.click();
                    return;
                }
            }
        });
        await new Promise(r => setTimeout(r, 800));
    }

    await new Promise(r => setTimeout(r, 3000));

    fs.writeFileSync('/tmp/browser_requests.json', JSON.stringify({
        googleFormRequests,
        totalRequests: allRequests.length
    }, null, 2));

    console.log(`\nTotal requests: ${allRequests.length}`);
    console.log(`Google Form requests: ${googleFormRequests.length}`);
    console.log('Saved to /tmp/browser_requests.json');

    await browser.close();
})();
