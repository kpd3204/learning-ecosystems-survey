const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();

    const url = `https://docs.google.com/forms/d/e/1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A/viewform?usp=pp_url&entry.32751407=15-18&entry.697045142=Ahmedabad&entry.1923221380=School+Student`;

    await page.setRequestInterception(true);

    let allPosts = "";

    page.on('request', request => {
        if (request.method() === 'POST') {
            allPosts += "\n\n=== POST TO: " + request.url() + " ===\n";
            allPosts += request.postData() || "";
        }
        request.continue();
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    const buttons = await page.$$('div[role="button"]');
    for (const btn of buttons) {
        const text = await page.evaluate(el => el.innerText, btn);
        if (text.includes("Next") || text.includes("Submit")) {
            await btn.click();
            break;
        }
    }

    await new Promise(r => setTimeout(r, 4000));
    fs.writeFileSync('/tmp/all_posts.txt', allPosts);
    console.log('Saved all POSTs to /tmp/all_posts.txt');
    await browser.close();
})();
