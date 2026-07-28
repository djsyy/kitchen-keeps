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
      className="fixed inset-0 z-50 flex items-center justify-center bg-text-950/50 p-4"
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
        className="flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-background-300 bg-background-50 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="recipe-step-form-title"
            className="text-xl font-bold text-text-950"
          >
            {isEditing ? 'Edit step' : 'Add step'}
          </h1>
          <p
            id="recipe-step-form-description"
            className="mt-1 text-sm text-text-600"
          >
            Write one clear instruction for this part of the recipe.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Instruction
          <textarea
            required
            autoFocus
            maxLength={5000}
            rows={5}
            className="min-h-32 rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            value={instruction}
            onChange={(event) => setInstruction(event.currentTarget.value)}
          />
        </label>

        {error && <ErrorMessage message={error.message} />}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            className="rounded-lg px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
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
