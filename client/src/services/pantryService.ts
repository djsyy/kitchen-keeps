import { apiClient } from './apiClient';
import type { Recipe } from './recipeService';

export interface PantryItem {
  id: number;
  ingredient_id: number;
  name: string;
  created_by_user_id: number | null;
  created_at: string;
}

type PantryData = {
  pantryItems: PantryItem[];
  recommendations: Recipe[];
  recommendationEligibility: {
    unlinkedRecipeCount: number;
  };
};

type PantryItemData = {
  pantryItem: PantryItem;
};

export type PantryResponse = {
  data: PantryData;
  meta: { count: number };
};

export type PantryItemResponse = {
  data: PantryItemData;
};

export const getPantry = () => apiClient.get<PantryResponse>('/pantry');

export const addPantryItem = (ingredientId: number) =>
  apiClient.post<PantryItemResponse>('/pantry', {
    ingredient_id: ingredientId,
  });

export const createPrivatePantryItem = (name: string) =>
  apiClient.post<PantryItemResponse>('/pantry/private-ingredient', { name });

export const removePantryItem = (ingredientId: number) =>
  apiClient.delete<PantryItemResponse>(`/pantry/${ingredientId}`);

export const pantryService = {
  getPantry,
  addPantryItem,
  createPrivatePantryItem,
  removePantryItem,
};
