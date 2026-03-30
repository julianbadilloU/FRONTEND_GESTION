export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};
