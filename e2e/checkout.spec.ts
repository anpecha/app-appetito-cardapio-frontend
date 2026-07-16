import { test, expect } from '@playwright/test';
import { getMockCatalog, getMockOrder } from './api-mocks';

const MOCK_COUPON = { valid: true, discount_percent: 10, discount_amount: 4.99, description: '10% off' };
const MOCK_ORDER = getMockOrder();

test.describe('Checkout flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/catalog/pizza-do-bairro', async (route) => {
      await route.fulfill({ json: getMockCatalog() });
    });
    await page.route('**/coupons/validate', async (route) => {
      await route.fulfill({ json: MOCK_COUPON });
    });
    await page.route('**/orders/create', async (route) => {
      await route.fulfill({ json: MOCK_ORDER });
    });

    await page.goto('/pizza-do-bairro');
    await page.getByText('Coca-Cola 2L').click();
    await page.getByRole('button', { name: 'Adicionar' }).first().click();
    await page.getByText('Ir para o carrinho').click();
  });

  test('shows cart with added items', async ({ page }) => {
    await expect(page.getByText('Coca-Cola 2L')).toBeVisible();
    await expect(page.getByText(/R\$\s*12,00/)).toBeVisible();
  });

  test('adjusts item quantity in cart', async ({ page }) => {
    const addBtn = page.locator('button').filter({ has: page.locator('.lucide-plus') }).first();
    await addBtn.click();
    await expect(page.getByText(/R\$\s*24,00/)).toBeVisible();

    const removeBtn = page.locator('button').filter({ has: page.locator('.lucide-minus') }).first();
    await removeBtn.click();
    await expect(page.getByText(/R\$\s*12,00/)).toBeVisible();
  });
});

test.describe('Checkout form submission', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/catalog/pizza-do-bairro', async (route) => {
      await route.fulfill({ json: getMockCatalog() });
    });
    await page.route('**/coupons/validate', async (route) => {
      await route.fulfill({ json: MOCK_COUPON });
    });
    await page.route('**/orders/create', async (route) => {
      await route.fulfill({ json: getMockOrder() });
    });
    await page.route('**/orders/order-12345', async (route) => {
      await route.fulfill({ json: getMockOrder({ status: 'preparing' }) });
    });

    await page.goto('/pizza-do-bairro');
    await page.getByText('Mussarela').click();
    await page.getByRole('button', { name: 'Adicionar' }).first().click();
    await page.getByText('Ir para o carrinho').click();
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click();
  });

  test('fills checkout form and submits', async ({ page }) => {
    await expect(page.getByText('Finalizar compra')).toBeVisible();

    await page.getByPlaceholder('Rua').fill('Rua das Flores');
    await page.getByPlaceholder('Número').fill('100');
    await page.getByPlaceholder('Bairro').fill('Centro');
    await page.getByPlaceholder('Cidade').fill('São Paulo');

    await page.getByText('PIX').click();
    await page.getByRole('button', { name: 'Finalizar Pedido' }).click();
    await expect(page.getByText('Pedido Confirmado!')).toBeVisible();
  });

  test('applies coupon code', async ({ page }) => {
    await page.getByPlaceholder('Inserir cupom').fill('PIZZA10');
    await page.getByRole('button', { name: 'Validar' }).click();
    await expect(page.getByText('10% off')).toBeVisible();
  });
});
