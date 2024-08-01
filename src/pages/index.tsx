import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "./Home.module.css";
import { FormEvent, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [input, setInput] = useState("");

  const [transcript, setTranscript] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/getSummary", { url: input });

      if (res.data.transcript) {
        setTranscript(res.data.transcript);
      }

      if (res.data.summary) {
        setSummary(res.data.summary);
      }
    } catch (error) {}
  };

  return (
    <>
      <Head>
        <title>Video Summariser</title>
        <meta
          name="description"
          content="Paste a youtube link and get a text summary - perfect for when you don't have 3 hours to listen to a podcast"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <main className={`${styles.main} ${inter.className}`}>
          <form onSubmit={handleSubmit}>
            <label htmlFor="videoURL">Video URL</label>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <button type="submit">Submit</button>
          </form>

          <section>
            {transcript.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>

          <section>
            <ReactMarkdown>{summary}</ReactMarkdown>

            <button>Email this to me</button>
            <button>Download as PDF</button>
          </section>
        </main>
      </SignedIn>
    </>
  );
}
