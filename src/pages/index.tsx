import styles from "./Home.module.css";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import ReactMarkdown from "react-markdown";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import { useForm, SubmitHandler } from "react-hook-form";
import { isValidYoutubeURL } from "@/lib";
import { AppHead } from "@/components/AppHead";
import { Toast, ToastContent } from "@/components/Toast";
import { PiFilePdf, PiSignOutFill } from "react-icons/pi";
import { TbMailShare } from "react-icons/tb";
import download from "downloadjs";
import { CgTranscript } from "react-icons/cg";
import { Modal } from "@/components/Modal";

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
      const response = await axios.post("/api/downloadAsPdf", { summary });
      download(response.data.url, "summary.pdf", "application/pdf");
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

  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <AppHead />

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>

      <SignedIn>
        <SignOutButton>
          <div className={styles.signOut}>
            <PiSignOutFill className={styles.signOutIcon} />
          </div>
        </SignOutButton>

        <div className={styles.main}>
          <section className={styles.controls}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <label htmlFor="videoURL">Youtube URL</label>

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
                {!summaryLoading ? "Generate summary" : "Loading..."}
              </button>
            </form>

            <div>
              <button onClick={handleSendEmail} disabled={!summary}>
                <TbMailShare className={styles.icon} />
                {!emailLoading ? "Email this to me" : "Loading..."}
              </button>

              <button onClick={handleDownloadAsPdf} disabled={!summary}>
                <PiFilePdf className={styles.icon} />
                {!pdfLoading ? "Download as PDF" : "Loading..."}
              </button>
            </div>
          </section>

          {summary && transcript.length && (
            <>
              {/* Replace with border-bottom */}
              <div className={styles.divider} />

              <section className={styles.summary}>
                <header>
                  <h2>
                    <em>Summary</em>
                  </h2>
                  <button
                    aria-label="View transcript"
                    disabled={!transcript}
                    onClick={() => setModalOpen(true)}
                  >
                    <CgTranscript />
                  </button>
                </header>

                <div>
                  <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
              </section>
            </>
          )}
        </div>

        <Modal open={modalOpen} onOpenChange={setModalOpen}>
          <section className={styles.transcript}>
            <header>
              <h2>
                <em>Transcript</em>
              </h2>
            </header>

            <div>
              {transcript.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        </Modal>

        <Toast {...toastContent} open={toastOpen} onOpenChange={setToastOpen} />
      </SignedIn>
    </>
  );
}
