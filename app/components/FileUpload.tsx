"use client";

import {
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
  upload,
} from "@imagekit/next";
import React, { useState } from "react";

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress: (res: number) => void;
  fileType?: "image";
}

const FileUpload = ({ onSuccess, onProgress, fileType }: FileUploadProps) => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (fileType === "image") {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file");
        return false;
      }
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large");
      return false;
    }

    return true;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    setUploading(true);
    setError(null);

    try {
      const authRes = await fetch("/api/upload-auth");
      const auth = await authRes.json();

      const uploadResponse = await upload({
        file,
        fileName: file.name,
        publicKey: process.env.NEXT_PUBLIC_KEY!,
        signature: auth.signature,
        expire: auth.expire,
        token: auth.token,
        onProgress: (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
            onProgress(percent);
          }
        },
      });

      onSuccess(uploadResponse);
    } catch (err) {
      if (
        err instanceof ImageKitInvalidRequestError ||
        err instanceof ImageKitUploadNetworkError ||
        err instanceof ImageKitServerError ||
        err instanceof ImageKitAbortError
      ) {
        setError(err.message || "An error occurred while uploading.");
      } else {
        setError("Unexpected error during file upload.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        type="file"
        accept={fileType === "image" ? "image/*" : "video/*"}
        onChange={handleUpload}
      />
      {uploading && (
        <div>
          <p>Uploading... {progress}%</p>
          <progress value={progress} max={100}></progress>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </>
  );
};

export default FileUpload;
