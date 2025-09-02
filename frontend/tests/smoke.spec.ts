import { test, expect } from '@playwright/test'

test('home renders product cards with images', async ({ page }) => {
  await page.goto('/')
  // Wait for any grid to appear
  const cards = page.locator('a.group.relative.h-\[500px\]')
  await expect(cards.first()).toBeVisible({ timeout: 10000 })
  // Check at least one image has non-empty src
  const img = cards.first().locator('img')
  await expect(img).toHaveAttribute('src', /.+/)
})

