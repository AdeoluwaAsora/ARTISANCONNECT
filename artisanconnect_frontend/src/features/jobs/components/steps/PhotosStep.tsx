import { useRef } from "react";
import { FiUpload, FiX } from "react-icons/fi";
import type { JobPhoto } from "@/types/job";
import styles from "./PhotosStep.module.css";
import stepStyles from "./steps.module.css";

interface PhotosStepProps {
  photos: JobPhoto[];
  onChange: (photos: JobPhoto[]) => void;
}

export function PhotosStep({ photos, onChange }: PhotosStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newPhotos: JobPhoto[] = Array.from(files)
      .slice(0, 6 - photos.length)
      .map((file) => ({
        id: `${Date.now()}-${file.name}`,
        url: URL.createObjectURL(file),
      }));
    onChange([...photos, ...newPhotos]);
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  return (
    <div className={stepStyles.stepFields}>
      <p className="body-sm">
        Photos help artisans quote accurately and arrive prepared. Add up to 6 (optional).
      </p>

      <div className={styles.grid}>
        {photos.map((photo) => (
          <div key={photo.id} className={styles.tile}>
            <img src={photo.url} alt="" className={styles.image} />
            <button
              type="button"
              className={styles.removeButton}
              onClick={() => removePhoto(photo.id)}
              aria-label="Remove photo"
            >
              <FiX size={14} />
            </button>
          </div>
        ))}

        {photos.length < 6 && (
          <button
            type="button"
            className={styles.addTile}
            onClick={() => inputRef.current?.click()}
          >
            <FiUpload size={20} aria-hidden="true" />
            <span className="body-sm">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
