import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_FILE_BYTES = 5 * 1024 * 1024;

function field(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function validate(form: FormData): { ok: true } | { ok: false; error: string } {
  if (field(form, 'company')) return { ok: false, error: 'Invalid submission.' };

  const name = field(form, 'name');
  const email = field(form, 'email');
  const location = field(form, 'location');

  if (name.length < 2 || name.length > 120) {
    return { ok: false, error: 'Invalid name.' };
  }
  if (!email.includes('@')) return { ok: false, error: 'Invalid email.' };
  if (!location) return { ok: false, error: 'Location is required.' };
  if (!field(form, 'painting_type')) return { ok: false, error: 'Painting type is required.' };
  if (!field(form, 'size_preference')) {
    return { ok: false, error: 'Size preference is required.' };
  }
  if (!field(form, 'budget_range')) return { ok: false, error: 'Budget is required.' };

  const file = form.get('reference_image');
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: 'Reference image exceeds 5 MB.' };
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return { ok: false, error: 'Unsupported reference image type.' };
    }
  }

  return { ok: true };
}

function buildEmailBody(form: FormData, meta: { ua: string; at: string }) {
  const file = form.get('reference_image');
  const fileLine =
    file instanceof File && file.size > 0
      ? `Reference file: ${file.name} (${file.type}, ${file.size} bytes)`
      : 'Reference file: none';

  return [
    `Benjo Manigo commission inquiry`,
    `Timestamp (UTC): ${meta.at}`,
    `User-Agent: ${meta.ua}`,
    '',
    `Name: ${field(form, 'name')}`,
    `Email: ${field(form, 'email')}`,
    `Phone: ${field(form, 'phone') || '—'}`,
    `Location: ${field(form, 'location')}`,
    `Painting type: ${field(form, 'painting_type')}`,
    `Size: ${field(form, 'size_preference')}`,
    `Budget: ${field(form, 'budget_range')}`,
    `Deadline: ${field(form, 'deadline') || '—'}`,
    `Notes: ${field(form, 'notes') || '—'}`,
    fileLine,
    `Attribution: ${field(form, 'website_attribution') || 'source=benjo-manigo-website'}`,
  ].join('\n');
}

async function sendEmail(subject: string, body: string, to: string, from: string) {
  const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from, name: 'Benjo Manigo website' },
      subject,
      content: [{ type: 'text/plain', value: body }],
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Mail send failed (${response.status}): ${text.slice(0, 200)}`);
  }
}

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host && !origin.includes(host)) {
    return new Response(JSON.stringify({ ok: false, error: 'Invalid origin.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return new Response(JSON.stringify({ ok: false, error: 'Expected multipart form data.' }), {
      status: 415,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const form = await request.formData();
  const checked = validate(form);
  if (!checked.ok) {
    return new Response(JSON.stringify({ ok: false, error: checked.error }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const to =
    (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env?.INQUIRY_TO_EMAIL ??
    import.meta.env.INQUIRY_TO_EMAIL;
  const from =
    (locals as { runtime?: { env?: Record<string, string> } }).runtime?.env?.INQUIRY_FROM_EMAIL ??
    import.meta.env.INQUIRY_FROM_EMAIL ??
    'noreply@benjo-manigo.example.com';

  const subject = `[Benjo inquiry] ${field(form, 'name')} — ${field(form, 'painting_type')}`;
  const body = buildEmailBody(form, {
    at: new Date().toISOString(),
    ua: (request.headers.get('user-agent') ?? '').slice(0, 240),
  });

  if (to) {
    try {
      await sendEmail(subject, body, to, from);
    } catch (error) {
      console.error(error);
      return new Response(JSON.stringify({ ok: false, error: 'Email delivery failed.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else if (import.meta.env.DEV) {
    console.log('INQUIRY (dev, no INQUIRY_TO_EMAIL):\n', body);
  } else {
    return new Response(JSON.stringify({ ok: false, error: 'Inquiry email not configured.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
};
