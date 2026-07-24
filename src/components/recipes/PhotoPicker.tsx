"use client";

import { useRef, useState } from "react";
import { Camera, ImageIcon, Loader2 } from "lucide-react";
import { compressImage } from "@/lib/utils/image-compress";

interface PhotoPickerProps {
  preview: string | null;
  onChange: (dataUrl: string) => void;
}

export function PhotoPicker({ preview, onChange }: PhotoPickerProps) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [compressing, setCompressing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompressing(true);
    try {
      const compressed = await compressImage(file, 800, 0.75);
      onChange(compressed);
    } catch {
      const reader = new FileReader();
      reader.onload = () => onChange(reader.result as string);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative aspect-video rounded-xl overflow-hidden bg-surface border-2 border-dashed border-border">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted gap-1">
            {compressing ? (
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            ) : (
              <ImageIcon className="w-8 h-8" strokeWidth={1.5} />
            )}
            <span className="text-sm">{compressing ? "Compression..." : "Ajouter une photo"}</span>
          </div>
        )}
        {compressing && preview && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={compressing}
          onClick={() => galleryRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-sm font-medium active:bg-surface-elevated transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-4 h-4 text-accent" />
          Galerie
        </button>
        <button
          type="button"
          disabled={compressing}
          onClick={() => cameraRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-surface border border-border text-sm font-medium active:bg-surface-elevated transition-colors disabled:opacity-50"
        >
          <Camera className="w-4 h-4 text-accent" />
          Caméra
        </button>
      </div>

      <input ref={galleryRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
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
