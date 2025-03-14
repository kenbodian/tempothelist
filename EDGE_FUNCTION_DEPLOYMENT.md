# Manual Edge Function Deployment Guide

Since Docker Desktop is required for local Edge Function development and deployment (and doesn't appear to be installed), you'll need to deploy your updated functions manually through the Supabase dashboard. Here's how:

## 1. Update the `verify-id` Edge Function

1. Go to the [Supabase Dashboard](https://app.supabase.com/)
2. Open your project
3. Navigate to Edge Functions in the sidebar
4. Find the "verify-id" function in the list
5. Click on it to open the details
6. Click "Edit" to open the editor
7. Replace the entire function with the following code:

```typescript
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

    console.log("Calling OpenAI API...");
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
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
        const errorText = await response.text();
        console.error("OpenAI API error response:", errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: "Failed to parse error response" };
        }
        
        throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log("OpenAI API response received");
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected OpenAI response format:", data);
        throw new Error("Invalid response format from OpenAI");
      }
      
      const content = data.choices[0].message.content;
      console.log("Raw GPT response:", content);

      // Parse the JSON response from GPT-4
      let parsedResult;
      try {
        parsedResult = JSON.parse(content);
      } catch (e) {
        console.log("Failed to parse JSON directly, attempting to extract from text...");
        // If GPT-4 didn't return valid JSON, extract it from the text
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          console.error("Could not parse GPT response as JSON:", content);
          throw new Error("Failed to parse GPT-4 response");
        }
      }

      console.log("Analysis result:", parsedResult);
      
      return new Response(JSON.stringify(parsedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (openaiError) {
      console.error("OpenAI processing error:", openaiError);
      throw new Error(`OpenAI processing failed: ${openaiError.message}`);
    }
  } catch (error) {
    console.error("Error verifying ID:", error);
    return new Response(
      JSON.stringify({
        isValid: false,
        confidence: 0,
        message: error.message || "An error occurred during verification",
        error: error.toString(),
        stack: error.stack,
        extractedInfo: null,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
```

8. Click "Save" to update the function

## 2. Check all environment variables

Ensure all of these environment variables are set for your Edge Functions in the Supabase Dashboard:

1. Go to Settings > API in your project
2. Scroll down to "Project API keys" and copy the "service_role key" (this should be set as `SERVICE_ROLE_KEY`)
3. Go to Settings > Functions
4. Verify these variables are set:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `PROJECT_URL`: Your Supabase project URL (e.g., https://pmluvmynrbjszsaowvof.supabase.co)
   - `SERVICE_ROLE_KEY`: The service role key you copied earlier
   - `SUPABASE_URL`: Same as your PROJECT_URL
   - `SUPABASE_SERVICE_ROLE_KEY`: Same as your SERVICE_ROLE_KEY

## 3. Test the Upload ID Form

1. Return to your app
2. Navigate to the ID upload page
3. Try uploading an ID image again
4. The app should now provide more detailed debug information if any issues occur

## Troubleshooting

If you continue to have issues:

1. Check the Edge Function logs in the Supabase Dashboard (Functions > Logs)
2. Look for any specific error messages in the debug information shown in the upload form
3. Ensure your OpenAI API key has access to the `gpt-4-vision-preview` model
4. Check that the Supabase storage bucket `pilot-ids` exists and is properly configured 