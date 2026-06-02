import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const question = typeof payload.question === "string" ? payload.question.trim() : "";
  const context = typeof payload.context === "string" ? payload.context.slice(0, 30000) : "";

  if (!question) {
    return NextResponse.json({ answer: "Ask a question about the extracted material." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ answer: "OPENAI_API_KEY is not configured, so chat cannot run yet." }, { status: 503 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are a finance learning assistant. Answer using only the provided extracted learning context. If context is missing, say what is missing. Do not provide financial advice, buy/sell signals, or guaranteed outcomes."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${question}`
        }
      ]
    });

    return NextResponse.json({ answer: response.choices[0]?.message.content ?? "No answer returned." });
  } catch (caught) {
    return NextResponse.json(
      { answer: caught instanceof Error ? `Chat failed: ${caught.message}` : "Chat failed." },
      { status: 502 }
    );
  }
}
