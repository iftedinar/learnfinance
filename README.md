# Finance Learning Agent

A private-first finance education app that turns public YouTube finance content into summaries, strategy libraries, simulations, glossary terms, notes, and AI-searchable learning context.

This is not a financial advice platform. It is for education, organization, simulation, and strategy explanation only.

## MVP Scope

- Add one YouTube video, multiple videos, a playlist, or an entire channel.
- Queue transcript processing and downstream AI analysis.
- Review video summaries, extracted strategies, glossary terms, simulations, and notes.
- Export saved learning content as a Word-compatible document or PDF.
- Keep the architecture ready for Supabase, OpenAI, Vercel, user accounts, plans, and usage limits.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL with pgvector
- OpenAI API-ready backend routes

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

3. Fill in:

   ```text
   OPENAI_API_KEY
   YOUTUBE_API_KEY
   SUPABASE_URL
   SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   DATABASE_URL
   ```

4. Apply the schema in `database/schema.sql` to Supabase.

5. Start the app:

   ```bash
   npm run dev
   ```

## Backend Workflow

`POST /api/process-content` accepts:

```json
{
  "sourceType": "channel",
  "urls": ["https://www.youtube.com/@samplemarketeducation"],
  "includeTranscript": true,
  "maxVideos": 50
}
```

The current route validates the request and returns the processing plan. Wire the route to the YouTube Data API, transcript fetching, chunking, embeddings, Supabase persistence, summary generation, strategy extraction, glossary extraction, and simulation generation.

## Export

- `GET /api/export?format=doc` downloads a Word-compatible `.doc` file.
- `GET /api/export?format=pdf` downloads a simple PDF.

## Legal and Content Safety

- Do not publicly republish full YouTube transcripts.
- Show source links back to YouTube.
- Use transcripts for private learning, summarization, search, and citation.
- Never claim guaranteed profit or give buy/sell signals.
