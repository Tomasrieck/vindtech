// components/Loader.tsx
'use client';
import React from 'react';
import styles from './loader.module.css';

interface LoaderProps {
  mt?: string;
}

export default function Loader({ mt }: LoaderProps) {
  return (
    <div className={styles.loaderContainer} style={{ marginTop: mt }}>
      <div className={styles.spinner} aria-label="Loading"></div>
    </div>
  );
}