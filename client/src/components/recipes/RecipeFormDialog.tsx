import { LuImagePlus, LuTrash2 } from 'react-icons/lu';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import type { CreateRecipePayload, Recipe } from '../../services/recipeService';
import ErrorMessage from '../ui/ErrorMessage';

export type RecipeImageAction =
  | { type: 'unchanged' }
  | { type: 'upload'; file: File }
  | { type: 'remove' };

export type RecipeFormSubmission = {
  payload: CreateRecipePayload;
  imageAction: RecipeImageAction;
};

type RecipeFormDialogProps = {
  recipe?: Recipe;
  isPending: boolean;
  error: Error | null;
  onChange: () => void;
  onCancel: () => void;
  onSubmit: (submission: RecipeFormSubmission) => void;
  onRetryImageAction?: () => void;
  onContinueWithoutImage?: () => void;
};

const toOptionalPositiveInteger = (value: string): number | null =>
  value === '' ? null : Number(value);

export default function RecipeFormDialog({
  recipe,
  isPending,
  error,
  onChange,
  onCancel,
  onSubmit,
  onRetryImageAction,
  onContinueWithoutImage,
}: RecipeFormDialogProps) {
  const isEditing = Boolean(recipe);
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [description, setDescription] = useState(recipe?.description ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isImageRemoved, setIsImageRemoved] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(
    recipe?.prep_time_minutes?.toString() ?? ''
  );
  const [cookTimeMinutes, setCookTimeMinutes] = useState(
    recipe?.cook_time_minutes?.toString() ?? ''
  );
  const [servings, setServings] = useState(recipe?.servings?.toString() ?? '');
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isAwaitingImageRetry = Boolean(onRetryImageAction);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [imageFile]);

  const imageSource =
    imagePreviewUrl ?? (!isImageRemoved ? recipe?.image_url : null);

  const handleImageChange = (file: File | null) => {
    if (!file) {
      return;
    }

    onChange();

    const isSupportedType = ['image/jpeg', 'image/png', 'image/webp'].includes(
      file.type
    );

    if (!isSupportedType) {
      setImageError('Choose a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError('Choose an image that is 5 MB or smaller');
      return;
    }

    setImageError(null);
    setImageFile(file);
    setIsImageRemoved(false);
  };

  const getImageAction = (): RecipeImageAction => {
    if (imageFile) {
      return { type: 'upload', file: imageFile };
    }

    if (isImageRemoved) {
      return { type: 'remove' };
    }

    return { type: 'unchanged' };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onRetryImageAction) {
      onRetryImageAction();
      return;
    }

    onSubmit({
      payload: {
        title: title.trim(),
        description: description.trim() || null,
        prep_time_minutes: toOptionalPositiveInteger(prepTimeMinutes),
        cook_time_minutes: toOptionalPositiveInteger(cookTimeMinutes),
        servings: toOptionalPositiveInteger(servings),
      },
      imageAction: getImageAction(),
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
            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border px-3 py-2 outline-none focus:ring"
            maxLength={255}
            required
            value={title}
            disabled={isAwaitingImageRetry}
            onChange={(event) => {
              setTitle(event.currentTarget.value);
              onChange();
            }}
          />
        </label>

        <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
          Description{' '}
          <span className="text-text-500 font-normal">(optional)</span>
          <textarea
            className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 min-h-24 rounded-lg border px-3 py-2 outline-none focus:ring"
            maxLength={1000}
            value={description}
            disabled={isAwaitingImageRetry}
            onChange={(event) => {
              setDescription(event.currentTarget.value);
              onChange();
            }}
          />
        </label>

        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-text-800 text-sm font-bold">
              Recipe image{' '}
              <span className="text-text-500 font-normal">(optional)</span>
            </p>
            <span className="text-text-500 text-xs">
              JPG, PNG, or WebP · 5 MB max
            </span>
          </div>
          <div className="relative">
            <button
              type="button"
              aria-label={
                imageSource ? 'Change recipe image' : 'Choose recipe image'
              }
              className="border-background-300 focus-visible:outline-primary group relative block w-full overflow-hidden rounded-lg border text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed"
              disabled={isAwaitingImageRetry}
              onClick={() => imageInputRef.current?.click()}
            >
              {imageSource ? (
                <img
                  src={imageSource}
                  alt="Recipe image preview"
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="bg-background-100 text-text-500 hover:bg-background-100/50 flex h-44 flex-col items-center justify-center gap-2 text-sm hover:cursor-pointer">
                  <LuImagePlus className="h-8 w-8" aria-hidden="true" />
                </div>
              )}
              <span
                aria-hidden="true"
                className="bg-text-950/55 text-text-50 pointer-events-none absolute inset-0 flex items-center justify-center gap-2 text-sm font-bold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <LuImagePlus className="h-5 w-5" />
                {imageSource ? 'Change image' : 'Choose image'}
              </span>
            </button>
            {imageSource && (
              <button
                type="button"
                aria-label="Remove recipe image"
                className="text-text-50 focus-visible:outline-text-50 absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-lg drop-shadow-md transition hover:text-red-200 focus-visible:outline-2 focus-visible:outline-offset-2"
                disabled={isAwaitingImageRetry}
                onClick={(event) => {
                  event.stopPropagation();
                  setImageFile(null);
                  setImageError(null);
                  setIsImageRemoved(Boolean(recipe?.image_url));
                  onChange();
                }}
              >
                <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isAwaitingImageRetry}
            onChange={(event) => {
              handleImageChange(event.currentTarget.files?.[0] ?? null);
              event.currentTarget.value = '';
            }}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField
            label="Prep time (minutes)"
            value={prepTimeMinutes}
            onChange={(value) => {
              setPrepTimeMinutes(value);
              onChange();
            }}
            disabled={isAwaitingImageRetry}
            max={1440}
          />
          <NumberField
            label="Cook time (minutes)"
            value={cookTimeMinutes}
            onChange={(value) => {
              setCookTimeMinutes(value);
              onChange();
            }}
            disabled={isAwaitingImageRetry}
            max={1440}
          />
          <NumberField
            label="Servings"
            value={servings}
            onChange={(value) => {
              setServings(value);
              onChange();
            }}
            disabled={isAwaitingImageRetry}
            max={100}
          />
        </div>

        {(error || imageError) && (
          <ErrorMessage message={error?.message ?? imageError ?? ''} />
        )}
        <div className="flex justify-end gap-3">
          {isAwaitingImageRetry && onContinueWithoutImage && (
            <button
              type="button"
              className="text-text-700 hover:bg-background-100 rounded-lg px-4 py-2.5 text-sm font-bold transition"
              disabled={isPending}
              onClick={onContinueWithoutImage}
            >
              {recipe?.image_url
                ? 'Keep current image'
                : 'Continue without image'}
            </button>
          )}
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
            disabled={isPending || !title.trim() || Boolean(imageError)}
          >
            {isPending
              ? isAwaitingImageRetry
                ? 'Retrying image...'
                : isEditing
                  ? 'Saving...'
                  : 'Creating...'
              : isAwaitingImageRetry
                ? 'Retry image upload'
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
  disabled,
  max,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  max: number;
}) {
  return (
    <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
      {label} <span className="text-text-500 font-normal">(optional)</span>
      <input
        type="number"
        min="1"
        max={max}
        step="1"
        className="border-background-300 bg-background-50 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border px-3 py-2 outline-none focus:ring"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    </label>
  );
}
