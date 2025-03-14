"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Upload, Loader2 } from "lucide-react";
import { createBrowserClient } from "@supabase/ssr";

export function UploadIdForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [authReady, setAuthReady] = useState(false);
  const [sessionStatus, setSessionStatus] = useState<string>("checking");
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Get Supabase client the same way the rest of your app does
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Check authentication status on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("Auth check response:", data, error);
        
        if (error) {
          console.error("Error checking session:", error);
          setSessionStatus("error");
        } else if (data.session) {
          console.log("User is authenticated:", data.session.user.id);
          setSessionStatus("authenticated");
        } else {
          console.log("No active session found");
          setSessionStatus("unauthenticated");
        }
      } catch (err) {
        console.error("Failed to check session:", err);
        setSessionStatus("exception");
      } finally {
        setAuthReady(true);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (session) {
        setSessionStatus("authenticated");
      } else if (event === 'SIGNED_OUT') {
        setSessionStatus("unauthenticated");
      }
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Check file type
    if (!selectedFile.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    // Check file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setFile(selectedFile);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);
    setDebugInfo(null);
    setUploadProgress(0);

    try {
      // 0. Verify the user has a valid session
      console.log("Checking authentication status...");
      const { data: sessionData } = await supabase.auth.getSession();
      
      console.log("Session check result:", sessionData);
      
      if (!sessionData.session) {
        console.error("No active session found during upload");
        throw new Error("You must be logged in to upload an ID");
      }

      // 1. Upload the file to Supabase Storage
      console.log("Uploading file to bucket 'pilot-ids'...");
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`; // No subfolder for simplicity

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("pilot-ids")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("pilot-ids")
        .getPublicUrl(filePath);

      console.log("File uploaded successfully, URL:", urlData.publicUrl);

      // 3. Call the verification edge function
      console.log("Calling verification edge function...");
      const verifyResult = await supabase.functions.invoke(
        "verify-id",
        {
          body: {
            userId,
            imageUrl: urlData.publicUrl,
          },
        },
      );
      
      // Log the full response for debugging
      console.log("Edge function raw response:", verifyResult);
      
      if (verifyResult.error) {
        console.error("Verification error:", verifyResult.error);
        
        // Store detailed debug info
        setDebugInfo(JSON.stringify(verifyResult, null, 2));
        
        throw new Error(`Verification failed: ${verifyResult.error.message || verifyResult.error.name || 'Unknown error'}`);
      }
      
      const data = verifyResult.data;
      
      if (!data) {
        throw new Error("Verification returned no data");
      }
      
      // Check if the data contains an error object (our new format returns 200 but with error details)
      if (data.error) {
        console.error("Verification processing error:", data.error);
        setError(data.message || "ID verification failed due to processing error");
        setDebugInfo(`Error details: ${JSON.stringify(data.error, null, 2)}`);
        throw new Error(data.message || "ID verification processing error");
      }

      // 4. Update the user's verification status based on the result
      if (data.isValid) {
        console.log("ID verified successfully, updating profile record...");
        // Update profile record with verification status using admin client
        const updateResult = await supabase.functions.invoke(
          "update-user-verification",
          {
            body: {
              userId,
              id_verified: true,
              id_verification_date: new Date().toISOString(),
              id_image_path: filePath,
            },
          },
        );
        
        // Log the full response for debugging
        console.log("Update function raw response:", updateResult);

        if (updateResult.error) {
          console.error("Update error:", updateResult.error);
          setDebugInfo(JSON.stringify(updateResult, null, 2));
          throw new Error(`Update failed: ${updateResult.error.message || updateResult.error.name || 'Unknown error'}`);
        }

        console.log("Profile record updated successfully, redirecting...");
        // Redirect to dashboard using window.location
        window.location.href = "/dashboard";
      } else {
        // ID verification failed
        setError(
          data.message ||
            "ID verification failed. Please try again with a clearer image."
        );
        if (data.extractedInfo) {
          setDebugInfo(`Extracted info: ${JSON.stringify(data.extractedInfo, null, 2)}`);
        }
      }
    } catch (err: any) {
      console.error("Overall error:", err);
      setError(err.message || "An error occurred during verification");
    } finally {
      setIsUploading(false);
    }
  };

  // Debugging button to trigger manual auth check
  const checkAuthStatus = async () => {
    const { data } = await supabase.auth.getSession();
    console.log("Manual auth check:", data);
    alert(`Auth status: ${data.session ? "Logged in" : "Not logged in"}`);
  };

  // If we're having auth issues, show them to the user
  if (authReady && sessionStatus !== "authenticated" && sessionStatus !== "checking") {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <h3 className="text-red-600 font-semibold">Authentication Issue</h3>
        <p className="mb-2">Unable to verify your login status: {sessionStatus}</p>
        <p>Please try refreshing the page or logging in again.</p>
        
        <div className="mt-4 flex space-x-4">
          <Button 
            variant="default"
            onClick={() => window.location.href = "/sign-in"}
          >
            Go to Login
          </Button>
          
          <Button 
            variant="outline"
            onClick={checkAuthStatus}
          >
            Check Auth Status
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {sessionStatus === "checking" && (
        <div className="text-blue-500 text-sm">Verifying authentication...</div>
      )}
      
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`border-2 border-dashed rounded-lg p-4 w-full h-48 flex flex-col items-center justify-center cursor-pointer ${
              preview
                ? "border-blue-500"
                : "border-gray-300 hover:border-blue-500"
            }`}
            onClick={() => document.getElementById("id-upload")?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="ID Preview"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG or JPEG (max 5MB)
                </p>
              </>
            )}
          </div>
          <input
            id="id-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm border-l-2 border-red-500 pl-3">
            {error}
          </div>
        )}
        
        {debugInfo && (
          <div className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
            <h4 className="font-semibold mb-1">Debug Information:</h4>
            <pre>{debugInfo}</pre>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={!file || isUploading || sessionStatus !== "authenticated"}
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify ID"
          )}
        </Button>
      </div>
    </form>
  );
}
