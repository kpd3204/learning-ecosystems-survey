import axios from 'axios';

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body = await req.json();
        const { formId, answers, pageHistory = '0' } = body;

        if (!formId || !answers) {
            return new Response(JSON.stringify({ error: 'Missing formId or answers' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const formUrl = `https://docs.google.com/forms/d/e/${formId}/viewform`;
        const responseUrl = `https://docs.google.com/forms/d/e/${formId}/formResponse`;

        // 1. Fetch the form page to get a real fbzx token
        const getRes = await axios.get(formUrl);
        const html = getRes.data;
        const fbzxMatch = html.match(/name="fbzx" value="([^"]+)"/);
        const fbzx = fbzxMatch ? fbzxMatch[1] : '';

        // 2. Prepare the form data for submission
        const formData = new URLSearchParams();
        Object.entries(answers).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(key, String(v)));
            } else {
                formData.append(key, String(value));
            }
        });

        formData.append('fbzx', fbzx);
        formData.append('pageHistory', pageHistory);

        // 3. Submit to Google Forms
        await axios.post(responseUrl, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Submission error:', error.message);
        return new Response(JSON.stringify({
            error: 'Failed to submit to Google Forms',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};
