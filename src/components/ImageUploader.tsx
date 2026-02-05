"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Upload, Loader2, Sparkles, X } from "lucide-react";

const STYLE_OPTIONS = [
  { value: "3D Pixar character", label: "3D Pixar" },
  { value: "Studio Ghibli anime style", label: "Studio Ghibli" },
  { value: "oil painting masterpiece", label: "Oil Painting" },
  { value: "cyberpunk neon aesthetic", label: "Cyberpunk" },
  { value: "watercolor illustration", label: "Watercolor" },
  { value: "pop art comic style", label: "Pop Art" },
];

export default function ImageUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [transformedDescription, setTransformedDescription] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0].value);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setTransformedDescription(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || "Upload failed");
        return;
      }

      if (result.url) {
        setOriginalUrl(result.url);
      }
    } catch (err) {
      console.error("Upload catch error:", err);
      const message = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTransform = async () => {
    if (!originalUrl) return;

    setError(null);
    setIsTransforming(true);

    try {
      const response = await fetch("/api/transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: originalUrl, style: selectedStyle }),
      });

      const result = await response.json();

      if (!response.ok || result.error) {
        setError(result.error || "Transform failed");
        return;
      }

      if (result.description) {
        setTransformedDescription(result.description);
      }
    } catch (err) {
      console.error("Transform catch error:", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Transform failed: ${message}`);
    } finally {
      setIsTransforming(false);
    }
  };

  const handleReset = () => {
    setOriginalUrl(null);
    setTransformedDescription(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Upload Area - Show when no image uploaded */}
      {!originalUrl && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-2xl p-12
            transition-all duration-200 ease-in-out
            ${isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }
            ${isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}
          `}
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
          />

          <div className="flex flex-col items-center justify-center text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-lg font-medium text-black">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-black mb-2">
                  Drop your image here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse (JPEG, PNG, WebP, GIF up to 10MB)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Display & Transform Controls */}
      {originalUrl && (
        <div className="space-y-6">
          {/* Style Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-medium text-black">
              Transform style:
            </label>
            <select
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
              disabled={isTransforming}
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
              disabled={isTransforming}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTransforming ? (
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
              disabled={isTransforming}
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
                  src={originalUrl}
                  alt="Original uploaded image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Transformed Result */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Transformed
              </p>
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {isTransforming ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">AI is thinking...</p>
                  </div>
                ) : transformedDescription ? (
                  <div className="absolute inset-0 p-4 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                      AI Description:
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {transformedDescription}
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm text-gray-400">
                      Select a style and click Transform
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Note about image generation */}
          {transformedDescription && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> Currently showing AI description. For actual image
                generation, integrate with Google Imagen, DALL-E, or Stable Diffusion API.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
