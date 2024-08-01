import { SignIn } from "@clerk/nextjs";
import styles from "./SignIn.module.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Page() {
  return (
    <main className={`${styles.signIn} ${inter.className}`}>
      <SignIn appearance={{ elements: { footer: { display: "none" } } }} />
    </main>
  );
}
