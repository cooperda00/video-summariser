import Head from "next/head";
import { Inter } from "next/font/google";
import styles from "./Home.module.css";
import { FormEvent, useState } from "react";
import axios, { AxiosError } from "axios";
import ReactMarkdown from "react-markdown";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { useForm, SubmitHandler } from "react-hook-form";
import { isValidYoutubeURL } from "@/lib";
import { AppHead } from "@/components/AppHead";
import { Toast, ToastContent } from "@/components/Toast";

type Input = {
  url: string;
};

export default function Home() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>();

  const [transcript, setTranscript] = useState<string[]>([]);
  const [summary, setSummary] = useState<string>("");
  const [toastOpen, setToastOpen] = useState(false);
  const [toastContent, setToastContent] = useState<ToastContent>({
    title: "",
    description: "",
  });

  const triggerToast = (toastContent: ToastContent) => {
    setToastContent(toastContent);
    setToastOpen(true);
  };

  const onSubmit: SubmitHandler<Input> = async ({ url }) => {
    try {
      const res = await axios.post("/api/getSummary", { url: url });

      if (res.data.transcript) {
        setTranscript(res.data.transcript);
      }

      if (res.data.summary) {
        setSummary(res.data.summary);
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        triggerToast({
          title: "❌ Failure",
          description: error.response?.data.error,
        });
      }
    }
  };

  const handleSendEmail = async () => {
    if (!summary) return;

    try {
      await axios.post("/api/emailMe", { summary });

      triggerToast({
        title: "✅ Success",
        description: "Your summary has been sent successfully",
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        triggerToast({
          title: "❌ Failure",
          description: error.response?.data.error,
        });
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
        triggerToast({
          title: "❌ Failure",
          description: error.response?.data.error,
        });
      }
    }
  };

  return (
    <>
      <AppHead />

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <UserButton />

        <div className={styles.main}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <label htmlFor="videoURL">Video URL</label>

            <input
              id="videoURL"
              {...register("url", {
                validate: (str) => {
                  const { isValid } = isValidYoutubeURL(str);
                  return isValid || "Please enter a valid YouTube URL.";
                },
              })}
              placeholder="http://www.youtube.com/watch?v=-wtIMTCHWuI"
            />

            {errors.url && (
              <span className={styles.error}>{errors.url.message}</span>
            )}

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
        </div>

        <Toast {...toastContent} open={toastOpen} onOpenChange={setToastOpen} />
      </SignedIn>
    </>
  );
}
