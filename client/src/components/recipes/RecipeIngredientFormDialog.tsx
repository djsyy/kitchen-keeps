import { type FormEvent, useState } from 'react';
import type {
  CreateRecipeIngredientPayload,
  RecipeIngredient,
} from '../../services/recipeIngredientService';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeIngredientFormDialogProps = {
  recipeIngredient?: RecipeIngredient;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateRecipeIngredientPayload) => void;
};

export default function RecipeIngredientFormDialog({
  recipeIngredient,
  isPending,
  error,
  onCancel,
  onSubmit,
}: RecipeIngredientFormDialogProps) {
  const isEditing = Boolean(recipeIngredient);
  const [displayName, setDisplayName] = useState(
    recipeIngredient?.display_name ?? ''
  );
  const [quantityValue, setQuantityValue] = useState(
    recipeIngredient?.quantity_value ?? ''
  );
  const [quantityUnit, setQuantityUnit] = useState(
    recipeIngredient?.quantity_unit ?? ''
  );
  const [preparationNote, setPreparationNote] = useState(
    recipeIngredient?.preparation_note ?? ''
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      display_name: displayName.trim(),
      quantity_value: quantityValue.trim() || null,
      quantity_unit: quantityUnit.trim() || null,
      preparation_note: preparationNote.trim() || null,
    });
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
        aria-labelledby="recipe-ingredient-form-title"
        aria-describedby="recipe-ingredient-form-description"
        className="flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border border-background-300 bg-background-50 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="recipe-ingredient-form-title"
            className="text-xl font-bold text-text-950"
          >
            {isEditing ? 'Edit ingredient' : 'Add ingredient'}
          </h1>
          <p
            id="recipe-ingredient-form-description"
            className="mt-1 text-sm text-text-600"
          >
            Add the amount and any preparation details you need while cooking.
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Ingredient
          <input
            required
            maxLength={255}
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            value={displayName}
            onChange={(event) => setDisplayName(event.currentTarget.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
            Amount <span className="font-normal text-text-500">(optional)</span>
            <input
              maxLength={100}
              className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
              placeholder="2"
              value={quantityValue}
              onChange={(event) => setQuantityValue(event.currentTarget.value)}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
            Unit <span className="font-normal text-text-500">(optional)</span>
            <input
              maxLength={50}
              className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
              placeholder="tbsp"
              value={quantityUnit}
              onChange={(event) => setQuantityUnit(event.currentTarget.value)}
            />
          </label>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Preparation note{' '}
          <span className="font-normal text-text-500">(optional)</span>
          <input
            maxLength={255}
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            placeholder="finely chopped"
            value={preparationNote}
            onChange={(event) => setPreparationNote(event.currentTarget.value)}
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
            disabled={isPending || !displayName.trim()}
          >
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Adding...'
              : isEditing
                ? 'Save changes'
                : 'Add ingredient'}
          </button>
        </div>
      </form>
    </div>
  );
}
