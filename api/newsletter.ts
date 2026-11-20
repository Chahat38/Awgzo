interface VercelReq {
  method?: string;
  body?: Record<string, unknown> | string;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
  end: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function handler(req: VercelReq, res: VercelRes) {
  if (req.method === 'OPTIONS') {
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

  const email = parsedBody.email;
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
    return;
  }

  res.status(201).json({
    success: true,
    message: 'Subscribed to AWGZO updates.',
  });
}
