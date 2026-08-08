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
import { IngredientSearchSkeleton } from '../ui/LoadingSkeletons';

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
      recipeIngredient?.ingredient_id &&
        recipeIngredient.ingredient_status !== 'hidden'
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
  const isUnlinkedIngredient = recipeIngredient?.ingredient_id === null;
  const isArchivedIngredient = recipeIngredient?.ingredient_status === 'hidden';

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
        aria-labelledby="recipe-ingredient-form-title"
        aria-describedby="recipe-ingredient-form-description"
        className="border-background-300 bg-background-50 flex max-h-full w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-2xl border p-6 shadow-xl"
        onSubmit={handleSubmit}
      >
        <div>
          <h1
            id="recipe-ingredient-form-title"
            className="text-text-950 text-xl font-bold"
          >
            {isEditing ? 'Edit ingredient' : 'Add ingredient'}
          </h1>
          <p
            id="recipe-ingredient-form-description"
            className="text-text-600 mt-1 text-sm"
          >
            Add the amount and any preparation details you need while cooking.
          </p>
          {isEditing && (isUnlinkedIngredient || isArchivedIngredient) && (
            <p className="border-secondary-200 bg-secondary-50 text-secondary-900 mt-3 rounded-lg border px-3 py-2 text-sm leading-5">
              {isArchivedIngredient
                ? 'This ingredient is archived.'
                : 'This ingredient is not linked to your Pantry.'}{' '}
              Select an existing ingredient or add it privately to include this
              recipe in verified Pantry recommendations.
            </p>
          )}
        </div>

        <div className="text-text-800 relative flex flex-col gap-2 text-sm font-bold">
          <label htmlFor="recipe-ingredient-name">Ingredient</label>
          <input
            id="recipe-ingredient-name"
            required
            maxLength={255}
            role="combobox"
            aria-autocomplete="list"
            aria-controls="ingredient-search-results"
            aria-expanded={isIngredientMenuOpen && search.length >= 2}
            className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
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
              className="border-background-300 absolute top-full z-10 mt-1 w-full overflow-hidden rounded-lg border bg-white py-1 shadow-lg"
            >
              {ingredientQuery.isFetching ? (
                <IngredientSearchSkeleton />
              ) : ingredientQuery.isError ? (
                <p className="text-text-600 px-3 py-2 font-normal">
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
                      className="text-text-950 hover:bg-background-100 flex w-full items-center justify-between px-3 py-2 text-left font-normal transition"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectIngredient(ingredient)}
                    >
                      <span>{ingredient.name}</span>
                      {ingredient.created_by_user_id !== null && (
                        <span className="text-text-500 text-xs">
                          Your ingredient
                        </span>
                      )}
                    </button>
                  ))}
                  {!hasExactMatch && (
                    <button
                      type="button"
                      className="border-background-200 text-primary hover:bg-primary-50 w-full border-t px-3 py-2 text-left font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
                    <p className="text-text-500 px-3 pb-2 font-normal">
                      No matching ingredients found.
                    </p>
                  )}
                  {!canCreateIngredient && search.length > 100 && (
                    <p className="text-primary-700 px-3 pb-2 font-normal">
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
          <p className="text-text-600 text-sm">
            Choose an ingredient from search or add it privately to continue.
          </p>
        )}

        <fieldset
          disabled={!hasSelectedIngredient || isPending}
          className="contents disabled:opacity-60"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
              Amount{' '}
              <span className="text-text-500 font-normal">(optional)</span>
              <input
                maxLength={100}
                className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
                placeholder="2"
                value={quantityValue}
                onChange={(event) =>
                  setQuantityValue(event.currentTarget.value)
                }
              />
            </label>
            <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
              Unit <span className="text-text-500 font-normal">(optional)</span>
              <input
                maxLength={50}
                className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
                placeholder="tbsp"
                value={quantityUnit}
                onChange={(event) => setQuantityUnit(event.currentTarget.value)}
              />
            </label>
          </div>

          <label className="text-text-800 flex flex-col gap-2 text-sm font-bold">
            Preparation note{' '}
            <span className="text-text-500 font-normal">(optional)</span>
            <input
              maxLength={255}
              className="border-background-300 text-text-950 focus:border-primary focus:ring-primary-100 rounded-lg border bg-white px-3 py-2 outline-none focus:ring"
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
            className="text-text-700 hover:bg-background-100 rounded-lg px-4 py-2.5 text-sm font-bold transition"
            disabled={isPending}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-text-50 hover:bg-primary-700 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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
