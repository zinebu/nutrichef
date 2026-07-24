"use client";

import { useRef } from "react";
import { Camera, ImageIcon } from "lucide-react";

interface PhotoPickerProps {
  preview: string | null;
  onChange: (dataUrl: string) => void;
}

export function PhotoPicker({ preview, onChange }: PhotoPickerProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-surface border-2 border-dashed border-border">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-1">
            <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
            <span className="text-sm">Ajouter une photo</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => galleryRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-sm font-medium active:bg-surface-elevated transition-colors"
        >
          <ImageIcon className="w-4 h-4 text-accent" />
          Galerie
        </button>
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-sm font-medium active:bg-surface-elevated transition-colors"
        >
          <Camera className="w-4 h-4 text-accent" />
          Caméra
        </button>
      </div>

      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
