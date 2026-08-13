import { type FormEvent, useState } from 'react';
import type {
  CreateRecipeStepPayload,
  RecipeStep,
} from '../../services/recipeStepService';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeStepFormDialogProps = {
  recipeStep?: RecipeStep;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateRecipeStepPayload) => void;
};

export default function RecipeStepFormDialog({
  recipeStep,
  isPending,
  error,
  onCancel,
  onSubmit,
}: RecipeStepFormDialogProps) {
  const isEditing = Boolean(recipeStep);
  const [instruction, setInstruction] = useState(recipeStep?.instruction ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ instruction: instruction.trim() });
  };

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
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-step-form-title"
        aria-describedby="recipe-step-form-description"
        className="border-background-300 bg-background-50 flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="recipe-step-form-title"
            className="text-text-950 text-xl font-bold"
          >
            {isEditing ? 'Edit step' : 'Add step'}
          </h1>
          <p
            id="recipe-step-form-description"
            className="text-text-600 mt-1 text-sm"
          >
            Write one clear instruction for this step of the recipe.
          </p>
        </div>

        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Instruction
          <textarea
            required
            autoFocus
            maxLength={5000}
            rows={5}
            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 min-h-32 rounded-lg border px-3 py-2 outline-none focus:ring"
            value={instruction}
            onChange={(event) => setInstruction(event.currentTarget.value)}
          />
        </label>

        {error && <ErrorMessage message={error.message} />}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="text-text-700 hover:bg-background-100 rounded-lg px-4 py-2.5 text-sm font-bold transition"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isPending || !instruction.trim()}
          >
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Adding...'
              : isEditing
                ? 'Save changes'
                : 'Add step'}
          </button>
        </div>
      </form>
    </div>
  );
}
