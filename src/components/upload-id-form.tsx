"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Upload, Loader2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Create client outside component to prevent multiple instantiations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function UploadIdForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

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
    setUploadProgress(0);

    try {
      // 0. Verify the user has a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
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
      const { data, error: verifyError } = await supabase.functions.invoke(
        "verify-id",
        {
          body: {
            userId,
            imageUrl: urlData.publicUrl,
          },
        },
      );

      if (verifyError) {
        console.error("Verification error:", verifyError);
        throw new Error(`Verification failed: ${verifyError.message}`);
      }

      // 4. Update the user's verification status based on the result
      if (data.isValid) {
        console.log("ID verified successfully, updating profile record...");
        // Update profile record with verification status using admin client
        const { data: adminData, error: adminError } =
          await supabase.functions.invoke(
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

        if (adminError) {
          console.error("Update error:", adminError);
          throw new Error(`Update failed: ${adminError.message}`);
        }

        console.log("Profile record updated successfully, redirecting...");
        // Redirect to dashboard using window.location
        window.location.href = "/dashboard";
      } else {
        // ID verification failed
        setError(
          data.message ||
            "ID verification failed. Please try again with a clearer image.",
        );
      }
    } catch (err: any) {
      console.error("Overall error:", err);
      setError(err.message || "An error occurred during verification");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        <Button
          type="submit"
          className="w-full"
          disabled={!file || isUploading}
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
