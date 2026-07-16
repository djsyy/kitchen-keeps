import { apiBaseUrl } from '../config/env';

const normalizedApiBaseUrl = apiBaseUrl.replace(/\/$/, '');
const API_BASE_URL = normalizedApiBaseUrl.endsWith('/api')
  ? normalizedApiBaseUrl
  : `${normalizedApiBaseUrl}/api`;

// What values can go into the URL query param
export type QueryValue = string | number | boolean | null | undefined;

export type ApiFieldError = {
  field: string;
  message: string;
};

// The standard types of 'fetch' + specific handling for body and query
export type ApiClientOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  query?: Record<string, QueryValue>;
};

// Consistent structure for handling API responses
type ApiErrorDetails = {
  status: number;
  statusText: string;
  data: unknown;
  errors: ApiFieldError[];
};

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: unknown;
  errors: ApiFieldError[];

  constructor(message: string, details: ApiErrorDetails) {
    super(message);
    this.name = 'ApiError';
    this.status = details.status;
    this.statusText = details.statusText;
    this.data = details.data;
    this.errors = details.errors;
  }
}

const buildUrl = (
  endpoint: string,
  query?: Record<string, QueryValue>
): string => {
  // Allows both 'auth/login' and '/auth/login'.
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;
  const url = new URL(`${API_BASE_URL}${normalizedEndpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type');

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
};

const getErrorMessage = (data: unknown, response: Response): string => {
  if (data && typeof data === 'object') {
    const errorData = data as Record<string, unknown>;

    if (typeof errorData.message === 'string') {
      return errorData.message;
    }
  }

  return response.statusText || 'Request failed';
};

const getErrorList = (data: unknown): ApiFieldError[] => {
  if (data && typeof data === 'object') {
    const errorData = data as Record<string, unknown>;

    if (Array.isArray(errorData.errors)) {
      return errorData.errors.filter((error): error is ApiFieldError =>
        Boolean(
          error &&
          typeof error === 'object' &&
          typeof (error as ApiFieldError).field === 'string' &&
          typeof (error as ApiFieldError).message === 'string'
        )
      );
    }
  }

  return [];
};

export const getApiFieldError = (
  error: unknown,
  field: string
): string | null => {
  if (!(error instanceof ApiError)) {
    return null;
  }

  return error.errors.find((item) => item.field === field)?.message ?? null;
};

// T is the expected response type, like apiClient.get<User>('/auth/me').
const request = async <T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  const { body, headers, query, ...fetchOptions } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(buildUrl(endpoint, query), {
    credentials: 'include',
    ...fetchOptions,
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, response), {
      status: response.status,
      statusText: response.statusText,
      data,
      errors: getErrorList(data),
    });
  }

  return data as T;
};

export const apiClient = {
  // Helper methods that wrap the base request function to provide cleaner and reusable API calls.
  get: <T>(endpoint: string, options?: ApiClientOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    request<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    request<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: unknown, options?: ApiClientOptions) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: ApiClientOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),

  request,
};
