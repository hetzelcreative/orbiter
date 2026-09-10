const twilio = require('twilio');

/**
 * Netlify Forms outgoing-webhook target. When configured under
 * Site settings → Forms → Form notifications → Outgoing webhook
 * (URL: https://<site>/.netlify/functions/send-sms), Netlify POSTs
 * every form submission here and we relay the contents to the
 * business owner's phone as an SMS via Twilio.
 *
 * Required environment variables (set in the Netlify dashboard, and
 * mirrored in .env.example for local reference):
 *   TWILIO_ACCOUNT_SID
 *   TWILIO_AUTH_TOKEN
 *   TWILIO_PHONE_NUMBER       the Twilio-owned "from" number, e.g. +15555551234
 *   RECIPIENT_PHONE_NUMBER    where the business wants the alert, e.g. +14025551234
 *
 * To customize per client: add an `if (formName === 'your-form')` branch
 * below to format specific forms nicely. Any form without a branch falls
 * through to the generic key/value dump, so new forms notify automatically.
 */
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const formData = data.data || data;
    const formName =
      data.form_name ||
      formData.form_name ||
      formData['form-name'] ||
      data.payload?.form_name ||
      'Unknown';

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials');
    }
    if (!process.env.TWILIO_PHONE_NUMBER || !process.env.RECIPIENT_PHONE_NUMBER) {
      throw new Error('Missing phone number configuration');
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    let message;

    if (formName === 'contact') {
      const name = [formData['first-name'], formData['last-name']]
        .filter(Boolean)
        .join(' ');
      message = `
New Contact Form Submission:

Name: ${name || 'Not provided'}
Email: ${formData['email'] || 'Not provided'}
Phone: ${formData['phone'] || 'Not provided'}
Service: ${formData['service'] || 'Not specified'}
Preferred contact: ${formData['contact-method'] || 'Not specified'}

Message:
${formData['message'] || 'Not provided'}
      `.trim();
    } else {
      // Generic fallback: dump every submitted field except plumbing.
      const skip = new Set([
        'form-name',
        'form_name',
        'bot-field',
        'ip',
        'user_agent',
        'referrer',
      ]);
      message = `
New Form Submission (${formName}):

${Object.entries(formData)
  .filter(([key]) => !skip.has(key))
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n')}
      `.trim();
    }

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.RECIPIENT_PHONE_NUMBER,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'SMS sent successfully', sid: result.sid }),
    };
  } catch (error) {
    console.error('send-sms error:', {
      message: error.message,
      code: error.code,
    });
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send SMS', details: error.message }),
    };
  }
};
