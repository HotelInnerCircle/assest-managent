import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  X,
  ImageIcon,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageUploadProps {
  imageUrls: string[];
  onNext: (urls: string[]) => void;
  onBack: () => void;
}

const ImageUpload = ({ imageUrls, onNext, onBack }: ImageUploadProps) => {
  const [urls, setUrls] = useState<string[]>(imageUrls);
  const [uploading, setUploading] = useState(false);

  const isUploadDisabled = uploading || urls.length > 0;

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      setUploading(true);
      const newUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 5MB limit`,
            variant: "destructive",
          });
          continue;
        }

        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;

        const { error } = await supabase.storage
          .from("asset-images")
          .upload(fileName, file);

        if (error) {
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          const { data } = supabase.storage
            .from("asset-images")
            .getPublicUrl(fileName);

          newUrls.push(data.publicUrl);
        }
      }

      setUrls((prev) => [...prev, ...newUrls]);
      setUploading(false);
      e.target.value = "";
    },
    []
  );

  const removeImage = (index: number) => {
    setUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Asset Images</h2>
        <p className="text-muted-foreground mt-1">
          Upload photos of assigned assets
        </p>
      </div>

      {/* Upload Box */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isUploadDisabled
              ? "border-border bg-muted cursor-not-allowed opacity-60"
              : "border-border hover:border-primary/50 cursor-pointer"
          }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          id="image-upload"
          disabled={isUploadDisabled}
        />

        <label
          htmlFor={!isUploadDisabled ? "image-upload" : undefined}
          className={isUploadDisabled ? "pointer-events-none" : "cursor-pointer"}
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 mx-auto text-primary animate-spin" />
          ) : (
            <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          )}

          <p className="mt-3 text-sm font-medium text-foreground">
            {uploading
              ? "Uploading..."
              : urls.length > 0
              ? "Images uploaded"
              : "Click to upload images"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            PNG, JPG up to 5MB each
          </p>
        </label>
      </div>

      {/* Image Preview */}
      {urls.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {urls.map((url, i) => (
            <div
              key={i}
              className="relative group rounded-lg overflow-hidden border border-border"
            >
              <img
                src={url}
                alt={`Asset ${i + 1}`}
                className="w-full h-32 object-cover"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <ImageIcon className="w-4 h-4" />
          No images uploaded yet (optional)
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button type="button" onClick={() => onNext(urls)} className="gap-2">
          Next <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ImageUpload;
