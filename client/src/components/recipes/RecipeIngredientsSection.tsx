import { LuListChecks } from 'react-icons/lu';

const ingredientPreview = [
  { name: 'Olive oil', amount: '2 tbsp' },
  { name: 'Garlic', amount: '2 cloves' },
  { name: 'Tomatoes', amount: '1 can' },
  { name: 'Fresh basil', amount: '1 handful' },
];

export default function RecipeIngredientsSection() {
  return (
    <section className="rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm sm:p-8">
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

      <ul className="mt-8 divide-y divide-background-200 rounded-2xl border border-background-200 bg-white px-5">
        {ingredientPreview.map((ingredient) => (
          <li
            key={ingredient.name}
            className="flex items-center justify-between gap-4 py-4 text-sm"
          >
            <span className="font-bold text-text-800">{ingredient.name}</span>
            <span className="shrink-0 text-text-600">{ingredient.amount}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-sm leading-6 text-text-500">
        Ingredient editing and checklist creation will connect here next.
      </p>
    </section>
  );
}
