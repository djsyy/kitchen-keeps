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
import { IngredientListSkeleton } from '../ui/LoadingSkeletons';
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
    <section className="border-background-300 bg-background-50 relative overflow-hidden rounded-2xl border-2 border-t-0 p-6 shadow-lg sm:p-8">
      <div
        aria-hidden="true"
        className="bg-primary absolute inset-x-0 top-0 h-1.5"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-text-500 text-sm font-bold tracking-wide uppercase">
            Recipe essentials
          </p>
          <h2 className="text-text-950 mt-1 text-2xl font-bold">Ingredients</h2>
          <p className="text-text-600 mt-1 text-sm">
            Everything you’ll need before you start cooking.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="border-background-300 bg-background-50 text-text-700 hover:bg-background-100 inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-bold transition"
            onClick={() => setIsAdding(true)}
          >
            <LuPlus className="h-4 w-4" />
            Add ingredient
          </button>
          <button
            type="button"
            className="bg-primary text-text-50 hover:bg-primary-700 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
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

      <ul className="divide-background-200 border-background-200 bg-background-100/70 mt-8 divide-y rounded-xl border px-5">
        {isPending ? (
          <li>
            <IngredientListSkeleton />
          </li>
        ) : isError ? (
          <li className="text-text-600 py-5 text-sm">
            We couldn’t load the ingredients. Please try again.
          </li>
        ) : recipeIngredients.length === 0 ? (
          <li className="text-text-600 py-5 text-sm">
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
                  <span className="text-text-800 block font-bold">
                    {ingredient.display_name}
                  </span>
                  {ingredient.preparation_note && (
                    <span className="text-text-600 mt-1 block">
                      {ingredient.preparation_note}
                    </span>
                  )}
                  {ingredient.ingredient_id === null ? (
                    <span className="bg-secondary-100 text-secondary-900 mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold">
                      Not linked to Pantry
                    </span>
                  ) : ingredient.ingredient_status === 'hidden' ? (
                    <span className="bg-secondary-100 text-secondary-900 mt-2 inline-flex rounded-full px-2 py-1 text-xs font-bold">
                      Archived ingredient
                    </span>
                  ) : null}
                </span>
                <div className="ml-auto flex shrink-0 items-start gap-2">
                  {quantity && (
                    <span className="text-text-600 pt-2">{quantity}</span>
                  )}
                  <div className="border-background-200 bg-background-50 flex rounded-md border">
                    <button
                      type="button"
                      aria-label={`Move ${ingredient.display_name} up`}
                      className="text-text-600 hover:bg-background-100 p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => moveIngredient(ingredient.id, -1)}
                    >
                      <LuArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Move ${ingredient.display_name} down`}
                      className="border-background-200 text-text-600 hover:bg-background-100 border-l p-2 transition disabled:cursor-not-allowed disabled:opacity-40"
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
                    className="text-text-600 hover:bg-background-100 hover:text-primary rounded-md p-2 transition"
                    onClick={() => setEditingIngredient(ingredient)}
                  >
                    <LuPencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${ingredient.display_name}`}
                    className="text-text-600 hover:bg-primary-50 hover:text-primary rounded-md p-2 transition"
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
