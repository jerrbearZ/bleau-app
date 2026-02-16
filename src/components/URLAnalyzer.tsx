"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Loader2,
  X,
  ExternalLink,
  Image as ImageIcon,
  FileText,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  VERDICT_CONFIG,
  type DetectResult,
  type DetectIndicator,
  type Verdict,
} from "@/lib/detect-constants";

function ConfidenceMeter({
  confidence,
  verdict,
}: {
  confidence: number;
  verdict: Verdict;
}) {
  const config = VERDICT_CONFIG[verdict];
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Confidence</span>
        <span className={`text-sm font-bold ${config.textClass}`}>
          {confidence}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${config.barClass}`}
          style={{ width: `${confidence}%` }}
        />
      </div>
    </div>
  );
}

function IndicatorBadge({ signal }: { signal: DetectIndicator["signal"] }) {
  const styles = {
    ai: "bg-red-100 text-red-600",
    real: "bg-green-100 text-green-600",
    neutral: "bg-gray-100 text-gray-500",
  };
  const labels = {
    ai: "AI Signal",
    real: "Human Signal",
    neutral: "Neutral",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles[signal]}`}
    >
      {labels[signal]}
    </span>
  );
}

function ResultCard({ result }: { result: DetectResult }) {
  const [showDetails, setShowDetails] = useState(false);
  const config = VERDICT_CONFIG[result.verdict];

  const aiSignals = result.indicators.filter((i) => i.signal === "ai").length;
  const realSignals = result.indicators.filter(
    (i) => i.signal === "real"
  ).length;

  return (
    <div className="space-y-6">
      {/* Verdict Card */}
      <div
        className={`overflow-hidden rounded-3xl border-2 ${config.bgClass} p-8`}
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-4xl">{config.emoji}</span>
            <h2 className={`mt-3 text-2xl font-bold ${config.textClass}`}>
              {config.label}
            </h2>
            <p className="mt-2 text-sm text-gray-600">{result.summary}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-gray-500">
            {result.contentType === "image" ? (
              <ImageIcon className="h-3.5 w-3.5" />
            ) : (
              <FileText className="h-3.5 w-3.5" />
            )}
            {result.contentType === "image" ? "Image" : "Text"} Analysis
          </div>
        </div>

        <div className="mt-6">
          <ConfidenceMeter
            confidence={result.confidence}
            verdict={result.verdict}
          />
        </div>

        {/* Signal summary */}
        {result.indicators.length > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            {aiSignals > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                {aiSignals} AI signal{aiSignals !== 1 && "s"}
              </span>
            )}
            {realSignals > 0 && (
              <span className="flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
                {realSignals} human signal{realSignals !== 1 && "s"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Explanation */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6">
        <h3 className="mb-2 text-sm font-semibold text-black">Analysis</h3>
        <p className="text-sm leading-relaxed text-gray-600">
          {result.explanation}
        </p>
      </div>

      {/* Detailed Indicators — Expandable */}
      {result.indicators.length > 0 && (
        <div className="rounded-2xl border border-gray-100 bg-white">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between p-6 text-left"
          >
            <h3 className="text-sm font-semibold text-black">
              Detailed Indicators ({result.indicators.length})
            </h3>
            {showDetails ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          {showDetails && (
            <div className="border-t border-gray-50 px-6 pb-6">
              <div className="divide-y divide-gray-50">
                {result.indicators.map((indicator, i) => (
                  <div key={i} className="py-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold text-black">
                        {indicator.category}
                      </span>
                      <IndicatorBadge signal={indicator.signal} />
                    </div>
                    <p className="text-xs leading-relaxed text-gray-500">
                      {indicator.finding}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Source */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
        <ExternalLink className="h-3 w-3" />
        <span className="max-w-md truncate">{result.sourceUrl}</span>
      </div>
    </div>
  );
}

export default function URLAnalyzer() {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) return;

    // Auto-prepend https:// if no protocol
    let processedUrl = url.trim();
    if (
      !processedUrl.startsWith("http://") &&
      !processedUrl.startsWith("https://")
    ) {
      processedUrl = `https://${processedUrl}`;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: processedUrl }),
      });

      const data: DetectResult = await response.json();

      if (data.error) {
        setError(data.error);
        if (data.verdict && data.verdict !== "UNCERTAIN") {
          setResult(data);
        }
      } else {
        setResult(data);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [url]);

  const handleReset = useCallback(() => {
    setUrl("");
    setResult(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isAnalyzing) {
        handleAnalyze();
      }
    },
    [handleAnalyze, isAnalyzing]
  );

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Error */}
      {error && !result && (
        <div
          role="alert"
          className="mb-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="ml-4 text-red-400 transition-colors hover:text-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Input */}
      {!result && (
        <div className="space-y-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-5">
              <Search className="h-5 w-5 text-gray-300" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste a URL to any image or article..."
              disabled={isAnalyzing}
              className="w-full rounded-2xl border-2 border-gray-100 bg-white py-4 pl-14 pr-4 text-base text-black placeholder-gray-300 outline-none transition-all duration-200 focus:border-black focus:shadow-lg disabled:opacity-60"
              autoFocus
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !url.trim()}
            className="w-full rounded-2xl bg-black py-4 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isAnalyzing ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing content&hellip;
              </span>
            ) : (
              "Analyze"
            )}
          </button>

          {isAnalyzing && (
            <p className="text-center text-xs text-gray-400">
              Fetching content and running forensic analysis — this takes 10-20
              seconds
            </p>
          )}

          {/* Tips */}
          {!isAnalyzing && !url && (
            <div className="mt-8 space-y-3">
              <p className="text-center text-xs font-medium uppercase tracking-widest text-gray-300">
                What you can analyze
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">
                      Images
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    Direct image URLs, social media images, AI art, stock
                    photos, screenshots
                  </p>
                </div>
                <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">
                      Articles & Text
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    News articles, blog posts, social media posts, product
                    descriptions, reviews
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-black"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Analyze another
            </button>
          </div>
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
