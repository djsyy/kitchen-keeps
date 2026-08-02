import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  LuArrowLeft,
  LuBookOpen,
  LuClock3,
  LuEllipsisVertical,
  LuPencil,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LibraryDeleteDialog from '../components/library/LibraryDeleteDialog';
import LibraryFormDialog from '../components/library/LibraryFormDialog';
import LibraryRecipePickerDialog from '../components/library/LibraryRecipePickerDialog';
import RecipeImagePlaceholder from '../components/recipes/RecipeImagePlaceholder';
import Navbar from '../components/layout/Navbar';
import ErrorMessage from '../components/ui/ErrorMessage';
import { LibraryDetailSkeleton } from '../components/ui/LoadingSkeletons';
import { libraryColorClasses, libraryIcons } from '../config/libraryIcons';
import useCardOptionsMenu from '../hooks/useCardOptionsMenu';
import {
  addRecipeToLibrary,
  deleteLibrary,
  getLibrary,
  removeRecipeFromLibrary,
  type CreateLibraryPayload,
  updateLibrary,
} from '../services/libraryService';
import type { Recipe } from '../services/recipeService';
import { getRecipeTotalTime } from '../utils/recipeDisplay';
import { queryKeys } from '../utils/queryKeys';

function formatCreatedDate(createdAt?: string) {
  if (!createdAt) {
    return 'Recently created';
  }

  return `Created ${new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(createdAt))}`;
}

export default function LibraryPage() {
  const { id } = useParams();
  const libraryId = Number(id);
  const isValidLibraryId = Number.isInteger(libraryId) && libraryId > 0;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isRecipePickerOpen, setIsRecipePickerOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { data, error, isPending } = useQuery({
    queryKey: queryKeys.libraries.detail(libraryId),
    queryFn: () => getLibrary(libraryId),
    enabled: isValidLibraryId,
  });

  const library = data?.data.library;
  const recipes = data?.data.recipes ?? [];
  const addRecipeMutation = useMutation({
    mutationFn: (recipeId: number) => addRecipeToLibrary(libraryId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.libraries.detail(libraryId),
      });
    },
  });
  const removeRecipeMutation = useMutation({
    mutationFn: (recipeId: number) =>
      removeRecipeFromLibrary(libraryId, recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.libraries.detail(libraryId),
      });
    },
  });
  const updateLibraryMutation = useMutation({
    mutationFn: (payload: CreateLibraryPayload) =>
      updateLibrary(libraryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.libraries.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.libraries.detail(libraryId),
      });
      setIsEditFormOpen(false);
    },
  });
  const deleteLibraryMutation = useMutation({
    mutationFn: () => deleteLibrary(libraryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.libraries.all });
      navigate('/library', { replace: true });
    },
  });
  const LibraryIcon = library ? libraryIcons[library.icon_key] : LuBookOpen;
  const colorClass = library
    ? libraryColorClasses[library.color_key]
    : libraryColorClasses.primary;

  if (isValidLibraryId && isPending) {
    return <LibraryDetailSkeleton />;
  }

  return (
    <main className="bg-background min-h-screen">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/library"
          className="text-text-600 hover:text-text-950 inline-flex items-center gap-2 text-sm font-bold transition"
        >
          <LuArrowLeft className="h-4 w-4" />
          All libraries
        </Link>

        {!isValidLibraryId ? (
          <div className="mt-6">
            <ErrorMessage message="This library link is invalid." />
          </div>
        ) : error || !library ? (
          <div className="mt-6">
            <ErrorMessage message="We couldn’t load this library. Please try again." />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,2fr)]">
            <aside className="border-background-300 bg-background-50 h-fit rounded-3xl border p-6 shadow-sm">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${colorClass}`}
              >
                <LibraryIcon className="h-7 w-7" />
              </span>
              <h1 className="text-text-950 mt-5 text-3xl font-bold">
                {library.name}
              </h1>
              {library.description && (
                <p className="text-text-600 mt-3 text-sm leading-6">
                  {library.description}
                </p>
              )}

              <div className="border-background-200 text-text-500 mt-6 border-t pt-5 text-sm">
                <p className="flex items-center gap-2">
                  <LuClock3 className="h-4 w-4" />
                  {formatCreatedDate(library.created_at)}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  type="button"
                  className="border-background-300 text-text-700 hover:bg-background-100 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold"
                  onClick={() => setIsEditFormOpen(true)}
                >
                  <LuPencil className="h-4 w-4" />
                  Edit
                </button>
                <button
                  type="button"
                  aria-label="Delete library"
                  className="border-background-300 text-text-600 hover:bg-background-100 rounded-lg border p-2"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <LuTrash2 className="h-4 w-4" />
                </button>
              </div>
            </aside>

            <section className="border-background-300 bg-background-50 rounded-3xl border p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-text-500 text-sm font-bold tracking-wide uppercase">
                    Collection
                  </p>
                  <h2 className="text-text-950 mt-1 text-2xl font-bold">
                    Recipes
                  </h2>
                  <p className="text-text-600 mt-1 text-sm">
                    Recipes you add to {library.name} will appear here.
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-primary text-text-50 hover:bg-primary-700 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition"
                  onClick={() => setIsRecipePickerOpen(true)}
                >
                  <LuPlus className="h-4 w-4" />
                  Add recipe
                </button>
              </div>

              {removeRecipeMutation.error && (
                <ErrorMessage
                  className="mt-5"
                  message={removeRecipeMutation.error.message}
                />
              )}

              {recipes.length > 0 ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {recipes.map((recipe) => {
                    const isRemoving =
                      removeRecipeMutation.isPending &&
                      removeRecipeMutation.variables === recipe.id;

                    return (
                      <LibraryRecipeCard
                        key={recipe.id}
                        recipe={recipe}
                        isRemoving={isRemoving}
                        isRemovalPending={removeRecipeMutation.isPending}
                        onRemove={() => removeRecipeMutation.mutate(recipe.id)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="border-background-300 mt-8 rounded-2xl border border-dashed px-6 py-14 text-center">
                  <span className="bg-background-100 text-text-600 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl">
                    <LuBookOpen className="h-6 w-6" />
                  </span>
                  <h3 className="text-text-950 mt-4 text-lg font-bold">
                    No recipes in this library yet
                  </h3>
                  <p className="text-text-600 mx-auto mt-2 max-w-md text-sm leading-6">
                    Add recipes here to keep this collection organized and easy
                    to browse.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
      {isRecipePickerOpen && library && (
        <LibraryRecipePickerDialog
          memberRecipeIds={recipes.map((recipe) => recipe.id)}
          isPending={addRecipeMutation.isPending}
          error={addRecipeMutation.error}
          onAdd={(recipeId) => addRecipeMutation.mutate(recipeId)}
          onClose={() => setIsRecipePickerOpen(false)}
        />
      )}
      {isEditFormOpen && library && (
        <LibraryFormDialog
          key={library.id}
          library={library}
          isPending={updateLibraryMutation.isPending}
          error={updateLibraryMutation.error}
          onCancel={() => setIsEditFormOpen(false)}
          onSubmit={(payload) => updateLibraryMutation.mutate(payload)}
        />
      )}
      {isDeleteDialogOpen && library && (
        <LibraryDeleteDialog
          library={library}
          isPending={deleteLibraryMutation.isPending}
          error={deleteLibraryMutation.error}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={() => deleteLibraryMutation.mutate()}
        />
      )}
    </main>
  );
}

type LibraryRecipeCardProps = {
  recipe: Recipe;
  isRemoving: boolean;
  isRemovalPending: boolean;
  onRemove: () => void;
};

function LibraryRecipeCard({
  recipe,
  isRemoving,
  isRemovalPending,
  onRemove,
}: LibraryRecipeCardProps) {
  const { containerRef, isOptionsOpen, toggleOptions } =
    useCardOptionsMenu<HTMLElement>();
  const totalTime = getRecipeTotalTime(recipe);

  return (
    <article
      ref={containerRef}
      className="border-background-300 bg-background-50 relative overflow-hidden rounded-2xl border shadow-sm"
    >
      <button
        type="button"
        aria-label={`Show options for ${recipe.title}`}
        aria-expanded={isOptionsOpen}
        aria-haspopup="menu"
        className="bg-background-50/90 text-text-600 hover:bg-background-100 hover:text-text-950 absolute top-3 right-3 z-10 rounded-md p-1 transition"
        onClick={toggleOptions}
      >
        <LuEllipsisVertical className="h-5 w-5" />
      </button>
      {isOptionsOpen && (
        <div
          role="menu"
          className="border-background-300 bg-background-50 absolute top-12 right-3 z-10 w-44 rounded-lg border p-1 shadow-md"
        >
          <Link
            to={`/recipes/${recipe.id}`}
            role="menuitem"
            className="text-text-700 hover:bg-background-100 block w-full rounded-md px-3 py-2 text-left text-sm font-bold transition"
          >
            Edit recipe
          </Link>
          <button
            type="button"
            role="menuitem"
            className="text-primary hover:bg-primary-100 w-full rounded-md px-3 py-2 text-left text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isRemovalPending}
            onClick={onRemove}
          >
            {isRemoving ? 'Removing...' : 'Remove from library'}
          </button>
        </div>
      )}
      <Link
        to={`/recipes/${recipe.id}`}
        className="hover:bg-background-100 block transition"
      >
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="h-32 w-full object-cover"
          />
        ) : (
          <RecipeImagePlaceholder
            className="h-32 w-full"
            iconClassName="h-8 w-8"
          />
        )}
        <div className="p-4">
          <h3 className="text-text-950 text-lg font-bold">{recipe.title}</h3>
          {recipe.description && (
            <p className="text-text-600 mt-1 line-clamp-2 text-sm leading-5">
              {recipe.description}
            </p>
          )}
          {totalTime > 0 && (
            <p className="text-text-600 mt-3 text-sm">{totalTime} min</p>
          )}
        </div>
      </Link>
    </article>
  );
}
