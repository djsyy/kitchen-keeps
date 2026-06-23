import type { IconType } from 'react-icons';

export type DashboardMetric = {
  label: string;
  value: string;
  detail: string;
  className: string;
};

export type QuickAction = {
  label: string;
  icon: IconType;
  className: string;
};

export type RecipePreview = {
  title: string;
  library: string;
  lastOpened: string;
  ingredientCount: number;
  icon: IconType;
  iconClass: string;
};

export type LibraryPreview = {
  title: string;
  description: string;
  recipeCount: number;
  updatedAt: string;
  icon: IconType;
  iconClass: string;
  borderClass: string;
};

export type ActiveCookList = {
  recipeTitle: string;
  checkedCount: number;
  totalCount: number;
  remainingCount: number;
};
