"use client";

import { useReducer, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, Sparkles, X, Download } from "lucide-react";
import { STYLE_OPTIONS, API_ENDPOINTS, UPLOAD_CONFIG } from "@/lib/constants";
import type { UploaderState, UploaderAction, UploadResponse, TransformResponse } from "@/types";

// Initial state
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

// Reducer for cleaner state management
function uploaderReducer(state: UploaderState, action: UploaderAction): UploaderState {
  switch (action.type) {
    case "SET_DRAGGING":
      return { ...state, isDragging: action.payload };
    case "START_UPLOAD":
      return { ...state, isUploading: true, uploadProgress: 0, error: null, transformedUrl: null, description: null };
    case "SET_UPLOAD_PROGRESS":
      return { ...state, uploadProgress: action.payload };
    case "UPLOAD_SUCCESS":
      return { ...state, isUploading: false, uploadProgress: 100, originalUrl: action.payload };
    case "UPLOAD_ERROR":
      return { ...state, isUploading: false, uploadProgress: 0, error: action.payload };
    case "START_TRANSFORM":
      return { ...state, isTransforming: true, error: null };
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
      return { ...state, selectedStyle: action.payload };
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
          dispatch({ type: "UPLOAD_ERROR", payload: result.error || "Upload failed" });
        }
      } catch {
        dispatch({ type: "UPLOAD_ERROR", payload: "Upload failed: invalid response" });
      }
    };

    xhr.onerror = () => {
      dispatch({ type: "UPLOAD_ERROR", payload: "Upload failed: network error" });
    };

    xhr.open("POST", API_ENDPOINTS.upload);
    xhr.send(formData);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dispatch({ type: "SET_DRAGGING", payload: false });
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileUpload(file);
      }
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
        dispatch({ type: "TRANSFORM_ERROR", payload: result.error || "Transform failed" });
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
    link.download = `transformed-${state.selectedStyle.replace(/\s+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [state.transformedUrl, state.selectedStyle]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error Message */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
          <span>{state.error}</span>
          <button
            onClick={() => dispatch({ type: "CLEAR_ERROR" })}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
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
            relative border-2 border-dashed rounded-2xl p-12
            transition-all duration-200 ease-in-out
            ${state.isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
            ${state.isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}
          `}
        >
          <input
            type="file"
            accept={UPLOAD_CONFIG.allowedTypes.join(",")}
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={state.isUploading}
          />

          <div className="flex flex-col items-center justify-center text-center">
            {state.isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-black mb-3">Uploading...</p>
                <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${state.uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{state.uploadProgress}%</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-black mb-2">
                  Drop your image here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse ({UPLOAD_CONFIG.allowedExtensions.join(", ")} up to {UPLOAD_CONFIG.maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Display & Transform Controls */}
      {state.originalUrl && (
        <div className="space-y-6">
          {/* Style Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-medium text-black">
              Transform style:
            </label>
            <select
              value={state.selectedStyle}
              onChange={(e) => dispatch({ type: "SET_STYLE", payload: e.target.value })}
              disabled={state.isTransforming}
              className="flex-1 max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STYLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleTransform}
              disabled={state.isTransforming}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {state.isTransforming ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Transforming...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Transform
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={state.isTransforming}
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Images Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Image */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Original
              </p>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image
                  src={state.originalUrl}
                  alt="Original uploaded image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Transformed Result */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Transformed
                </p>
                {state.transformedUrl && (
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
              </div>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {state.isTransforming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">AI is creating your image...</p>
                  </div>
                ) : state.transformedUrl ? (
                  <Image
                    src={state.transformedUrl}
                    alt="Transformed image"
                    fill
                    className="object-cover"
                    unoptimized // Required for data URLs
                  />
                ) : state.description ? (
                  <div className="absolute inset-0 p-4 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      AI Description:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {state.description}
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-400 text-center px-4">
                      Select a style and click Transform
                    </p>
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
