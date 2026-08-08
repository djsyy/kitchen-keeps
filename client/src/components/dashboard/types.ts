import type { IconType } from 'react-icons';
import type {
  LibraryColorKey,
  LibraryIconKey,
} from '../../config/libraryIcons';

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
  onClick: () => void;
};

export type RecipePreview = {
  id: number;
  title: string;
  imageUrl: string | null;
  libraryNames: string[];
  updatedLabel: string;
  ingredientCount: number;
};

export type LibraryPreview = {
  id: number;
  title: string;
  description: string | null;
  recipeCount: number;
  updatedLabel: string;
  iconKey: LibraryIconKey;
  colorKey: LibraryColorKey;
  coverImageUrl: string | null;
};

export type ActiveCookList = {
  id: number;
  recipeId: number;
  recipeTitle: string;
  checkedCount: number;
  totalCount: number;
  remainingCount: number;
};
