import { LuImagePlus } from 'react-icons/lu';

type RecipeImagePlaceholderProps = {
  className: string;
  iconClassName: string;
};

export default function RecipeImagePlaceholder({
  className,
  iconClassName,
}: RecipeImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label="Recipe image placeholder"
      className={`flex items-center justify-center bg-background-100 text-text-500 ${className}`}
    >
      <LuImagePlus aria-hidden="true" className={iconClassName} />
    </div>
  );
}
