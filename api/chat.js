// Allow larger request bodies for image uploads
export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: 'Only POST requests allowed.' });
  }

  try {
    const { question, image, lang } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      console.error('Missing OPENAI_API_KEY in environment.');
      return res.status(500).json({ answer: 'Server misconfiguration: missing API key.' });
    }

    // Build messages for OpenAI; instruct model to be simple and sustainable
    const systemPrompt = `You are a helpful farming assistant. Use simple clear language suitable for low-literacy users. Prefer sustainable, low-cost, eco-friendly solutions. If given an image, analyze visible crop symptoms and suggest practical next steps. If state or scheme info is relevant, mention that the user may check local agricultural extension services.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question || 'Please describe the crop condition in the provided image.' }
    ];

    // If image provided as base64 data URL, attach a short note. Some OpenAI image-capable models accept image URLs/data URIs in messages.
    // We attach the base64 as text so model can be prompted to interpret it if the model supports vision.
    if (image) {
      messages.push({
        role: 'user',
        content: `Image data: ${image.substring(0, 200)}... (image truncated). Analyze the image and describe visible problems and remedies.`
      });
    }

    // Call OpenAI API (Chat Completions)
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 600
      })
    });

    const data = await resp.json();

    if (!resp.ok) {
      console.error('OpenAI error', data);
      return res.status(502).json({ answer: 'AI service error. Try again later.' });
    }

    const answer = data.choices?.[0]?.message?.content?.trim() || 'No answer from AI.';
    return res.status(200).json({ answer });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ answer: 'Internal server error.' });
  }
}
