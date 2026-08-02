import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuArrowDown,
  LuArrowUp,
  LuListChecks,
  LuPencil,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import {
  createRecipeIngredient,
  deleteRecipeIngredient,
  getRecipeIngredients,
  reorderRecipeIngredients,
  type RecipeIngredient,
  type UpdateRecipeIngredientPayload,
  updateRecipeIngredient,
} from '../../services/recipeIngredientService';
import { createCookSession } from '../../services/cookSessionService';
import { formatIngredientQuantity } from '../../utils/recipeDisplay';
import { queryKeys } from '../../utils/queryKeys';
import ErrorMessage from '../ui/ErrorMessage';
import RecipeIngredientDeleteDialog from './RecipeIngredientDeleteDialog';
import RecipeIngredientFormDialog from './RecipeIngredientFormDialog';

export default function RecipeIngredientsSection({
  recipeId,
}: {
  recipeId: number;
}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingIngredient, setEditingIngredient] =
    useState<RecipeIngredient | null>(null);
  const [deletingIngredient, setDeletingIngredient] =
    useState<RecipeIngredient | null>(null);
  const ingredientQueryKey = queryKeys.recipes.ingredients(recipeId);
  const { data, isError, isPending } = useQuery({
    queryKey: ingredientQueryKey,
    queryFn: () => getRecipeIngredients(recipeId),
  });

  const recipeIngredients = data?.data.recipeIngredients ?? [];
  const invalidateIngredients = () =>
    queryClient.invalidateQueries({ queryKey: ingredientQueryKey });
  const createMutation = useMutation({
    mutationFn: createRecipeIngredient.bind(null, recipeId),
    onSuccess: () => {
      setIsAdding(false);
      invalidateIngredients();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      recipeIngredientId,
      payload,
    }: {
      recipeIngredientId: number;
      payload: UpdateRecipeIngredientPayload;
    }) => updateRecipeIngredient(recipeId, recipeIngredientId, payload),
    onSuccess: () => {
      setEditingIngredient(null);
      invalidateIngredients();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (recipeIngredientId: number) =>
      deleteRecipeIngredient(recipeId, recipeIngredientId),
    onSuccess: () => {
      setDeletingIngredient(null);
      invalidateIngredients();
    },
  });
  const reorderMutation = useMutation({
    mutationFn: (recipeIngredientIds: number[]) =>
      reorderRecipeIngredients(recipeId, recipeIngredientIds),
    onSuccess: invalidateIngredients,
  });
  const createCookSessionMutation = useMutation({
    mutationFn: () => createCookSession(recipeId),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cookSessions.all });
      navigate(`/cook-sessions/${data.cookSession.id}`);
    },
  });

  const moveIngredient = (ingredientId: number, direction: -1 | 1) => {
    const currentIndex = recipeIngredients.findIndex(
      (ingredient) => ingredient.id === ingredientId
    );
    const nextIndex = currentIndex + direction;

    if (
      reorderMutation.isPending ||
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= recipeIngredients.length
    ) {
      return;
    }

    const reorderedIngredients = [...recipeIngredients];
    [reorderedIngredients[currentIndex], reorderedIngredients[nextIndex]] = [
      reorderedIngredients[nextIndex],
      reorderedIngredients[currentIndex],
    ];
    reorderMutation.mutate(
      reorderedIngredients.map((ingredient) => ingredient.id)
    );
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border-2 border-t-0 border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-primary"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-text-500">
            Recipe essentials
          </p>
          <h2 className="mt-1 text-2xl font-bold text-text-950">Ingredients</h2>
          <p className="mt-1 text-sm text-text-600">
            Everything you’ll need before you start cooking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-background-300 bg-background-50 px-4 py-2.5 text-sm font-bold text-text-700 transition hover:bg-background-100"
            onClick={() => setIsAdding(true)}
          >
            <LuPlus className="h-4 w-4" />
            Add ingredient
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={createCookSessionMutation.isPending}
            onClick={() => createCookSessionMutation.mutate()}
          >
            <LuListChecks className="h-4 w-4" />
            {createCookSessionMutation.isPending
              ? 'Opening list...'
              : 'What Do I Need?'}
          </button>
        </div>
      </div>

      {createCookSessionMutation.error && (
        <ErrorMessage
          className="mt-4"
          message={createCookSessionMutation.error.message}
        />
      )}

      <ul className="mt-8 divide-y divide-background-200 rounded-xl border border-background-200 bg-background-100/70 px-5">
        {isPending ? (
          <li className="py-5 text-sm text-text-600">Loading ingredients…</li>
        ) : isError ? (
          <li className="py-5 text-sm text-text-600">
            We couldn’t load the ingredients. Please try again.
          </li>
        ) : recipeIngredients.length === 0 ? (
          <li className="py-5 text-sm text-text-600">
            No ingredients have been added yet.
          </li>
        ) : (
          recipeIngredients.map((ingredient, index) => {
            const quantity = formatIngredientQuantity(ingredient);

            return (
              <li
                key={ingredient.id}
                className="flex gap-4 py-4 text-sm first:pt-5 last:pb-5"
              >
                <span>
                  <span className="block font-bold text-text-800">
                    {ingredient.display_name}
                  </span>
                  {ingredient.preparation_note && (
                    <span className="mt-1 block text-text-600">
                      {ingredient.preparation_note}
                    </span>
                  )}
                </span>
                <div className="ml-auto flex shrink-0 items-start gap-2">
                  {quantity && (
                    <span className="pt-2 text-text-600">{quantity}</span>
                  )}
                  <div className="flex rounded-md border border-background-200 bg-background-50">
                    <button
                      type="button"
                      aria-label={`Move ${ingredient.display_name} up`}
                      className="p-2 text-text-600 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => moveIngredient(ingredient.id, -1)}
                    >
                      <LuArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${ingredient.display_name} down`}
                      className="border-l border-background-200 p-2 text-text-600 transition hover:bg-background-100 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={
                        index === recipeIngredients.length - 1 ||
                        reorderMutation.isPending
                      }
                      onClick={() => moveIngredient(ingredient.id, 1)}
                    >
                      <LuArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Edit ${ingredient.display_name}`}
                    className="rounded-md p-2 text-text-600 transition hover:bg-background-100 hover:text-primary"
                    onClick={() => setEditingIngredient(ingredient)}
                  >
                    <LuPencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${ingredient.display_name}`}
                    className="rounded-md p-2 text-text-600 transition hover:bg-primary-50 hover:text-primary"
                    onClick={() => setDeletingIngredient(ingredient)}
                  >
                    <LuTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {reorderMutation.error && (
        <ErrorMessage
          className="mt-4"
          message={reorderMutation.error.message}
        />
      )}

      {isAdding && (
        <RecipeIngredientFormDialog
          isPending={createMutation.isPending}
          error={createMutation.error}
          onCancel={() => setIsAdding(false)}
          onSubmit={(payload) => createMutation.mutate(payload)}
        />
      )}
      {editingIngredient && (
        <RecipeIngredientFormDialog
          recipeIngredient={editingIngredient}
          isPending={updateMutation.isPending}
          error={updateMutation.error}
          onCancel={() => setEditingIngredient(null)}
          onSubmit={(payload) =>
            updateMutation.mutate({
              recipeIngredientId: editingIngredient.id,
              payload,
            })
          }
        />
      )}
      {deletingIngredient && (
        <RecipeIngredientDeleteDialog
          recipeIngredient={deletingIngredient}
          isPending={deleteMutation.isPending}
          error={deleteMutation.error}
          onCancel={() => setDeletingIngredient(null)}
          onConfirm={() => deleteMutation.mutate(deletingIngredient.id)}
        />
      )}
    </section>
  );
}
