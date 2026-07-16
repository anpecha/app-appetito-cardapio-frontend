import { test, expect } from '@playwright/test';
import { getMockOrder } from './api-mocks';

test.describe('Order tracking', () => {
  test('shows order details with status', async ({ page }) => {
    await page.route('**/orders/order-12345', async (route) => {
      await route.fulfill({ json: getMockOrder({ status: 'preparing' }) });
    });

    await page.goto('/pizza-do-bairro/order/order-12345');
    await expect(page.getByText('Pedido Confirmado!')).toBeVisible();
    await expect(page.getByText('Preparando')).toBeVisible();
    await expect(page.getByText('Calabresa')).toBeVisible();
    await expect(page.getByText(/R\$\s*49,90/)).toBeVisible();
    await expect(page.getByText(/R\$\s*5,00/)).toBeVisible();
    await expect(page.getByText('Rua Exemplo')).toBeVisible();
    await expect(page.getByText('Dinheiro')).toBeVisible();
  });

  test('shows cancelled order state', async ({ page }) => {
    await page.route('**/orders/order-12345', async (route) => {
      await route.fulfill({ json: getMockOrder({ status: 'cancelled' }) });
    });

    await page.goto('/pizza-do-bairro/order/order-12345');
    await expect(page.getByText('Pedido Cancelado')).toBeVisible();
    await expect(page.getByText('Cancelado')).toBeVisible();
  });

  test('shows not found for invalid order', async ({ page }) => {
    await page.route('**/orders/invalid-id', async (route) => {
      await route.fulfill({ status: 404 });
    });

    await page.goto('/pizza-do-bairro/order/invalid-id');
    await expect(page.getByText('Pedido não encontrado')).toBeVisible();
  });
});
