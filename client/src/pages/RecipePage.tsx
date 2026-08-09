import { useQuery } from '@tanstack/react-query';
import { LuArrowLeft } from 'react-icons/lu';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import RecipeIngredientsSection from '../components/recipes/RecipeIngredientsSection';
import RecipeEditDialog from '../components/recipes/RecipeEditDialog';
import RecipeOverviewCard from '../components/recipes/RecipeOverviewCard';
import RecipeStepsSection from '../components/recipes/RecipeStepsSection';
import ErrorMessage from '../components/ui/ErrorMessage';
import { RecipeDetailSkeleton } from '../components/ui/LoadingSkeletons';
import { getRecipe } from '../services/recipeService';
import { queryKeys } from '../utils/queryKeys';

export default function RecipePage() {
  const { id } = useParams();
  const recipeId = Number(id);
  const isValidRecipeId = Number.isInteger(recipeId) && recipeId > 0;
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const { data, error, isPending } = useQuery({
    queryKey: queryKeys.recipes.detail(recipeId),
    queryFn: () => getRecipe(recipeId),
    enabled: isValidRecipeId,
  });
  const recipe = data?.data.recipe;

  if (isValidRecipeId && isPending) {
    return <RecipeDetailSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Link
          to="/recipes"
          className="text-text-600 hover:text-text-950 inline-flex items-center gap-2 text-sm font-bold transition"
        >
          <LuArrowLeft className="h-4 w-4" />
          All recipes
        </Link>

        {!isValidRecipeId ? (
          <div className="mt-6">
            <ErrorMessage message="This recipe link is invalid." />
          </div>
        ) : error || !recipe ? (
          <div className="mt-6">
            <ErrorMessage message="We couldn’t load this recipe. Please try again." />
          </div>
        ) : (
          <div className="mt-6 space-y-10">
            <RecipeOverviewCard
              recipe={recipe}
              onEdit={() => setIsEditFormOpen(true)}
            />
            <RecipeIngredientsSection recipeId={recipeId} />
            <RecipeStepsSection recipeId={recipeId} />
          </div>
        )}
        {recipe && isEditFormOpen && (
          <RecipeEditDialog
            recipe={recipe}
            onClose={() => setIsEditFormOpen(false)}
          />
        )}
      </div>
    </main>
  );
}
