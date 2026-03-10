const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const url = `https://docs.google.com/forms/d/e/1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A/viewform?usp=pp_url&entry.32751407=15-18&entry.697045142=Ahmedabad&entry.1923221380=School+Student`;

    await page.setRequestInterception(true);

    let allPosts = "";
    page.on('request', request => {
        if (request.method() === 'POST' && request.url().includes('formResponse')) {
            allPosts += "\n\n=== POST TO: " + request.url() + " ===\n";
            allPosts += decodeURIComponent(request.postData()) || "";
        }
        request.continue();
    });

    console.log("Loading page 1...");
    await page.goto(url, { waitUntil: 'networkidle2' });

    console.log("Clicking Next...");
    let buttons = await page.$$('div[role="button"]');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes("Next")) { await btn.click(); break; }
    }

    await new Promise(r => setTimeout(r, 4000));
    console.log("On page 2. Filling out everything blindly...");

    await page.evaluate(() => {
        // Find all questions (role="listitem")
        const qs = document.querySelectorAll('div[role="listitem"]');
        qs.forEach(q => {
            // Click first radio if exists
            const radio = q.querySelector('div[role="radio"]');
            if (radio) { radio.click(); return; }
            // Click first checkbox if exists
            const cb = q.querySelector('div[role="checkbox"]');
            if (cb) { cb.click(); return; }
            // Fill input if exists
            const input = q.querySelector('input[type="text"]');
            if (input) {
                input.value = "test";
                input.dispatchEvent(new Event('input', { bubbles: true }));
                return;
            }
            const ta = q.querySelector('textarea');
            if (ta) {
                ta.value = "test";
                ta.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    });

    await new Promise(r => setTimeout(r, 1000));

    console.log("Clicking Submit...");
    buttons = await page.$$('div[role="button"]');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes("Submit") || text.includes("Next")) {
            await btn.click();
            break;
        }
    }

    await new Promise(r => setTimeout(r, 6000));

    fs.writeFileSync('/tmp/final_posts_dec.txt', allPosts);
    console.log('Saved decoded POSTs to /tmp/final_posts_dec.txt');
    await browser.close();
})();
