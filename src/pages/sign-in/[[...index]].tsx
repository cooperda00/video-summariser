import { SignIn } from "@clerk/nextjs";
import styles from "./SignIn.module.css";
import { AppHead } from "@/components/AppHead";

export default function Page() {
  return (
    <>
      <AppHead />
      <div className={styles.signIn}>
        <SignIn appearance={{ elements: { footer: { display: "none" } } }} />
      </div>
    </>
  );
}
