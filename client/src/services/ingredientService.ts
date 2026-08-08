import { apiClient } from './apiClient';

export interface Ingredient {
  id: number;
  name: string;
  status: 'active' | 'hidden';
  created_by_user_id: number | null;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type IngredientsData = {
  ingredients: Ingredient[];
};

type IngredientData = {
  ingredient: Ingredient;
};

export type IngredientsResponse = ApiDataResponse<IngredientsData>;
export type IngredientResponse = ApiDataResponse<IngredientData>;

export interface GetIngredientsOptions {
  search?: string;
}

export interface GetManagedIngredientsOptions {
  status?: 'active' | 'hidden';
}

export interface CreateIngredientPayload {
  name: string;
}

export type UpdateIngredientPayload = CreateIngredientPayload;

export const getIngredients = (options: GetIngredientsOptions = {}) =>
  apiClient.get<IngredientsResponse>('/ingredients', {
    query: { search: options.search },
  });

export const searchIngredients = (search: string) => getIngredients({ search });

export const getManagedIngredients = (
  options: GetManagedIngredientsOptions = {}
) =>
  apiClient.get<IngredientsResponse>('/ingredients/manage', {
    query: { status: options.status ?? 'active' },
  });

export const getIngredient = (ingredientId: number) =>
  apiClient.get<IngredientResponse>(`/ingredients/${ingredientId}`);

export const createIngredient = (payload: CreateIngredientPayload) =>
  apiClient.post<IngredientResponse>('/ingredients', payload);

export const updateIngredient = (
  ingredientId: number,
  payload: UpdateIngredientPayload
) =>
  apiClient.patch<IngredientResponse>(`/ingredients/${ingredientId}`, payload);

export const hideIngredient = (ingredientId: number) =>
  apiClient.delete<IngredientResponse>(`/ingredients/${ingredientId}`);

export const reactivateIngredient = (ingredientId: number) =>
  apiClient.patch<IngredientResponse>(
    `/ingredients/${ingredientId}/reactivate`
  );

export const ingredientService = {
  getIngredients,
  searchIngredients,
  getManagedIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  hideIngredient,
  reactivateIngredient,
};
