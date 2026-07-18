import type { IconType } from 'react-icons';
import {
  LuArchive,
  LuBookOpen,
  LuCakeSlice,
  LuCalendarDays,
  LuCoffee,
  LuCookie,
  LuCookingPot,
  LuCroissant,
  LuCupSoda,
  LuIceCreamCone,
  LuFolder,
  LuHeart,
  LuLeaf,
  LuPizza,
  LuSalad,
  LuSandwich,
  LuSoup,
  LuStar,
  LuUtensils,
} from 'react-icons/lu';

export const libraryIconKeys = [
  'folder',
  'utensils',
  'soup',
  'archive',
  'book',
  'heart',
  'star',
  'coffee',
  'calendar',
  'leaf',
  'bowl',
  'drink',
  'cookie',
  'burger',
  'ice-cream',
  'pizza',
  'cake',
  'croissant',
  'salad',
] as const;

export type LibraryIconKey = (typeof libraryIconKeys)[number];

export const libraryColorKeys = ['primary', 'secondary', 'accent'] as const;

export type LibraryColorKey = (typeof libraryColorKeys)[number];

export const libraryIconOptions: Array<{
  key: LibraryIconKey;
  label: string;
}> = [
  { key: 'folder', label: 'Folder' },
  { key: 'utensils', label: 'Utensils' },
  { key: 'soup', label: 'Soup' },
  { key: 'archive', label: 'Archive' },
  { key: 'book', label: 'Book' },
  { key: 'heart', label: 'Heart' },
  { key: 'star', label: 'Star' },
  { key: 'coffee', label: 'Coffee' },
  { key: 'calendar', label: 'Calendar' },
  { key: 'leaf', label: 'Leaf' },
  { key: 'drink', label: 'Drink' },
  { key: 'cookie', label: 'Cookie' },
  { key: 'burger', label: 'Burger' },
  { key: 'ice-cream', label: 'Ice cream' },
  { key: 'pizza', label: 'Pizza' },
  { key: 'cake', label: 'Cake' },
  { key: 'croissant', label: 'Croissant' },
  { key: 'salad', label: 'Salad' },
];

export const libraryIcons: Record<LibraryIconKey, IconType> = {
  folder: LuFolder,
  utensils: LuUtensils,
  soup: LuSoup,
  archive: LuArchive,
  book: LuBookOpen,
  heart: LuHeart,
  star: LuStar,
  coffee: LuCoffee,
  calendar: LuCalendarDays,
  leaf: LuLeaf,
  bowl: LuCookingPot,
  drink: LuCupSoda,
  cookie: LuCookie,
  burger: LuSandwich,
  'ice-cream': LuIceCreamCone,
  pizza: LuPizza,
  cake: LuCakeSlice,
  croissant: LuCroissant,
  salad: LuSalad,
};

export const libraryColorOptions: Array<{
  key: LibraryColorKey;
  label: string;
}> = [
  { key: 'primary', label: 'Red' },
  { key: 'secondary', label: 'Green' },
  { key: 'accent', label: 'Gold' },
];

export const libraryColorClasses: Record<LibraryColorKey, string> = {
  primary: 'border-primary-300 bg-primary-50 text-primary-800',
  secondary: 'border-secondary-300 bg-secondary-100 text-secondary-800',
  accent: 'border-accent-300 bg-accent-100 text-accent-800',
};
