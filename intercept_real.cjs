/**
 * Full human-simulation test to verify what payload the real app sends.
 * This fills each question correctly via React state clicking, then submits.
 */
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        headless: false, // Run visually so we can see what's happening
        args: ['--no-sandbox'],
        defaultViewport: null
    });
    const page = await browser.newPage();

    let googleFormRequests = [];

    await page.setRequestInterception(true);

    page.on('request', request => {
        const url = request.url();
        const method = request.method();
        const postData = request.postData();

        if (url.includes('formResponse')) {
            const decoded = postData ? decodeURIComponent(postData) : '';
            googleFormRequests.push({ url, method, decoded });
            console.log(`\n>>> FORM REQUEST: ${method} ${url}`);
            console.log('Decoded body:\n', decoded);
        }
        request.continue();
    });

    console.log("Loading React app...");
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

    // Step 1: Click Start Survey
    await page.click('button');
    await new Promise(r => setTimeout(r, 1000));
    console.log("Clicked start");

    // Step 2: Select Age Group "15-18" (should be in the MCQ list since it has 6 options)
    // The role MCQ list shows options as buttons with text
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent && btn.textContent.includes('15-18')) {
                btn.click();
                return;
            }
        }
    });
    await new Promise(r => setTimeout(r, 2000)); // Wait for auto-advance
    console.log("Selected age");

    // Step 3: City field (text input)
    await page.evaluate(() => {
        const ta = document.querySelector('textarea');
        if (ta) {
            ta.focus();
            // Simulate typing
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
            nativeInputValueSetter.call(ta, 'Ahmedabad');
            ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    await new Promise(r => setTimeout(r, 500));
    // Click the arrow button inside the input
    await page.evaluate(() => {
        const btns = document.querySelectorAll('button');
        for (const btn of btns) {
            if (btn.querySelector('svg')) {
                btn.click(); // The arrow inside ConversationalInput
                return;
            }
        }
    });
    await new Promise(r => setTimeout(r, 1500));
    console.log("Filled city");

    // Step 4: Select Role "School Student"
    await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        for (const btn of buttons) {
            if (btn.textContent && btn.textContent.includes('School Student')) {
                btn.click();
                return;
            }
        }
    });
    await new Promise(r => setTimeout(r, 2000));
    console.log("Selected role");

    // Now in School Student branch - answer 13 questions then submit
    // For each question, try to click the first available option or next button
    for (let q = 0; q < 15; q++) {
        // Try to click first list button option
        const clicked = await page.evaluate(() => {
            // Try clicking first option button (not Back/Next)
            const btns = document.querySelectorAll('button');
            for (const btn of btns) {
                const t = btn.textContent.trim();
                if (t && t !== '← Back' && !t.includes('Next') && !t.includes('Submit') && !t.startsWith('Cmd')) {
                    btn.click();
                    return true;
                }
            }
            return false;
        });

        await new Promise(r => setTimeout(r, 300));

        if (!clicked) {
            // Fill textarea
            await page.evaluate(() => {
                const ta = document.querySelector('textarea');
                if (ta) {
                    const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
                    setter.call(ta, 'Test response');
                    ta.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            await new Promise(r => setTimeout(r, 200));
        }

        // Now click Next or Submit
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
        await new Promise(r => setTimeout(r, 1500));
        console.log(`Answered question ${q + 1}`);
    }

    await new Promise(r => setTimeout(r, 3000));

    fs.writeFileSync('/tmp/real_app_requests.json', JSON.stringify(googleFormRequests, null, 2));
    console.log(`\nTotal Google Form requests: ${googleFormRequests.length}`);
    console.log('Saved to /tmp/real_app_requests.json');

    // Keep browser open for inspection
    await new Promise(r => setTimeout(r, 5000));
    await browser.close();
})();
