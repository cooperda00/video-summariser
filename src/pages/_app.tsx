import "./globals.css";
import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { ToastProvider } from "@/components/Toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider>
      <ToastProvider>
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      </ToastProvider>
    </ClerkProvider>
  );
}
