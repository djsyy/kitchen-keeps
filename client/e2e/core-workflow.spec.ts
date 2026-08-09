import { expect, test } from '@playwright/test';

test('a new user can create and edit a recipe, then add a pantry item', async ({
  page,
}) => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const email = `e2e-${suffix}@example.test`;
  const recipeTitle = `E2E recipe ${suffix}`;
  const updatedRecipeTitle = `Updated E2E recipe ${suffix}`;

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);

  await page.getByRole('link', { name: 'Create one' }).click();
  await page.getByLabel('Name').fill('E2E User');
  await page.getByLabel('Email address').fill(email);
  await page
    .getByRole('textbox', { name: 'Password', exact: true })
    .fill('secure-e2e-password');
  await page
    .getByRole('textbox', { name: 'Confirm Password', exact: true })
    .fill('secure-e2e-password');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole('button', { name: 'New Recipe' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByLabel('Title').fill(recipeTitle);
  await page.getByRole('button', { name: 'Create recipe' }).click();

  await page.getByRole('heading', { name: recipeTitle }).click();
  await expect(page).toHaveURL(/\/recipes\/\d+$/);
  await page.getByRole('button', { name: 'Edit recipe' }).click();
  await page.getByRole('dialog').getByLabel('Title').fill(updatedRecipeTitle);
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('heading', { name: updatedRecipeTitle })
  ).toBeVisible();

  await page.getByLabel('Open profile menu').click();
  await page.getByRole('menuitem', { name: 'Pantry' }).click();
  await expect(page).toHaveURL(/\/pantry$/);
  await page.getByLabel('Search ingredients').fill('Eggs');
  await page.getByRole('option', { name: 'Eggs' }).click();
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(page.getByText('Eggs', { exact: true })).toBeVisible();

  await page.getByLabel('Open profile menu').click();
  await page.getByRole('menuitem', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
});
