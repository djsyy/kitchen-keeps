import type { IconType } from 'react-icons';
import {
  LuArchive,
  LuBookOpen,
  LuCalendarDays,
  LuCoffee,
  LuFolder,
  LuHeart,
  LuLeaf,
  LuSoup,
  LuStar,
  LuUtensils,
} from 'react-icons/lu';
import { PiBowlFood } from 'react-icons/pi';
import { RiDrinks2Line } from 'react-icons/ri';

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
  { key: 'bowl', label: 'Bowl' },
  { key: 'drink', label: 'Drink' },
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
  bowl: PiBowlFood,
  drink: RiDrinks2Line,
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
