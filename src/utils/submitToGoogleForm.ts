/**
 * Submits form data to Google Forms via a proxy to bypass CORS/Token issues.
 * In Development: Uses Vite proxy to /google-form
 * In Production: Uses Vercel Serverless Function to /api/submit
 */
export async function submitToGoogleForm(formId: string, answers: Record<string, string | string[]>) {
  try {
    // Check if we are running in a production environment (like Vercel)
    const isProd = import.meta.env.PROD;

    if (isProd) {
      // Production: Use Netlify Serverless Function
      const response = await fetch('/.netlify/functions/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formId, answers }),
      });

      if (!response.ok) {
        throw new Error('Serverless submission failed');
      }
      return true;
    } else {
      // Development: Use Vite Proxy to /google-form (defined in vite.config.ts)
      const formUrl = `/google-form/d/e/${formId}/viewform`;
      const responseUrl = `/google-form/d/e/${formId}/formResponse`;

      const getRes = await fetch(formUrl);
      const html = await getRes.text();
      const fbzxMatch = html.match(/name="fbzx" value="([^"]+)"/);
      const fbzx = fbzxMatch ? fbzxMatch[1] : '';

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

      const submitRes = await fetch(responseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      return submitRes.ok;
    }
  } catch (error) {
    console.error('Submission error:', error);
    return false;
  }
}
