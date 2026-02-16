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
  Link as LinkIcon,
  Type,
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

      {/* Detailed Indicators */}
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
      {result.sourceUrl && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-300">
          <ExternalLink className="h-3 w-3" />
          <span className="max-w-md truncate">{result.sourceUrl}</span>
        </div>
      )}
    </div>
  );
}

type InputMode = "url" | "text";

export default function URLAnalyzer() {
  const [inputMode, setInputMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async () => {
    const input = inputMode === "url" ? url.trim() : rawText.trim();
    if (!input) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      if (inputMode === "url") {
        let processedUrl = input;
        if (
          !processedUrl.startsWith("http://") &&
          !processedUrl.startsWith("https://")
        ) {
          processedUrl = `https://${processedUrl}`;
        }

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
      } else {
        // Raw text mode — send directly to detect-text endpoint
        const response = await fetch("/api/detect-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
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
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Analysis failed";
      setError(message);
    } finally {
      setIsAnalyzing(false);
    }
  }, [url, rawText, inputMode]);

  const handleReset = useCallback(() => {
    setUrl("");
    setRawText("");
    setResult(null);
    setError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey && !isAnalyzing) {
        if (inputMode === "url") {
          handleAnalyze();
        }
      }
    },
    [handleAnalyze, isAnalyzing, inputMode]
  );

  const handleTryExample = useCallback((exampleUrl: string) => {
    setInputMode("url");
    setUrl(exampleUrl);
  }, []);

  const hasInput =
    inputMode === "url" ? url.trim().length > 0 : rawText.trim().length > 0;

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
          {/* Mode Tabs */}
          <div className="flex items-center gap-1 rounded-xl bg-gray-50 p-1">
            <button
              onClick={() => setInputMode("url")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                inputMode === "url"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LinkIcon className="h-4 w-4" />
              Paste a URL
            </button>
            <button
              onClick={() => setInputMode("text")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                inputMode === "text"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Type className="h-4 w-4" />
              Paste text
            </button>
          </div>

          {/* URL Input */}
          {inputMode === "url" && (
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
          )}

          {/* Text Input */}
          {inputMode === "text" && (
            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste the text you want to analyze..."
              disabled={isAnalyzing}
              rows={8}
              className="w-full resize-none rounded-2xl border-2 border-gray-100 bg-white p-5 text-base text-black placeholder-gray-300 outline-none transition-all duration-200 focus:border-black focus:shadow-lg disabled:opacity-60"
              autoFocus
            />
          )}

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !hasInput}
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
              {inputMode === "url"
                ? "Fetching content and running forensic analysis — this takes 10-20 seconds"
                : "Running AI writing pattern analysis — this takes 5-10 seconds"}
            </p>
          )}

          {/* Tips & Examples */}
          {!isAnalyzing && !hasInput && (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">
                      Images
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    AI art, social media photos, stock photos, screenshots,
                    profile pictures
                  </p>
                </div>
                <div className="rounded-xl border border-gray-50 bg-gray-50/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-semibold text-gray-600">
                      Text & Articles
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-gray-400">
                    News articles, blog posts, essays, reviews, social posts,
                    product descriptions
                  </p>
                </div>
              </div>

              {/* Example URLs */}
              {inputMode === "url" && (
                <div>
                  <p className="mb-2 text-center text-xs font-medium uppercase tracking-widest text-gray-300">
                    Try an example
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() =>
                        handleTryExample(
                          "https://thispersondoesnotexist.com"
                        )
                      }
                      className="rounded-full border border-gray-100 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-black"
                    >
                      🧑 AI Face Generator
                    </button>
                    <button
                      onClick={() =>
                        handleTryExample(
                          "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Ocelot_%28Leopardus_pardalis%29-8.jpg/1280px-Ocelot_%28Leopardus_pardalis%29-8.jpg"
                        )
                      }
                      className="rounded-full border border-gray-100 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-300 hover:text-black"
                    >
                      📷 Real Photo
                    </button>
                  </div>
                </div>
              )}
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
