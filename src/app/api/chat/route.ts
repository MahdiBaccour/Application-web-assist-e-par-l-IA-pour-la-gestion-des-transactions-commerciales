import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { message } = await req.json();

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Set this in your .env
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'openai/gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }]
    })
  });

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content || "Je n'ai pas compris.";

  return NextResponse.json({ reply });
}
