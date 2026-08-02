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
        aria-labelledby="recipe-form-title"
        aria-describedby="recipe-form-description"
        className="border-background-300 bg-background-50 flex max-h-full w-full max-w-2xl flex-col gap-4 overflow-y-auto rounded-3xl border p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="recipe-form-title"
            className="text-text-950 text-xl font-bold"
          >
            {isEditing ? 'Edit recipe' : 'Create a recipe'}
          </h1>
          <p
            id="recipe-form-description"
            className="text-text-600 mt-1 text-sm"
          >
            {isEditing
              ? 'Update this recipe’s details.'
              : 'Add the basics now. You can add ingredients and steps afterwards.'}
          </p>
        </div>

        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Title
          <input
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
            maxLength={255}
            required
            value={title}
            onChange={(event) => setTitle(event.currentTarget.value)}
          />
        </label>

        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Description{' '}
          <span className="text-text-500 font-normal">(optional)</span>
          <textarea
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 min-h-24 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
            maxLength={1000}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
          />
        </label>

        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Image URL{' '}
          <span className="text-text-500 font-normal">(optional)</span>
          <input
            type="url"
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
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
          <NumberField
            label="Servings"
            value={servings}
            onChange={setServings}
          />
        </div>

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
    <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
      {label} <span className="text-text-500 font-normal">(optional)</span>
      <input
        type="number"
        min="1"
        step="1"
        className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
