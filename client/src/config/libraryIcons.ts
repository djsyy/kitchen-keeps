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
] as const;

export type LibraryIconKey = (typeof libraryIconKeys)[number];

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
};

export const libraryIconClasses: Record<LibraryIconKey, string> = {
  folder: 'border-primary-200 bg-primary-50 text-primary-800',
  utensils: 'border-secondary-300 bg-secondary-100 text-secondary-800',
  soup: 'border-accent-300 bg-accent-100 text-accent-800',
  archive: 'border-primary-300 bg-primary-100 text-primary-900',
  book: 'border-secondary-300 bg-secondary-50 text-secondary-900',
  heart: 'border-accent-300 bg-accent-50 text-accent-900',
  star: 'border-primary-300 bg-primary-100 text-primary-800',
  coffee: 'border-secondary-300 bg-secondary-100 text-secondary-900',
  calendar: 'border-accent-300 bg-accent-100 text-accent-900',
  leaf: 'border-primary-200 bg-primary-50 text-primary-900',
};
