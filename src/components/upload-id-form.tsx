"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Upload, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../supabase/supabase";

export function UploadIdForm({ userId }: { userId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    try {
      // 1. Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `pilot-ids/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("id-verifications")
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // 2. Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from("id-verifications")
        .getPublicUrl(filePath);

      // 3. Call the verification edge function
      const { data, error: verifyError } = await supabase.functions.invoke(
        "supabase-functions-verify-id",
        {
          body: {
            userId,
            imageUrl: urlData.publicUrl,
          },
        },
      );

      if (verifyError) {
        throw new Error(verifyError.message);
      }

      // 4. Update the user's verification status based on the result
      if (data.isValid) {
        // Update user record with verification status using admin client
        const { data: adminData, error: adminError } =
          await supabase.functions.invoke(
            "supabase-functions-update-user-verification",
            {
              body: {
                userId,
                id_verified: true,
                id_verification_date: new Date().toISOString(),
                id_image_path: filePath,
              },
            },
          );

        const updateError = adminError;

        if (updateError) {
          throw new Error(updateError.message);
        }

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // ID verification failed
        setError(
          data.message ||
            "ID verification failed. Please try again with a clearer image.",
        );
      }
    } catch (err: any) {
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
