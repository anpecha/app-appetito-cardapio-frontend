import { test, expect } from '@playwright/test';
import { getMockCatalog } from './api-mocks';

test.describe('Product modal & cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/catalog/pizza-do-bairro', async (route) => {
      await route.fulfill({ json: getMockCatalog() });
    });
    await page.goto('/pizza-do-bairro');
  });

  test('opens product modal and selects size', async ({ page }) => {
    await page.getByText('Calabresa').click();

    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Calabresa, cebola e mussarela')).toBeVisible();

    await page.getByRole('button', { name: 'Grande' }).click();
    await expect(page.getByRole('button', { name: 'Grande' })).toHaveAttribute('data-selected', 'true');
  });

  test('adds product with options to cart', async ({ page }) => {
    await page.getByText('Calabresa').click();
    await page.getByRole('button', { name: 'Grande' }).click();
    await page.getByRole('button', { name: 'Bacon' }).click();

    await page.getByRole('button', { name: 'Adicionar' }).first().click();
    await expect(page.getByText('R$ 54,90')).toBeVisible();
  });
});
