"use client";

import { useReducer, useCallback, useState } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  Heart,
  X,
  Download,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import ShareButton from "./ShareButton";
import { UPLOAD_CONFIG, API_ENDPOINTS } from "@/lib/constants";
import { MEMORIAL_STYLE_OPTIONS } from "@/lib/memorial-constants";
import { addWatermark, shouldWatermark } from "@/lib/watermark";
import { canGenerate, recordGeneration } from "@/lib/pricing";
import type {
  UploaderState,
  UploaderAction,
  UploadResponse,
  TransformResponse,
} from "@/types";

const initialState: UploaderState = {
  isDragging: false,
  isUploading: false,
  isTransforming: false,
  uploadProgress: 0,
  originalUrl: null,
  transformedUrl: null,
  description: null,
  selectedStyle: MEMORIAL_STYLE_OPTIONS[0].value,
  error: null,
};

function uploaderReducer(
  state: UploaderState,
  action: UploaderAction
): UploaderState {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload };
    case "START_UPLOAD":
      return {
        ...state,
        isUploading: true,
        uploadProgress: 0,
        error: null,
        transformedUrl: null,
        description: null,
      };
    case "SET_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        isUploading: false,
        uploadProgress: 100,
        originalUrl: action.payload,
      };
    case "UPLOAD_ERROR":
      return {
        ...state,
        isUploading: false,
        uploadProgress: 0,
        error: action.payload,
      };
    case "START_TRANSFORM":
      return {
        ...state,
        isTransforming: true,
        error: null,
        transformedUrl: null,
        description: null,
      };
    case "TRANSFORM_SUCCESS":
      return {
        ...state,
        isTransforming: false,
        transformedUrl: action.payload.url || null,
        description: action.payload.description || null,
      };
    case "TRANSFORM_ERROR":
      return { ...state, isTransforming: false, error: action.payload };
    case "SET_STYLE":
      return {
        ...state,
        selectedStyle: action.payload,
        transformedUrl: null,
        description: null,
      };
    case "RESET":
      return initialState;
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function MemorialUploader() {
  const [state, dispatch] = useReducer(uploaderReducer, initialState);
  const [petName, setPetName] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_DRAGGING", payload: true });
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dispatch({ type: "SET_DRAGGING", payload: false });
  }, []);

  const handleFileUpload = useCallback((file: File) => {
    dispatch({ type: "START_UPLOAD" });
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        dispatch({
          type: "SET_UPLOAD_PROGRESS",
          payload: Math.round((e.loaded / e.total) * 100),
        });
      }
    };
    xhr.onload = () => {
      try {
        const result: UploadResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && !result.error && result.url) {
          dispatch({ type: "UPLOAD_SUCCESS", payload: result.url });
        } else {
          dispatch({ type: "UPLOAD_ERROR", payload: result.error || "Upload failed" });
        }
      } catch {
        dispatch({ type: "UPLOAD_ERROR", payload: "Upload failed: invalid response" });
      }
    };
    xhr.onerror = () => dispatch({ type: "UPLOAD_ERROR", payload: "Upload failed: network error" });
    xhr.open("POST", API_ENDPOINTS.upload);
    xhr.send(formData);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dispatch({ type: "SET_DRAGGING", payload: false });
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload]
  );

  const handleTransform = useCallback(async () => {
    if (!state.originalUrl) return;

    const usage = canGenerate();
    if (!usage.allowed) {
      dispatch({ type: "TRANSFORM_ERROR", payload: usage.reason || "Daily limit reached." });
      return;
    }

    dispatch({ type: "START_TRANSFORM" });
    try {
      const response = await fetch("/api/memorial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: state.originalUrl,
          style: state.selectedStyle,
          petName: petName.trim() || undefined,
        }),
      });
      const result: TransformResponse = await response.json();
      if (!response.ok || result.error) {
        dispatch({ type: "TRANSFORM_ERROR", payload: result.error || "Transform failed" });
        return;
      }

      recordGeneration();

      let finalUrl = result.transformedUrl;
      if (finalUrl && shouldWatermark()) {
        finalUrl = await addWatermark(finalUrl);
      }

      dispatch({
        type: "TRANSFORM_SUCCESS",
        payload: { url: finalUrl, description: result.description },
      });
    } catch (err) {
      dispatch({
        type: "TRANSFORM_ERROR",
        payload: err instanceof Error ? err.message : "Transform failed",
      });
    }
  }, [state.originalUrl, state.selectedStyle, petName]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
    setPetName("");
  }, []);

  const handleDownload = useCallback(() => {
    if (!state.transformedUrl) return;
    const name = petName.trim() || "beloved-pet";
    const link = document.createElement("a");
    link.href = state.transformedUrl;
    link.download = `bleau-memorial-${name}-${state.selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.transformedUrl, state.selectedStyle, petName]);

  const selectedStyleOption = MEMORIAL_STYLE_OPTIONS.find(
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
            onClick={() => dispatch({ type: "CLEAR_ERROR" })}
            className="ml-4 text-red-400 hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload */}
      {!state.originalUrl && (
        <div className="space-y-6">
          {/* Pet Name */}
          <div className="mx-auto max-w-md">
            <label
              htmlFor="pet-name"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Their name <span className="text-gray-300">(optional)</span>
            </label>
            <input
              id="pet-name"
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              placeholder="What was their name?"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-base text-black placeholder-gray-300 outline-none transition-all focus:border-black"
            />
          </div>

          {/* Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-16 transition-all duration-300 ${
              state.isDragging
                ? "scale-[1.01] border-black bg-gray-50"
                : "border-gray-200 bg-white hover:border-gray-400"
            } ${state.isUploading ? "pointer-events-none" : "cursor-pointer"}`}
          >
            <input
              type="file"
              accept={UPLOAD_CONFIG.allowedTypes.join(",")}
              onChange={handleFileSelect}
              aria-label="Upload a photo of your pet"
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={state.isUploading}
            />
            <div className="flex flex-col items-center justify-center text-center">
              {state.isUploading ? (
                <>
                  <Loader2 className="mb-6 h-10 w-10 animate-spin text-black" />
                  <p className="mb-4 text-lg font-medium text-black">
                    Uploading&hellip;
                  </p>
                  <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-black transition-all duration-300"
                      style={{ width: `${state.uploadProgress}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 text-6xl">🕊️</div>
                  <Upload className="mb-6 h-8 w-8 text-gray-300" />
                  <p className="mb-2 text-xl font-semibold text-black">
                    Upload their favorite photo
                  </p>
                  <p className="text-sm text-gray-400">
                    Choose the photo that captures them best
                  </p>
                  <p className="mt-2 text-xs text-gray-300">
                    {UPLOAD_CONFIG.allowedExtensions.join(", ")} &middot; up to{" "}
                    {UPLOAD_CONFIG.maxSizeMB}MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Style Selection & Generation */}
      {state.originalUrl && (
        <div className="space-y-8">
          {/* Name display */}
          {petName.trim() && (
            <p className="text-center text-lg font-medium text-gray-600">
              In loving memory of{" "}
              <span className="font-bold text-black">{petName.trim()}</span>{" "}
              💛
            </p>
          )}

          {/* Style Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">
                Choose a tribute style
              </h2>
              <button
                onClick={handleReset}
                disabled={state.isTransforming}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-black disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start over
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {MEMORIAL_STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    dispatch({ type: "SET_STYLE", payload: option.value })
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
                  Creating tribute&hellip;
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" />
                  Create {selectedStyleOption?.label || "Tribute"}
                </>
              )}
            </button>
            {state.isTransforming && (
              <p className="text-xs text-gray-400">
                Creating something beautiful for{" "}
                {petName.trim() || "your pet"} — 15-30s
              </p>
            )}
          </div>

          {/* Images */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {petName.trim() || "Your Pet"}
              </p>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                <Image
                  src={state.originalUrl}
                  alt={petName.trim() || "Your pet"}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Tribute
                </p>
                {state.transformedUrl && (
                  <div className="flex items-center gap-3">
                    <ShareButton
                      imageUrl={state.transformedUrl}
                      title="A tribute to my beloved pet — made with Bleau"
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
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                {state.isTransforming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <Loader2 className="mb-6 h-10 w-10 animate-spin text-black" />
                    <p className="text-sm font-medium text-black">
                      Creating a tribute for{" "}
                      {petName.trim() || "your pet"}&hellip;
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Every detail matters
                    </p>
                  </div>
                ) : state.transformedUrl ? (
                  <>
                    <Image
                      src={state.transformedUrl}
                      alt="Memorial portrait"
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
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="mb-3 text-3xl">
                        {selectedStyleOption?.emoji}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedStyleOption?.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-300">
                        Click create to begin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
