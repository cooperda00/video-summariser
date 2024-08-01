import "./globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}
