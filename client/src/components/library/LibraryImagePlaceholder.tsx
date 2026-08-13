import { LuImagePlus } from 'react-icons/lu';

type LibraryImagePlaceholderProps = {
  className: string;
  iconClassName: string;
};

export default function LibraryImagePlaceholder({
  className,
  iconClassName,
}: LibraryImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label="Library image placeholder"
      className={`bg-background-100 text-text-500 flex items-center justify-center ${className}`}
    >
      <LuImagePlus aria-hidden="true" className={iconClassName} />
    </div>
  );
}
