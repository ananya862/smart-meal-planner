export const config = {
  api: {
    bodyParser: { sizeLimit: '2mb' },
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });

  try {
    let body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);

    // Handle fetchUrl - fetch page server-side
    if (body.fetchUrl) {
      const url = body.fetchUrl;
      const { fetchUrl, ...rest } = body;
      body = rest;

      const pageRes = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)',
          'Accept': 'text/html',
        },
      });

      const html = await pageRes.text();
      const plain = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000);

      body.userMessage = `Extract the recipe from this webpage. URL: ${url}\n\nContent:\n${plain}`;
    }

    // Convert Anthropic-style body to Gemini format
    const systemPrompt = body.system || '';
    const userMessage = body.userMessage || (body.messages?.[0]?.content) || '';

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
          contents: [{ role: 'user', parts: [{ text: userMessage }] }],
          generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
        }),
      }
    );

    const geminiData = await geminiRes.json();

    // Convert Gemini response to Anthropic-compatible format
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return res.status(200).json({
      content: [{ type: 'text', text }],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
