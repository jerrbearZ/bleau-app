"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  Sparkles,
  X,
  Download,
  RotateCcw,
  RefreshCw,
  User,
} from "lucide-react";
import { UPLOAD_CONFIG, API_ENDPOINTS } from "@/lib/constants";
import ShareButton from "./ShareButton";
import { addWatermark, shouldWatermark } from "@/lib/watermark";
import { canGenerate, recordGeneration } from "@/lib/pricing";
import { TOGETHER_STYLE_OPTIONS } from "@/lib/together-constants";
import type { UploadResponse, TransformResponse } from "@/types";

type UploadTarget = "person" | "pet";

interface TogetherState {
  personUrl: string | null;
  petUrl: string | null;
  selectedStyle: string;
  isUploading: UploadTarget | null;
  uploadProgress: number;
  isTransforming: boolean;
  transformedUrl: string | null;
  description: string | null;
  error: string | null;
}

const initialState: TogetherState = {
  personUrl: null,
  petUrl: null,
  selectedStyle: TOGETHER_STYLE_OPTIONS[0].value,
  isUploading: null,
  uploadProgress: 0,
  isTransforming: false,
  transformedUrl: null,
  description: null,
  error: null,
};

function UploadBox({
  label,
  emoji,
  hint,
  imageUrl,
  isUploading,
  uploadProgress,
  onFileSelect,
  onClear,
  disabled,
}: {
  label: string;
  emoji: string;
  hint: string;
  imageUrl: string | null;
  isUploading: boolean;
  uploadProgress: number;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
    },
    [onFileSelect]
  );

  if (imageUrl) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
        <Image src={imageUrl} alt={label} fill className="object-cover" />
        {!disabled && (
          <button
            onClick={onClear}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${
        isUploading
          ? "border-gray-300 bg-gray-50"
          : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50"
      } ${disabled ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
    >
      <input
        type="file"
        accept={UPLOAD_CONFIG.allowedTypes.join(",")}
        onChange={handleChange}
        aria-label={`Upload ${label}`}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        disabled={disabled || isUploading}
      />
      {isUploading ? (
        <>
          <Loader2 className="mb-3 h-8 w-8 animate-spin text-black" />
          <p className="text-sm font-medium text-black">Uploading&hellip;</p>
          <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-black transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <span className="mb-2 text-3xl">{emoji}</span>
          <Upload className="mb-2 h-6 w-6 text-gray-300" />
          <p className="text-sm font-medium text-black">{label}</p>
          <p className="mt-1 text-xs text-gray-400">{hint}</p>
        </>
      )}
    </div>
  );
}

export default function TogetherUploader() {
  const [state, setState] = useState<TogetherState>(initialState);

  const uploadFile = useCallback(
    (file: File, target: UploadTarget) => {
      setState((s) => ({
        ...s,
        isUploading: target,
        uploadProgress: 0,
        error: null,
      }));

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setState((s) => ({ ...s, uploadProgress: percent }));
        }
      };

      xhr.onload = () => {
        try {
          const result: UploadResponse = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && !result.error && result.url) {
            setState((s) => ({
              ...s,
              isUploading: null,
              uploadProgress: 100,
              [target === "person" ? "personUrl" : "petUrl"]: result.url,
            }));
          } else {
            setState((s) => ({
              ...s,
              isUploading: null,
              uploadProgress: 0,
              error: result.error || "Upload failed",
            }));
          }
        } catch {
          setState((s) => ({
            ...s,
            isUploading: null,
            uploadProgress: 0,
            error: "Upload failed: invalid response",
          }));
        }
      };

      xhr.onerror = () => {
        setState((s) => ({
          ...s,
          isUploading: null,
          uploadProgress: 0,
          error: "Upload failed: network error",
        }));
      };

      xhr.open("POST", API_ENDPOINTS.upload);
      xhr.send(formData);
    },
    []
  );

  const handleTransform = useCallback(async () => {
    if (!state.personUrl || !state.petUrl) return;

    const usage = canGenerate();
    if (!usage.allowed) {
      setState((s) => ({ ...s, error: usage.reason || "Daily limit reached." }));
      return;
    }

    setState((s) => ({
      ...s,
      isTransforming: true,
      error: null,
      transformedUrl: null,
      description: null,
    }));

    try {
      const response = await fetch("/api/together", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personImageUrl: state.personUrl,
          petImageUrl: state.petUrl,
          style: state.selectedStyle,
        }),
      });

      const result: TransformResponse = await response.json();

      if (!response.ok || result.error) {
        setState((s) => ({
          ...s,
          isTransforming: false,
          error: result.error || "Transform failed",
        }));
        return;
      }

      recordGeneration();

      let finalUrl = result.transformedUrl || null;
      if (finalUrl && shouldWatermark()) {
        finalUrl = await addWatermark(finalUrl);
      }

      setState((s) => ({
        ...s,
        isTransforming: false,
        transformedUrl: finalUrl,
        description: result.description || null,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transform failed";
      setState((s) => ({ ...s, isTransforming: false, error: message }));
    }
  }, [state.personUrl, state.petUrl, state.selectedStyle]);

  const handleReset = useCallback(() => {
    setState(initialState);
  }, []);

  const handleDownload = useCallback(() => {
    if (!state.transformedUrl) return;
    const link = document.createElement("a");
    link.href = state.transformedUrl;
    link.download = `bleau-together-${state.selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.transformedUrl, state.selectedStyle]);

  const bothUploaded = state.personUrl && state.petUrl;
  const selectedStyleOption = TOGETHER_STYLE_OPTIONS.find(
    (s) => s.value === state.selectedStyle
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Error */}
      {state.error && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{state.error}</span>
          <button
            onClick={() => setState((s) => ({ ...s, error: null }))}
            className="ml-4 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Areas — Side by Side */}
      {!bothUploaded && (
        <div className="grid grid-cols-2 gap-4">
          <UploadBox
            label="You"
            emoji="🧑"
            hint="Upload your photo"
            imageUrl={state.personUrl}
            isUploading={state.isUploading === "person"}
            uploadProgress={state.isUploading === "person" ? state.uploadProgress : 0}
            onFileSelect={(file) => uploadFile(file, "person")}
            onClear={() => setState((s) => ({ ...s, personUrl: null }))}
            disabled={state.isUploading !== null && state.isUploading !== "person"}
          />
          <UploadBox
            label="Your Pet"
            emoji="🐾"
            hint="Upload your pet's photo"
            imageUrl={state.petUrl}
            isUploading={state.isUploading === "pet"}
            uploadProgress={state.isUploading === "pet" ? state.uploadProgress : 0}
            onFileSelect={(file) => uploadFile(file, "pet")}
            onClear={() => setState((s) => ({ ...s, petUrl: null }))}
            disabled={state.isUploading !== null && state.isUploading !== "pet"}
          />
        </div>
      )}

      {/* Both uploaded — Style Selection & Generation */}
      {bothUploaded && (
        <div className="space-y-8">
          {/* Thumbnails + Reset */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image
                  src={state.personUrl!}
                  alt="You"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-white shadow-sm">
                <Image
                  src={state.petUrl!}
                  alt="Your pet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-black">
                Both photos uploaded
              </p>
              <p className="text-xs text-gray-400">
                Choose a style and generate your portrait together
              </p>
            </div>
            <button
              onClick={handleReset}
              disabled={state.isTransforming}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
          </div>

          {/* Style Grid */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-black">
              Choose a style
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TOGETHER_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    setState((s) => ({
                      ...s,
                      selectedStyle: option.value,
                      transformedUrl: null,
                      description: null,
                    }))
                  }
                  disabled={state.isTransforming}
                  className={`rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                    state.selectedStyle === option.value
                      ? "border-black bg-black text-white shadow-lg"
                      : "border-gray-100 bg-white text-gray-700 hover:border-gray-300"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="mb-1 block text-lg">{option.emoji}</span>
                  <span className="block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span
                    className={`mt-0.5 block text-xs ${
                      state.selectedStyle === option.value
                        ? "text-white/60"
                        : "text-gray-400"
                    }`}
                  >
                    {option.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleTransform}
              disabled={state.isTransforming}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-black px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.isTransforming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating your portrait&hellip;
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate {selectedStyleOption?.label || "Portrait"}
                </>
              )}
            </button>
            {state.isTransforming && (
              <p className="text-xs text-gray-400">
                Analyzing both subjects and composing the scene — 20-40s
              </p>
            )}
          </div>

          {/* Result */}
          {(state.transformedUrl ||
            state.description ||
            state.isTransforming) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Your Portrait Together
                </p>
                {state.transformedUrl && (
                  <div className="flex items-center gap-3">
                    <ShareButton
                      imageUrl={state.transformedUrl}
                      title="Check out our pet & owner AI portrait!"
                      variant="inline"
                    />
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1 text-xs font-medium text-black hover:text-gray-600"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </button>
                  </div>
                )}
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                {state.isTransforming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <Loader2 className="mb-6 h-10 w-10 animate-spin text-black" />
                    <p className="text-sm font-medium text-black">
                      Bringing you together&hellip;
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Matching both identities in one scene
                    </p>
                  </div>
                ) : state.transformedUrl ? (
                  <>
                    <Image
                      src={state.transformedUrl}
                      alt="Portrait together"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <button
                      onClick={handleTransform}
                      className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-xl bg-black/70 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm hover:bg-black"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Regenerate
                    </button>
                  </>
                ) : state.description ? (
                  <div className="absolute inset-0 overflow-y-auto p-6">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                      {state.description}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
