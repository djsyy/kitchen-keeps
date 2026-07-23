import { useQuery } from '@tanstack/react-query';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RecipeIngredientsSection from '../components/recipes/RecipeIngredientsSection';
import RecipeOverviewCard from '../components/recipes/RecipeOverviewCard';
import RecipeStepsSection from '../components/recipes/RecipeStepsSection';
import ErrorMessage from '../components/ui/ErrorMessage';
import { getRecipe } from '../services/recipeService';

export default function RecipePage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const isValidRecipeId = Number.isInteger(recipeId) && recipeId > 0;
  const { data, error, isPending } = useQuery({
    queryKey: ['recipes', recipeId],
    queryFn: () => getRecipe(recipeId),
    enabled: isValidRecipeId,
  });
  const recipe = data?.data.recipe;

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-2 text-sm font-bold text-text-600 transition hover:text-text-950"
        >
          <LuArrowLeft className="h-4 w-4" />
          All recipes
        </Link>

        {!isValidRecipeId ? (
          <div className="mt-6">
            <ErrorMessage message="This recipe link is invalid." />
          </div>
        ) : isPending ? (
          <p className="mt-6 text-text-600">Loading recipe…</p>
        ) : error || !recipe ? (
          <div className="mt-6">
            <ErrorMessage message="We couldn’t load this recipe. Please try again." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.4fr)]">
            <RecipeOverviewCard recipe={recipe} />
            <div className="space-y-6">
              <RecipeIngredientsSection />
              <RecipeStepsSection />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
