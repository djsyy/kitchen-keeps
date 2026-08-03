import { apiClient } from './apiClient';

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  created_by_user_id: number;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  created_at: string;
  updated_at: string;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type RecipesData = {
  recipes: Recipe[];
};

type RecipeData = {
  recipe: Recipe;
};

export interface CreateRecipePayload {
  title: string;
  description?: string | null;
  prep_time_minutes?: number | null;
  cook_time_minutes?: number | null;
  servings?: number | null;
}

export type UpdateRecipePayload = Partial<CreateRecipePayload>;
export type RecipesResponse = ApiDataResponse<RecipesData>;
export type RecipeResponse = ApiDataResponse<RecipeData>;

export const createRecipe = (payload: CreateRecipePayload) =>
  apiClient.post<RecipeResponse>('/recipes', payload);

export const getRecipes = () => apiClient.get<RecipesResponse>('/recipes');

export const getRecipe = (recipeId: number) =>
  apiClient.get<RecipeResponse>(`/recipes/${recipeId}`);

export const updateRecipe = (recipeId: number, payload: UpdateRecipePayload) =>
  apiClient.patch<RecipeResponse>(`/recipes/${recipeId}`, payload);

export const deleteRecipe = (recipeId: number) =>
  apiClient.delete<RecipeResponse>(`/recipes/${recipeId}`);

export const uploadRecipeImage = (recipeId: number, image: File) => {
  const formData = new FormData();
  formData.append('image', image);

  return apiClient.post<RecipeResponse>(`/recipes/${recipeId}/image`, formData);
};

export const removeRecipeImage = (recipeId: number) =>
  apiClient.delete<RecipeResponse>(`/recipes/${recipeId}/image`);

export const recipeService = {
  createRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
  uploadRecipeImage,
  removeRecipeImage,
};
