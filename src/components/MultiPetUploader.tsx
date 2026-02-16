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
  Plus,
} from "lucide-react";
import { UPLOAD_CONFIG, API_ENDPOINTS } from "@/lib/constants";
import { MULTI_PET_STYLE_OPTIONS } from "@/lib/multi-pet-constants";
import ShareButton from "./ShareButton";
import type { UploadResponse, TransformResponse } from "@/types";

interface MultiPetState {
  petUrls: string[];
  selectedStyle: string;
  isUploading: boolean;
  uploadProgress: number;
  isTransforming: boolean;
  transformedUrl: string | null;
  description: string | null;
  error: string | null;
}

const initialState: MultiPetState = {
  petUrls: [],
  selectedStyle: MULTI_PET_STYLE_OPTIONS[0].value,
  isUploading: false,
  uploadProgress: 0,
  isTransforming: false,
  transformedUrl: null,
  description: null,
  error: null,
};

const MAX_PETS = 5;

export default function MultiPetUploader() {
  const [state, setState] = useState<MultiPetState>(initialState);

  const uploadFile = useCallback((file: File) => {
    setState((s) => ({ ...s, isUploading: true, uploadProgress: 0, error: null }));

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setState((s) => ({
          ...s,
          uploadProgress: Math.round((e.loaded / e.total) * 100),
        }));
      }
    };

    xhr.onload = () => {
      try {
        const result: UploadResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && !result.error && result.url) {
          setState((s) => ({
            ...s,
            isUploading: false,
            uploadProgress: 100,
            petUrls: [...s.petUrls, result.url!],
          }));
        } else {
          setState((s) => ({
            ...s,
            isUploading: false,
            error: result.error || "Upload failed",
          }));
        }
      } catch {
        setState((s) => ({ ...s, isUploading: false, error: "Upload failed" }));
      }
    };

    xhr.onerror = () => {
      setState((s) => ({ ...s, isUploading: false, error: "Network error" }));
    };

    xhr.open("POST", API_ENDPOINTS.upload);
    xhr.send(formData);
  }, []);

  const removePet = useCallback((index: number) => {
    setState((s) => ({
      ...s,
      petUrls: s.petUrls.filter((_, i) => i !== index),
      transformedUrl: null,
      description: null,
    }));
  }, []);

  const handleTransform = useCallback(async () => {
    if (state.petUrls.length < 2) return;

    setState((s) => ({
      ...s,
      isTransforming: true,
      error: null,
      transformedUrl: null,
      description: null,
    }));

    try {
      const response = await fetch("/api/multi-pet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          petImageUrls: state.petUrls,
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

      setState((s) => ({
        ...s,
        isTransforming: false,
        transformedUrl: result.transformedUrl || null,
        description: result.description || null,
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        isTransforming: false,
        error: err instanceof Error ? err.message : "Transform failed",
      }));
    }
  }, [state.petUrls, state.selectedStyle]);

  const handleReset = useCallback(() => setState(initialState), []);

  const handleDownload = useCallback(() => {
    if (!state.transformedUrl) return;
    const link = document.createElement("a");
    link.href = state.transformedUrl;
    link.download = `bleau-multi-pet-${state.selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.transformedUrl, state.selectedStyle]);

  const canAddMore = state.petUrls.length < MAX_PETS && !state.isUploading;
  const canGenerate = state.petUrls.length >= 2;
  const selectedStyleOption = MULTI_PET_STYLE_OPTIONS.find(
    (s) => s.value === state.selectedStyle
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Error */}
      {state.error && (
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <span>{state.error}</span>
          <button onClick={() => setState((s) => ({ ...s, error: null }))}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Pet Grid — Upload Area */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">
            Your pets ({state.petUrls.length}/{MAX_PETS})
          </h2>
          {state.petUrls.length > 0 && (
            <button
              onClick={handleReset}
              disabled={state.isTransforming}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start over
            </button>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {/* Uploaded pets */}
          {state.petUrls.map((url, i) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
            >
              <Image src={url} alt={`Pet ${i + 1}`} fill className="object-cover" />
              {!state.isTransforming && (
                <button
                  onClick={() => removePet(i)}
                  className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
              <span className="absolute bottom-1.5 left-1.5 rounded-lg bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
                Pet {i + 1}
              </span>
            </div>
          ))}

          {/* Add more button */}
          {canAddMore && (
            <div className="relative flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white transition-all hover:border-gray-400 hover:bg-gray-50/50">
              <input
                type="file"
                accept={UPLOAD_CONFIG.allowedTypes.join(",")}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadFile(file);
                }}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={state.isUploading || state.isTransforming}
              />
              {state.isUploading ? (
                <>
                  <Loader2 className="mb-1 h-6 w-6 animate-spin text-black" />
                  <p className="text-[10px] text-gray-500">{state.uploadProgress}%</p>
                </>
              ) : (
                <>
                  <Plus className="mb-1 h-6 w-6 text-gray-300" />
                  <p className="text-xs font-medium text-gray-400">Add pet</p>
                </>
              )}
            </div>
          )}
        </div>

        {state.petUrls.length === 0 && (
          <p className="mt-3 text-center text-sm text-gray-400">
            Upload 2-5 pet photos to create a group portrait
          </p>
        )}
        {state.petUrls.length === 1 && (
          <p className="mt-3 text-center text-sm text-amber-600">
            Add at least one more pet to generate a group portrait
          </p>
        )}
      </div>

      {/* Style Selection */}
      {canGenerate && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-black">
              Choose a style
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MULTI_PET_STYLE_OPTIONS.map((option) => (
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
                  className={`rounded-2xl border-2 px-4 py-4 text-left transition-all ${
                    state.selectedStyle === option.value
                      ? "border-black bg-black text-white shadow-lg"
                      : "border-gray-100 bg-white text-gray-700 hover:border-gray-300"
                  } disabled:opacity-50`}
                >
                  <span className="mb-1 block text-lg">{option.emoji}</span>
                  <span className="block text-sm font-semibold">{option.label}</span>
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
              className="inline-flex items-center gap-2.5 rounded-2xl bg-black px-8 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg disabled:opacity-50"
            >
              {state.isTransforming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating group portrait&hellip;
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
                Analyzing {state.petUrls.length} pets and composing the scene — 30-60s
              </p>
            )}
          </div>

          {/* Result */}
          {(state.transformedUrl || state.isTransforming) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Group Portrait
                </p>
                {state.transformedUrl && (
                  <div className="flex items-center gap-3">
                    <ShareButton
                      imageUrl={state.transformedUrl}
                      title="Check out our pets' group portrait!"
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
                      Bringing your pets together&hellip;
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Matching {state.petUrls.length} identities in one scene
                    </p>
                  </div>
                ) : state.transformedUrl ? (
                  <>
                    <Image
                      src={state.transformedUrl}
                      alt="Group portrait"
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
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
