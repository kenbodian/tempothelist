import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, imageUrl } = await req.json();

    if (!userId || !imageUrl) {
      throw new Error("Missing required parameters");
    }

    console.log("Analyzing image for ID verification:", imageUrl);

    // Call OpenAI GPT-4 Vision API to analyze the ID
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Analyze this image and determine if it is a valid airline or pilot ID card. Look for: airline name, pilot name, position, employee ID number, expiration date, and official logos. Respond with a JSON object with the following structure: {"isValid": boolean, "confidence": number between 0-1, "message": string with explanation, "extractedInfo": {object with any extracted information}}. Only respond with the JSON object, nothing else.',
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response from GPT-4
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      // If GPT-4 didn't return valid JSON, extract it from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Failed to parse GPT-4 response");
      }
    }

    console.log("Analysis result:", parsedResult);
    
    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error verifying ID:", error);
    return new Response(
      JSON.stringify({
        isValid: false,
        confidence: 0,
        message: error.message || "An error occurred during verification",
        extractedInfo: null,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
