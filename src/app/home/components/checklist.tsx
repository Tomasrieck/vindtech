import styles from './checklist.module.css';

import { IoCheckmark } from "react-icons/io5";

export default function Checklist({ items }: { items: string[] }) {
  return (
    <ul className={styles.checklist}>
      {items.map((text, index) => (
        <li
          key={index}
          id={styles.item}
          className={index % 2 === 0 ? styles.itemEven : styles.itemOdd}
          style={{ animationDelay: `${index * 0.33}s` }}
        >
          <IoCheckmark color="limegreen" /> <p>{text}</p>
        </li>
      ))}
    </ul>
  );
}