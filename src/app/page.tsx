import styles from './page.module.css';

import CheckClient from './components/checkClient';
import Link from 'next/link';

export default async function LandingPage() {
  return (
    <main className={styles.container}>
      <CheckClient />
      <p>or <Link style={{ color: 'var(--primary-foreground)' }} href='/home'>continue in browser</Link></p>
    </main>
  );
}