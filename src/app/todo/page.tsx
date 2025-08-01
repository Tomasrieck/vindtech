'use client';
import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

import { IoMdAddCircleOutline } from "react-icons/io";
import Loader from '../components/loader';

interface TodoItem { id: string; text: string; disabled: boolean; }

export default function TodoPage() {
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

  const [items, setItems] = useState<TodoItem[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    fetch('/api/to-do')
      .then(res => res.json())
      .then(data => {setItems(data.items || []); setLoading(false);});
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAdd = async () => {
    if (!text.trim()) return;
    if (items.length >= 10) {
      alert('Du kan kun have 10 opgaver ad gangen.');
      return;
    }
    setLoading(true);
    await fetch('/api/to-do', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await fetch('/api/to-do', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    fetchItems();
  };

  return (
    <main className={styles.container}>
      <div className={styles.inputGroup}>
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Tilføj opgave..."
          className={styles.input}
        />
        <button onClick={handleAdd} className={styles.addBtn}>
          <IoMdAddCircleOutline size={32} />
        </button>
      </div>
      {loading ? <Loader mt="2rem" /> : (
        <ul className={styles.list}>
          {items.map((item, idx) => (
            <li key={item.id} className={`${idx % 2 === 0 ? styles.itemEven : styles.itemOdd} ${styles.item}`}>
              <label>
                <input
                  type="checkbox"
                  checked={item.disabled}
                  disabled={item.disabled}
                  onChange={() => handleDelete(item.id)}
                />
                <span className={styles.text} style={{ color: item.disabled ? 'rgba(255, 255, 255, 0.33)' : 'inherit' }}>{item.text}</span>
              </label>
            </li>
          ))}
        </ul>)}
    </main>
  );
};
