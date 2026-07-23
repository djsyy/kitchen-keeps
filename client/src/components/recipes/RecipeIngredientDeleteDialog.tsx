import type { RecipeIngredient } from '../../services/recipeIngredientService';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeIngredientDeleteDialogProps = {
  recipeIngredient: RecipeIngredient;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function RecipeIngredientDeleteDialog({
  recipeIngredient,
  isPending,
  error,
  onCancel,
  onConfirm,
}: RecipeIngredientDeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
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
        aria-labelledby="delete-recipe-ingredient-title"
        aria-describedby="delete-recipe-ingredient-description"
        className="w-full max-w-md rounded-2xl bg-background-50 p-6 shadow-xl"
      >
        <div className="space-y-3">
          <h1
            id="delete-recipe-ingredient-title"
            className="text-xl font-bold text-text-950"
          >
            Delete {recipeIngredient.display_name}?
          </h1>
          <p
            id="delete-recipe-ingredient-description"
            className="text-sm text-text-700"
          >
            This permanently removes this ingredient from the recipe.
          </p>
          {error && <ErrorMessage message={error.message} />}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="rounded-md border border-background-300 px-4 py-2 text-sm font-bold text-text-700 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md bg-primary-700 px-4 py-2 text-sm font-bold text-text-50 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? 'Deleting...' : 'Delete ingredient'}
          </button>
        </div>
      </section>
    </div>
  );
}
