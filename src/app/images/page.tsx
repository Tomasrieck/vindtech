// app/images/page.tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

import { LuImagePlus, LuTrash2 } from "react-icons/lu";
import Image from 'next/image';
import Loader from '../components/loader';

type Img = { filename: string; url: string }

export default function ImagesPage() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<Img[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgPressed, setImgPressed] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch existing images
  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      const json = await res.json();
      setImages(json.images || []);
    } catch (e) {
      console.error('Failed to fetch images', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Generate preview URL when a file is selected
  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreview(null);
  }, [selectedFile]);

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setUploading(true);
    const form = new FormData();
    form.append('image', selectedFile);
    await fetch('/api/images', { method: 'POST', body: form });
    setSelectedFile(null);
    await fetchImages();
    setUploading(false);
    setLoading(false);
  };

  const handleDelete = async (fn: string) => {
    setLoading(true);
    await fetch('/api/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename: fn }),
    });
    await fetchImages();
    setLoading(false);
  };

  const canUpload = !!selectedFile && !uploading;

  return (
    <main className={styles.container}>
      <div className={styles.uploadBox} onClick={handleBoxClick}>
        {preview ? (
          <Image src={preview} alt="Preview" width={100} height={100} unoptimized />
        ) : (
          <LuImagePlus size={48} color="#888" />
        )}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleFileChange}
          hidden
          className={styles.fileInput}
        />
      </div>

      <button
        onClick={handleUpload}
        disabled={!canUpload}
        className={styles.uploadBtn}
      >
        {uploading ? 'Uploader...' : 'Upload'}
      </button>

      {loading ? <Loader mt="2rem" /> : (
      <div className={styles.grid}>
        {images.map(({ filename, url }) => (
          <div key={filename} className={styles.thumb} onClick={() => setImgPressed(imgPressed === filename ? null : filename)}>
            {imgPressed === filename && (
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(filename)}
                aria-label="Slet billede"
              >
                <LuTrash2 size={16} />
              </button>)}
            <Image src={url} alt={filename} width={100} height={100} unoptimized />
          </div>
        ))}
      </div>)}
    </main>
  );
}