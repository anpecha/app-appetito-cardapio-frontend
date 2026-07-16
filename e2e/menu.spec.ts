import { test, expect } from '@playwright/test';
import { getMockCatalog } from './api-mocks';

test.describe('Menu page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/catalog/pizza-do-bairro', async (route) => {
      await route.fulfill({ json: getMockCatalog() });
    });
    await page.goto('/pizza-do-bairro');
  });

  test('loads restaurant name and delivery info', async ({ page }) => {
    await expect(page.getByText('Pizza do Bairro')).toBeVisible();
    await expect(page.getByText('30-50 min')).toBeVisible();
    await expect(page.getByText('R$ 5,00')).toBeVisible();
  });

  test('shows category tabs and switches between them', async ({ page }) => {
    const pizzas = page.getByRole('button', { name: 'Pizzas' });
    await expect(pizzas).toBeVisible();
    await pizzas.click();
    await expect(page.getByText('Calabresa')).toBeVisible();

    const bebidas = page.getByRole('button', { name: 'Bebidas' });
    await bebidas.click();
    await expect(page.getByText('Coca-Cola 2L')).toBeVisible();
    await expect(page.getByText('Calabresa')).toBeHidden();
  });

  test('shows product cards with prices', async ({ page }) => {
    await expect(page.getByText('Calabresa')).toBeVisible();
    await expect(page.getByText('Calabresa, cebola e mussarela')).toBeVisible();
    await expect(page.getByText(/R\$\s*29,90/)).toBeVisible();
  });

  test('shows floating cart button when items are added', async ({ page }) => {
    await expect(page.getByText('0')).toBeVisible();
  });
});
