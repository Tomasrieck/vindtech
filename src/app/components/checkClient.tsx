'use client';

import { useEffect, useState } from 'react';
import styles from './checkClient.module.css';

import { IoShareOutline } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import { LuDock } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function SuitableInstructions() {
  const [isSafariOnPhone, setIsSafariOnPhone] = useState(false);
  const [isChromeOnPhone, setIsChromeOnPhone] = useState(false);
  const [isSafariOnComputer, setIsSafariOnComputer] = useState(false);
  const [isChromeOnComputer, setIsChromeOnComputer] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const isPhone = /iPhone|iPod|Android/.test(ua);
    const safari = /Safari/.test(ua) && !/Chrome/.test(ua);
    const chrome = !/Safari/.test(ua) && /Chrome/.test(ua);
    setIsSafariOnPhone(isPhone && safari);
    setIsChromeOnPhone(isPhone && chrome);
    setIsSafariOnComputer(!isPhone && safari);
    setIsChromeOnComputer(!isPhone && chrome);
  }, []);

  if (isSafariOnPhone) return (
    <>
      <div className={styles.step}>
        <span className={styles.stepNumber}>1.</span>
        <div className={styles.stepContent}>
          <p>Tryk på <strong>Del</strong>-knappen</p>
          <IoShareOutline size={28} color="-apple-system-blue" />
        </div>
      </div>

      <div className={styles.step}>
        <span className={styles.stepNumber}>2.</span>
        <div className={styles.stepContent}>
          <p>Vælg <strong>Føj til hjemmeskærm</strong></p>
          <FaPlus size={25.5} color="white" style={{ border: "2px solid white", borderRadius: "25%", display: "flex", alignItems: "center", justifyContent: "center", padding: '2.5px' }} />
        </div>
      </div>

      <div className={styles.step}>
        <span className={styles.stepNumber}>3.</span>
        <div className={styles.stepContent}>
          <p>Vælg</p>
          <p className={styles.addBtnTxt}>Tilføj</p>
        </div>
      </div>
    </>
  );

  if (isSafariOnComputer) return (
    <>
      <div className={styles.step}>
        <span className={styles.stepNumber}>1.</span>
        <div className={styles.stepContent}>
          <p>Tryk på</p>
          <IoShareOutline size={28} color="-apple-system-gray" />
        </div>
      </div>

      <div className={styles.step}>
        <span className={styles.stepNumber}>2.</span>
        <div className={styles.stepContent}>
          <p>Vælg</p>
          <LuDock size={22.5} color="-apple-system-gray" />
          <p style={{ color: "-apple-system-gray" }}><strong>Føj til dock</strong></p>
        </div>
      </div>

      <div className={styles.step}>
        <span className={styles.stepNumber}>3.</span>
        <div className={styles.stepContent}>
          <p>Vælg</p>
          <p className={styles.addBtnBox}>Tilføj</p>
        </div>
      </div>
    </>
  );
}

export default function CheckClient() {
  return (
    <div className={styles.safariOnPhoneContainer}>
      <h2 className={styles.instructionsTitle}>Sådan installerer du appen</h2>
    
      <SuitableInstructions />
    </div>
  );
}