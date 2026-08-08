import type { LibraryColorKey, LibraryIconKey } from '../config/libraryIcons';
import { apiClient } from './apiClient';

export interface DashboardMetrics {
  recipe_count: number;
  library_count: number;
  ingredient_count: number;
}

export interface DashboardRecipePreview {
  id: number;
  title: string;
  image_url: string | null;
  updated_at: string;
  ingredient_count: number;
  library_names: string[];
}

export interface DashboardLibraryPreview {
  id: number;
  name: string;
  description: string | null;
  icon_key: LibraryIconKey;
  color_key: LibraryColorKey;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  recipe_count: number;
}

export interface DashboardActiveCookSession {
  id: number;
  recipe_id: number;
  recipe_title: string;
  updated_at: string;
  item_count: number;
  unchecked_count: number;
  checked_count: number;
}

type DashboardData = {
  metrics: DashboardMetrics;
  recipes: DashboardRecipePreview[];
  libraries: DashboardLibraryPreview[];
  activeCookSession: DashboardActiveCookSession | null;
};

export type DashboardResponse = {
  data: DashboardData;
};

export const getDashboard = () =>
  apiClient.get<DashboardResponse>('/dashboard');

export const dashboardService = {
  getDashboard,
};
