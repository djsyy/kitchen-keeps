import { apiClient } from './apiClient';

export interface RecipeIngredient {
  id: number;
  recipe_id: number;
  ingredient_id: number | null;
  quantity_value: string | null;
  quantity_unit: string | null;
  preparation_note: string | null;
  sort_order: number;
  display_name: string;
  created_at: string;
  updated_at: string;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type RecipeIngredientsData = {
  recipeIngredients: RecipeIngredient[];
};

type RecipeIngredientData = {
  recipeIngredient: RecipeIngredient;
};

export interface CreateRecipeIngredientPayload {
  display_name: string;
  ingredient_id?: number | null;
  quantity_value?: string | null;
  quantity_unit?: string | null;
  preparation_note?: string | null;
  sort_order?: number | null;
}

export type UpdateRecipeIngredientPayload = Partial<
  Omit<CreateRecipeIngredientPayload, 'sort_order'>
>;

export type RecipeIngredientsResponse = ApiDataResponse<RecipeIngredientsData>;
export type RecipeIngredientResponse = ApiDataResponse<RecipeIngredientData>;

const recipeIngredientsPath = (recipeId: number) =>
  `/recipes/${recipeId}/ingredients`;

export const createRecipeIngredient = (
  recipeId: number,
  payload: CreateRecipeIngredientPayload
) =>
  apiClient.post<RecipeIngredientResponse>(
    recipeIngredientsPath(recipeId),
    payload
  );

export const getRecipeIngredients = (recipeId: number) =>
  apiClient.get<RecipeIngredientsResponse>(recipeIngredientsPath(recipeId));

export const updateRecipeIngredient = (
  recipeId: number,
  recipeIngredientId: number,
  payload: UpdateRecipeIngredientPayload
) =>
  apiClient.patch<RecipeIngredientResponse>(
    `${recipeIngredientsPath(recipeId)}/${recipeIngredientId}`,
    payload
  );

export const deleteRecipeIngredient = (
  recipeId: number,
  recipeIngredientId: number
) =>
  apiClient.delete<RecipeIngredientResponse>(
    `${recipeIngredientsPath(recipeId)}/${recipeIngredientId}`
  );

export const reorderRecipeIngredients = (
  recipeId: number,
  recipeIngredientIds: number[]
) =>
  apiClient.patch<RecipeIngredientsResponse>(
    `${recipeIngredientsPath(recipeId)}/reorder`,
    { recipeIngredientIds }
  );

export const recipeIngredientService = {
  createRecipeIngredient,
  getRecipeIngredients,
  updateRecipeIngredient,
  deleteRecipeIngredient,
  reorderRecipeIngredients,
};
