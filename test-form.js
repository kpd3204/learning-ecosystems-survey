const formId = "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A";
const responseUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

// Submit with ONLY age group, missing the rest
const formData = new URLSearchParams();
formData.append('entry.32751407', '15-18');
formData.append('pageHistory', '0');

async function run() {
    try {
        const res = await fetch(responseUrl, {
            method: 'POST',
            body: formData,
        });
        console.log("Status:", res.status);
    } catch (err) {
        console.log("Error:", err.message);
    }
}

run();
