import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Gemini Server SDK with Server-Side GEMINI_API_KEY
const apiKey = process.env.GEMINI_API_KEY || '';
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to initialize server-side GoogleGenAI:', err);
  }
} else {
  console.warn('Warning: GEMINI_API_KEY is not defined in server environment.');
}

/**
 * Strips markdown code fences from JSON output
 */
function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }
  return cleaned.trim();
}

/**
 * Generic server-side Gemini runner with 8s timeout and 1 retry
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  if (!aiClient) {
    throw new Error('GEMINI_API_KEY not configured on server');
  }

  const executeOnce = async (): Promise<string> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await aiClient!.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || 'You are TripPilot AI. Respond strictly in valid JSON.',
          responseMimeType: 'application/json',
        },
      });
      clearTimeout(timer);
      const text = response.text || '';
      if (!text) throw new Error('Empty response from Gemini');
      return text;
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  };

  try {
    return await executeOnce();
  } catch {
    // Retry once
    return await executeOnce();
  }
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Generate Trip Plan
app.post('/api/gemini/plan', async (req: Request, res: Response) => {
  try {
    const { from, destination, startDate, endDate, travelers, budget, travelStyle, interests, transport, stay, pace, tripMode, language } = req.body;
    const prompt = `Plan a ${travelers} traveler trip from ${from} to ${destination} under ₹${budget} starting ${startDate} to ${endDate}.
Trip Style: ${travelStyle}, Mode: ${tripMode}, Transport: ${transport}, Stay: ${stay}, Pace: ${pace}.
Interests: ${Array.isArray(interests) ? interests.join(', ') : interests}.
Respond in language: ${language || 'en'}.
Return JSON schema:
{
  "days": [
    {
      "day": 1,
      "title": "Title",
      "route": "Route summary",
      "dayTotal": 3500,
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity name",
          "location": "Place name",
          "lat": 11.41,
          "lng": 76.69,
          "type": "sightseeing",
          "estCost": 500,
          "notes": "Practical tip"
        }
      ]
    }
  ],
  "estimatedTotal": 14200,
  "safetyTips": ["tip 1", "tip 2"],
  "weatherNotes": ["weather tip"]
}`;

    const raw = await callGemini(prompt, 'You are the lead travel planning AI for TripPilot AI. Always return strictly JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate plan' });
  }
});

// 2. Parse Search Query
app.post('/api/gemini/parse-search', async (req: Request, res: Response) => {
  try {
    const { query, language } = req.body;
    const prompt = `Parse this Indian travel query: "${query}".
Language context: ${language || 'en'}.
Return JSON:
{
  "destination": "Ooty",
  "days": 3,
  "budget": 15000,
  "travelers": 2,
  "tripMode": "family",
  "interests": ["Nature", "Tea Estates", "Food"],
  "from": "Chennai"
}`;

    const raw = await callGemini(prompt, 'You are a natural language search query parser for an Indian travel app. Return strictly JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to parse query' });
  }
});

// 3. Suggest Destinations
app.post('/api/gemini/suggest-destinations', async (req: Request, res: Response) => {
  try {
    const { tripMode, budget, duration, language } = req.body;
    const prompt = `Suggest 3 top Indian travel destinations for a "${tripMode}" trip with budget ₹${budget} for ${duration} days.
Respond in language: ${language || 'en'}.
Return JSON schema:
{
  "suggestions": [
    {
      "name": "Ooty",
      "nameTa": "ஊட்டி",
      "whySuits": "Tea estates and toy train ride",
      "whySuitsTa": "தேயிலைத் தோட்டங்கள் மற்றும் மலை ரயில்",
      "estimatedCost": 12500,
      "bestTime": "Oct - May"
    }
  ]
}`;

    const raw = await callGemini(prompt, 'You are an expert Indian tourism consultant. Respond strictly in JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to suggest destinations' });
  }
});

// 4. Recommend Package
app.post('/api/gemini/recommend-package', async (req: Request, res: Response) => {
  try {
    const { packages, budget, tripMode, language } = req.body;
    const prompt = `From these travel packages for budget ₹${budget} and trip mode "${tripMode}":
${JSON.stringify(packages)}
Recommend ONE package. Respond in language: ${language || 'en'}.
Return JSON:
{
  "recommendedId": "standard",
  "reason": "Best value matching ₹15,000 budget with private cab",
  "reasonTa": "பட்ஜெட்டுக்குள் சிறந்த தனி கார் வசதி"
}`;

    const raw = await callGemini(prompt, 'You are a travel package advisor. Return strictly JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to recommend package' });
  }
});

// 5. Replanning
app.post('/api/gemini/replan', async (req: Request, res: Response) => {
  try {
    const { currentDays, disruptionType, balance, language } = req.body;
    const prompt = `A disruption occurred during a trip: "${disruptionType}".
Current itinerary summary: ${JSON.stringify(currentDays)}.
Remaining budget: ₹${balance}.
Generate a revised itinerary replacing unsafe or blocked outdoor spots with indoor cultural/safe spots.
Respond in language: ${language || 'en'}.
Return JSON:
{
  "reason": "Heavy rain avoided by swapping outdoor lake boating with Tea Factory and Chocolate Museum.",
  "reasonTa": "கனமழை காரணமாக வெளிப்புற ஏரிப் படகு சவாரிக்குப் பதிலாக தேயிலை தொழிற்சாலை மற்றும் சாக்லேட் அருங்காட்சியகத்திற்கு மாற்றப்பட்டது.",
  "costImpact": 0,
  "safetyImpact": "Eliminated slippery trail and open water hazards during thunderstorm.",
  "safetyImpactTa": "இடிமின்னல் மழையின் போது வழுக்கும் பாறைகள் மற்றும் படகு சவாரி ஆபத்து முற்றிலும் தவிர்க்கப்பட்டது.",
  "revisedDays": [...]
}`;

    const raw = await callGemini(prompt, 'You are TripPilot AI emergency replanning engine. Return strictly JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to replan' });
  }
});

// 6. Assistant Message
app.post('/api/gemini/assistant', async (req: Request, res: Response) => {
  try {
    const { userMessage, tripContext, language } = req.body;
    const prompt = `User message: "${userMessage}".
Language: ${language || 'en'}.
Trip context:
- Destination: ${tripContext?.destination || 'Ooty'}
- Budget: ₹${tripContext?.budget || 15000} (Spent: ₹${tripContext?.spent || 6800})
- Trip Mode: ${tripContext?.tripMode || 'Family'}
- Status: ${tripContext?.tripStatus || 'planning'}
- Current Step: ${tripContext?.currentStep || 'Planner'}

Provide a helpful, crisp travel response in markdown.
If health or medical is mentioned, NEVER diagnose; always advise calling 108/112 and provide disclaimer.
Return JSON:
{
  "reply": "markdown text",
  "actions": [{"type": "navigate", "payload": {"step": "Companion"}}],
  "quickReplies": ["Show my budget", "Nearest hospital", "Check route safety"]
}`;

    const raw = await callGemini(prompt, 'You are TripPilot AI Assistant, a friendly Indian travel companion. Return strictly JSON.');
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed assistant request' });
  }
});

// 7. Translate
app.post('/api/gemini/translate', async (req: Request, res: Response) => {
  try {
    const { text, fromLang, toLang } = req.body;
    const prompt = `Translate this travel phrase from ${fromLang} to ${toLang}: "${text}".
Return JSON:
{
  "translation": "translated string",
  "pronunciation": "phonetic english pronunciation"
}`;

    const raw = await callGemini(prompt);
    const parsed = JSON.parse(cleanJsonString(raw));
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed translation' });
  }
});

// -------------------------------------------------------------
// Vite Dev Server / Static Hosting Integration
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripPilot AI Server running on port ${PORT} (NODE_ENV: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
