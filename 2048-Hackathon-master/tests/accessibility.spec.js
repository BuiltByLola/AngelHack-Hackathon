// @ts-check
const { test, expect } = require('@playwright/test');
const { checkA11y, injectAxe } = require('@axe-core/playwright');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Open the game with Math.random mocked so that the initial two tiles are
 * always:
 *   - tile 1: value 2 at grid position {x:0, y:0}  (column 1, row 1)
 *   - tile 2: value 2 at grid position {x:0, y:1}  (column 1, row 2)
 *
 * Pressing ArrowDown merges them → score becomes 4.
 *
 * Math.random is called in this order during setup:
 *   addRandomTile() call 1:
 *     randomAvailableCell() → Math.random() × 16 cells  → index 0  → {x:0,y:0}
 *     tile value             → Math.random() < 0.9      → 2
 *   addRandomTile() call 2:
 *     randomAvailableCell() → Math.random() × 15 cells  → index 1  → {x:0,y:1}
 *     tile value             → Math.random() < 0.9      → 2
 *
 * We return 0 for the cell-index picks (smallest index = position 0 and 1)
 * and 0 for the value picks (0 < 0.9, so value = 2).
 */
async function openWithKnownBoard(page) {
  const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');

  // Intercept before any script runs
  await page.addInitScript(() => {
    let callCount = 0;
    const realRandom = Math.random.bind(Math);
    Math.random = function mockedRandom() {
      callCount++;
      // Calls 1 & 3 → cell index pick → return 0 (picks first available cell)
      // Calls 2 & 4 → value pick      → return 0 (0 < 0.9 → value = 2)
      if (callCount === 1 || callCount === 2 || callCount === 3 || callCount === 4) {
        return 0;
      }
      // Restore real randomness for any subsequent calls (e.g. new tile after move)
      return realRandom();
    };
  });

  await page.goto(fileURL);

  // Wait for the game to fully initialise (tiles rendered)
  await page.waitForSelector('.tile');
}

// ---------------------------------------------------------------------------
// Test 1 — Score live region updates after a move
// ---------------------------------------------------------------------------

test.describe('Score live region', () => {
  test('aria-label on score container updates to reflect new score after a merge', async ({ page }) => {
    await openWithKnownBoard(page);

    // Confirm initial score label is "Score: 0"
    const scoreBox = page.locator('.score-container');
    await expect(scoreBox).toHaveAttribute('aria-label', 'Score: 0');

    // Confirm two tiles exist with value 2 (our seeded board)
    const tiles = page.locator('.tile-2');
    await expect(tiles).toHaveCount(2);

    // Press ArrowDown — merges the two 2-tiles in column 1 into a single 4-tile
    await page.keyboard.press('ArrowDown');

    // Wait for the DOM update (HTMLActuator runs inside requestAnimationFrame)
    await page.waitForFunction(() => {
      const el = document.querySelector('.score-container');
      return el && el.getAttribute('aria-label') !== 'Score: 0';
    }, { timeout: 2000 });

    // Score should now be 4 (2 + 2)
    await expect(scoreBox).toHaveAttribute('aria-label', 'Score: 4');

    // The tile-2 tiles should be gone; a tile-4 should exist
    await expect(page.locator('.tile-2')).toHaveCount(0);
    await expect(page.locator('.tile-4')).toHaveCount(1);
  });

  test('score live region has role="status" and aria-live="polite"', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    const scoreBox = page.locator('.score-container');
    await expect(scoreBox).toHaveAttribute('role', 'status');
    await expect(scoreBox).toHaveAttribute('aria-live', 'polite');
  });
});

// ---------------------------------------------------------------------------
// Test 2 — axe accessibility check: fail on critical violations
// ---------------------------------------------------------------------------

test.describe('axe accessibility', () => {
  test('page has no critical or serious WCAG 2.x violations', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    // Wait for the game to fully initialise so axe sees the live ARIA state
    await page.waitForSelector('.tile');

    await injectAxe(page);

    // Collect violations — we'll assert on them manually so we can log detail
    const violations = [];
    await checkA11y(
      page,
      undefined, // whole page
      {
        axeOptions: {
          runOnly: {
            type: 'tag',
            values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
          },
        },
        // Only surface critical and serious — ignore minor/moderate
        violationCallback: (axeViolations) => {
          for (const v of axeViolations) {
            if (v.impact === 'critical' || v.impact === 'serious') {
              violations.push(v);
            }
          }
        },
        // Don't throw automatically — we throw below with better output
        includedImpacts: ['critical', 'serious'],
      },
    );

    if (violations.length > 0) {
      const summary = violations
        .map((v) => {
          const nodes = v.nodes
            .map((n) => `    • ${n.html}\n      Fix: ${n.failureSummary}`)
            .join('\n');
          return `[${v.impact.toUpperCase()}] ${v.id} — ${v.description}\n${nodes}`;
        })
        .join('\n\n');

      throw new Error(
        `${violations.length} critical/serious axe violation(s) found:\n\n${summary}`,
      );
    }
  });

  test('game container has role="application" and accessible label', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    const gameContainer = page.locator('.game-container');
    await expect(gameContainer).toHaveAttribute('role', 'application');
    await expect(gameContainer).toHaveAttribute('aria-label', '2048 game board');
  });

  test('html element has lang attribute', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });

  test('all buttons are keyboard-focusable', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    // Verify each button/role=button element has a tabindex that allows focus
    const restartBtn = page.locator('.restart-button');
    await expect(restartBtn).toHaveAttribute('tabindex', '0');

    const hcToggle = page.locator('.hc-toggle');
    // Native <button> is always focusable — no tabindex needed, but confirm it exists
    await expect(hcToggle).toBeVisible();
    await expect(hcToggle).toBeEnabled();
  });

  test('grid decorative cells are hidden from AT', async ({ page }) => {
    const fileURL = 'file://' + path.resolve(__dirname, '..', 'index.html');
    await page.goto(fileURL);

    const gridContainer = page.locator('.grid-container');
    await expect(gridContainer).toHaveAttribute('aria-hidden', 'true');
  });
});
