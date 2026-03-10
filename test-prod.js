const formId = "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A";
const responseUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;
const fetch = globalThis.fetch;

async function testGoogleForm() {
    const formData = new URLSearchParams();
    formData.append('entry.32751407', '15-18');
    formData.append('entry.697045142', 'Ahmedabad');
    formData.append('entry.1923221380', 'School Student');
    // Random answer for string
    formData.append('entry.2098517042', 'Not answered');
    formData.append('pageHistory', '0,1');
    formData.append('fbzx', '-3572836267866504245'); // mock

    console.log("Submitting formData:", formData.toString());
    const res = await fetch(responseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Body snippet:", text.substring(0, 200));
}
testGoogleForm();
