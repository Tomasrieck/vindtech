import styles from './page.module.css';

import { IoMenu } from "react-icons/io5";

import CheckList from './components/checklist';

export default async function HomePage() {
  return (
    <main className={styles.container}>
      <div className={styles.discover}>
        <div />
        {/* <h2>
          Tryk på <IoMenu className={styles.inlineIcon} size={30} color='var(--foreground)' /> og oplev<br/>hvad en PWA kan
        </h2> */}
        {/* <FaArrowRightLong className={styles.arrow} size={42.5} /> */}
        <h1 className={styles.headline}>Skal jeg lave<br/>din næste <strong>PWA</strong>?</h1>
        <h3>Kontakt mig for mere information.</h3>
        <p>Mail: <a href="mailto:tomasrieck@gmail.com">tomasrieck@gmail.com</a></p>
      </div>

      <hr id="divider" />

      <h3>Progressive Web Apps (PWA)</h3>
      <div className={styles.description}>
        <p>En PWA er en moderne app, der installeres direkte fra browseren – uden brug af App Store – og fungerer som en helt almindelig mobilapp. Den starter hurtigt, virker offline og føles naturlig for brugeren.</p>
        <p>Med <strong>server side rendering</strong> (SSR) vises altid den nyeste version af siden med det samme, hvilket giver både en bedre brugeroplevelse og højere synlighed i søgemaskiner.</p>
      </div>

      <h3 className={styles.subheadline}>Fordele ved en PWA</h3>
      <CheckList
        items={[
          "Installeres direkte fra browseren",
          "Fungerer offline",
          "Lynhurtig opstart og smidig brugeroplevelse",
          "Push-notifikationer",
          "Altid opdateret indhold",
          "Mere synlighed i søgemaskiner (SEO)",
          "Mindre databrug og bedre performance",
          "Fungerer på tværs af enheder",
        ]}
      />
    </main>
  );
}