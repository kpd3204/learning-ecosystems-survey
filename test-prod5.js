const formId = "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A";
const responseUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

const formData = new URLSearchParams();
formData.append('entry.32751407', '15-18');
formData.append('entry.697045142', 'Ahmedabad');
formData.append('entry.1923221380', 'School Student');
formData.append('entry.1425252221', 'Only school');
formData.append('entry.765806255', 'I want to understand how things work');
formData.append('entry.467922558', 'To learn new skills and explore');
formData.append('entry.329413005', 'Moderate');
formData.append('entry.1355986295', 'Daily');
formData.append('entry.2059375593', 'Thinking independently and forming my own opinions');
formData.append('entry.1770901762', 'Yes'); // Helping
formData.append('entry.1328170802', 'Not answered'); // Explore
formData.append('entry.81430863', 'I have my own dedicated laptop/tablet and stable internet'); // Internet
formData.append('entry.1363554638', 'It makes the class noticeably more engaging'); // Tech
formData.append('entry.1113088066', 'I do not use AI tools'); // AI
formData.append('entry.1169093603', 'Attaining financial stability and independence'); // Success
formData.append('entry.2098517042', 'Not answered'); // Dream school

formData.append('pageHistory', '0,1');
// A dummy token with the same format as a real one
formData.append('fbzx', '-1234567890123456789');

async function run() {
    try {
        const res = await fetch(responseUrl, {
            method: 'POST',
            body: formData,
        });
        console.log("Status:", res.status);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

run();
