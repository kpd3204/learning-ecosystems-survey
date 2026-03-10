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

        // 1. Prepare a dummy fbzx token. 
        // Google Forms strictly validates the syntax of this token but not the authenticity for public forms.
        // Fetching this live via axios.get from a Netlify Serverless IP often results in Bot/Captcha blocks.
        const fbzx = '-1234567890123456789';

        // 2. Prepare the form data for submission
        const formData = new URLSearchParams();
        Object.entries(answers).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach(v => formData.append(key, String(v)));
            } else {
                const stringVal = String(value);
                formData.append(key, stringVal && stringVal.trim() !== '' && stringVal !== 'undefined' ? stringVal : 'Not answered');
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
