export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // lock to your domain in prod
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}; 