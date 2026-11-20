import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const dataDir = path.resolve(__dirname, 'data');
const inquiriesFile = path.join(dataDir, 'inquiries.json');
const subscribersFile = path.join(dataDir, 'subscribers.json');

function ensureDataFile(filePath: string) {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]', 'utf-8');
    }
  } catch {
    // Fallback if filesystem is read-only; handled gracefully during append
  }
}

function appendRecord(filePath: string, record: Record<string, unknown>) {
  try {
    ensureDataFile(filePath);
    const existingRaw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '[]';
    const existing = JSON.parse(existingRaw);
    const next = Array.isArray(existing) ? [...existing, record] : [record];
    fs.writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf-8');
    return true;
  } catch {
    return false;
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'awgzo-web', timestamp: new Date().toISOString() });
  });

  app.post('/api/contact', (req, res) => {
    const { name, email, company, service, message } = req.body ?? {};

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
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields and try again.',
        errors,
      });
    }

    const referenceId = `AWG-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const submittedAt = new Date().toISOString();

    const record = {
      referenceId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      company: typeof company === 'string' ? company.trim() : '',
      service: service.trim(),
      message: message.trim(),
      submittedAt,
    };

    appendRecord(inquiriesFile, record);

    return res.status(201).json({
      success: true,
      referenceId,
      submittedAt,
      message: 'Inquiry received by AWGZO. Our team will respond within one business day.',
    });
  });

  app.post('/api/newsletter', (req, res) => {
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const normalized = email.trim().toLowerCase();
    appendRecord(subscribersFile, {
      email: normalized,
      subscribedAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Subscribed to AWGZO updates.',
    });
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AWGZO server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
