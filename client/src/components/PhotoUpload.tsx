import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PhotoUploadProps {
  currentPhoto?: string | null;
  onPhotoChange: (photoData: string | null) => void;
  disabled?: boolean;
}

export default function PhotoUpload({ currentPhoto, onPhotoChange, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please choose a photo smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreview(result);
      onPhotoChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemovePhoto = () => {
    setPreview(null);
    onPhotoChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-slate-700">Photo (Optional)</div>
      
      {preview ? (
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-50">
            <img 
              src={preview} 
              alt="Volunteer photo" 
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemovePhoto}
            disabled={disabled}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 bg-white border border-slate-300"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
          <Camera className="h-8 w-8 text-slate-400" />
        </div>
      )}

      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCameraCapture}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          <Camera className="h-4 w-4" />
          <span>Camera</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center space-x-1"
        >
          <Upload className="h-4 w-4" />
          <span>Upload</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}