import { type FormEvent, useState } from 'react';
import type { CreateRecipePayload, Recipe } from '../../services/recipeService';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeFormDialogProps = {
  recipe?: Recipe;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateRecipePayload) => void;
};

const toOptionalPositiveInteger = (value: string): number | null =>
  value === '' ? null : Number(value);

export default function RecipeFormDialog({
  recipe,
  isPending,
  error,
  onCancel,
  onSubmit,
}: RecipeFormDialogProps) {
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [imageUrl, setImageUrl] = useState(recipe?.image_url ?? '');
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    recipe?.prep_time_minutes?.toString() ?? ''
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState(
    recipe?.cook_time_minutes?.toString() ?? ''
  );
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? '');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      prep_time_minutes: toOptionalPositiveInteger(prepTimeMinutes),
      cook_time_minutes: toOptionalPositiveInteger(cookTimeMinutes),
      servings: toOptionalPositiveInteger(servings),
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
        aria-labelledby="recipe-form-title"
        aria-describedby="recipe-form-description"
        className="flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border border-background-300 bg-background-50 p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1 id="recipe-form-title" className="text-xl font-bold text-text-950">
            {isEditing ? 'Edit recipe' : 'Create a recipe'}
          </h1>
          <p id="recipe-form-description" className="mt-1 text-sm text-text-600">
            {isEditing
              ? 'Update this recipe’s details.'
              : 'Add the basics now. You can add ingredients and steps afterwards.'}
          </p>
        </div>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Title
          <input
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            maxLength={255}
            required
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Description{' '}
          <span className="font-normal text-text-500">(optional)</span>
          <textarea
            className="min-h-24 rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
          Image URL{' '}
          <span className="font-normal text-text-500">(optional)</span>
          <input
            type="url"
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            maxLength={2048}
            placeholder="https://example.com/recipe.jpg"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.currentTarget.value)}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Prep time (minutes)"
            value={prepTimeMinutes}
            onChange={setPrepTimeMinutes}
          />
          <NumberField
            label="Cook time (minutes)"
            value={cookTimeMinutes}
            onChange={setCookTimeMinutes}
          />
          <NumberField label="Servings" value={servings} onChange={setServings} />
        </div>

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
            disabled={isPending || !title.trim()}
          >
            {isPending
              ? isEditing
                ? 'Saving...'
                : 'Creating...'
              : isEditing
                ? 'Save changes'
                : 'Create recipe'}
          </button>
        </div>
      </form>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
      {label} <span className="font-normal text-text-500">(optional)</span>
      <input
        type="number"
        min="1"
        step="1"
        className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
