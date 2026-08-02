export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  recipes: {
    all: ['recipes'] as const,
    detail: (recipeId: number) => ['recipes', recipeId] as const,
    ingredients: (recipeId: number) =>
      ['recipes', recipeId, 'ingredients'] as const,
    steps: (recipeId: number) => ['recipes', recipeId, 'steps'] as const,
  },
  libraries: {
    all: ['libraries'] as const,
    detail: (libraryId: number) => ['libraries', libraryId] as const,
  },
  cookSessions: {
    all: ['cook-sessions'] as const,
    detail: (cookSessionId: number) =>
      ['cook-sessions', cookSessionId] as const,
  },
  ingredients: {
    search: (search: string) => ['ingredients', 'search', search] as const,
  },
};
