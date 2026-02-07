// API Response Types

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  url?: string;
  error?: string;
}

export interface TransformResponse {
  transformedUrl?: string;
  description?: string;
  error?: string;
}

// Component State Types

export interface UploaderState {
  isDragging: boolean;
  isUploading: boolean;
  isTransforming: boolean;
  uploadProgress: number;
  originalUrl: string | null;
  transformedUrl: string | null;
  description: string | null;
  selectedStyle: string;
  error: string | null;
}

export type UploaderAction =
  | { type: "SET_DRAGGING"; payload: boolean }
  | { type: "START_UPLOAD" }
  | { type: "SET_UPLOAD_PROGRESS"; payload: number }
  | { type: "UPLOAD_SUCCESS"; payload: string }
  | { type: "UPLOAD_ERROR"; payload: string }
  | { type: "START_TRANSFORM" }
  | { type: "TRANSFORM_SUCCESS"; payload: { url?: string; description?: string } }
  | { type: "TRANSFORM_ERROR"; payload: string }
  | { type: "SET_STYLE"; payload: string }
  | { type: "RESET" }
  | { type: "CLEAR_ERROR" };

// Style Option Type
export interface StyleOption {
  value: string;
  label: string;
}
