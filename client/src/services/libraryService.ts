import { apiClient } from './apiClient';
import type { LibraryColorKey, LibraryIconKey } from '../config/libraryIcons';
import type { Recipe } from './recipeService';

export interface Library {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  icon_key: LibraryIconKey;
  color_key: LibraryColorKey;
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

type LibraryDetailData = LibraryData & {
  recipes: Recipe[];
};

type LibraryRecipeData = {
  libraryRecipe: LibraryRecipe;
};

export interface LibraryRecipe {
  library_id: number;
  recipe_id: number;
  added_at: string;
  notes: string | null;
}

export interface CreateLibraryPayload {
  name: string;
  description?: string | null;
  icon_key?: LibraryIconKey;
  color_key?: LibraryColorKey;
}

export type UpdateLibraryPayload = Partial<CreateLibraryPayload>;
export type LibrariesResponse = ApiDataResponse<LibrariesData>;
export type LibraryResponse = ApiDataResponse<LibraryData>;
export type LibraryDetailResponse = ApiDataResponse<LibraryDetailData>;
export type LibraryRecipeResponse = ApiDataResponse<LibraryRecipeData>;

// The authenticated session identifies the library owner
export const createLibrary = (payload: CreateLibraryPayload) =>
  apiClient.post<LibraryResponse>('/libraries', payload);

export const getLibraries = () =>
  apiClient.get<LibrariesResponse>('/libraries');

export const getLibrary = (libraryId: number) =>
  apiClient.get<LibraryDetailResponse>(`/libraries/${libraryId}`);

export const addRecipeToLibrary = (libraryId: number, recipeId: number) =>
  apiClient.post<LibraryRecipeResponse>(`/libraries/${libraryId}/recipes`, {
    recipe_id: recipeId,
  });

export const removeRecipeFromLibrary = (
  libraryId: number,
  recipeId: number
) =>
  apiClient.delete<LibraryRecipeResponse>(
    `/libraries/${libraryId}/recipes/${recipeId}`
  );

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
  addRecipeToLibrary,
  removeRecipeFromLibrary,
  updateLibrary,
  deleteLibrary,
};
