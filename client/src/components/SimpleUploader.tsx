import { useState, useRef } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SimpleUploaderProps {
  onUploadComplete?: (url: string) => void;
  buttonClassName?: string;
  children: ReactNode;
  accept?: string;
  "data-testid"?: string;
}

export function SimpleUploader({
  onUploadComplete,
  buttonClassName,
  children,
  accept = "image/*",
  "data-testid": dataTestId,
}: SimpleUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Get upload URL
      const uploadResponse = await fetch("/api/objects/upload", {
        method: "POST",
        credentials: "include",
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { uploadURL } = await uploadResponse.json();

      // Upload file
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error("Failed to upload file");
      }

      // Extract object path from upload URL
      const url = new URL(uploadURL);
      const objectPath = url.pathname;

      toast({
        title: "Upload successful",
        description: "File has been uploaded successfully",
      });

      onUploadComplete?.(objectPath);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={buttonClassName}
        data-testid={dataTestId}
      >
        {isUploading ? "Uploading..." : children}
      </Button>
    </>
  );
}
