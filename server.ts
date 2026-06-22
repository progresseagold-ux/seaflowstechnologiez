import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON decoder middleware
  app.use(express.json());

  // Server-Side Lazy initialized Gemini Client
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is not defined.');
      }
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return aiClient;
  }

  // --- API SECURITY ROUTES FIRST ---

  // Chat conversation route proxying API keys
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
      const client = getAiClient();

      // Setup structured personality instruction
      const systemInstruction = 
        "You are Seaflows Technologies' AI Engineering & Customer Liaison Assistant.\n\n" +
        "COMPANY MOTTO: \"Excellent Connections, Better Value\"\n" +
        "BUSINESS SCOPE:\n" +
        "1. Solar Energy Solutions (solar panels, hybrid pure sine wave inverters, lithium batteries, accessories, sizing requirements, automated quote diagnostics).\n" +
        "2. CCTV Security Surveillance Systems (Dome and Bullet starlight cameras, NVR/DVR recoders, accessories, live feed camera selections).\n" +
        "3. Financial Installment Spread Plans (3 to 12 months spreadsheet repayment guides, down-payments).\n\n" +
        "GUIDELINES:\n" +
        "- Maintain a highly professional, welcoming, corporate, and technically clear tone.\n" +
        "- Refer to the company motto 'Excellent Connections, Better Value' naturally when appropriate.\n" +
        "- Quote currencies in Nigerian Naira (₦).\n" +
        "- Keep replies relatively concise, perfectly formatted into lists, structure options, tables or bullet points where useful.\n" +
        "- If asked to calculate solar requirements or sizing, provide helpful estimated steps (Total watts / inverter loads) and route them to utilize our custom interactive Calculators menu bar.";

      // Reconstruct content chat log
      const formattedContents = [];
      if (history && Array.isArray(history)) {
        for (const log of history) {
          formattedContents.push({
            role: log.role === 'user' ? 'user' : 'model',
            parts: [{ text: log.text }]
          });
        }
      }
      formattedContents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API server-side exception:", error);
      res.status(500).json({ error: error.message || 'Severe server exception occurred' });
    }
  });

  // Google mock popup screen
  app.get('/auth/mock-google', (req, res) => {
    const email = (req.query.email as string) || 'seaflowstechautomation@gmail.com';
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Google Accounts - Sign In</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #030913;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 16px;
              box-sizing: border-box;
            }
            .card {
              background: #060c18;
              border: 1px solid #1e293b;
              border-radius: 16px;
              width: 100%;
              max-width: 420px;
              padding: 32px;
              text-align: center;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            }
            .google-logo {
              display: inline-flex;
              font-weight: bold;
              font-size: 26px;
              margin-bottom: 24px;
            }
            h1 {
              font-size: 20px;
              font-weight: 700;
              margin: 0 0 8px 0;
              color: #f8fafc;
            }
            p {
              font-size: 13px;
              color: #94a3b8;
              margin: 0 0 24px 0;
              line-height: 1.5;
            }
            .user-badge {
              display: inline-flex;
              align-items: center;
              gap: 12px;
              padding: 10px 18px;
              border: 1px solid #1e293b;
              background-color: #030913;
              border-radius: 9999px;
              margin-bottom: 28px;
              text-align: left;
            }
            .avatar {
              width: 32px;
              height: 32px;
              border-radius: 50%;
              background-color: #FDB813;
              color: #0A2342;
              font-weight: bold;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
            }
            .email-details {
              display: flex;
              flex-direction: column;
            }
            .name {
              font-size: 12px;
              font-weight: 600;
              color: #f8fafc;
            }
            .email {
              font-size: 11px;
              color: #94a3b8;
              word-break: break-all;
            }
            .btn-group {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 12px;
              gap: 12px;
            }
            button {
              font-family: inherit;
              font-size: 13px;
              font-weight: 600;
              padding: 10px 20px;
              border-radius: 8px;
              cursor: pointer;
              transition: all 0.2s;
            }
            .btn-cancel {
              background: transparent;
              border: 1px solid #1e293b;
              color: #94a3b8;
              flex: 1;
            }
            .btn-cancel:hover {
              background-color: #0e1726;
              color: #f8fafc;
            }
            .btn-submit {
              background-color: #FDB813;
              border: none;
              color: #0A2342;
              flex: 1;
            }
            .btn-submit:hover {
              background-color: #fbca4c;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="google-logo">
              <span style="color:#4285F4">G</span>
              <span style="color:#EA4335">o</span>
              <span style="color:#FBBC05">o</span>
              <span style="color:#4285F4">g</span>
              <span style="color:#34A853">l</span>
              <span style="color:#EA4335">e</span>
            </div>
            <h1>Single Sign-On Access</h1>
            <p>Seaflows Technologies requests access to verify your Google identity to continue your secure session.</p>
            
            <div class="user-badge">
              <div class="avatar">${email[0].toUpperCase()}</div>
              <div class="email-details">
                <span class="name">Google User</span>
                <span class="email">${email}</span>
              </div>
            </div>
            
            <div class="btn-group">
              <button class="btn-cancel" onclick="window.close()">Cancel</button>
              <button class="btn-submit" onclick="submitAuth()">Continue</button>
            </div>
          </div>

          <script>
            function submitAuth() {
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS',
                  email: '${email}'
                }, '*');
                window.close();
              } else {
                alert('Connection link expired. Please start again from the sign-in page.');
              }
            }
          </script>
        </body>
      </html>
    `);
  });

  // Real OAuth Callback route
  app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
          <style>
            body {
              font-family: system-ui;
              background-color: #030913;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication complete. This pop-up should automatically dismiss.</p>
        </body>
      </html>
    `);
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', datetime: new Date().toISOString() });
  });

  // --- VITE WEB MIDDLEWARE FOR DEV VS PROD RENDER ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Seaflows Server Setup] Server actively running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Fatal startup server exception:", err);
});
