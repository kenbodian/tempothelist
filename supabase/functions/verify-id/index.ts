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
    const { userId, imageUrl, imageBase64, fileType } = await req.json();

    if (!userId || (!imageUrl && !imageBase64)) {
      throw new Error("Missing required parameters");
    }

    console.log("Analyzing image for ID verification:", imageBase64 ? "Base64 data provided" : imageUrl);

    // Call OpenAI GPT-4 Vision API to analyze the ID
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    console.log("Calling OpenAI API...");
    
    // Define models to try in order of preference
    const modelsToTry = ["gpt-4o-mini", "gpt-4-vision-preview"];
    let lastError = null;
    let success = false;
    let data = null;
    
    // Try each model in sequence
    for (const model of modelsToTry) {
      if (success) break;
      
      try {
        console.log(`Attempting with model: ${model}`);
        
        // Prepare the image content - either URL or base64 data
        let imageContent;
        if (imageBase64) {
          // If base64 data is provided, use that
          const dataURI = `data:${fileType || 'image/jpeg'};base64,${imageBase64}`;
          imageContent = {
            type: "image_url",
            image_url: {
              url: dataURI,
            },
          };
        } else {
          // Fallback to URL if no base64 data
          imageContent = {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          };
        }
        
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiApiKey}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: 'Analyze this image and determine if it is a valid airline or pilot ID card. Look for: airline name, pilot name, position, employee ID number, expiration date, and official logos. Respond with a JSON object with the following structure: {"isValid": boolean, "confidence": number between 0-1, "message": string with explanation, "extractedInfo": {object with any extracted information}}. Only respond with the JSON object, nothing else.',
                  },
                  imageContent,
                ],
              },
            ],
            max_tokens: 1000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error with model ${model}:`, errorText);
          
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { error: "Failed to parse error response" };
          }
          
          lastError = new Error(`OpenAI API error with model ${model}: ${JSON.stringify(errorData)}`);
          // Continue to next model
          continue;
        }

        data = await response.json();
        console.log(`${model} API response received`);
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error(`Unexpected OpenAI response format from ${model}:`, data);
          lastError = new Error(`Invalid response format from ${model}`);
          // Continue to next model
          continue;
        }
        
        const content = data.choices[0].message.content;
        console.log(`Raw ${model} response:`, content);

        // Parse the JSON response from GPT
        try {
          const parsedResult = JSON.parse(content);
          console.log(`Analysis result from ${model}:`, parsedResult);
          success = true;
          
          return new Response(JSON.stringify(parsedResult), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          });
        } catch (e) {
          console.log(`Failed to parse JSON directly from ${model}, attempting to extract from text...`);
          // If model didn't return valid JSON, extract it from the text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsedResult = JSON.parse(jsonMatch[0]);
            console.log(`Extracted analysis result from ${model}:`, parsedResult);
            success = true;
            
            return new Response(JSON.stringify(parsedResult), {
              headers: { ...corsHeaders, "Content-Type": "application/json" },
              status: 200,
            });
          } else {
            console.error(`Could not parse ${model} response as JSON:`, content);
            lastError = new Error(`Failed to parse ${model} response`);
            // Continue to next model
          }
        }
      } catch (modelError) {
        console.error(`Error processing with model ${model}:`, modelError);
        lastError = modelError;
        // Continue to next model
      }
    }
    
    // If we get here, all models failed
    if (lastError) {
      throw lastError;
    } else {
      throw new Error("All OpenAI model attempts failed");
    }
  } catch (error) {
    console.error("Error verifying ID:", error);
    
    // Create a detailed error object for debugging
    const errorDetails = {
      isValid: false,
      confidence: 0,
      message: error.message || "An error occurred during verification",
      error: {
        name: error.name || "Unknown",
        message: error.message || "No message available",
        stack: error.stack || "No stack trace available",
        toString: error.toString()
      },
      extractedInfo: null,
    };
    
    return new Response(JSON.stringify(errorDetails), {
      status: 200, // Return 200 status to avoid the Edge Function error while still communicating the failure
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
