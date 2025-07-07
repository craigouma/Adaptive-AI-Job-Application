// 1️⃣  Shared CORS headers (Supabase's doc pattern)
import { corsHeaders } from '../_shared/cors.ts';

// Use esm.sh CDN for Deno compatibility
import { LingoDotDevEngine } from "https://esm.sh/lingo.dev/sdk";

const lingo = new LingoDotDevEngine({
  apiKey: Deno.env.get("LINGO_API_KEY")!,   // Correct env var for Supabase Edge
});

// 3️⃣  Standard Deno serve handler
Deno.serve(async (req) => {
  // Pre-flight? Send the CORS headers and bail.
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[Lingo Edge] Failed to parse JSON:', err);
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { text, texts, sourceLocale = "en", targetLocale } = body;

  try {
    if (Array.isArray(texts)) {
      // Batch translation
      const translated = await Promise.all(
        texts.map((t: string) => lingo.localizeText(t, { sourceLocale, targetLocale }))
      );
      return new Response(JSON.stringify({ translated }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else if (typeof text === 'string') {
      // Single translation
      const translated = await lingo.localizeText(text, { sourceLocale, targetLocale });
      return new Response(JSON.stringify({ translated }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: 'Missing text or texts in request body.' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error('[Lingo Edge] Translation error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Translation failed.' }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}); 