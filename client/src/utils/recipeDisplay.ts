type RecipeTiming = {
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
};

type IngredientQuantity = {
  quantity_value: string | null;
  quantity_unit: string | null;
};

export function getRecipeTotalTime({
  prep_time_minutes: prepTimeMinutes,
  cook_time_minutes: cookTimeMinutes,
}: RecipeTiming) {
  return (prepTimeMinutes ?? 0) + (cookTimeMinutes ?? 0);
}

export function formatIngredientQuantity({
  quantity_value: quantityValue,
  quantity_unit: quantityUnit,
}: IngredientQuantity) {
  return [quantityValue, quantityUnit].filter(Boolean).join(' ');
}
