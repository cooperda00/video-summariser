import styles from "./Home.module.css";
import { useState } from "react";
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
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const triggerToast = (toastContent: ToastContent) => {
    setToastContent(toastContent);
    setToastOpen(true);
  };

  const onSubmit: SubmitHandler<Input> = async ({ url }) => {
    setSummaryLoading(true);

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
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!summary) return;

    setEmailLoading(true);

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
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDownloadAsPdf = async () => {
    if (!summary) return;

    setPdfLoading(true);

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
    } finally {
      setPdfLoading(false);
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

            <button type="submit" disabled={summaryLoading}>
              {!summaryLoading ? "Generate" : "Loading..."}
            </button>
          </form>

          <section>
            {transcript.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </section>

          <section>
            <ReactMarkdown>{summary}</ReactMarkdown>

            <button onClick={handleSendEmail} disabled={!summary}>
              {!emailLoading ? "Email this to me" : "Loading..."}
            </button>

            <button onClick={handleDownloadAsPdf} disabled={!summary}>
              {!pdfLoading ? "Download as PDF" : "Loading..."}
            </button>
          </section>
        </div>

        <Toast {...toastContent} open={toastOpen} onOpenChange={setToastOpen} />
      </SignedIn>
    </>
  );
}
