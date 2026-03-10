const formId = "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A";
const responseUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

const formData = new URLSearchParams();

// Common
formData.append('entry.32751407', '15-18');
formData.append('entry.697045142', 'Ahmedabad');
formData.append('entry.1923221380', 'School Student');

// Branch: School Student
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
formData.append('fbzx', '-3572836267866504245');

fetch(responseUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
}).then(async res => {
    console.log("Status:", res.status);
    const text = await res.text();
    if (res.status === 400) {
        const errors = [...text.matchAll(/class="[^"]*error[^"]*"[^>]*>([^<]+)/gi)];
        if (errors.length > 0) {
            errors.forEach(e => console.log("- ", e[1].trim()));
        } else {
            console.log("No specific error class found. First 500 chars:");
            console.log(text.substring(0, 500));
        }
    }
}).catch(console.error);
