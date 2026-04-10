"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/apiClient";
import { useAudioGuide } from "@/hooks/useAudioGuide";
import { useToast } from "@/hooks/use-toast";
import { SectionHeader } from "@/components/mobile/SectionHeader";
import { MobileCard } from "@/components/mobile/MobileCard";
import { TabSwitcher } from "@/components/mobile/TabSwitcher";
import { useLang } from "@/lib/languageContext";

function normalizeConfidence(data: Record<string, unknown>) {
  const score = data.confidence_score;
  if (typeof score === "number" && Number.isFinite(score)) {
    if (score > 1 && score <= 100) return score / 100;
    return Math.max(0, Math.min(1, score));
  }

  const raw = data.confidence;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw > 1 && raw <= 100) return raw / 100;
    return Math.max(0, Math.min(1, raw));
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim().toLowerCase();
    const parsed = Number(trimmed.replace("%", ""));
    if (Number.isFinite(parsed)) {
      if (parsed > 1 && parsed <= 100) return parsed / 100;
      return Math.max(0, Math.min(1, parsed));
    }

    if (trimmed === "high") return 0.85;
    if (trimmed === "medium") return 0.6;
    if (trimmed === "low") return 0.3;
  }

  return 0;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 600;
        const scale = Math.min(1, max / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = String(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function toRawBase64(dataUrlOrRaw: string) {
  if (dataUrlOrRaw.includes(",")) {
    return dataUrlOrRaw.split(",")[1] ?? dataUrlOrRaw;
  }
  return dataUrlOrRaw;
}

type RecognitionResult = {
  name: string;
  location?: string;
  description?: string;
  confidence: number;
  tags: string[];
};

export function RecognitionScreen() {
  const [mode, setMode] = useState("upload");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const toast = useToast();
  const { speak } = useAudioGuide();
  const { t, lang } = useLang();

  const runRecognition = async (imageDataUrlOrRaw: string, filename: string) => {
    setLoading(true);
    try {
      const image_b64 = toRawBase64(imageDataUrlOrRaw);
      const res = await api.recognize(image_b64, filename);
      const data = res.data ?? {};
      const confidence = normalizeConfidence(data);

      const next: RecognitionResult = {
        name: (data.monument_name as string) ?? (data.name as string) ?? "Unknown Monument",
        location: (data.location as string) ?? undefined,
        description: (data.brief_description as string) ?? (data.reasoning as string) ?? undefined,
        confidence,
        tags:
          Array.isArray(data.key_identifiers) && data.key_identifiers.length > 0
            ? (data.key_identifiers as string[])
            : data.is_unknown
              ? ["needs-clearer-image"]
              : ["heritage", "architecture"],
      };

      setResult(next);
      speak(
        lang === "hi"
          ? `यह ${next.name} लगता है। विश्वसनीयता ${Math.round(next.confidence * 100)} प्रतिशत।`
          : `This appears to be ${next.name}. Confidence ${Math.round(next.confidence * 100)} percent.`,
      );
    } catch {
      toast.error(lang === "hi" ? "रिकग्निशन सेवा उपलब्ध नहीं है" : "Recognition service unavailable");
    } finally {
      setLoading(false);
    }
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageData = await compressImage(file);
    await runRecognition(imageData, file.name);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch {
      toast.error(lang === "hi" ? "कैमरा एक्सेस अस्वीकृत या अनुपलब्ध है।" : "Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraOn(false);
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = Math.round((video.videoHeight / video.videoWidth) * 600) || 338;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg", 0.85);
    await runRecognition(imageData, "camera-capture.jpg");
  };

  useEffect(() => {
    if (mode !== "camera" && cameraOn) {
      stopCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const color = (c: number) =>
    c >= 0.75 ? "text-emerald-400" : c >= 0.4 ? "text-amber-400" : "text-red-400";

  return (
    <section className={`space-y-4 ${lang === "hi" ? "lang-hi" : ""}`}>
      <SectionHeader
        title={t("recognize")}
        subtitle={lang === "hi" ? "एकीकृत अनुभव में अपलोड या कैमरा कैप्चर" : "Upload or camera capture in one unified experience"}
      />

      <TabSwitcher
        items={[
          { value: "upload", label: t("upload") },
          { value: "camera", label: t("camera") },
        ]}
        value={mode}
        onValueChange={setMode}
      />

      {mode === "upload" ? (
        <label className="flex h-44 cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/25 bg-[var(--bg-card)]/60 p-4 text-center">
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          <span className="text-sm">{loading ? t("processingImage") : t("tapToUpload")}</span>
        </label>
      ) : (
        <MobileCard>
          {cameraOn ? (
            <div className="space-y-3">
              <video ref={videoRef} autoPlay playsInline muted className="h-56 w-full rounded-xl object-cover" />
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="min-h-[44px] rounded-xl bg-gold px-3 font-semibold text-black"
                  onClick={captureFromCamera}
                  disabled={loading}
                >
                  {loading ? t("analyzing") : t("capture")}
                </button>
                <button className="min-h-[44px] rounded-xl bg-white/10 px-3" onClick={stopCamera}>
                  {t("stopCamera")}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-cream/80">
                {lang === "hi"
                  ? "स्मारक विवरण स्कैन करने और तुरंत रिकग्निशन चलाने के लिए रियर कैमरा उपयोग करें।"
                  : "Use rear camera to scan monument details and run recognition instantly."}
              </p>
              <button className="min-h-[44px] rounded-xl bg-teal px-4 font-semibold text-black" onClick={startCamera}>
                {t("startCamera")}
              </button>
            </div>
          )}
        </MobileCard>
      )}

      {result && (
        <MobileCard>
          <h2 className="text-xl font-semibold">{result.name}</h2>
          {result.location ? <p className="text-sm text-cream/75">{result.location}</p> : null}
          <p className={`text-sm ${color(result.confidence)}`}>
            {t("confidence")}: {Math.round(result.confidence * 100)}%
          </p>
          {result.description ? <p className="mt-1 text-sm text-cream/75">{result.description}</p> : null}
          <div className="mt-2 flex flex-wrap gap-2">
            {result.tags.map((t) => (
              <span key={t} className="rounded-full bg-teal/20 px-2 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        </MobileCard>
      )}
    </section>
  );
}
