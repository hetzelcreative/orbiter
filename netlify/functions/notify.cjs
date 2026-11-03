/**
 * Netlify Forms outgoing-webhook target: relays every form submission to
 * the business owner by email (Resend) and/or SMS (Twilio).
 *
 * Wire it under Site configuration → Forms → Form notifications →
 * Outgoing webhook, URL: https://<site>/.netlify/functions/notify
 * (the legacy /.netlify/functions/send-sms URL still works too).
 *
 * Each channel is opt-in and turns on when its env vars are present in
 * the Netlify dashboard (see .env.example):
 *
 *   Email (Resend)
 *     RESEND_API_KEY        sending-only key, one per client site
 *     NOTIFY_EMAIL_TO       recipient(s), comma-separated
 *     NOTIFY_EMAIL_FROM     optional; defaults to "<site name> Website <notifications@forms.hetzelcreative.com>"
 *     NOTIFY_SITE_NAME      optional; label in subject line, defaults to the site hostname
 *
 *   SMS (Twilio)
 *     TWILIO_ACCOUNT_SID
 *     TWILIO_AUTH_TOKEN
 *     TWILIO_PHONE_NUMBER       Twilio-owned "from" number, e.g. +15555551234
 *     RECIPIENT_PHONE_NUMBER    where the business wants the alert
 *
 * Why not Netlify's built-in email notification? Netlify only allows
 * recipients who are members of the Netlify team, so client addresses
 * are rejected. This function sends from our own verified Resend domain.
 *
 * To customize per client: add a `formName === 'your-form'` branch in
 * `buildSummary()` to format a specific form nicely. Forms without a
 * branch fall through to the generic field dump, so new forms notify
 * automatically. The form field `name`s are the contract.
 */

const DEFAULT_FROM_ADDRESS = "notifications@forms.hetzelcreative.com";

// Netlify adds these to `data`; they're noise in a notification.
const SKIP_FIELDS = new Set([
  'form-name',
  'form_name',
  'bot-field',
  'ip',
  'user_agent',
  'referrer',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function titleCase(key) {
  return key
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Netlify sends file uploads as { filename, size, type, url }. */
function isFile(value) {
  return value && typeof value === 'object' && typeof value.url === 'string';
}

/**
 * Normalize the Netlify payload into an ordered list of
 * { label, name, value, file? } entries.
 */
function collectFields(payload) {
  const data = payload.data || {};
  const ordered = Array.isArray(payload.ordered_human_fields)
    ? payload.ordered_human_fields
    : null;

  const entries = ordered
    ? ordered.map((f) => ({ name: f.name, label: f.title || titleCase(f.name), raw: data[f.name] ?? f.value }))
    : Object.keys(data).map((name) => ({ name, label: titleCase(name), raw: data[name] }));

  return entries
    .filter(({ name }) => !SKIP_FIELDS.has(name))
    .map(({ name, label, raw }) => {
      if (isFile(raw)) {
        return { name, label, value: raw.filename || 'Attachment', file: raw };
      }
      const value = raw == null ? '' : String(raw).trim();
      return { name, label, value };
    })
    .filter(({ value, file }) => file || value !== '');
}

/** Plain-text summary shared by SMS and the text part of the email. */
function buildSummary(formName, fields) {
  const lines = fields.map(({ label, value, file }) =>
    file ? `${label}: ${value} (${file.url})` : `${label}: ${value}`
  );
  const heading =
    formName === 'contact'
      ? 'New Contact Form Submission'
      : `New Form Submission (${formName})`;
  return `${heading}\n\n${lines.join('\n')}`.trim();
}

function buildHtml({ siteName, formLabel, fields, submittedAt, adminUrl }) {
  const rows = fields
    .map(({ label, value, file }) => {
      const cell = file
        ? `<a href="${escapeHtml(file.url)}">${escapeHtml(value)}</a>` +
          (file.size ? ` <span style="color:#6b7280">(${Math.round(file.size / 1024)} KB)</span>` : '')
        : escapeHtml(value).replace(/\n/g, '<br>');
      return `<tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;color:#6b7280;white-space:nowrap">${escapeHtml(label)}</td>
        <td style="padding:8px 0;vertical-align:top;color:#111827">${cell}</td>
      </tr>`;
    })
    .join('');

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;padding:24px 28px">
    <p style="margin:0 0 4px;color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:.05em">${escapeHtml(siteName)}</p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#111827">New ${escapeHtml(formLabel)} form submission</h1>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="margin:24px 0 0;color:#9ca3af;font-size:12px">
      Received ${escapeHtml(submittedAt)}${adminUrl ? ` · <a href="${escapeHtml(adminUrl)}" style="color:#9ca3af">View in Netlify</a>` : ''}
    </p>
  </div>
</body></html>`;
}

async function sendEmail({ siteName, formName, formLabel, fields, summary, submittedAt, adminUrl }) {
  const to = (process.env.NOTIFY_EMAIL_TO || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const from = process.env.NOTIFY_EMAIL_FROM || `${siteName} Website <${DEFAULT_FROM_ADDRESS}>`;

  const submitter = fields.find((f) => f.name === 'email' && EMAIL_RE.test(f.value));
  const nameParts = ['first-name', 'last-name', 'name']
    .map((k) => fields.find((f) => f.name === k)?.value)
    .filter(Boolean);
  const who = nameParts.join(' ');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: submitter ? submitter.value : undefined,
      subject: `[${siteName}] New ${formLabel} submission${who ? ` from ${who}` : ''}`,
      text: summary,
      html: buildHtml({ siteName, formLabel, fields, submittedAt, adminUrl }),
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body}`);
  }
  const json = await res.json();
  return { id: json.id, to };
}

async function sendSms(summary) {
  const twilio = require('twilio');
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const result = await client.messages.create({
    body: summary,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.RECIPIENT_PHONE_NUMBER,
  });
  return { sid: result.sid };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const formName =
    payload.form_name ||
    payload.data?.['form-name'] ||
    payload.data?.form_name ||
    'unknown';

  const siteHost = (() => { try { return new URL(payload.site_url).hostname; } catch { return null; } })();
  const siteName = process.env.NOTIFY_SITE_NAME || siteHost || process.env.SITE_NAME || "Website";
  const formLabel = titleCase(formName).toLowerCase();
  const submittedAt = payload.created_at
    ? new Date(payload.created_at).toLocaleString('en-US', { timeZone: process.env.NOTIFY_TIMEZONE || 'America/Chicago' })
    : new Date().toLocaleString('en-US', { timeZone: process.env.NOTIFY_TIMEZONE || 'America/Chicago' });
  // Netlify does not expose a stable deep link to a submission; left undefined.
  const adminUrl = undefined;

  const fields = collectFields(payload);
  const summary = buildSummary(formName, fields);

  const emailEnabled = Boolean(process.env.RESEND_API_KEY && process.env.NOTIFY_EMAIL_TO);
  const smsEnabled = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER &&
      process.env.RECIPIENT_PHONE_NUMBER
  );

  if (!emailEnabled && !smsEnabled) {
    console.warn('notify: no channels configured (set RESEND_API_KEY + NOTIFY_EMAIL_TO and/or the Twilio vars)');
    return { statusCode: 200, body: JSON.stringify({ sent: [], skipped: 'no channels configured' }) };
  }

  const results = { sent: [], errors: [] };

  if (emailEnabled) {
    try {
      const r = await sendEmail({ siteName, formName, formLabel, fields, summary, submittedAt, adminUrl });
      results.sent.push({ channel: 'email', ...r });
    } catch (error) {
      console.error('notify email error:', error.message);
      results.errors.push({ channel: 'email', message: error.message });
    }
  }

  if (smsEnabled) {
    try {
      const r = await sendSms(summary);
      results.sent.push({ channel: 'sms', ...r });
    } catch (error) {
      console.error('notify sms error:', error.message, error.code);
      results.errors.push({ channel: 'sms', message: error.message });
    }
  }

  const allFailed = results.sent.length === 0 && results.errors.length > 0;
  return {
    statusCode: allFailed ? 500 : 200,
    body: JSON.stringify(results),
  };
};
