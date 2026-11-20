interface VercelReq {
  method?: string;
}

interface VercelRes {
  status: (code: number) => VercelRes;
  json: (data: unknown) => void;
}

export default function handler(req: VercelReq, res: VercelRes) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    status: 'ok',
    service: 'awgzo-web',
    runtime: 'vercel',
    timestamp: new Date().toISOString(),
  });
}
