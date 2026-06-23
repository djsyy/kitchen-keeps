import {
  LuArchive,
  LuBookOpen,
  LuFolderPlus,
  LuSearch,
  LuSoup,
  LuUtensils,
} from 'react-icons/lu';
import type {
  ActiveCookList,
  DashboardMetric,
  LibraryPreview,
  QuickAction,
  RecipePreview,
} from './types';

// DEMO: top-level dashboard counts shown as a quick snapshot.
export const dashboardMetrics: DashboardMetric[] = [
  {
    label: 'Recipes',
    value: '124',
    detail: '9 opened this week',
    className: 'border-secondary-200 bg-secondary-50 text-secondary-900',
  },
  {
    label: 'Libraries',
    value: '28',
    detail: '4 recently updated',
    className: 'border-accent-200 bg-accent-50 text-accent-900',
  },
  {
    label: 'Ingredients',
    value: '312',
    detail: 'Across all recipes',
    className: 'border-primary-100 bg-primary-50 text-primary-900',
  },
];

export const quickActions: QuickAction[] = [
  {
    label: 'New Recipe',
    icon: LuBookOpen,
    className: 'bg-primary text-text-100 hover:bg-primary-700',
  },
  {
    label: 'Create Library',
    icon: LuFolderPlus,
    className:
      'border border-accent-300 bg-accent-50 text-accent-900 hover:bg-accent-100',
  },
  {
    label: 'Browse Recipes',
    icon: LuSearch,
    className:
      'border border-secondary-300 bg-secondary-50 text-secondary-900 hover:bg-secondary-100',
  },
];

// DEMO: recently used recipes are the main dashboard preview.
export const recipePreviews: RecipePreview[] = [
  {
    title: 'Roasted Carrot Soup',
    library: 'Soups & Stews',
    lastOpened: 'Opened today',
    ingredientCount: 9,
    icon: LuSoup,
    iconClass: 'bg-accent-100 text-accent-800',
  },
  {
    title: 'Garlic Herb Chicken Bowls',
    library: 'Weeknight Dinners',
    lastOpened: 'Cooked yesterday',
    ingredientCount: 12,
    icon: LuUtensils,
    iconClass: 'bg-secondary-100 text-secondary-800',
  },
  {
    title: 'Chickpea Tomato Skillet',
    library: 'Simple Staples',
    lastOpened: 'Opened 3 days ago',
    ingredientCount: 8,
    icon: LuArchive,
    iconClass: 'bg-primary-50 text-primary-800',
  },
];

// DEMO: a short preview of the user's larger library collection.
export const libraryPreviews: LibraryPreview[] = [
  {
    title: 'Weeknight Dinners',
    description: 'Reliable meals for busy evenings and leftovers.',
    recipeCount: 26,
    updatedAt: 'Updated today',
    icon: LuUtensils,
    iconClass: 'bg-secondary-100 text-secondary-800',
    borderClass: 'border-secondary-300',
  },
  {
    title: 'Soups & Stews',
    description: 'Cold-weather bowls, broths, and freezer staples.',
    recipeCount: 18,
    updatedAt: 'Updated yesterday',
    icon: LuSoup,
    iconClass: 'bg-accent-100 text-accent-800',
    borderClass: 'border-accent-300',
  },
  {
    title: 'Simple Staples',
    description: 'Flexible recipes with short ingredient lists.',
    recipeCount: 14,
    updatedAt: 'Updated 2 days ago',
    icon: LuArchive,
    iconClass: 'bg-primary-50 text-primary-800',
    borderClass: 'border-primary-200',
  },
];

// Null represents the default state when no recipe checklist is in progress.
export const activeCookList: ActiveCookList | null = null;
