import type { Recipe } from '../../services/recipeService';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeDeleteDialogProps = {
  recipe: Recipe;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RecipeDeleteDialog({
  recipe,
  isPending,
  error,
  onCancel,
  onConfirm,
}: RecipeDeleteDialogProps) {
  return (
    <div
      className="bg-text-950/50 fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onCancel();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-recipe-title"
        aria-describedby="delete-recipe-description"
        className="bg-background-50 w-full max-w-md rounded-2xl p-6 shadow-xl"
      >
        <div className="space-y-3">
          <h1
            id="delete-recipe-title"
            className="text-text-950 text-xl font-bold"
          >
            Delete {recipe.title}?
          </h1>
          <p id="delete-recipe-description" className="text-text-700 text-sm">
            This permanently deletes the recipe and its associated ingredients.
          </p>
          {error && <ErrorMessage message={error.message} />}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="border-background-300 text-text-700 hover:bg-background-100 rounded-md border px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-primary-700 text-text-50 hover:bg-primary-600 rounded-md px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting...' : 'Delete recipe'}
          </button>
        </div>
      </section>
    </div>
  );
}
