interface VercelReq {
  method?: string;
  body?: Record<string, unknown> | string;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
  end: () => void;
  setHeader: (name: string, value: string) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: VercelReq, res: VercelRes) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  let parsedBody: Record<string, unknown> = {};
  if (typeof req.body === 'string') {
    try {
      parsedBody = JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
      return;
    }
  } else if (req.body && typeof req.body === 'object') {
    parsedBody = req.body;
  }

  const { name, email, company, service, message } = parsedBody;
  const errors: Record<string, string> = {};

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (typeof service !== 'string' || service.trim().length < 2) {
    errors.service = 'Please select the service you need.';
  }
  if (typeof message !== 'string' || message.trim().length < 10) {
    errors.message = 'Please describe your project (at least 10 characters).';
  }

  if (Object.keys(errors).length > 0) {
    res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields and try again.',
      errors,
    });
    return;
  }

  const referenceId = `AWG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const submittedAt = new Date().toISOString();

  const record = {
    referenceId,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    company: typeof company === 'string' ? company.trim() : '',
    service: String(service).trim(),
    message: String(message).trim(),
    submittedAt,
  };

  const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {
      // Do not fail inquiry acknowledgement if optional webhook forwarding fails
    }
  }

  res.status(201).json({
    success: true,
    referenceId,
    submittedAt,
    message: 'Inquiry received by AWGZO. Our team will respond within one business day.',
  });
}
