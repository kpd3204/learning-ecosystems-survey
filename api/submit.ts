import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { formId, answers } = req.body;

    if (!formId || !answers) {
        return res.status(400).json({ error: 'Missing formId or answers' });
    }

    try {
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
                value.forEach(v => formData.append(key, v));
            } else {
                formData.append(key, value as string);
            }
        });

        formData.append('fbzx', fbzx);
        formData.append('pageHistory', '0');

        // 3. Submit to Google Forms
        await axios.post(responseUrl, formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        return res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Submission error:', error.message);
        return res.status(500).json({
            error: 'Failed to submit to Google Forms',
            details: error.message
        });
    }
}
