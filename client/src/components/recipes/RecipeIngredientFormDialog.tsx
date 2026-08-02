import { useMutation, useQuery } from '@tanstack/react-query';
import { type FormEvent, useEffect, useState } from 'react';
import type {
  CreateRecipeIngredientPayload,
  RecipeIngredient,
} from '../../services/recipeIngredientService';
import {
  createIngredient,
  searchIngredients,
  type Ingredient,
} from '../../services/ingredientService';
import { ApiError } from '../../services/apiClient';
import { queryKeys } from '../../utils/queryKeys';
import ErrorMessage from '../ui/ErrorMessage';

type RecipeIngredientFormDialogProps = {
  recipeIngredient?: RecipeIngredient;
  isPending: boolean;
  error: Error | null;
  onCancel: () => void;
  onSubmit: (payload: CreateRecipeIngredientPayload) => void;
};

const isIngredient = (value: unknown): value is Ingredient => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const ingredient = value as Record<string, unknown>;
  return (
    typeof ingredient.id === 'number' &&
    typeof ingredient.name === 'string' &&
    (ingredient.status === 'active' || ingredient.status === 'hidden') &&
    (typeof ingredient.created_by_user_id === 'number' ||
      ingredient.created_by_user_id === null)
  );
};

const getDuplicateIngredient = (error: unknown): Ingredient | null => {
  if (!(error instanceof ApiError) || error.status !== 409) {
    return null;
  }

  if (!error.data || typeof error.data !== 'object') {
    return null;
  }

  const responseData = error.data as Record<string, unknown>;
  if (!responseData.data || typeof responseData.data !== 'object') {
    return null;
  }

  const data = responseData.data as Record<string, unknown>;
  return isIngredient(data.ingredient) ? data.ingredient : null;
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
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(
      recipeIngredient?.ingredient_id
        ? {
            id: recipeIngredient.ingredient_id,
            name: recipeIngredient.display_name,
            status: 'active',
            created_by_user_id: null,
          }
        : null
    );
  const [isIngredientMenuOpen, setIsIngredientMenuOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(displayName.trim());
  const search = displayName.trim();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const ingredientQuery = useQuery({
    queryKey: queryKeys.ingredients.search(debouncedSearch),
    queryFn: () => searchIngredients(debouncedSearch),
    enabled: isIngredientMenuOpen && debouncedSearch.length >= 1,
  });
  const createIngredientMutation = useMutation({
    mutationFn: createIngredient,
    onSuccess: ({ data }) => selectIngredient(data.ingredient),
    onError: (error) => {
      const duplicateIngredient = getDuplicateIngredient(error);
      if (duplicateIngredient) {
        selectIngredient(duplicateIngredient);
      }
    },
  });

  const selectIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setDisplayName(ingredient.name);
    setIsIngredientMenuOpen(false);
  };

  const matchingIngredients = ingredientQuery.data?.data.ingredients ?? [];
  const hasExactMatch = matchingIngredients.some(
    (ingredient) =>
      ingredient.name.toLocaleLowerCase() === search.toLocaleLowerCase()
  );
  const duplicateIngredient = getDuplicateIngredient(
    createIngredientMutation.error
  );
  const canCreateIngredient = search.length > 0 && search.length <= 100;
  const hasSelectedIngredient = selectedIngredient !== null;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      display_name: displayName.trim(),
      ingredient_id: selectedIngredient?.id ?? null,
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

        <div className="relative flex flex-col gap-2 text-sm font-bold text-text-800">
          <label htmlFor="recipe-ingredient-name">Ingredient</label>
          <input
            id="recipe-ingredient-name"
            required
            maxLength={255}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="ingredient-search-results"
            aria-expanded={isIngredientMenuOpen && search.length >= 2}
            className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
            value={displayName}
            onFocus={() => setIsIngredientMenuOpen(true)}
            onBlur={() => setIsIngredientMenuOpen(false)}
            onChange={(event) => {
              setDisplayName(event.currentTarget.value);
              setSelectedIngredient(null);
              setIsIngredientMenuOpen(true);
              createIngredientMutation.reset();
            }}
          />
          {isIngredientMenuOpen && search.length >= 2 && (
            <div
              id="ingredient-search-results"
              role="listbox"
              className="absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border border-background-300 bg-white py-1 shadow-lg"
            >
              {ingredientQuery.isFetching ? (
                <p className="px-3 py-2 font-normal text-text-600">
                  Searching ingredients…
                </p>
              ) : ingredientQuery.isError ? (
                <p className="px-3 py-2 font-normal text-text-600">
                  We couldn’t search ingredients. Try again.
                </p>
              ) : (
                <>
                  {matchingIngredients.map((ingredient) => (
                    <button
                      key={ingredient.id}
                      type="button"
                      role="option"
                      aria-selected={selectedIngredient?.id === ingredient.id}
                      className="flex w-full items-center justify-between px-3 py-2 text-left font-normal text-text-950 transition hover:bg-background-100"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectIngredient(ingredient)}
                    >
                      <span>{ingredient.name}</span>
                      {ingredient.created_by_user_id !== null && (
                        <span className="text-xs text-text-500">
                          Your ingredient
                        </span>
                      )}
                    </button>
                  ))}
                  {!hasExactMatch && (
                    <button
                      type="button"
                      className="w-full border-t border-background-200 px-3 py-2 text-left font-bold text-primary transition hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={
                        createIngredientMutation.isPending ||
                        !canCreateIngredient
                      }
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() =>
                        createIngredientMutation.mutate({ name: search })
                      }
                    >
                      {createIngredientMutation.isPending
                        ? 'Adding private ingredient…'
                        : `Add “${search}” as a private ingredient`}
                    </button>
                  )}
                  {matchingIngredients.length === 0 && !hasExactMatch && (
                    <p className="px-3 pb-2 font-normal text-text-500">
                      No matching ingredients found.
                    </p>
                  )}
                  {!canCreateIngredient && search.length > 100 && (
                    <p className="px-3 pb-2 font-normal text-primary-700">
                      Private ingredient names can be up to 100 characters.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {createIngredientMutation.error && !duplicateIngredient && (
          <ErrorMessage message={createIngredientMutation.error.message} />
        )}

        {!hasSelectedIngredient && (
          <p className="text-sm text-text-600">
            Choose an ingredient from search or add it privately to continue.
          </p>
        )}

        <fieldset
          disabled={!hasSelectedIngredient || isPending}
          className="contents disabled:opacity-60"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-bold text-text-800">
              Amount{' '}
              <span className="font-normal text-text-500">(optional)</span>
              <input
                maxLength={100}
                className="rounded-lg border border-background-300 bg-white px-3 py-2 text-text-950 outline-none focus:border-primary focus:ring focus:ring-primary-100"
                placeholder="2"
                value={quantityValue}
                onChange={(event) =>
                  setQuantityValue(event.currentTarget.value)
                }
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
              placeholder="Finely chopped"
              value={preparationNote}
              onChange={(event) =>
                setPreparationNote(event.currentTarget.value)
              }
            />
          </label>
        </fieldset>

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
            disabled={isPending || !hasSelectedIngredient}
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
