import { apiClient } from './apiClient';

export interface RecipeStep {
  id: number;
  recipe_id: number;
  sort_order: number;
  instruction: string;
  created_at: string;
  updated_at: string;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type RecipeStepsData = {
  recipeSteps: RecipeStep[];
};

type RecipeStepData = {
  recipeStep: RecipeStep;
};

export interface CreateRecipeStepPayload {
  instruction: string;
}

export type UpdateRecipeStepPayload = CreateRecipeStepPayload;
export type RecipeStepsResponse = ApiDataResponse<RecipeStepsData>;
export type RecipeStepResponse = ApiDataResponse<RecipeStepData>;

const recipeStepsPath = (recipeId: number) => `/recipes/${recipeId}/steps`;

export const createRecipeStep = (
  recipeId: number,
  payload: CreateRecipeStepPayload
) => apiClient.post<RecipeStepResponse>(recipeStepsPath(recipeId), payload);

export const getRecipeSteps = (recipeId: number) =>
  apiClient.get<RecipeStepsResponse>(recipeStepsPath(recipeId));

export const updateRecipeStep = (
  recipeId: number,
  recipeStepId: number,
  payload: UpdateRecipeStepPayload
) =>
  apiClient.patch<RecipeStepResponse>(
    `${recipeStepsPath(recipeId)}/${recipeStepId}`,
    payload
  );

export const deleteRecipeStep = (recipeId: number, recipeStepId: number) =>
  apiClient.delete<RecipeStepResponse>(
    `${recipeStepsPath(recipeId)}/${recipeStepId}`
  );

export const reorderRecipeSteps = (recipeId: number, recipeStepIds: number[]) =>
  apiClient.patch<RecipeStepsResponse>(`${recipeStepsPath(recipeId)}/reorder`, {
    recipeStepIds,
  });

export const recipeStepService = {
  createRecipeStep,
  getRecipeSteps,
  updateRecipeStep,
  deleteRecipeStep,
  reorderRecipeSteps,
};
