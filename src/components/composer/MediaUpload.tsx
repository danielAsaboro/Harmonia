import React, { useRef } from 'react';

interface Props {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
}

export default function MediaUpload({ 
  onUpload, 
  maxFiles = 4,
  acceptedTypes = "image/*,video/*,gif/*" 
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onUpload(files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    onUpload(files);
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="relative"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="p-2 rounded-full hover:bg-gray-800"
      >
        📷
      </button>
    </div>
  );
}