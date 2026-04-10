export type Framework = "playwright" | "cypress";
export type Category =
  | "auth"
  | "network"
  | "assertions"
  | "navigation"
  | "forms"
  | "fixtures"
  | "visual"
  | "file"
  | "wait"
  | "selectors";

export interface Snippet {
  id: string;
  title: string;
  description: string;
  framework: Framework;
  category: Category;
  tags: string[];
  code: string;
  language: "typescript" | "javascript";
}

export const snippets: Snippet[] = [
  // ── PLAYWRIGHT ──────────────────────────────────────────────
  {
    id: "pw-001",
    title: "Intercept & mock a GET request",
    description: "Mock a REST API response so your test never hits the real server.",
    framework: "playwright",
    category: "network",
    tags: ["intercept", "mock", "api", "route"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

test('shows mocked user data', async ({ page }) => {
  // Intercept before navigation
  await page.route('**/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, name: 'QA Engineer' }),
    });
  });

  await page.goto('/profile');
  await expect(page.getByText('QA Engineer')).toBeVisible();
});`,
  },
  {
    id: "pw-002",
    title: "Login via API and set auth state",
    description: "Authenticate through the API and reuse the session across tests — no UI login needed.",
    framework: "playwright",
    category: "auth",
    tags: ["login", "session", "storageState", "api"],
    language: "typescript",
    code: `import { test, request } from '@playwright/test';

test.beforeAll(async () => {
  const apiContext = await request.newContext();

  const response = await apiContext.post('/api/login', {
    data: { email: 'user@test.com', password: 'secret' },
  });

  // Save auth state (cookies + localStorage) to file
  await apiContext.storageState({ path: 'auth.json' });
  await apiContext.dispose();
});

// In playwright.config.ts, set: storageState: 'auth.json'
// All tests in this project will reuse the session`,
  },
  {
    id: "pw-003",
    title: "Wait for a network response",
    description: "Wait for a specific API call to complete before asserting.",
    framework: "playwright",
    category: "wait",
    tags: ["waitForResponse", "network", "async"],
    language: "typescript",
    code: `test('waits for API before asserting', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for the API call triggered by the page load
  const response = await page.waitForResponse(
    (res) => res.url().includes('/api/dashboard') && res.status() === 200
  );

  const data = await response.json();
  expect(data.items.length).toBeGreaterThan(0);
});`,
  },
  {
    id: "pw-004",
    title: "Upload a file",
    description: "Trigger a file input and upload a local file.",
    framework: "playwright",
    category: "file",
    tags: ["upload", "file", "input"],
    language: "typescript",
    code: `test('uploads a file', async ({ page }) => {
  await page.goto('/upload');

  // Set the file directly on the input — no dialog needed
  await page.locator('input[type="file"]').setInputFiles('tests/fixtures/sample.pdf');

  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.getByText('Upload successful')).toBeVisible();
});`,
  },
  {
    id: "pw-005",
    title: "Screenshot on test failure",
    description: "Automatically capture a screenshot whenever a test fails.",
    framework: "playwright",
    category: "visual",
    tags: ["screenshot", "failure", "debug"],
    language: "typescript",
    code: `// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    screenshot: 'only-on-failure', // 'on' | 'off' | 'only-on-failure'
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
});

// Screenshots land in: test-results/<test-name>/screenshot.png`,
  },
  {
    id: "pw-006",
    title: "Custom fixture for logged-in page",
    description: "Create a reusable fixture that provides a pre-authenticated page to every test.",
    framework: "playwright",
    category: "fixtures",
    tags: ["fixture", "auth", "reusable", "extend"],
    language: "typescript",
    code: `import { test as base, expect } from '@playwright/test';

type MyFixtures = { loggedInPage: Page };

export const test = base.extend<MyFixtures>({
  loggedInPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'user@test.com');
    await page.fill('[name="password"]', 'secret');
    await page.click('[type="submit"]');
    await page.waitForURL('/dashboard');

    // Hand the authenticated page to the test
    await use(page);
  },
});

export { expect };

// Usage in any test file:
// import { test, expect } from './fixtures';
// test('dashboard loads', async ({ loggedInPage }) => { ... });`,
  },
  {
    id: "pw-007",
    title: "Select from a dropdown",
    description: "Select an option by label, value, or index from a native <select> element.",
    framework: "playwright",
    category: "forms",
    tags: ["select", "dropdown", "forms"],
    language: "typescript",
    code: `test('selects an option', async ({ page }) => {
  await page.goto('/settings');

  const select = page.locator('select[name="country"]');

  // By visible label
  await select.selectOption({ label: 'Egypt' });

  // By value attribute
  // await select.selectOption({ value: 'EG' });

  // By index (0-based)
  // await select.selectOption({ index: 2 });

  await expect(select).toHaveValue('EG');
});`,
  },
  {
    id: "pw-008",
    title: "Assert element is visible and contains text",
    description: "Basic but essential: check an element exists and shows the right content.",
    framework: "playwright",
    category: "assertions",
    tags: ["visible", "text", "toBeVisible", "toHaveText"],
    language: "typescript",
    code: `test('element is visible with correct text', async ({ page }) => {
  await page.goto('/home');

  const heading = page.getByRole('heading', { level: 1 });

  // Playwright auto-waits for the element and retries assertions
  await expect(heading).toBeVisible();
  await expect(heading).toHaveText('Welcome back');

  // Partial match
  await expect(heading).toContainText('Welcome');
});`,
  },

  // ── CYPRESS ─────────────────────────────────────────────────
  {
    id: "cy-001",
    title: "Intercept & stub a POST request",
    description: "Intercept a POST request and return a stubbed response — no real server needed.",
    framework: "cypress",
    category: "network",
    tags: ["intercept", "stub", "mock", "api"],
    language: "javascript",
    code: `describe('Form submission', () => {
  it('shows success message after submit', () => {
    cy.intercept('POST', '/api/contact', {
      statusCode: 200,
      body: { message: 'Sent!' },
    }).as('submitForm');

    cy.visit('/contact');
    cy.get('[name="email"]').type('test@test.com');
    cy.get('[name="message"]').type('Hello');
    cy.get('[type="submit"]').click();

    cy.wait('@submitForm');
    cy.contains('Sent!').should('be.visible');
  });
});`,
  },
  {
    id: "cy-002",
    title: "Login via cy.request (skip UI)",
    description: "Authenticate by hitting the API directly — much faster than typing through the login form.",
    framework: "cypress",
    category: "auth",
    tags: ["login", "api", "cy.request", "session"],
    language: "javascript",
    code: `// cypress/support/commands.js
Cypress.Commands.add('loginByApi', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/login',
    body: { email, password },
  }).then(({ body }) => {
    // Store the token however your app uses it
    window.localStorage.setItem('auth_token', body.token);
  });
});

// Usage in tests:
// cy.loginByApi('user@test.com', 'secret');
// cy.visit('/dashboard'); // already authenticated`,
  },
  {
    id: "cy-003",
    title: "Wait for a network response",
    description: "Use cy.intercept + cy.wait to pause until an API call completes before asserting.",
    framework: "cypress",
    category: "wait",
    tags: ["wait", "intercept", "alias", "network"],
    language: "javascript",
    code: `it('waits for API before asserting', () => {
  // Set up the intercept BEFORE the action that triggers it
  cy.intercept('GET', '/api/items').as('getItems');

  cy.visit('/items');

  // Wait for the aliased request to complete
  cy.wait('@getItems').then(({ response }) => {
    expect(response.statusCode).to.eq(200);
    expect(response.body).to.have.length.greaterThan(0);
  });

  cy.contains('Item list loaded').should('be.visible');
});`,
  },
  {
    id: "cy-004",
    title: "Custom command with TypeScript types",
    description: "Create a typed custom Cypress command and register it so autocomplete works.",
    framework: "cypress",
    category: "fixtures",
    tags: ["custom command", "typescript", "extend", "reusable"],
    language: "typescript",
    code: `// cypress/support/commands.ts
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(\`[data-testid="\${testId}"]\`);
});

// cypress/support/index.d.ts
declare namespace Cypress {
  interface Chainable {
    getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
  }
}

// Usage:
// cy.getByTestId('submit-button').click();
// cy.getByTestId('error-message').should('be.visible');`,
  },
  {
    id: "cy-005",
    title: "Upload a file with cy.fixture",
    description: "Upload a file stored in your fixtures folder using selectFile.",
    framework: "cypress",
    category: "file",
    tags: ["upload", "fixture", "selectFile", "file"],
    language: "javascript",
    code: `it('uploads a file', () => {
  cy.visit('/upload');

  // File must be in cypress/fixtures/
  cy.get('input[type="file"]')
    .selectFile('cypress/fixtures/sample.pdf');

  cy.get('[type="submit"]').click();
  cy.contains('Upload successful').should('be.visible');
});`,
  },
  {
    id: "cy-006",
    title: "Assert text, visibility, and value",
    description: "Core assertion patterns you'll use in almost every test.",
    framework: "cypress",
    category: "assertions",
    tags: ["should", "contain", "visible", "value", "assert"],
    language: "javascript",
    code: `it('covers core assertions', () => {
  cy.visit('/profile');

  // Text content
  cy.get('h1').should('contain.text', 'Welcome');

  // Visibility
  cy.get('.error-banner').should('not.exist');
  cy.get('.success-msg').should('be.visible');

  // Input value
  cy.get('[name="email"]').should('have.value', 'user@test.com');

  // Attribute
  cy.get('img.avatar').should('have.attr', 'alt', 'User avatar');

  // CSS class
  cy.get('.btn-primary').should('have.class', 'active');
});`,
  },
  {
    id: "cy-007",
    title: "Navigate and assert URL",
    description: "Go to a page and verify the resulting URL.",
    framework: "cypress",
    category: "navigation",
    tags: ["visit", "url", "location", "navigate"],
    language: "javascript",
    code: `it('navigates and checks URL', () => {
  cy.visit('/');

  cy.get('nav a[href="/about"]').click();

  // Assert full URL
  cy.url().should('include', '/about');

  // Or check just the pathname
  cy.location('pathname').should('eq', '/about');
});`,
  },
  {
    id: "cy-008",
    title: "Select from a dropdown",
    description: "Select a <select> option by text, value, or index.",
    framework: "cypress",
    category: "forms",
    tags: ["select", "dropdown", "forms"],
    language: "javascript",
    code: `it('selects a dropdown option', () => {
  cy.visit('/settings');

  // By visible text
  cy.get('select[name="country"]').select('Egypt');

  // By value
  // cy.get('select[name="country"]').select('EG');

  // By index (0-based)
  // cy.get('select[name="country"]').select(2);

  cy.get('select[name="country"]').should('have.value', 'EG');
});`,
  },

  // ── PLAYWRIGHT ADDITIONS ─────────────────────────────────────
  {
    id: "pw-009",
    title: "Handle OAuth popup / new page",
    description: "Intercept a new browser tab that opens during OAuth and authenticate inside it.",
    framework: "playwright",
    category: "auth",
    tags: ["oauth", "popup", "new page", "multi-tab"],
    language: "typescript",
    code: `test('OAuth login via popup', async ({ page, context }) => {
  await page.goto('/login');

  // Listen for the new tab BEFORE clicking — race-condition safe
  const [popup] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'Sign in with Google' }).click(),
  ]);

  await popup.waitForLoadState('domcontentloaded');
  await popup.fill('[name="email"]', 'user@gmail.com');
  await popup.fill('[name="password"]', 'secret');
  await popup.getByRole('button', { name: 'Next' }).click();

  // Wait for OAuth to complete and the popup to close
  await popup.waitForEvent('close');

  await expect(page.getByText('Welcome')).toBeVisible();
});`,
  },
  {
    id: "pw-010",
    title: "Simulate token expiry and refresh",
    description: "Return a 401 on the first API call, then a valid response on the retry to verify token-refresh logic.",
    framework: "playwright",
    category: "auth",
    tags: ["401", "token refresh", "intercept", "retry"],
    language: "typescript",
    code: `test('app refreshes token on 401', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/data', async (route) => {
    callCount++;
    if (callCount === 1) {
      // First call returns Unauthorized
      await route.fulfill({ status: 401, body: JSON.stringify({ error: 'Unauthorized' }) });
    } else {
      // Second call succeeds after the app has refreshed the token
      await route.fulfill({ status: 200, body: JSON.stringify({ items: ['a', 'b'] }) });
    }
  });

  await page.goto('/dashboard');

  await expect(page.getByText('a')).toBeVisible();
  expect(callCount).toBe(2); // confirm the retry happened
});`,
  },
  {
    id: "pw-011",
    title: "Assert redirect for unauthenticated user",
    description: "Verify that a protected route redirects to /login when no session is present.",
    framework: "playwright",
    category: "auth",
    tags: ["redirect", "protected route", "unauthenticated", "url"],
    language: "typescript",
    code: `test('redirects unauthenticated user to /login', async ({ page }) => {
  // Navigate without any auth cookies or localStorage session
  await page.goto('/dashboard');

  // Playwright waits for navigation to settle before asserting
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
});`,
  },
  {
    id: "pw-012",
    title: "Simulate slow network response",
    description: "Add artificial latency to an API route to test loading states and spinners.",
    framework: "playwright",
    category: "network",
    tags: ["delay", "slow network", "loading", "intercept"],
    language: "typescript",
    code: `test('shows loading spinner during slow API', async ({ page }) => {
  await page.route('**/api/reports', async (route) => {
    // Pause 2 seconds before responding
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.fulfill({ status: 200, body: JSON.stringify({ rows: [] }) });
  });

  await page.goto('/reports');

  // Spinner visible while waiting for the delayed response
  await expect(page.getByTestId('loading-spinner')).toBeVisible();
  await expect(page.getByTestId('loading-spinner')).toBeHidden();
});`,
  },
  {
    id: "pw-013",
    title: "Block third-party analytics scripts",
    description: "Abort requests to analytics domains so tests run faster and don't fire real tracking events.",
    framework: "playwright",
    category: "network",
    tags: ["block", "analytics", "third-party", "abort"],
    language: "typescript",
    code: `// Run before each test — add to a beforeEach or global setup
test.beforeEach(async ({ page }) => {
  await page.route(
    /googletagmanager|segment\.io|hotjar|mixpanel|intercom/,
    (route) => route.abort()  // silently drop the request
  );
});

test('page loads without analytics noise', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});`,
  },
  {
    id: "pw-014",
    title: "Inject custom request headers",
    description: "Add feature-flag or API-version headers to every outgoing request.",
    framework: "playwright",
    category: "network",
    tags: ["headers", "request", "modify", "feature flag"],
    language: "typescript",
    code: `test('sends feature-flag header with every request', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(), // preserve existing headers
        'x-feature-flag': 'new-dashboard',
        'x-api-version': '2',
      },
    });
  });

  await page.goto('/dashboard');
  await expect(page.getByTestId('new-dashboard-banner')).toBeVisible();
});`,
  },
  {
    id: "pw-015",
    title: "Assert table row count",
    description: "Count rows in an HTML table and assert the exact number.",
    framework: "playwright",
    category: "assertions",
    tags: ["table", "rows", "count", "toHaveCount"],
    language: "typescript",
    code: `test('table renders the correct number of rows', async ({ page }) => {
  await page.goto('/users');

  const rows = page.locator('table tbody tr');

  // Playwright retries the assertion until the count matches
  await expect(rows).toHaveCount(10);

  // Or assert a minimum
  const count = await rows.count();
  expect(count).toBeGreaterThanOrEqual(5);
});`,
  },
  {
    id: "pw-016",
    title: "Assert all list items match a condition",
    description: "Iterate over every matched element using locator.all() and assert each one.",
    framework: "playwright",
    category: "assertions",
    tags: ["list", "all", "each", "contains", "loop"],
    language: "typescript",
    code: `test('every search result contains the keyword', async ({ page }) => {
  await page.goto('/search?q=cypress');

  const items = page.locator('[data-testid="result-item"]');
  await expect(items).not.toHaveCount(0);

  // locator.all() resolves the locator to an array of elements
  for (const item of await items.all()) {
    await expect(item).toContainText(/cypress/i);
  }
});`,
  },
  {
    id: "pw-017",
    title: "Assert element attributes and CSS",
    description: "Check href, aria-label, disabled state, and computed CSS on elements.",
    framework: "playwright",
    category: "assertions",
    tags: ["attribute", "aria", "disabled", "css", "toHaveAttribute"],
    language: "typescript",
    code: `test('button and link attributes are correct', async ({ page }) => {
  await page.goto('/profile');

  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toHaveAttribute('type', 'submit');
  await expect(saveBtn).not.toBeDisabled();
  await expect(saveBtn).toHaveCSS('cursor', 'pointer');

  // ARIA label on an image
  const avatar = page.getByRole('img', { name: /avatar/i });
  await expect(avatar).toHaveAttribute('alt', /avatar/i);

  // Data attribute
  const badge = page.getByTestId('plan-badge');
  await expect(badge).toHaveAttribute('data-plan', 'pro');
});`,
  },
  {
    id: "pw-018",
    title: "Browser back and forward navigation",
    description: "Programmatically navigate browser history and assert the URL at each step.",
    framework: "playwright",
    category: "navigation",
    tags: ["goBack", "goForward", "history", "url"],
    language: "typescript",
    code: `test('back and forward navigation works', async ({ page }) => {
  await page.goto('/page-a');
  await page.getByRole('link', { name: 'Go to B' }).click();
  await expect(page).toHaveURL(/page-b/);

  await page.goBack();
  await expect(page).toHaveURL(/page-a/);

  await page.goForward();
  await expect(page).toHaveURL(/page-b/);
});`,
  },
  {
    id: "pw-019",
    title: "Open link in new tab and interact",
    description: "Capture a new tab opened by target=_blank, interact with it, and close it.",
    framework: "playwright",
    category: "navigation",
    tags: ["new tab", "popup", "target blank", "context"],
    language: "typescript",
    code: `test('link opens in new tab with correct content', async ({ page, context }) => {
  await page.goto('/docs');

  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Open Guide' }).click(),
  ]);

  await newPage.waitForLoadState('domcontentloaded');
  await expect(newPage).toHaveURL(/guide/);
  await expect(newPage.getByRole('heading', { level: 1 })).toBeVisible();

  await newPage.close();
});`,
  },
  {
    id: "pw-020",
    title: "Reload page and assert persistence",
    description: "Reload and confirm that localStorage-backed state (e.g. theme) survives.",
    framework: "playwright",
    category: "navigation",
    tags: ["reload", "refresh", "localStorage", "persist"],
    language: "typescript",
    code: `test('theme preference persists after reload', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // reload() keeps cookies and localStorage intact
  await page.reload();

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});`,
  },
  {
    id: "pw-021",
    title: "Check and uncheck a checkbox",
    description: "Toggle a checkbox on and off, asserting state after each interaction.",
    framework: "playwright",
    category: "forms",
    tags: ["checkbox", "check", "uncheck", "isChecked"],
    language: "typescript",
    code: `test('checkbox toggles correctly', async ({ page }) => {
  await page.goto('/preferences');

  const checkbox = page.getByRole('checkbox', { name: 'Email notifications' });

  await expect(checkbox).not.toBeChecked();

  await checkbox.check();
  await expect(checkbox).toBeChecked();

  await checkbox.uncheck();
  await expect(checkbox).not.toBeChecked();
});`,
  },
  {
    id: "pw-022",
    title: "Select a radio button",
    description: "Pick a radio option by accessible name and confirm mutually exclusive selection.",
    framework: "playwright",
    category: "forms",
    tags: ["radio", "check", "getByRole", "exclusive"],
    language: "typescript",
    code: `test('selects express shipping radio', async ({ page }) => {
  await page.goto('/checkout');

  await page.getByRole('radio', { name: 'Express shipping' }).check();
  await expect(page.getByRole('radio', { name: 'Express shipping' })).toBeChecked();

  // Standard option should be deselected — radios are mutually exclusive
  await expect(page.getByRole('radio', { name: 'Standard shipping' })).not.toBeChecked();
});`,
  },
  {
    id: "pw-023",
    title: "Fill a date input",
    description: "Set a value on a native <input type='date'> using ISO format.",
    framework: "playwright",
    category: "forms",
    tags: ["date", "input", "fill", "ISO"],
    language: "typescript",
    code: `test('sets a date on a date input', async ({ page }) => {
  await page.goto('/booking');

  const dateInput = page.locator('input[type="date"][name="check-in"]');

  // Native date inputs require ISO 8601 format: YYYY-MM-DD
  await dateInput.fill('2025-08-15');
  await expect(dateInput).toHaveValue('2025-08-15');

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Aug 15, 2025')).toBeVisible();
});`,
  },
  {
    id: "pw-024",
    title: "Clear a field and retype",
    description: "Clear an existing input value and type a replacement — the edit-form pattern.",
    framework: "playwright",
    category: "forms",
    tags: ["clear", "fill", "triple-click", "retype"],
    language: "typescript",
    code: `test('clears and updates the display name', async ({ page }) => {
  await page.goto('/edit-profile');

  const nameInput = page.getByLabel('Display name');

  // Triple-click selects all, then fill replaces the selection
  await nameInput.click({ clickCount: 3 });
  await nameInput.fill('Jane Doe');
  await expect(nameInput).toHaveValue('Jane Doe');

  // Alternative: explicit clear then fill
  // await nameInput.clear();
  // await nameInput.fill('Jane Doe');
});`,
  },
  {
    id: "pw-025",
    title: "Parametrize tests with a data loop",
    description: "Run the same assertion logic for multiple roles using a for...of loop over test data.",
    framework: "playwright",
    category: "fixtures",
    tags: ["parametrize", "data-driven", "loop", "roles"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

const roles = [
  { name: 'admin',  email: 'admin@test.com',  canDelete: true  },
  { name: 'editor', email: 'editor@test.com', canDelete: false },
  { name: 'viewer', email: 'viewer@test.com', canDelete: false },
];

for (const { name, email, canDelete } of roles) {
  test(\`\${name} sees correct actions\`, async ({ page }) => {
    await page.goto(\`/login?email=\${email}\`);

    const deleteBtn = page.getByRole('button', { name: 'Delete' });

    if (canDelete) {
      await expect(deleteBtn).toBeVisible();
    } else {
      await expect(deleteBtn).not.toBeVisible();
    }
  });
}`,
  },
  {
    id: "pw-026",
    title: "Load a JSON fixture from disk",
    description: "Read a JSON file using Node's fs and use the data to drive test inputs.",
    framework: "playwright",
    category: "fixtures",
    tags: ["fixture", "json", "readFileSync", "data-driven"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// tests/fixtures/user.json → { "name": "Alice", "email": "alice@test.com" }
const user = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/user.json'), 'utf-8')
);

test('fills form from fixture data', async ({ page }) => {
  await page.goto('/create-user');

  await page.getByLabel('Name').fill(user.name);
  await page.getByLabel('Email').fill(user.email);
  await page.getByRole('button', { name: 'Submit' }).click();

  await expect(page.getByText(\`Welcome, \${user.name}\`)).toBeVisible();
});`,
  },
  {
    id: "pw-027",
    title: "Full-page screenshot comparison",
    description: "Capture a full-page screenshot and compare it against a stored baseline.",
    framework: "playwright",
    category: "visual",
    tags: ["screenshot", "visual regression", "baseline", "toHaveScreenshot"],
    language: "typescript",
    code: `test('home page matches visual baseline', async ({ page }) => {
  await page.goto('/home');

  // Wait for images, fonts, and animations to settle
  await page.waitForLoadState('networkidle');

  // First run creates the baseline PNG; subsequent runs diff against it
  await expect(page).toHaveScreenshot('home-page.png', {
    fullPage: true,
    maxDiffPixelRatio: 0.02, // tolerate 2% pixel difference (anti-aliasing)
  });
});`,
  },
  {
    id: "pw-028",
    title: "Screenshot a single element",
    description: "Capture a specific component rather than the whole page for focused visual tests.",
    framework: "playwright",
    category: "visual",
    tags: ["screenshot", "element", "component", "locator"],
    language: "typescript",
    code: `test('hero banner matches baseline', async ({ page }) => {
  await page.goto('/');

  const hero = page.getByTestId('hero-banner');
  await hero.scrollIntoViewIfNeeded();

  await expect(hero).toHaveScreenshot('hero-banner.png', {
    maxDiffPixelRatio: 0.01,
  });
});`,
  },
  {
    id: "pw-029",
    title: "Download a file and verify content",
    description: "Trigger a download, save it locally, and assert the filename and file content.",
    framework: "playwright",
    category: "file",
    tags: ["download", "csv", "save", "readFileSync"],
    language: "typescript",
    code: `import path from 'path';
import fs from 'fs';

test('downloads a CSV report', async ({ page }) => {
  await page.goto('/reports');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export CSV' }).click(),
  ]);

  const filePath = path.join(__dirname, 'downloads', download.suggestedFilename());
  await download.saveAs(filePath);

  expect(download.suggestedFilename()).toMatch(/\\.csv$/);

  const content = fs.readFileSync(filePath, 'utf-8');
  expect(content).toContain('email,name,role'); // assert CSV header row
});`,
  },
  {
    id: "pw-030",
    title: "Wait for element to disappear",
    description: "Assert that a loading spinner or toast notification becomes hidden.",
    framework: "playwright",
    category: "wait",
    tags: ["toBeHidden", "disappear", "loading", "spinner"],
    language: "typescript",
    code: `test('spinner disappears after data loads', async ({ page }) => {
  await page.goto('/dashboard');

  const spinner = page.getByTestId('loading-spinner');

  // Playwright retries until hidden — default timeout 30 s
  await expect(spinner).toBeHidden();

  // Data table should now be fully rendered
  await expect(page.getByRole('table')).toBeVisible();
});`,
  },
  {
    id: "pw-031",
    title: "Poll until a JS condition is true",
    description: "Use waitForFunction to keep polling the DOM until a dynamic condition resolves.",
    framework: "playwright",
    category: "wait",
    tags: ["waitForFunction", "poll", "condition", "live feed"],
    language: "typescript",
    code: `test('waits until feed has at least 5 items', async ({ page }) => {
  await page.goto('/live-feed');

  // Evaluate runs inside the browser; Playwright polls until it returns truthy
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="feed-item"]').length >= 5,
    { timeout: 15_000, polling: 500 }
  );

  await expect(page.locator('[data-testid="feed-item"]')).toHaveCount(5);
});`,
  },
  {
    id: "pw-032",
    title: "Select nth element and filter by text",
    description: "Use nth() to pick by position and filter() to narrow by text content.",
    framework: "playwright",
    category: "selectors",
    tags: ["nth", "filter", "hasText", "locator"],
    language: "typescript",
    code: `test('targets specific cards by position and text', async ({ page }) => {
  await page.goto('/products');

  // nth() is 0-indexed — picks the third card
  const thirdCard = page.locator('[data-testid="product-card"]').nth(2);
  await expect(thirdCard).toBeVisible();

  // filter() narrows the locator set by inner text
  const saleCard = page
    .locator('[data-testid="product-card"]')
    .filter({ hasText: 'Sale' })
    .first();

  await expect(saleCard.getByTestId('sale-badge')).toBeVisible();
});`,
  },
  {
    id: "pw-033",
    title: "Interact with Shadow DOM elements",
    description: "Pierce a shadow root to fill inputs inside web components.",
    framework: "playwright",
    category: "selectors",
    tags: ["shadow DOM", "web component", "pierce", "locator"],
    language: "typescript",
    code: `test('fills input inside a shadow DOM component', async ({ page }) => {
  await page.goto('/web-components-demo');

  // Playwright's locator API automatically pierces open shadow roots
  const shadowInput = page.locator('my-input-component input');
  await shadowInput.fill('hello');

  await expect(shadowInput).toHaveValue('hello');
});`,
  },

  // ── CYPRESS ADDITIONS ────────────────────────────────────────
  {
    id: "cy-009",
    title: "OAuth cross-origin flow with cy.origin",
    description: "Handle an OAuth provider on a separate domain using cy.origin.",
    framework: "cypress",
    category: "auth",
    tags: ["oauth", "cy.origin", "cross-origin", "google"],
    language: "javascript",
    code: `it('logs in via Google OAuth', () => {
  cy.visit('/login');
  cy.get('[data-testid="google-login"]').click();

  // cy.origin enables commands to run on a different domain
  cy.origin('https://accounts.google.com', () => {
    cy.get('input[type="email"]').type('user@gmail.com');
    cy.get('#identifierNext').click();
    cy.get('input[type="password"]', { timeout: 8000 }).type('secret');
    cy.get('#passwordNext').click();
  });

  cy.url().should('include', '/dashboard');
  cy.contains('Welcome').should('be.visible');
});`,
  },
  {
    id: "cy-010",
    title: "Cache auth session with cy.session",
    description: "Persist login state across tests so the API login runs once per spec, not per test.",
    framework: "cypress",
    category: "auth",
    tags: ["cy.session", "cache", "performance", "auth"],
    language: "javascript",
    code: `Cypress.Commands.add('loginWithSession', (email, password) => {
  cy.session(
    [email, password], // cache key — change it to invalidate the session
    () => {
      cy.request({ method: 'POST', url: '/api/login', body: { email, password } })
        .then(({ body }) => {
          window.localStorage.setItem('auth_token', body.token);
        });
    },
    { cacheAcrossSpecs: true } // reuse across multiple spec files
  );
});

// Usage in any test:
// cy.loginWithSession('user@test.com', 'password');
// cy.visit('/dashboard');`,
  },
  {
    id: "cy-011",
    title: "Assert unauthenticated redirect",
    description: "Clear session data and confirm that protected routes redirect to /login.",
    framework: "cypress",
    category: "auth",
    tags: ["redirect", "protected", "unauthenticated", "clearLocalStorage"],
    language: "javascript",
    code: `it('redirects to /login when not authenticated', () => {
  // Wipe any existing auth state
  cy.clearLocalStorage();
  cy.clearCookies();

  cy.visit('/dashboard', { failOnStatusCode: false });

  cy.url().should('include', '/login');
  cy.get('h1').should('contain.text', 'Sign in');
});`,
  },
  {
    id: "cy-012",
    title: "Simulate slow API response",
    description: "Delay a network response to test loading spinners and skeleton screens.",
    framework: "cypress",
    category: "network",
    tags: ["delay", "loading", "intercept", "slow network"],
    language: "javascript",
    code: `it('shows spinner during slow API response', () => {
  cy.intercept('GET', '/api/reports', (req) => {
    req.on('response', (res) => {
      res.setDelay(2000); // 2-second artificial delay
    });
  }).as('slowReports');

  cy.visit('/reports');

  cy.get('[data-testid="spinner"]').should('be.visible');
  cy.wait('@slowReports');
  cy.get('[data-testid="spinner"]').should('not.exist');
});`,
  },
  {
    id: "cy-013",
    title: "Block third-party scripts",
    description: "Destroy analytics/tracking requests globally so they don't pollute test runs.",
    framework: "cypress",
    category: "network",
    tags: ["block", "abort", "analytics", "third-party"],
    language: "javascript",
    code: `// cypress/support/e2e.js — applied before every test
beforeEach(() => {
  cy.intercept(/googletagmanager|segment\.io|hotjar|intercom/, (req) => {
    req.destroy(); // abort — prevents real events from firing
  });
});

it('page loads without analytics noise', () => {
  cy.visit('/home');
  cy.get('h1').should('be.visible');
});`,
  },
  {
    id: "cy-014",
    title: "Inject custom request headers",
    description: "Modify outgoing requests to carry feature-flag or API-version headers.",
    framework: "cypress",
    category: "network",
    tags: ["headers", "request", "intercept", "feature flag"],
    language: "javascript",
    code: `it('sends feature-flag header to enable new dashboard', () => {
  cy.intercept('GET', '/api/**', (req) => {
    req.headers['x-feature-flag'] = 'new-dashboard';
    req.headers['x-api-version'] = '2';
  });

  cy.visit('/dashboard');
  cy.get('[data-testid="new-dashboard-banner"]').should('be.visible');
});`,
  },
  {
    id: "cy-015",
    title: "Assert table row count",
    description: "Count table rows and assert an exact or minimum number.",
    framework: "cypress",
    category: "assertions",
    tags: ["table", "rows", "have.length", "count"],
    language: "javascript",
    code: `it('table renders the correct number of rows', () => {
  cy.visit('/users');

  cy.get('table tbody tr').should('have.length', 10);

  // Or assert a minimum
  cy.get('table tbody tr')
    .its('length')
    .should('be.gte', 5);
});`,
  },
  {
    id: "cy-016",
    title: "Assert every list item contains text",
    description: "Use .each() to iterate over results and assert each one matches a condition.",
    framework: "cypress",
    category: "assertions",
    tags: ["each", "contain", "list", "loop"],
    language: "javascript",
    code: `it('every search result mentions the keyword', () => {
  cy.visit('/search?q=playwright');

  cy.get('[data-testid="result-item"]')
    .should('have.length.greaterThan', 0)
    .each(($el) => {
      // cy.wrap() gives you Cypress commands on the raw jQuery element
      cy.wrap($el).should('contain.text', 'playwright');
    });
});`,
  },
  {
    id: "cy-017",
    title: "Assert element attributes",
    description: "Check href, aria-label, disabled state, and data attributes on elements.",
    framework: "cypress",
    category: "assertions",
    tags: ["attribute", "aria", "disabled", "href", "have.attr"],
    language: "javascript",
    code: `it('link and button attributes are correct', () => {
  cy.visit('/profile');

  cy.get('a[data-testid="docs-link"]')
    .should('have.attr', 'href')
    .and('include', '/docs');

  cy.get('[data-testid="avatar"]')
    .should('have.attr', 'aria-label', 'User avatar');

  cy.get('[data-testid="submit-btn"]')
    .should('not.be.disabled');

  cy.get('[data-testid="plan-badge"]')
    .should('have.attr', 'data-plan', 'pro');
});`,
  },
  {
    id: "cy-018",
    title: "Browser back and forward navigation",
    description: "Use cy.go() to navigate history and assert the URL at each step.",
    framework: "cypress",
    category: "navigation",
    tags: ["go back", "go forward", "history", "url"],
    language: "javascript",
    code: `it('back and forward navigation works', () => {
  cy.visit('/page-a');
  cy.get('a[href="/page-b"]').click();
  cy.url().should('include', '/page-b');

  cy.go('back');
  cy.url().should('include', '/page-a');

  cy.go('forward');
  cy.url().should('include', '/page-b');
});`,
  },
  {
    id: "cy-019",
    title: "Reload page and assert persistence",
    description: "Confirm localStorage-backed state (e.g. theme) survives a page reload.",
    framework: "cypress",
    category: "navigation",
    tags: ["reload", "refresh", "localStorage", "persist"],
    language: "javascript",
    code: `it('dark mode setting persists after reload', () => {
  cy.visit('/settings');

  cy.get('[data-testid="dark-mode-toggle"]').click();
  cy.get('html').should('have.attr', 'data-theme', 'dark');

  // cy.reload() keeps localStorage intact within the same test
  cy.reload();

  cy.get('html').should('have.attr', 'data-theme', 'dark');
});`,
  },
  {
    id: "cy-020",
    title: "Check and uncheck a checkbox",
    description: "Toggle a checkbox and chain assertions on its state.",
    framework: "cypress",
    category: "forms",
    tags: ["checkbox", "check", "uncheck", "be.checked"],
    language: "javascript",
    code: `it('checkbox toggles correctly', () => {
  cy.visit('/preferences');

  cy.get('[name="email-notifications"]')
    .should('not.be.checked')
    .check()
    .should('be.checked')
    .uncheck()
    .should('not.be.checked');
});`,
  },
  {
    id: "cy-021",
    title: "Select a radio button",
    description: "Choose a radio option by value and confirm mutual exclusivity.",
    framework: "cypress",
    category: "forms",
    tags: ["radio", "check", "be.checked", "exclusive"],
    language: "javascript",
    code: `it('selects the express shipping radio', () => {
  cy.visit('/checkout');

  cy.get('[name="shipping"][value="express"]')
    .check()
    .should('be.checked');

  // Other options must not be selected
  cy.get('[name="shipping"][value="standard"]')
    .should('not.be.checked');
});`,
  },
  {
    id: "cy-022",
    title: "Fill a date input",
    description: "Type an ISO date value into a native <input type='date'> field.",
    framework: "cypress",
    category: "forms",
    tags: ["date", "input", "type", "ISO"],
    language: "javascript",
    code: `it('fills a native date input', () => {
  cy.visit('/booking');

  // ISO 8601 format is required by native date inputs
  cy.get('input[type="date"][name="check-in"]')
    .type('2025-08-15')
    .should('have.value', '2025-08-15');

  cy.get('[type="submit"]').click();
  cy.contains('Aug 15, 2025').should('be.visible');
});`,
  },
  {
    id: "cy-023",
    title: "Clear a field and retype",
    description: "Clear an existing input value and replace it — the standard edit-form pattern.",
    framework: "cypress",
    category: "forms",
    tags: ["clear", "type", "retype", "edit form"],
    language: "javascript",
    code: `it('updates the display name field', () => {
  cy.visit('/edit-profile');

  cy.get('[name="display-name"]')
    .should('have.value', 'John Doe')
    .clear()
    .type('Jane Doe')
    .should('have.value', 'Jane Doe');

  cy.get('[type="submit"]').click();
  cy.contains('Profile updated').should('be.visible');
});`,
  },
  {
    id: "cy-024",
    title: "Load and use a JSON fixture",
    description: "Read test data from a fixture file and use it to fill form fields.",
    framework: "cypress",
    category: "fixtures",
    tags: ["fixture", "json", "cy.fixture", "data-driven"],
    language: "javascript",
    code: `// cypress/fixtures/user.json → { "name": "Alice", "email": "alice@test.com", "role": "admin" }

it('fills form from fixture data', () => {
  cy.fixture('user').then((user) => {
    cy.visit('/create-user');

    cy.get('[name="name"]').type(user.name);
    cy.get('[name="email"]').type(user.email);
    cy.get('select[name="role"]').select(user.role);

    cy.get('[type="submit"]').click();
    cy.contains(\`Welcome, \${user.name}\`).should('be.visible');
  });
});`,
  },
  {
    id: "cy-025",
    title: "Parametrize tests with forEach",
    description: "Loop over a data array to run the same test body for multiple input sets.",
    framework: "cypress",
    category: "fixtures",
    tags: ["parametrize", "forEach", "data-driven", "roles"],
    language: "javascript",
    code: `const roles = [
  { role: 'admin',  canDelete: true  },
  { role: 'editor', canDelete: false },
  { role: 'viewer', canDelete: false },
];

roles.forEach(({ role, canDelete }) => {
  it(\`\${role} sees correct actions\`, () => {
    cy.request('POST', '/api/login', { role }).then(({ body }) => {
      window.localStorage.setItem('auth_token', body.token);
    });

    cy.visit('/dashboard');

    if (canDelete) {
      cy.get('[data-testid="delete-btn"]').should('be.visible');
    } else {
      cy.get('[data-testid="delete-btn"]').should('not.exist');
    }
  });
});`,
  },
  {
    id: "cy-026",
    title: "Full-page screenshot",
    description: "Capture the entire page as a PNG for documentation or manual visual review.",
    framework: "cypress",
    category: "visual",
    tags: ["screenshot", "full page", "cy.screenshot", "capture"],
    language: "javascript",
    code: `it('captures full-page screenshot of dashboard', () => {
  cy.visit('/dashboard');

  // Wait for async data before capturing
  cy.get('table tbody tr').should('have.length.greaterThan', 0);

  cy.screenshot('dashboard-full', {
    capture: 'fullPage', // 'viewport' | 'fullPage' | 'runner'
  });
  // Saved to: cypress/screenshots/dashboard-full.png
});`,
  },
  {
    id: "cy-027",
    title: "Element screenshot for visual diff",
    description: "Screenshot a specific component for targeted visual regression testing.",
    framework: "cypress",
    category: "visual",
    tags: ["screenshot", "element", "component", "visual regression"],
    language: "javascript",
    code: `it('captures the nav bar component', () => {
  cy.visit('/');

  cy.get('[data-testid="main-nav"]')
    .scrollIntoView()
    .screenshot('main-nav', { padding: 8 });

  // Pair with cypress-image-diff or cypress-plugin-snapshots
  // for automated pixel-level comparison against a baseline
});`,
  },
  {
    id: "cy-028",
    title: "Download a file and verify content",
    description: "Trigger a CSV download and assert the file exists with expected content.",
    framework: "cypress",
    category: "file",
    tags: ["download", "csv", "readFile", "verify"],
    language: "javascript",
    code: `it('downloads the CSV report', () => {
  cy.visit('/reports');

  cy.get('[data-testid="export-btn"]').click();

  // cy.readFile polls until the file appears (default timeout 4 s)
  cy.readFile('cypress/downloads/report.csv', { timeout: 8000 })
    .should('exist')
    .and('include', 'email,name,role'); // assert the CSV header row
});`,
  },
  {
    id: "cy-029",
    title: "Wait for element to disappear",
    description: "Assert that a loading spinner or toast notification leaves the DOM.",
    framework: "cypress",
    category: "wait",
    tags: ["not.exist", "disappear", "spinner", "loading"],
    language: "javascript",
    code: `it('spinner disappears once data loads', () => {
  cy.visit('/dashboard');

  cy.get('[data-testid="spinner"]').should('exist');

  // Cypress retries until the element is gone
  cy.get('[data-testid="spinner"]').should('not.exist');

  cy.get('table').should('be.visible');
});`,
  },
  {
    id: "cy-030",
    title: "Select elements by position and text filter",
    description: "Target the nth item with .eq() and narrow a set with .filter(':contains(...)').",
    framework: "cypress",
    category: "selectors",
    tags: ["eq", "nth", "filter", "contains"],
    language: "javascript",
    code: `it('selects cards by position and text', () => {
  cy.visit('/products');

  // eq() is 0-indexed — gets the third card
  cy.get('[data-testid="product-card"]').eq(2).should('be.visible');

  // filter() narrows to only elements containing "Sale"
  cy.get('[data-testid="product-card"]')
    .filter(':contains("Sale")')
    .first()
    .find('[data-testid="sale-badge"]')
    .should('be.visible');
});`,
  },

  // ── PLAYWRIGHT (continued) ────────────────────────────────────
  {
    id: "pw-034",
    title: "Drag and drop",
    description: "Drag an element to a drop target using Playwright's built-in dragTo API.",
    framework: "playwright",
    category: "selectors",
    tags: ["drag", "drop", "dragTo", "mouse"],
    language: "typescript",
    code: `test('drags a card to the done column', async ({ page }) => {
  await page.goto('/kanban');

  const card = page.locator('[data-testid="card-1"]');
  const dropZone = page.locator('[data-testid="column-done"]');

  // dragTo handles the full mousedown → mousemove → mouseup sequence
  await card.dragTo(dropZone);

  // Assert the card now lives inside the target column
  await expect(dropZone.locator('[data-testid="card-1"]')).toBeVisible();
});`,
  },
  {
    id: "pw-035",
    title: "Hover over an element",
    description: "Trigger a hover to reveal a tooltip or dropdown menu.",
    framework: "playwright",
    category: "selectors",
    tags: ["hover", "tooltip", "mouseover", "mouseenter"],
    language: "typescript",
    code: `test('tooltip appears on hover', async ({ page }) => {
  await page.goto('/dashboard');

  // hover() dispatches the full mousemove → mouseenter → mouseover sequence
  await page.locator('[data-testid="info-icon"]').hover();

  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toContainText('Last updated');
});`,
  },
  {
    id: "pw-036",
    title: "Handle browser dialog (alert / confirm)",
    description: "Listen for alert and confirm dialogs and accept or dismiss them programmatically.",
    framework: "playwright",
    category: "navigation",
    tags: ["dialog", "alert", "confirm", "dismiss", "accept"],
    language: "typescript",
    code: `test('accepts a confirm dialog before deleting', async ({ page }) => {
  // Register the handler BEFORE the action that triggers the dialog
  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Are you sure?');
    await dialog.accept(); // use dialog.dismiss() to click Cancel
  });

  await page.goto('/settings');
  await page.getByRole('button', { name: 'Delete account' }).click();

  await expect(page.getByText('Account deleted')).toBeVisible();
});`,
  },
  {
    id: "pw-037",
    title: "Switch between browser tabs",
    description: "Open a new tab, interact with it, then return focus to the original tab.",
    framework: "playwright",
    category: "navigation",
    tags: ["tab", "new tab", "context", "bringToFront", "popup"],
    language: "typescript",
    code: `test('switches between tabs', async ({ page, context }) => {
  await page.goto('/home');

  // Capture the new tab at the same time as the click that opens it
  const [newTab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Open in new tab' }).click(),
  ]);

  await newTab.waitForLoadState('domcontentloaded');
  await expect(newTab).toHaveURL(/\/guide/);
  await newTab.getByRole('button', { name: 'Accept cookies' }).click();

  // Return focus to the original tab
  await page.bringToFront();
  await expect(page).toHaveURL(/\/home/);
});`,
  },
  {
    id: "pw-038",
    title: "Scroll to an element",
    description: "Scroll an off-screen element into the viewport before asserting or interacting.",
    framework: "playwright",
    category: "navigation",
    tags: ["scroll", "scrollIntoView", "viewport", "toBeInViewport"],
    language: "typescript",
    code: `test('scrolls to the pricing section', async ({ page }) => {
  await page.goto('/landing');

  const pricing = page.getByTestId('pricing-section');

  // scrollIntoViewIfNeeded does nothing if the element is already visible
  await pricing.scrollIntoViewIfNeeded();

  // toBeInViewport() asserts the element is actually in the visible area
  await expect(pricing).toBeInViewport();
  await expect(pricing.getByRole('heading', { name: /pricing/i })).toBeVisible();
});`,
  },
  {
    id: "pw-039",
    title: "Get all text from a list of elements",
    description: "Collect every matched element's text into a string array and assert the collection.",
    framework: "playwright",
    category: "assertions",
    tags: ["allTextContents", "text", "list", "array"],
    language: "typescript",
    code: `test('blog tags include "playwright"', async ({ page }) => {
  await page.goto('/blog');

  const tags = page.locator('[data-testid="tag"]');

  // allTextContents() resolves the full locator set to a string[]
  const texts = await tags.allTextContents();

  expect(texts.length).toBeGreaterThan(0);
  expect(texts).toContain('playwright');

  // Assert no duplicate tags
  const unique = new Set(texts);
  expect(unique.size).toBe(texts.length);
});`,
  },
  {
    id: "pw-040",
    title: "Test mobile viewport with device emulation",
    description: "Emulate a real device profile to verify responsive layout in a single test.",
    framework: "playwright",
    category: "visual",
    tags: ["mobile", "viewport", "devices", "responsive", "emulation"],
    language: "typescript",
    code: `import { test, expect, devices } from '@playwright/test';

test('mobile nav is shown on iPhone 14', async ({ browser }) => {
  // Spread the full device profile: viewport, UA, deviceScaleFactor, etc.
  const ctx = await browser.newContext({ ...devices['iPhone 14'] });
  const page = await ctx.newPage();

  await page.goto('/');

  // Hamburger visible on mobile, desktop nav hidden
  await expect(page.getByTestId('mobile-menu-button')).toBeVisible();
  await expect(page.getByTestId('desktop-nav')).toBeHidden();

  await ctx.close();
});`,
  },
  {
    id: "pw-041",
    title: "Run tests across multiple browsers",
    description: "Configure projects in playwright.config.ts so every test runs on Chromium, Firefox, and WebKit.",
    framework: "playwright",
    category: "fixtures",
    tags: ["projects", "cross-browser", "firefox", "webkit", "config"],
    language: "typescript",
    code: `// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome']  } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari']  } },
  ],
});

// Run all browsers:     npx playwright test
// Run one browser only: npx playwright test --project=firefox`,
  },
  {
    id: "pw-042",
    title: "Mock browser geolocation",
    description: "Inject fake GPS coordinates before the page loads to test location-aware features.",
    framework: "playwright",
    category: "network",
    tags: ["geolocation", "mock", "context", "permissions", "GPS"],
    language: "typescript",
    code: `test('shows the correct city for mocked coordinates', async ({ browser }) => {
  const context = await browser.newContext({
    geolocation: { latitude: 48.8566, longitude: 2.3522 }, // Paris
    permissions: ['geolocation'], // grant without a browser prompt
  });
  const page = await context.newPage();

  await page.goto('/store-finder');
  await page.getByRole('button', { name: 'Use my location' }).click();

  // The app should resolve the mocked coordinates to Paris
  await expect(page.getByTestId('detected-city')).toHaveText('Paris');
  await context.close();
});`,
  },
  {
    id: "pw-043",
    title: "Interact with content inside an iframe",
    description: "Use frameLocator() to scope all locator calls inside an embedded iframe.",
    framework: "playwright",
    category: "selectors",
    tags: ["iframe", "frameLocator", "embed", "payment", "cross-frame"],
    language: "typescript",
    code: `test('fills a payment form inside an iframe', async ({ page }) => {
  await page.goto('/checkout');

  // frameLocator() switches the locator context into the iframe's DOM
  const frame = page.frameLocator('[data-testid="payment-iframe"]');

  // All commands inside the frame use the same Playwright locator API
  await frame.locator('[placeholder="Card number"]').fill('4242 4242 4242 4242');
  await frame.locator('[placeholder="MM / YY"]').fill('12 / 28');
  await frame.locator('[placeholder="CVC"]').fill('123');

  await page.getByRole('button', { name: 'Pay now' }).click();
  await expect(page.getByText('Payment successful')).toBeVisible();
});`,
  },
  {
    id: "pw-044",
    title: "Trigger keyboard shortcuts",
    description: "Press modifier key combinations like Ctrl+A and Ctrl+C on a focused element.",
    framework: "playwright",
    category: "forms",
    tags: ["keyboard", "ctrl", "shortcut", "press", "hotkey"],
    language: "typescript",
    code: `test('selects all text and copies with keyboard shortcuts', async ({ page }) => {
  await page.goto('/editor');

  const editor = page.getByRole('textbox', { name: 'Content' });
  await editor.fill('Hello World');

  // press() accepts KeyboardEvent.key names and modifier combos
  await editor.press('Control+a'); // select all text
  await editor.press('Control+c'); // copy to clipboard

  // Paste into a second field to verify the clipboard content
  const preview = page.getByRole('textbox', { name: 'Preview' });
  await preview.click();
  await preview.press('Control+v');

  await expect(preview).toHaveValue('Hello World');
});`,
  },
  {
    id: "pw-045",
    title: "Count elements on the page",
    description: "Assert an exact element count with toHaveCount(), or read the count for conditional logic.",
    framework: "playwright",
    category: "assertions",
    tags: ["count", "toHaveCount", "length", "elements"],
    language: "typescript",
    code: `test('product grid renders the right number of cards', async ({ page }) => {
  await page.goto('/products');

  const cards = page.locator('[data-testid="product-card"]');

  // toHaveCount() retries — prefer it over count() for assertions
  await expect(cards).toHaveCount(12);

  // Use count() when the number drives conditional logic
  const n = await cards.count();
  if (n > 6) {
    await expect(page.getByTestId('pagination')).toBeVisible();
  }
});`,
  },
  {
    id: "pw-046",
    title: "Read and assert a cookie",
    description: "Retrieve cookies from the browser context after login and assert their security flags.",
    framework: "playwright",
    category: "auth",
    tags: ["cookie", "cookies", "httpOnly", "secure", "assert"],
    language: "typescript",
    code: `test('auth cookie is set with correct security flags', async ({ page, context }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // context.cookies() returns every cookie for the current browser context
  const cookies = await context.cookies();
  const auth = cookies.find((c) => c.name === 'auth_token');

  expect(auth).toBeDefined();
  expect(auth!.httpOnly).toBe(true); // JS must not be able to read it
  expect(auth!.secure).toBe(true);   // must only transmit over HTTPS
});`,
  },
  {
    id: "pw-047",
    title: "Pre-set localStorage before navigation",
    description: "Use addInitScript to inject localStorage values before the page boots — ideal for themes, feature flags, and onboarding state.",
    framework: "playwright",
    category: "fixtures",
    tags: ["localStorage", "addInitScript", "theme", "feature flag", "setup"],
    language: "typescript",
    code: `test('dashboard loads with pre-set dark mode', async ({ page }) => {
  // addInitScript runs in the browser before every page.goto() in this test
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'dark');
    window.localStorage.setItem('onboardingComplete', 'true');
  });

  await page.goto('/dashboard');

  // Theme is already applied — no toggle click needed
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Onboarding modal should not appear for returning users
  await expect(page.getByTestId('onboarding-modal')).not.toBeVisible();
});`,
  },
  {
    id: "pw-048",
    title: "Retry assertions with a custom timeout",
    description: "Override the per-assertion timeout and use toPass() for complex retry scenarios.",
    framework: "playwright",
    category: "wait",
    tags: ["timeout", "retry", "toPass", "custom wait", "polling"],
    language: "typescript",
    code: `test('toast auto-dismisses and status becomes Ready', async ({ page }) => {
  await page.goto('/notifications');
  await page.getByRole('button', { name: 'Trigger notification' }).click();

  // Extend the default timeout for this specific assertion
  await expect(page.getByTestId('toast')).toBeHidden({ timeout: 10_000 });

  // toPass() retries the callback until it stops throwing — great for
  // composite assertions that can't use a single locator
  await expect(async () => {
    const text = await page.locator('[data-testid="status"]').textContent();
    expect(text).toBe('Ready');
  }).toPass({ timeout: 15_000, intervals: [500, 1000, 2000] });
});`,
  },
  {
    id: "pw-049",
    title: "Generate random test data inline",
    description: "Create unique email and username values per run to prevent conflicts in a shared test database.",
    framework: "playwright",
    category: "fixtures",
    tags: ["random", "test data", "unique", "faker", "Math.random"],
    language: "typescript",
    code: `test('registers a new user with unique credentials', async ({ page }) => {
  // Generate a short unique suffix — avoids conflicts in a shared DB
  const uid = Math.random().toString(36).slice(2, 10);
  const email = \`qa+\${uid}@example.com\`;
  const username = \`user_\${uid}\`;

  await page.goto('/register');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('Str0ng!Pass');
  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText(\`Welcome, \${username}\`)).toBeVisible();
});`,
  },
  {
    id: "pw-050",
    title: "Take an element-level screenshot",
    description: "Capture a screenshot scoped to a single component for visual documentation or baseline comparison.",
    framework: "playwright",
    category: "visual",
    tags: ["screenshot", "element", "component", "toHaveScreenshot", "visual regression"],
    language: "typescript",
    code: `test('sidebar matches visual baseline', async ({ page }) => {
  await page.goto('/dashboard');

  const sidebar = page.getByTestId('sidebar');
  await sidebar.scrollIntoViewIfNeeded();

  // For a one-off PNG saved to disk:
  await sidebar.screenshot({ path: 'test-results/sidebar.png' });

  // For automated regression, use toHaveScreenshot() —
  // first run creates the baseline; subsequent runs diff against it
  await expect(sidebar).toHaveScreenshot('sidebar-baseline.png', {
    maxDiffPixelRatio: 0.02, // tolerate 2% pixel difference (anti-aliasing)
  });
});`,
  },

  // ── CYPRESS (continued) ──────────────────────────────────────
  {
    id: "cy-031",
    title: "Drag and drop",
    description: "Simulate HTML5 drag-and-drop by triggering the underlying mouse events manually.",
    framework: "cypress",
    category: "selectors",
    tags: ["drag", "drop", "trigger", "mousedown", "mousemove"],
    language: "javascript",
    code: `it('drags a card to the done column', () => {
  cy.visit('/kanban');

  // Cypress has no native drag API — fire the underlying pointer events
  cy.get('[data-testid="card-1"]')
    .trigger('mousedown', { which: 1, force: true });

  cy.get('[data-testid="column-done"]')
    .trigger('mousemove', { force: true })
    .trigger('mouseup',   { force: true });

  cy.get('[data-testid="column-done"]')
    .find('[data-testid="card-1"]')
    .should('exist');
});`,
  },
  {
    id: "cy-032",
    title: "Hover over an element",
    description: "Dispatch a mouseover event to reveal tooltips or hover menus — Cypress has no native .hover().",
    framework: "cypress",
    category: "selectors",
    tags: ["hover", "mouseover", "trigger", "tooltip"],
    language: "javascript",
    code: `it('tooltip appears on hover', () => {
  cy.visit('/dashboard');

  // trigger('mouseover') fires the event Cypress would send on hover
  cy.get('[data-testid="info-icon"]').trigger('mouseover');

  cy.get('[role="tooltip"]')
    .should('be.visible')
    .and('contain.text', 'Last updated');
});`,
  },
  {
    id: "cy-033",
    title: "Handle a browser alert or confirm dialog",
    description: "Stub window.confirm to accept or dismiss a dialog without freezing the Cypress runner.",
    framework: "cypress",
    category: "navigation",
    tags: ["alert", "confirm", "dialog", "window:confirm", "stub"],
    language: "javascript",
    code: `it('accepts a confirm dialog before deleting', () => {
  cy.visit('/settings');

  // Register the handler BEFORE the action that triggers the dialog
  cy.on('window:confirm', (message) => {
    expect(message).to.include('Are you sure?');
    return true; // return false to click Cancel
  });

  cy.get('[data-testid="delete-account-btn"]').click();
  cy.contains('Account deleted').should('be.visible');
});`,
  },
  {
    id: "cy-034",
    title: "Interact with content inside an iframe",
    description: "Access a same-origin iframe's DOM by chaining through its contentDocument body.",
    framework: "cypress",
    category: "selectors",
    tags: ["iframe", "contentDocument", "same-origin", "embed", "wrap"],
    language: "javascript",
    code: `it('fills a payment form inside an iframe', () => {
  cy.visit('/checkout');

  // Store the iframe body as an alias to avoid repeating the chain
  cy.get('[data-testid="payment-iframe"]')
    .its('0.contentDocument.body')
    .should('not.be.empty')   // wait for the iframe to finish loading
    .then(cy.wrap)
    .as('frame');

  cy.get('@frame').find('[placeholder="Card number"]').type('4242 4242 4242 4242');
  cy.get('@frame').find('[placeholder="CVC"]').type('123');

  cy.get('[type="submit"]').click();
  cy.contains('Payment successful').should('be.visible');
});`,
  },
  {
    id: "cy-035",
    title: "Scroll to an element",
    description: "Use .scrollIntoView() to bring an off-screen element into the viewport.",
    framework: "cypress",
    category: "navigation",
    tags: ["scroll", "scrollIntoView", "viewport", "off-screen"],
    language: "javascript",
    code: `it('scrolls to the pricing section', () => {
  cy.visit('/landing');

  // scrollIntoView() scrolls and then yields the element for chaining
  cy.get('[data-testid="pricing-section"]')
    .scrollIntoView()
    .should('be.visible');

  cy.get('[data-testid="pricing-section"] h2')
    .should('contain.text', 'Pricing');
});`,
  },
  {
    id: "cy-036",
    title: "Get text from multiple elements",
    description: "Collect inner text from a list of elements using .each() and assert the gathered array.",
    framework: "cypress",
    category: "assertions",
    tags: ["text", "each", "array", "collect", "list"],
    language: "javascript",
    code: `it('blog tags include "playwright"', () => {
  cy.visit('/blog');

  const texts = [];

  cy.get('[data-testid="tag"]')
    .each(($el) => {
      texts.push($el.text().trim()); // .text() returns the raw string
    })
    .then(() => {
      expect(texts.length).to.be.greaterThan(0);
      expect(texts).to.include('playwright');

      // Assert no duplicate tags
      const unique = [...new Set(texts)];
      expect(unique.length).to.equal(texts.length);
    });
});`,
  },
  {
    id: "cy-037",
    title: "Test mobile viewport",
    description: "Switch to a mobile viewport with cy.viewport() to verify responsive layout.",
    framework: "cypress",
    category: "visual",
    tags: ["mobile", "viewport", "responsive", "cy.viewport", "iphone"],
    language: "javascript",
    code: `it('shows mobile navigation on a small screen', () => {
  // Emulate an iPhone 14 — Cypress supports named presets and custom px sizes
  cy.viewport('iphone-14');
  cy.visit('/');

  // Hamburger should be visible; desktop nav should not
  cy.get('[data-testid="mobile-menu-button"]').should('be.visible');
  cy.get('[data-testid="desktop-nav"]').should('not.be.visible');

  // Verify the menu expands on click
  cy.get('[data-testid="mobile-menu-button"]').click();
  cy.get('[data-testid="mobile-nav"]').should('be.visible');
});`,
  },
  {
    id: "cy-038",
    title: "Mock browser geolocation",
    description: "Stub navigator.geolocation.getCurrentPosition before page load to test location-aware UI.",
    framework: "cypress",
    category: "network",
    tags: ["geolocation", "stub", "mock", "navigator", "location"],
    language: "javascript",
    code: `it('shows Paris when location is mocked', () => {
  cy.visit('/store-finder', {
    onBeforeLoad(win) {
      // Replace the real API with a stub before the page initialises
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((cb) => {
        cb({ coords: { latitude: 48.8566, longitude: 2.3522 } }); // Paris
      });
    },
  });

  cy.get('[data-testid="use-location-btn"]').click();
  cy.get('[data-testid="detected-city"]').should('have.text', 'Paris');
});`,
  },
  {
    id: "cy-039",
    title: "Read and assert a cookie",
    description: "Use cy.getCookie() to retrieve a named cookie and assert its value and security flags.",
    framework: "cypress",
    category: "auth",
    tags: ["cookie", "getCookie", "httpOnly", "secure", "assert"],
    language: "javascript",
    code: `it('auth cookie is set with correct security flags', () => {
  cy.request('POST', '/api/login', {
    email: 'user@test.com',
    password: 'secret',
  });

  // getCookie() returns the cookie object — chain assertions on properties
  cy.getCookie('auth_token').should('exist').then((cookie) => {
    expect(cookie.httpOnly).to.be.true; // JS must not be able to read it
    expect(cookie.secure).to.be.true;   // must only transmit over HTTPS
  });
});`,
  },
  {
    id: "cy-040",
    title: "Pre-set localStorage before navigation",
    description: "Inject localStorage values via onBeforeLoad so the app reads them on first paint.",
    framework: "cypress",
    category: "fixtures",
    tags: ["localStorage", "onBeforeLoad", "theme", "setup", "initialise"],
    language: "javascript",
    code: `it('dashboard loads with dark mode enabled', () => {
  cy.visit('/dashboard', {
    onBeforeLoad(win) {
      // Set localStorage BEFORE the page script executes
      win.localStorage.setItem('theme', 'dark');
      win.localStorage.setItem('onboardingComplete', 'true');
    },
  });

  cy.get('html').should('have.attr', 'data-theme', 'dark');

  // Onboarding modal should not appear for returning users
  cy.get('[data-testid="onboarding-modal"]').should('not.exist');
});`,
  },
  {
    id: "cy-041",
    title: "Trigger keyboard shortcuts",
    description: "Use Cypress key sequences like {ctrl+a} and {ctrl+v} to test editor keyboard interactions.",
    framework: "cypress",
    category: "forms",
    tags: ["keyboard", "ctrl", "shortcut", "type", "hotkey"],
    language: "javascript",
    code: `it('copies text with Ctrl+A and Ctrl+C', () => {
  cy.visit('/editor');

  cy.get('[data-testid="content-editor"]')
    .type('Hello World')
    .type('{ctrl+a}') // select all text in the field
    .type('{ctrl+c}'); // copy the selection to the clipboard

  cy.get('[data-testid="preview-area"]')
    .click()
    .type('{ctrl+v}') // paste from clipboard
    .should('have.value', 'Hello World');
});`,
  },
  {
    id: "cy-042",
    title: "Count elements on the page",
    description: "Assert the exact number of matched elements with have.length, or read the count dynamically.",
    framework: "cypress",
    category: "assertions",
    tags: ["count", "have.length", "length", "elements"],
    language: "javascript",
    code: `it('product grid shows the correct number of cards', () => {
  cy.visit('/products');

  // have.length asserts the exact count; Cypress retries until it passes
  cy.get('[data-testid="product-card"]').should('have.length', 12);

  // Use .its('length') when the count drives further conditional logic
  cy.get('[data-testid="product-card"]')
    .its('length')
    .should('be.gte', 1);
});`,
  },
  {
    id: "cy-043",
    title: "Generate random test data inline",
    description: "Produce a unique email and username per run to prevent conflicts in a shared test environment.",
    framework: "cypress",
    category: "fixtures",
    tags: ["random", "test data", "unique", "Math.random", "faker"],
    language: "javascript",
    code: `it('registers a new user with unique credentials', () => {
  // Math.random() gives a short unique suffix per run
  const uid = Math.random().toString(36).slice(2, 10);
  const email = \`qa+\${uid}@example.com\`;
  const username = \`user_\${uid}\`;

  cy.visit('/register');
  cy.get('[name="username"]').type(username);
  cy.get('[name="email"]').type(email);
  cy.get('[name="password"]').type('Str0ng!Pass');
  cy.get('[type="submit"]').click();

  cy.contains(\`Welcome, \${username}\`).should('be.visible');
});`,
  },
  {
    id: "cy-044",
    title: "Retry an assertion with a custom timeout",
    description: "Override the default 4-second retry window to wait longer for slow DOM updates.",
    framework: "cypress",
    category: "wait",
    tags: ["timeout", "retry", "custom wait", "should", "polling"],
    language: "javascript",
    code: `it('toast disappears and status becomes Ready', () => {
  cy.visit('/notifications');
  cy.get('[data-testid="trigger-btn"]').click();

  cy.get('[data-testid="toast"]').should('be.visible');

  // Pass a timeout option to extend the default 4 s retry window
  cy.get('[data-testid="toast"]', { timeout: 10_000 }).should('not.exist');

  // Use a should callback to assert on derived/computed values
  cy.get('[data-testid="status"]').should(($el) => {
    expect($el.text().trim()).to.equal('Ready');
  });
});`,
  },
  {
    id: "cy-045",
    title: "Stub window.open to prevent new tabs",
    description: "Replace window.open with a cy.stub() so no real tab opens during tests, then assert the call.",
    framework: "cypress",
    category: "network",
    tags: ["window.open", "stub", "new tab", "sinon", "spy"],
    language: "javascript",
    code: `it('share button calls window.open with the correct URL', () => {
  cy.visit('/share');

  cy.window().then((win) => {
    // Replace window.open before the button click — no real tab will open
    cy.stub(win, 'open').as('windowOpen');
  });

  cy.get('[data-testid="share-btn"]').click();

  // Assert window.open was called with a URL matching the pattern
  cy.get('@windowOpen').should(
    'have.been.calledWith',
    Cypress.sinon.match(/\/share\?id=/),
    '_blank'
  );
});`,
  },

  // ── PLAYWRIGHT (continued) ────────────────────────────────────
  {
    id: "pw-051",
    title: "Wait for network idle",
    description: "Hold execution until all in-flight network requests have settled — useful before screenshots or complex assertions.",
    framework: "playwright",
    category: "wait",
    tags: ["networkidle", "waitForLoadState", "network", "settle"],
    language: "typescript",
    code: `test('waits for all requests to settle before asserting', async ({ page }) => {
  await page.goto('/reports');

  // 'networkidle' waits until there are no requests for at least 500 ms
  await page.waitForLoadState('networkidle');

  // Safe to assert — all async data has finished loading
  await expect(page.getByTestId('report-table')).toBeVisible();
  await expect(page.locator('table tbody tr')).not.toHaveCount(0);
});`,
  },
  {
    id: "pw-052",
    title: "Assert page has no console errors",
    description: "Collect browser console messages during a test and fail if any errors were logged.",
    framework: "playwright",
    category: "assertions",
    tags: ["console", "errors", "debug", "page.on", "msg"],
    language: "typescript",
    code: `test('home page logs no console errors', async ({ page }) => {
  const errors: string[] = [];

  // Capture every console message before navigating
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Fail the test and print each offending message
  expect(errors, \`Console errors: \${errors.join(', ')}\`).toHaveLength(0);
});`,
  },

  // ── CYPRESS (continued) ──────────────────────────────────────
  {
    id: "cy-046",
    title: "Intercept and modify a response body",
    description: "Intercept a real API response and overwrite specific fields before they reach the app.",
    framework: "cypress",
    category: "network",
    tags: ["intercept", "modify", "response", "body", "req.reply"],
    language: "javascript",
    code: `it('shows an overdue badge when API returns an overdue status', () => {
  cy.intercept('GET', '/api/tasks', (req) => {
    req.reply((res) => {
      // Mutate a single field in the real response — everything else stays
      res.body.tasks[0].status = 'overdue';
    });
  }).as('getTasks');

  cy.visit('/tasks');
  cy.wait('@getTasks');

  // The app should render the overdue badge based on the patched status
  cy.get('[data-testid="task-0"] [data-testid="status-badge"]')
    .should('have.text', 'Overdue');
});`,
  },
  {
    id: "cy-047",
    title: "Assert element is in viewport",
    description: "Confirm an element is actually visible within the browser's current scroll position.",
    framework: "cypress",
    category: "assertions",
    tags: ["viewport", "visible", "isInViewport", "scroll", "in-view"],
    language: "javascript",
    code: `// Add this reusable command once in cypress/support/commands.js
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  const rect = subject[0].getBoundingClientRect();
  expect(rect.top).to.be.gte(0);
  expect(rect.bottom).to.be.lte(Cypress.config('viewportHeight'));
  expect(rect.left).to.be.gte(0);
  expect(rect.right).to.be.lte(Cypress.config('viewportWidth'));
  return subject;
});

// Usage in any test:
it('CTA button is fully visible without scrolling', () => {
  cy.visit('/landing');
  cy.get('[data-testid="cta-button"]').isInViewport();
});`,
  },
  {
    id: "cy-048",
    title: "Clear and type into an input field",
    description: "Clear an existing value and type a replacement — the standard edit-form pattern in Cypress.",
    framework: "cypress",
    category: "forms",
    tags: ["clear", "type", "input", "edit", "fill"],
    language: "javascript",
    code: `it('updates the email address field', () => {
  cy.visit('/account');

  // .clear() empties the field, .type() then populates it fresh
  cy.get('[name="email"]')
    .should('have.value', 'old@example.com')
    .clear()
    .type('new@example.com')
    .should('have.value', 'new@example.com');

  cy.get('[type="submit"]').click();
  cy.contains('Email updated').should('be.visible');
});`,
  },

  // ── PLAYWRIGHT (continued) ────────────────────────────────────
  {
    id: "pw-053",
    title: "getByRole — click a button by name",
    description: "Locate a button by its accessible role and visible name — the most resilient selector strategy.",
    framework: "playwright",
    category: "selectors",
    tags: ["getByRole", "button", "accessible name", "ARIA"],
    language: "typescript",
    code: `test('saves changes using getByRole', async ({ page }) => {
  await page.goto('/settings');

  // getByRole matches what screen readers see — survives CSS and text refactors
  await page.getByRole('button', { name: 'Save changes' }).click();

  await expect(page.getByText('Settings saved')).toBeVisible();
});`,
  },
  {
    id: "pw-054",
    title: "getByLabel — fill a form input",
    description: "Find an input by its associated label text — no need to know the input's id or name attribute.",
    framework: "playwright",
    category: "selectors",
    tags: ["getByLabel", "label", "form", "input"],
    language: "typescript",
    code: `test('fills inputs by their label text', async ({ page }) => {
  await page.goto('/signup');

  // getByLabel works with <label for="...">, aria-label, and aria-labelledby
  await page.getByLabel('Email address').fill('qa@example.com');
  await page.getByLabel('Password').fill('Str0ng!Pass');

  await page.getByRole('button', { name: 'Sign up' }).click();
  await expect(page.getByText('Account created')).toBeVisible();
});`,
  },
  {
    id: "pw-055",
    title: "getByPlaceholder — fill by placeholder text",
    description: "Locate an input by its placeholder attribute — useful for search bars and inline forms without visible labels.",
    framework: "playwright",
    category: "selectors",
    tags: ["getByPlaceholder", "placeholder", "search", "input"],
    language: "typescript",
    code: `test('searches using the placeholder-located input', async ({ page }) => {
  await page.goto('/library');

  // getByPlaceholder is ideal when there is no visible <label>
  await page.getByPlaceholder('Search snippets...').fill('playwright drag');
  await page.getByPlaceholder('Search snippets...').press('Enter');

  await expect(page.getByTestId('results-list')).toBeVisible();
});`,
  },
  {
    id: "pw-056",
    title: "getByTestId — locate by data-testid",
    description: "Select elements by a data-testid attribute — immune to text, style, and layout changes.",
    framework: "playwright",
    category: "selectors",
    tags: ["getByTestId", "data-testid", "stable selector", "test id"],
    language: "typescript",
    code: `test('interacts with elements via data-testid', async ({ page }) => {
  await page.goto('/profile');

  // data-testid never breaks due to copy or styling changes —
  // the gold standard for stable selectors in production test suites
  const avatar = page.getByTestId('user-avatar');
  await expect(avatar).toBeVisible();

  await page.getByTestId('edit-profile-btn').click();
  await expect(page.getByTestId('edit-profile-modal')).toBeVisible();
});`,
  },
  {
    id: "pw-057",
    title: "getByText — find element by visible text",
    description: "Locate any element by its visible text content — supports exact strings and regex patterns.",
    framework: "playwright",
    category: "selectors",
    tags: ["getByText", "text content", "regex", "visible text"],
    language: "typescript",
    code: `test('finds elements by their text content', async ({ page }) => {
  await page.goto('/pricing');

  // Exact string match — finds the element containing exactly this text
  await page.getByText('Get started for free').click();

  // Regex — useful for dynamic text or case-insensitive matching
  await expect(page.getByText(/welcome,/i)).toBeVisible();

  // Scope to a specific element type to avoid ambiguous matches
  await expect(page.getByRole('heading').getByText('Dashboard')).toBeVisible();
});`,
  },
  {
    id: "pw-058",
    title: "Filter a locator by text",
    description: "Narrow a matched set of elements down to only those containing specific text.",
    framework: "playwright",
    category: "selectors",
    tags: ["filter", "hasText", "locator", "narrow"],
    language: "typescript",
    code: `test('clicks the "View" button only on Alice's card', async ({ page }) => {
  await page.goto('/team');

  const cards = page.locator('[data-testid="member-card"]');

  // filter() narrows the matched set without leaving the locator API —
  // far more reliable than CSS :has-text() pseudo-classes
  const aliceCard = cards.filter({ hasText: 'Alice' });
  await expect(aliceCard).toHaveCount(1);

  await aliceCard.getByRole('button', { name: 'View profile' }).click();
  await expect(page.getByTestId('profile-drawer')).toBeVisible();
});`,
  },
  {
    id: "pw-059",
    title: "XPath selector — when to use it",
    description: "Use XPath as a last resort for legacy HTML with no accessible attributes or test IDs.",
    framework: "playwright",
    category: "selectors",
    tags: ["XPath", "xpath", "legacy", "normalize-space"],
    language: "typescript",
    code: `test('targets a table row by cell text using XPath', async ({ page }) => {
  await page.goto('/invoices');

  // XPath is a last resort — only reach for it when getByRole, getByTestId,
  // and CSS selectors all fail (e.g. old server-rendered HTML with no hooks).
  // Here: find the <tr> whose first <td> contains "Invoice #1042"
  const row = page.locator('//tr[td[normalize-space()="Invoice #1042"]]');
  await expect(row).toBeVisible();

  // Relative XPath from the matched element — get the third cell
  const statusCell = row.locator('xpath=td[3]');
  await expect(statusCell).toHaveText('Paid');
});`,
  },
  {
    id: "pw-060",
    title: "Save auth state to file after login",
    description: "Persist cookies and localStorage to a JSON file after login so other tests can skip the UI flow.",
    framework: "playwright",
    category: "auth",
    tags: ["storageState", "save auth", "login", "persist session"],
    language: "typescript",
    code: `test('logs in and saves session state to disk', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Saves cookies + localStorage to a JSON file.
  // Other test files can load this file and skip the login UI entirely.
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});`,
  },
  {
    id: "pw-061",
    title: "Reuse saved auth state with test.use()",
    description: "Load a saved storageState file so every test in the file starts already authenticated.",
    framework: "playwright",
    category: "auth",
    tags: ["storageState", "test.use", "reuse session", "skip login"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

// Apply the saved auth state to every test in this file.
// The browser context starts pre-loaded with cookies and localStorage.
test.use({ storageState: 'playwright/.auth/user.json' });

test('accesses dashboard without going through login', async ({ page }) => {
  // No login step — the context already carries a valid session
  await page.goto('/dashboard');
  await expect(page.getByTestId('user-menu')).toBeVisible();
});

test('accesses settings page directly', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
});`,
  },
  {
    id: "pw-062",
    title: "Login once for all tests with auth.setup.ts",
    description: "Use a global setup project to authenticate once before the entire suite — the standard pattern for large test suites.",
    framework: "playwright",
    category: "auth",
    tags: ["auth.setup", "global setup", "dependencies", "storageState", "project"],
    language: "typescript",
    code: `// ── playwright.config.ts ─────────────────────────────────────
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /auth\\.setup\\.ts/, // runs this file before all others
    },
    {
      name: 'chromium',
      use: { storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'], // waits for setup to finish first
    },
  ],
});

// ── auth.setup.ts ─────────────────────────────────────────────
import { test as setup } from '@playwright/test';

setup('authenticate once for the whole suite', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Write auth state — all chromium tests will load this automatically
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});`,
  },
  {
    id: "pw-063",
    title: "Abort a request to block third-party scripts",
    description: "Drop matching outgoing requests before they're sent — keeps analytics and trackers out of test runs.",
    framework: "playwright",
    category: "network",
    tags: ["route.abort", "block", "abort", "analytics", "third-party"],
    language: "typescript",
    code: `test('page works with analytics requests blocked', async ({ page }) => {
  // route.abort() drops the request — the browser never sends it.
  // Block analytics early so they don't pollute network logs or fire events.
  await page.route(/google-analytics\\.com|segment\\.io|hotjar\\.com/, (route) => {
    route.abort();
  });

  await page.goto('/home');

  // The page should still render correctly without the blocked resources
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});`,
  },
  {
    id: "pw-064",
    title: "Assert intercepted response body",
    description: "Capture a real API response in-flight and assert its JSON structure matches the expected contract.",
    framework: "playwright",
    category: "network",
    tags: ["waitForResponse", "response body", "json", "api contract", "assert"],
    language: "typescript",
    code: `test('users API response matches expected contract', async ({ page }) => {
  // Start listening before navigation so we don't miss the request
  const responsePromise = page.waitForResponse(
    (res) => res.url().includes('/api/users') && res.status() === 200
  );

  await page.goto('/users');
  const response = await responsePromise;
  const body = await response.json();

  // Assert the shape — catches backend contract breaks before the UI does
  expect(body).toHaveProperty('users');
  expect(Array.isArray(body.users)).toBe(true);
  expect(body.users[0]).toMatchObject({
    id: expect.any(Number),
    email: expect.stringContaining('@'),
  });
});`,
  },
  {
    id: "pw-065",
    title: "Soft assertions — collect all failures",
    description: "Use expect.soft() to continue the test after a failure and report all assertion errors together.",
    framework: "playwright",
    category: "assertions",
    tags: ["soft assertions", "expect.soft", "non-blocking", "collect failures"],
    language: "typescript",
    code: `test('profile page shows all user fields correctly', async ({ page }) => {
  await page.goto('/profile');

  // expect.soft() records the failure but does NOT stop execution —
  // all soft failures are reported together at the end of the test
  await expect.soft(page.getByTestId('username')).toHaveText('Alice');
  await expect.soft(page.getByTestId('email')).toHaveText('alice@test.com');
  await expect.soft(page.getByTestId('role-badge')).toHaveText('Admin');
  await expect.soft(page.getByTestId('plan-badge')).toHaveText('Pro');

  // Hard assertion — if the modal doesn't open, there's no point continuing
  await page.getByRole('button', { name: 'Edit profile' }).click();
  await expect(page.getByTestId('edit-modal')).toBeVisible();
});`,
  },
  {
    id: "pw-066",
    title: "Assert page title",
    description: "Assert the document <title> using toHaveTitle() — retries automatically for pages with dynamic titles.",
    framework: "playwright",
    category: "assertions",
    tags: ["toHaveTitle", "page title", "document title", "SEO"],
    language: "typescript",
    code: `test('page has the correct document title', async ({ page }) => {
  await page.goto('/');

  // toHaveTitle() retries until the <title> matches — handles async title updates
  await expect(page).toHaveTitle('SnipQA — Playwright & Cypress Snippet Library');

  // Regex — useful for titles with dynamic segments like counts or user names
  await expect(page).toHaveTitle(/SnipQA/);

  // After navigation, verify the title updated
  await page.getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveTitle(/Pricing/);
});`,
  },
  {
    id: "pw-067",
    title: "Assert current URL",
    description: "Assert the browser URL after navigation, form submission, or redirect using toHaveURL().",
    framework: "playwright",
    category: "assertions",
    tags: ["toHaveURL", "URL", "navigation", "redirect", "assert"],
    language: "typescript",
    code: `test('URL is correct after navigation and form submission', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@test.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // toHaveURL() retries — handles async redirects from client-side routers
  await expect(page).toHaveURL('/dashboard');

  // Regex — use for dynamic segments like /users/123 or query strings
  await expect(page).toHaveURL(/\\/dashboard/);

  await page.getByRole('link', { name: 'Settings' }).click();
  await expect(page).toHaveURL(/\\/settings/);
});`,
  },
  {
    id: "pw-068",
    title: "Assert input is disabled or enabled",
    description: "Check whether a button or input is in a disabled or enabled state — common for form validation flows.",
    framework: "playwright",
    category: "assertions",
    tags: ["toBeDisabled", "toBeEnabled", "disabled", "form validation"],
    language: "typescript",
    code: `test('submit button reflects form validity state', async ({ page }) => {
  await page.goto('/register');

  const submitBtn = page.getByRole('button', { name: 'Create account' });

  // toBeDisabled() retries — safe to call right after navigation
  await expect(submitBtn).toBeDisabled();

  await page.getByLabel('Email').fill('qa@example.com');
  await page.getByLabel('Password').fill('Str0ng!Pass');

  // Form is now valid — button should become interactive
  await expect(submitBtn).toBeEnabled();

  // Also works on inputs — e.g. assert a field is read-only after lock
  const emailField = page.getByLabel('Email');
  await expect(emailField).not.toBeDisabled();
});`,
  },
  {
    id: "pw-069",
    title: "Type into a contenteditable div",
    description: "Interact with rich-text editors and contenteditable elements using pressSequentially().",
    framework: "playwright",
    category: "forms",
    tags: ["contenteditable", "rich text", "editor", "pressSequentially"],
    language: "typescript",
    code: `test('types into a rich-text editor', async ({ page }) => {
  await page.goto('/editor');

  const editor = page.locator('[contenteditable="true"]');

  // .fill() does not work on contenteditable elements — use click + pressSequentially
  await editor.click();
  await editor.pressSequentially('Hello, Playwright!');

  // To replace existing content: select all then type the replacement
  await editor.press('Control+a');
  await editor.pressSequentially('Replaced content');

  await expect(editor).toHaveText('Replaced content');
});`,
  },
  {
    id: "pw-070",
    title: "beforeEach and afterEach hooks",
    description: "Run setup and teardown logic before and after every test in a describe block.",
    framework: "playwright",
    category: "fixtures",
    tags: ["beforeEach", "afterEach", "hooks", "setup", "teardown"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

test.describe('User settings', () => {
  test.beforeEach(async ({ page }) => {
    // Runs before every test — log in once per test
    await page.goto('/login');
    await page.getByLabel('Email').fill('user@test.com');
    await page.getByLabel('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForURL('/dashboard');
  });

  test.afterEach(async ({ page }) => {
    // Runs after every test — clean up state that could leak
    await page.evaluate(() => window.localStorage.clear());
  });

  test('can reach the settings page', async ({ page }) => {
    await page.goto('/settings');
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  });

  test('can update display name', async ({ page }) => {
    await page.goto('/settings');
    await page.getByLabel('Display name').fill('New Name');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Saved!')).toBeVisible();
  });
});`,
  },
  {
    id: "pw-071",
    title: "Group tests with test.describe",
    description: "Use test.describe to group related tests, share hooks, and produce readable nested report output.",
    framework: "playwright",
    category: "fixtures",
    tags: ["test.describe", "group", "nested", "organisation"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

// test.describe groups tests and scopes beforeEach/afterEach.
// Report shows: "Checkout > with items > shows total price"
test.describe('Checkout', () => {
  test.describe('with items in the cart', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/cart?prefill=true');
    });

    test('shows the total price', async ({ page }) => {
      await expect(page.getByTestId('cart-total')).toBeVisible();
    });

    test('applying a coupon reduces the total', async ({ page }) => {
      await page.getByLabel('Coupon code').fill('SAVE10');
      await page.getByRole('button', { name: 'Apply' }).click();
      await expect(page.getByTestId('discount-row')).toBeVisible();
    });
  });

  test('empty cart shows empty-state message', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByTestId('empty-cart-message')).toBeVisible();
  });
});`,
  },
  {
    id: "pw-072",
    title: "Data-driven tests with a for loop",
    description: "Generate one named test per data row by looping over an array with test() calls.",
    framework: "playwright",
    category: "fixtures",
    tags: ["data-driven", "loop", "parametrize", "test.each", "for"],
    language: "typescript",
    code: `import { test, expect } from '@playwright/test';

const plans = [
  { name: 'Free',  price: '$0',  maxUsers: '1 user'   },
  { name: 'Pro',   price: '$12', maxUsers: '5 users'  },
  { name: 'Team',  price: '$49', maxUsers: '25 users' },
];

// Each iteration registers a separately named test —
// report shows: "pricing card: Free", "pricing card: Pro", etc.
for (const { name, price, maxUsers } of plans) {
  test(\`pricing card: \${name}\`, async ({ page }) => {
    await page.goto('/pricing');

    const card = page.locator('[data-testid="pricing-card"]').filter({ hasText: name });
    await expect(card.getByTestId('plan-price')).toHaveText(price);
    await expect(card.getByTestId('plan-users')).toHaveText(maxUsers);
  });
}`,
  },
  {
    id: "pw-073",
    title: "Wait for URL to change after an action",
    description: "Use waitForURL() or toHaveURL() to wait for client-side navigation to complete after a click or submit.",
    framework: "playwright",
    category: "wait",
    tags: ["waitForURL", "toHaveURL", "navigation", "redirect", "SPA"],
    language: "typescript",
    code: `test('multi-step form advances the URL on each step', async ({ page }) => {
  await page.goto('/onboarding/step-1');

  await page.getByLabel('Company name').fill('Acme Corp');
  await page.getByRole('button', { name: 'Next' }).click();

  // waitForURL() blocks until the URL matches — safer than a fixed wait
  await page.waitForURL('/onboarding/step-2');
  await expect(page.getByRole('heading', { name: 'Step 2' })).toBeVisible();

  await page.getByRole('button', { name: 'Next' }).click();

  // toHaveURL() is the retrying assertion equivalent — use it in expect chains
  await expect(page).toHaveURL(/step-3/);
});`,
  },

  // ── CYPRESS (continued) ──────────────────────────────────────
  {
    id: "cy-049",
    title: "Select element by data-testid attribute",
    description: "Use a CSS attribute selector to target data-testid — the most stable selector strategy for production suites.",
    framework: "cypress",
    category: "selectors",
    tags: ["data-testid", "attribute selector", "stable selector", "get"],
    language: "javascript",
    code: `it('interacts with elements via data-testid', () => {
  cy.visit('/dashboard');

  // data-testid never breaks due to copy, style, or structure changes —
  // the gold standard for resilient selectors
  cy.get('[data-testid="user-menu"]').should('be.visible');
  cy.get('[data-testid="logout-btn"]').click();

  cy.url().should('include', '/login');
});`,
  },
  {
    id: "cy-050",
    title: "cy.contains — find element by text",
    description: "Locate elements by their visible text content — scope to a selector to avoid ambiguous matches.",
    framework: "cypress",
    category: "selectors",
    tags: ["cy.contains", "text", "visible text", "partial match"],
    language: "javascript",
    code: `it('finds elements by visible text', () => {
  cy.visit('/pricing');

  // cy.contains(selector, text) scopes the search to a specific element type
  cy.contains('button', 'Get started for free').click();

  // Without a selector it searches all elements — good for quick assertions
  cy.contains('Welcome to your dashboard').should('be.visible');

  // Regex — case-insensitive partial match
  cy.contains(/plan details/i).should('be.visible');
});`,
  },
  {
    id: "cy-051",
    title: "Scope commands with .within()",
    description: "Use .within() to constrain all cy.get() calls to a specific parent — prevents false positives when the same names appear in multiple forms.",
    framework: "cypress",
    category: "selectors",
    tags: ["within", "scope", "parent", "form", "context"],
    language: "javascript",
    code: `it('fills billing and shipping forms independently', () => {
  cy.visit('/checkout');

  // .within() constrains all subsequent cy.get() calls to this element —
  // prevents matching the same [name="email"] in both forms at once
  cy.get('[data-testid="billing-form"]').within(() => {
    cy.get('[name="first-name"]').type('Jane');
    cy.get('[name="last-name"]').type('Doe');
    cy.get('[name="postcode"]').type('SW1A 1AA');
  });

  cy.get('[data-testid="shipping-form"]').within(() => {
    cy.get('[name="first-name"]').type('John');
    cy.get('[name="postcode"]').type('EC1A 1BB');
  });
});`,
  },
  {
    id: "cy-052",
    title: "Narrow a matched set with .filter()",
    description: "Use .filter() to keep only the elements in a matched set that satisfy a selector or text condition.",
    framework: "cypress",
    category: "selectors",
    tags: ["filter", "contains", "narrow", "subset", "attribute"],
    language: "javascript",
    code: `it('targets only sale cards and express radio button', () => {
  cy.visit('/products');

  // .filter() keeps only elements matching the expression —
  // uses standard jQuery selector syntax
  cy.get('[data-testid="product-card"]')
    .filter(':contains("On Sale")')
    .should('have.length.greaterThan', 0)
    .first()
    .find('[data-testid="sale-badge"]')
    .should('be.visible');

  // Filter by attribute value
  cy.visit('/checkout');
  cy.get('input[type="radio"]')
    .filter('[value="express"]')
    .check()
    .should('be.checked');
});`,
  },
  {
    id: "cy-053",
    title: "CSS attribute selectors",
    description: "Select elements using CSS attribute selectors — exact match, substring, prefix, and presence checks.",
    framework: "cypress",
    category: "selectors",
    tags: ["attribute selector", "CSS", "contains", "starts-with", "required"],
    language: "javascript",
    code: `it('selects elements with various attribute patterns', () => {
  cy.visit('/form');

  // Attribute presence — all required fields
  cy.get('input[required]').should('have.length.greaterThan', 0);

  // Exact attribute value
  cy.get('input[type="email"]').type('qa@example.com');

  // Substring match (*=) — any class containing "btn-primary"
  cy.get('[class*="btn-primary"]').first().click();

  // Prefix match (^=) — data-testid starting with "card-"
  cy.get('[data-testid^="card-"]').should('have.length', 6);

  // Suffix match ($=) — href ending with ".pdf"
  cy.get('a[href$=".pdf"]').should('exist');
});`,
  },
  {
    id: "cy-054",
    title: "Reuse UI login session with cy.session()",
    description: "Cache a UI-based login session so the login flow runs once per spec rather than before every test.",
    framework: "cypress",
    category: "auth",
    tags: ["cy.session", "UI login", "cache", "session", "validate"],
    language: "javascript",
    code: `// cypress/support/commands.js
Cypress.Commands.add('loginByUi', (email, password) => {
  cy.session(
    [email, password], // cache key — Cypress re-runs setup if this changes
    () => {
      cy.visit('/login');
      cy.get('[name="email"]').type(email);
      cy.get('[name="password"]').type(password);
      cy.get('[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    },
    {
      validate() {
        // Re-authenticate automatically if this cookie is missing or expired
        cy.getCookie('auth_token').should('exist');
      },
      cacheAcrossSpecs: true, // reuse the same session across all spec files
    }
  );
});

// Usage in any spec:
// cy.loginByUi('user@test.com', 'secret');
// cy.visit('/dashboard');`,
  },
  {
    id: "cy-055",
    title: "Login via API in beforeEach",
    description: "Use a custom API login command in beforeEach — 10× faster than UI login and keeps tests independent.",
    framework: "cypress",
    category: "auth",
    tags: ["beforeEach", "API login", "custom command", "auth", "fast login"],
    language: "javascript",
    code: `// cypress/support/commands.js
Cypress.Commands.add('loginViaApi', (email, password) => {
  // API login skips the UI entirely — much faster and more reliable
  cy.request('POST', '/api/login', { email, password }).then(({ body }) => {
    window.localStorage.setItem('auth_token', body.token);
  });
});

// ── In any spec file ──────────────────────────────────────────
describe('Protected pages', () => {
  beforeEach(() => {
    cy.loginViaApi('user@test.com', 'secret');
    cy.visit('/dashboard');
  });

  it('shows the user menu', () => {
    cy.get('[data-testid="user-menu"]').should('be.visible');
  });

  it('can access the settings page', () => {
    cy.visit('/settings');
    cy.get('h1').should('contain.text', 'Settings');
  });
});`,
  },
  {
    id: "cy-056",
    title: "Assert intercepted response body",
    description: "Intercept a real API response, wait for it, then assert the body structure and values.",
    framework: "cypress",
    category: "network",
    tags: ["intercept", "response body", "cy.wait", "api contract", "assert"],
    language: "javascript",
    code: `it('users API response matches the expected contract', () => {
  // Alias the intercept so cy.wait() can reference it by name
  cy.intercept('GET', '/api/users').as('getUsers');

  cy.visit('/users');

  cy.wait('@getUsers').then(({ response }) => {
    // Assert on the actual response — catches backend contract breaks early
    expect(response.statusCode).to.equal(200);
    expect(response.body).to.have.property('users');
    expect(response.body.users).to.be.an('array').with.length.greaterThan(0);
    expect(response.body.users[0]).to.include.keys('id', 'email', 'role');
  });
});`,
  },
  {
    id: "cy-057",
    title: "Assert page title",
    description: "Use cy.title() to retrieve the document title and chain assertions on it.",
    framework: "cypress",
    category: "assertions",
    tags: ["cy.title", "page title", "document title", "SEO"],
    language: "javascript",
    code: `it('page has the correct document title', () => {
  cy.visit('/');

  // cy.title() returns document.title — chain .should() to assert it
  cy.title().should('eq', 'SnipQA — Playwright & Cypress Snippet Library');

  // Partial match with 'include'
  cy.title().should('include', 'SnipQA');

  // After navigating to another route, verify the title updated
  cy.get('a[href="/pricing"]').click();
  cy.title().should('include', 'Pricing');
});`,
  },
  {
    id: "cy-058",
    title: "Assert current URL",
    description: "Use cy.url() to retrieve the full current URL and assert it after navigation or redirect.",
    framework: "cypress",
    category: "assertions",
    tags: ["cy.url", "URL", "location", "redirect", "navigation"],
    language: "javascript",
    code: `it('URL is correct after login redirect', () => {
  cy.visit('/login');

  cy.get('[name="email"]').type('user@test.com');
  cy.get('[name="password"]').type('secret');
  cy.get('[type="submit"]').click();

  // cy.url() automatically retries — handles async redirects from SPAs
  cy.url().should('include', '/dashboard');

  // Exact match using baseUrl from cypress.config.js
  cy.url().should('eq', Cypress.config('baseUrl') + '/dashboard');

  // After further navigation
  cy.get('a[href="/settings"]').click();
  cy.url().should('match', /\\/settings/);
});`,
  },
  {
    id: "cy-059",
    title: "Assert element is disabled or enabled",
    description: "Check the disabled state of a button or input — commonly used to validate form readiness.",
    framework: "cypress",
    category: "assertions",
    tags: ["disabled", "enabled", "be.disabled", "form validation", "button state"],
    language: "javascript",
    code: `it('submit button reflects form validity', () => {
  cy.visit('/register');

  // Assert disabled before the form is filled
  cy.get('[type="submit"]').should('be.disabled');

  cy.get('[name="email"]').type('qa@example.com');
  cy.get('[name="password"]').type('Str0ng!Pass');

  // Once valid, the button should become interactive
  cy.get('[type="submit"]').should('not.be.disabled');

  // Assert a read-only field is not editable
  cy.get('[name="plan"]').should('be.disabled');
});`,
  },
  {
    id: "cy-060",
    title: "Chain multiple assertions with .and()",
    description: "Use .and() (alias for .should()) to assert multiple properties on the same element without re-querying.",
    framework: "cypress",
    category: "assertions",
    tags: ["chained assertions", "and", "should", "multiple", "chain"],
    language: "javascript",
    code: `it('asserts several properties on the same element', () => {
  cy.visit('/profile');

  // .and() chains assertions on the same subject — no extra cy.get() calls
  cy.get('[data-testid="plan-badge"]')
    .should('be.visible')
    .and('have.text', 'Pro')
    .and('have.attr', 'data-plan', 'pro')
    .and('have.class', 'badge-pro');

  // Works on inputs too
  cy.get('[name="email"]')
    .should('be.visible')
    .and('not.be.disabled')
    .and('have.attr', 'type', 'email')
    .and('have.value', 'user@test.com');
});`,
  },
  {
    id: "cy-061",
    title: "Type into a contenteditable div",
    description: "Use .type() with {selectall} to interact with rich-text editors and contenteditable elements.",
    framework: "cypress",
    category: "forms",
    tags: ["contenteditable", "rich text", "editor", "selectall", "type"],
    language: "javascript",
    code: `it('types into a rich-text editor', () => {
  cy.visit('/editor');

  // {selectall} selects all existing content before typing the replacement —
  // .clear() does not work on contenteditable elements
  cy.get('[contenteditable="true"]')
    .click()
    .type('{selectall}Hello, Cypress!');

  // Assert via invoke('text') — .should('have.value') doesn't work on div
  cy.get('[contenteditable="true"]')
    .invoke('text')
    .should('include', 'Hello, Cypress!');
});`,
  },
  {
    id: "cy-062",
    title: "beforeEach and afterEach hooks",
    description: "Run shared setup before every test and cleanup after every test in a describe block.",
    framework: "cypress",
    category: "fixtures",
    tags: ["beforeEach", "afterEach", "hooks", "setup", "teardown"],
    language: "javascript",
    code: `describe('User profile', () => {
  beforeEach(() => {
    // API login is faster than UI login — runs before every test
    cy.request('POST', '/api/login', {
      email: 'user@test.com',
      password: 'secret',
    }).then(({ body }) => {
      window.localStorage.setItem('auth_token', body.token);
    });
    cy.visit('/profile');
  });

  afterEach(() => {
    // Clear auth state between tests to prevent bleed-through
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  it('shows the username', () => {
    cy.get('[data-testid="username"]').should('be.visible');
  });

  it('can update the display name', () => {
    cy.get('[name="display-name"]').clear().type('New Name');
    cy.get('[type="submit"]').click();
    cy.contains('Profile updated').should('be.visible');
  });
});`,
  },
  {
    id: "cy-063",
    title: "Assert and interact after a redirect",
    description: "Verify that a form submission or link triggers a redirect, then assert the landing page rendered correctly.",
    framework: "cypress",
    category: "navigation",
    tags: ["redirect", "navigation", "url", "login", "landing page"],
    language: "javascript",
    code: `it('redirects to dashboard after successful login', () => {
  cy.visit('/login');

  cy.get('[name="email"]').type('user@test.com');
  cy.get('[name="password"]').type('secret');
  cy.get('[type="submit"]').click();

  // cy.url() retries automatically — handles async client-side redirects
  cy.url().should('include', '/dashboard');

  // Assert the landing page rendered correctly after the redirect
  cy.get('[data-testid="welcome-banner"]').should('be.visible');
  cy.get('[data-testid="user-menu"]').should('contain.text', 'user@test.com');
});`,
  },
  {
    id: "cy-064",
    title: "Wait for URL to change after an action",
    description: "Assert the URL after a button click or form submit — Cypress retries cy.url() automatically for SPA navigation.",
    framework: "cypress",
    category: "wait",
    tags: ["url", "navigation", "SPA", "redirect", "timeout"],
    language: "javascript",
    code: `it('URL advances on each step of the onboarding flow', () => {
  cy.visit('/onboarding/step-1');

  cy.get('[name="company"]').type('Acme Corp');
  cy.get('[type="submit"]').click();

  // cy.url() retries — no explicit wait needed for most client-side navigations
  cy.url().should('include', '/onboarding/step-2');
  cy.get('h1').should('contain.text', 'Step 2');

  cy.get('[type="submit"]').click();

  // For slower SPAs, extend the timeout on the assertion
  cy.url({ timeout: 10_000 }).should('include', '/onboarding/step-3');
});`,
  },
];

export const categories: { value: Category | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "auth", label: "Auth" },
  { value: "network", label: "Network" },
  { value: "assertions", label: "Assertions" },
  { value: "navigation", label: "Navigation" },
  { value: "forms", label: "Forms" },
  { value: "fixtures", label: "Fixtures" },
  { value: "visual", label: "Visual" },
  { value: "file", label: "File" },
  { value: "wait", label: "Wait" },
  { value: "selectors", label: "Selectors" },
];
