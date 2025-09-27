export type ApiResponse<T = any> = {
  status: "success" | "error";
  message: string;
  data?: T;
};

export type CourseData = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: Date;
};

export type SlugCheckResponse = {
  available: boolean;
  suggestion?: string;
};

export type ValidationError = {
  field: string;
  message: string;
};

export type FormState = {
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
  lastSaved?: Date;
};