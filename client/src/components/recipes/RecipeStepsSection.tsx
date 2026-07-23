const stepPreview = [
  'Warm the olive oil in a large pan over medium heat.',
  'Add the garlic and tomatoes, then simmer until softened.',
  'Finish with fresh basil and season to taste.',
];

export default function RecipeStepsSection() {
  return (
    <section className="rounded-3xl border border-background-300 bg-background-50 p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-text-500">
          Recipe steps
        </p>
        <h2 className="mt-1 text-2xl font-bold text-text-950">Steps</h2>
        <p className="mt-1 text-sm text-text-600">
          Follow these steps to prepare your recipe.
        </p>
      </div>

      <ol className="mt-8 space-y-4">
        {stepPreview.map((step, index) => (
          <li key={step} className="flex gap-4 text-sm leading-6 text-text-700">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-bold text-secondary-800">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>

      <p className="mt-4 text-sm leading-6 text-text-500">
        Step editing will connect here next.
      </p>
    </section>
  );
}
