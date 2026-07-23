import { useQuery } from '@tanstack/react-query';
import { LuListChecks } from 'react-icons/lu';
import {
  getRecipeIngredients,
  type RecipeIngredient,
} from '../../services/recipeIngredientService';

function formatQuantity({
  quantity_value: quantityValue,
  quantity_unit: quantityUnit,
}: RecipeIngredient) {
  return [quantityValue, quantityUnit].filter(Boolean).join(' ');
}

export default function RecipeIngredientsSection({
  recipeId,
}: {
  recipeId: number;
}) {
  const { data, isError, isPending } = useQuery({
    queryKey: ['recipes', recipeId, 'ingredients'],
    queryFn: () => getRecipeIngredients(recipeId),
  });

  const recipeIngredients = data?.data.recipeIngredients ?? [];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-background-300 bg-background-50 p-6 shadow-lg sm:p-8">
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
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-text-50 transition hover:bg-primary-700"
        >
          <LuListChecks className="h-4 w-4" />
          Create checklist
        </button>
      </div>

      <ul className="mt-8 divide-y divide-background-200 rounded-xl border border-background-200 bg-background-100/70 px-5">
        {isPending ? (
          <li
            className="py-5 text-sm text-text-600"
          >
            Loading ingredients…
          </li>
        ) : isError ? (
          <li className="py-5 text-sm text-text-600">
            We couldn’t load the ingredients. Please try again.
          </li>
        ) : recipeIngredients.length === 0 ? (
          <li className="py-5 text-sm text-text-600">
            No ingredients have been added yet.
          </li>
        ) : (
          recipeIngredients.map((ingredient) => {
            const quantity = formatQuantity(ingredient);

            return (
              <li
                key={ingredient.id}
                className="flex items-start justify-between gap-4 py-4 text-sm first:pt-5 last:pb-5"
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
                {quantity && (
                  <span className="shrink-0 pt-0.5 text-text-600">
                    {quantity}
                  </span>
                )}
              </li>
            );
          })
        )}
      </ul>

      <p className="mt-4 text-sm leading-6 text-text-500">
        Ingredient editing and checklist creation will connect here next.
      </p>
    </section>
  );
}
