import { apiClient } from './apiClient';

export interface Library {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at?: string;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type LibrariesData = {
  libraries: Library[];
};

type LibraryData = {
  library: Library;
};

export interface CreateLibraryPayload {
  name: string;
  description?: string | null;
}

export type UpdateLibraryPayload = Partial<CreateLibraryPayload>;
export type LibrariesResponse = ApiDataResponse<LibrariesData>;
export type LibraryResponse = ApiDataResponse<LibraryData>;

// The authenticated session identifies the library owner
export const createLibrary = (payload: CreateLibraryPayload) =>
  apiClient.post<LibraryResponse>('/libraries', payload);

export const getLibraries = () =>
  apiClient.get<LibrariesResponse>('/libraries');

export const getLibrary = (libraryId: number) =>
  apiClient.get<LibraryResponse>(`/libraries/${libraryId}`);

export const updateLibrary = (
  libraryId: number,
  payload: UpdateLibraryPayload
) => apiClient.patch<LibraryResponse>(`/libraries/${libraryId}`, payload);

export const deleteLibrary = (libraryId: number) =>
  apiClient.delete<LibraryResponse>(`/libraries/${libraryId}`);

export const libraryService = {
  createLibrary,
  getLibraries,
  getLibrary,
  updateLibrary,
  deleteLibrary,
};
