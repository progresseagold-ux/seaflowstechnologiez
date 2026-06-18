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
