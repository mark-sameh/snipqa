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
