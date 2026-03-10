const formId = "1FAIpQLScZJda_4ur3o96utnqPhR5GzrW4QfdbVP4TGxd44-0X04i52A";
const responseUrl = `http://localhost:5173/google-form/d/e/${formId}/formResponse`;

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
formData.append('entry.1770901762', 'Yes'); 
formData.append('entry.1328170802', 'Not answered'); 
formData.append('entry.81430863', 'I have my own dedicated laptop/tablet and stable internet'); 
formData.append('entry.1363554638', 'It makes the class noticeably more engaging'); 
formData.append('entry.1113088066', 'I do not use AI tools'); 
formData.append('entry.1169093603', 'Attaining financial stability and independence'); 
formData.append('entry.2098517042', 'Not answered'); 
formData.append('pageHistory', '0,1');
formData.append('fbzx', '-3572836267866504245');

async function run() {
    try {
        const res = await fetch(responseUrl, {
            method: 'POST',
            body: formData,
        });
        console.log("Local Proxy Status:", res.status);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

run();
