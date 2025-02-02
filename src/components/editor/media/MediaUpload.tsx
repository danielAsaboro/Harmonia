import { useRef } from "react";

// MediaUpload.tsx
interface Props {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  disabled?: boolean; // Add disabled prop
}

export default function MediaUpload({
  onUpload,
  maxFiles = 4,
  acceptedTypes = "image/*,video/*,gif/*",
  disabled = false,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > maxFiles) {
      alert(`Maximum of 4 files allowed`);
      return;
    }
    onUpload(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const files = Array.from(e.target.files || []);
    if (files.length > maxFiles) {
      alert(`Maximum of 4 files allowed`);
      return;
    }
    onUpload(files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />
      <button
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`p-2 rounded-full ${
          disabled ? "cursor-not-allowed" : "hover:bg-gray-800"
        }`}
        disabled={disabled}
      >
        📷
      </button>
    </div>
  );
}
