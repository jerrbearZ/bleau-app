"use client";

import { useReducer, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, Sparkles, X, Download, RotateCcw } from "lucide-react";
import { STYLE_OPTIONS, API_ENDPOINTS, UPLOAD_CONFIG } from "@/lib/constants";
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
  selectedStyle: STYLE_OPTIONS[0].value,
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
      return { ...state, isTransforming: true, error: null, transformedUrl: null, description: null };
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
      return { ...state, selectedStyle: action.payload, transformedUrl: null, description: null };
    case "RESET":
      return initialState;
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export default function ImageUploader() {
  const [state, dispatch] = useReducer(uploaderReducer, initialState);

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
        const percent = Math.round((e.loaded / e.total) * 100);
        dispatch({ type: "SET_UPLOAD_PROGRESS", payload: percent });
      }
    };

    xhr.onload = () => {
      try {
        const result: UploadResponse = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && !result.error) {
          if (result.url) {
            dispatch({ type: "UPLOAD_SUCCESS", payload: result.url });
          }
        } else {
          dispatch({
            type: "UPLOAD_ERROR",
            payload: result.error || "Upload failed",
          });
        }
      } catch {
        dispatch({
          type: "UPLOAD_ERROR",
          payload: "Upload failed: invalid response",
        });
      }
    };

    xhr.onerror = () => {
      dispatch({
        type: "UPLOAD_ERROR",
        payload: "Upload failed: network error",
      });
    };

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

    dispatch({ type: "START_TRANSFORM" });

    try {
      const response = await fetch(API_ENDPOINTS.transform, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: state.originalUrl,
          style: state.selectedStyle,
        }),
      });

      const result: TransformResponse = await response.json();

      if (!response.ok || result.error) {
        dispatch({
          type: "TRANSFORM_ERROR",
          payload: result.error || "Transform failed",
        });
        return;
      }

      dispatch({
        type: "TRANSFORM_SUCCESS",
        payload: {
          url: result.transformedUrl,
          description: result.description,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Transform failed";
      dispatch({ type: "TRANSFORM_ERROR", payload: message });
    }
  }, [state.originalUrl, state.selectedStyle]);

  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const handleDownload = useCallback(() => {
    if (!state.transformedUrl) return;
    const link = document.createElement("a");
    link.href = state.transformedUrl;
    link.download = `bleau-pet-portrait-${state.selectedStyle}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.transformedUrl, state.selectedStyle]);

  const selectedStyleOption = STYLE_OPTIONS.find(
    (s) => s.value === state.selectedStyle
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Error Message */}
      {state.error && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{state.error}</span>
          <button
            onClick={() => dispatch({ type: "CLEAR_ERROR" })}
            aria-label="Dismiss error"
            className="ml-4 text-red-400 transition-colors hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Upload Area */}
      {!state.originalUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative overflow-hidden rounded-3xl border-2 border-dashed p-16
            transition-all duration-300 ease-in-out
            ${
              state.isDragging
                ? "scale-[1.01] border-black bg-gray-50"
                : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50"
            }
            ${state.isUploading ? "pointer-events-none" : "cursor-pointer"}
          `}
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
                  Uploading your photo&hellip;
                </p>
                <div
                  role="progressbar"
                  aria-valuenow={state.uploadProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Upload progress"
                  className="h-1 w-48 overflow-hidden rounded-full bg-gray-200"
                >
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300 ease-out"
                    style={{ width: `${state.uploadProgress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 text-6xl">🐾</div>
                <Upload className="mb-6 h-8 w-8 text-gray-300" />
                <p className="mb-2 text-xl font-semibold text-black">
                  Upload your pet&apos;s photo
                </p>
                <p className="mb-4 text-sm text-gray-400">
                  Drag and drop or click to browse
                </p>
                <p className="text-xs text-gray-300">
                  {UPLOAD_CONFIG.allowedExtensions.join(", ")} &middot; up to{" "}
                  {UPLOAD_CONFIG.maxSizeMB}MB &middot; clear, well-lit photos
                  work best
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Uploaded — Style Selection & Generation */}
      {state.originalUrl && (
        <div className="space-y-8">
          {/* Style Grid */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-black">
                Choose a style
              </h2>
              <button
                onClick={handleReset}
                disabled={state.isTransforming}
                className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-black disabled:opacity-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Start over
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {STYLE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    dispatch({ type: "SET_STYLE", payload: option.value })
                  }
                  disabled={state.isTransforming}
                  className={`group relative rounded-2xl border-2 px-4 py-4 text-left transition-all duration-200 ${
                    state.selectedStyle === option.value
                      ? "border-black bg-black text-white shadow-lg"
                      : "border-gray-100 bg-white text-gray-700 hover:border-gray-300 hover:shadow-sm"
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

          {/* Generate Button */}
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
                AI is studying your pet&apos;s features — this takes 15-30s
              </p>
            )}
          </div>

          {/* Images */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Original */}
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Your Pet
              </p>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                <Image
                  src={state.originalUrl}
                  alt="Your pet"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Result */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Portrait
                </p>
                {state.transformedUrl && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-xs font-medium text-black transition-colors hover:text-gray-600"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                )}
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 shadow-sm">
                {state.isTransforming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white">
                    <div className="relative mb-6">
                      <Loader2 className="h-10 w-10 animate-spin text-black" />
                    </div>
                    <p className="text-sm font-medium text-black">
                      Painting your pet&hellip;
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Preserving every unique detail
                    </p>
                  </div>
                ) : state.transformedUrl ? (
                  <Image
                    src={state.transformedUrl}
                    alt="Pet portrait"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : state.description ? (
                  <div className="absolute inset-0 overflow-y-auto p-6">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                      {state.description}
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl mb-3">
                        {selectedStyleOption?.emoji}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedStyleOption?.label}
                      </p>
                      <p className="mt-1 text-xs text-gray-300">
                        Click generate to create
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
