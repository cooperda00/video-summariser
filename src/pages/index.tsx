import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "./Home.module.css";
import { FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
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
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data.error); // TODO : error toast
      }
    }
  };

  const handleSendEmail = async () => {
    if (!summary) return;

    try {
      await axios.post("/api/emailMe", { summary });

      // TODO : success toast
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data.error); // TODO : error toast
      }
    }
  };

  const handleDownloadAsPdf = async () => {
    if (!summary) return;

    try {
      const response = await axios.post(
        "/api/downloadAsPdf",
        { summary },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "summary.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.log(error.response?.data.error); // TODO : error toast
      }
    }
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

            <button onClick={handleSendEmail} disabled={!summary}>
              Email this to me
            </button>

            <button onClick={handleDownloadAsPdf} disabled={!summary}>
              Download as PDF
            </button>
          </section>
        </main>
      </SignedIn>
    </>
  );
}
