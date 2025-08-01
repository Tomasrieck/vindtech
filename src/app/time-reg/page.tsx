'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

interface Entry { date: string; hours: number; }

export default function TimeRegPage() {
  // Ensure anonymous ID cookie
  useEffect(() => {
    const COOKIE_NAME = 'anonId';
    const existing = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${COOKIE_NAME}=`))
      ?.split('=')[1];
    if (!existing) {
      const id = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 10);
      document.cookie = `${COOKIE_NAME}=${id}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
    }
  }, []);

  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState<number>(0);
  const [entries, setEntries] = useState<Entry[]>([]);
  const timerRef = useRef<number>(0);

  // Restore persisted timerStart on mount
  useEffect(() => {
    const saved = localStorage.getItem('timerStart');
    if (saved) {
      const start = new Date(saved);
      setStartTime(start);
      setElapsed((Date.now() - start.getTime()) / 1000);
      setRunning(true);
    }
  }, []);

  // Fetch last 5 entries on mount
  useEffect(() => {
    fetch('/api/time-reg')
      .then(res => res.json())
      .then(data => setEntries(data.entries || []));
  }, []);

  // Update elapsed timer every second when running
  useEffect(() => {
    if (running && startTime) {
      timerRef.current = window.setInterval(() => {
        setElapsed((Date.now() - startTime.getTime()) / 1000);
      }, 1000);
    } else {
      window.clearInterval(timerRef.current);
    }
    return () => window.clearInterval(timerRef.current);
  }, [running, startTime]);

  const handleStart = () => {
    const now = new Date();
    localStorage.setItem('timerStart', now.toISOString());
    setStartTime(now);
    setElapsed(0);
    setRunning(true);
  };

  const handleStop = async () => {
    if (!startTime) return;
    setRunning(false);
    localStorage.removeItem('timerStart');
    const endTime = new Date();
    // Save via API
    await fetch('/api/time-reg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start: startTime.toISOString(), end: endTime.toISOString() }),
    });
    setElapsed(0);
    setStartTime(null);
    // Refresh entries
    const res = await fetch('/api/time-reg');
    const json = await res.json();
    setEntries(json.entries || []);
  };

  const formatTime = (sec: number) => new Date(sec * 1000).toISOString().substr(11, 8);

  return (
    <main className={styles.container}>
      <div className={styles.timer}>
        {running
          ? <button onClick={handleStop}>Stop</button>
          : <button onClick={handleStart}>Start</button>
        }
        <span className={styles.elapsed}>{formatTime(elapsed)}</span>
      </div>
      <ul className={styles.entries}>
        {entries.map((e, i) => (
          <li key={i} className={i % 2 === 0 ? styles.entryEven : styles.entryOdd}>
            <strong>{e.date}:</strong> {Math.floor(e.hours)} timer {Math.round((e.hours % 1) * 60)} minutter
          </li>
        ))}
      </ul>
    </main>
  );
}