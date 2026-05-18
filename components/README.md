# Components

This directory contains reusable React Native components for the Edible Plant Finder app.

## ResultCard

Displays plant identification results with safety-first handling of toxicity information.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `result` | `PlantIdentificationResult` | Yes | The identification result from the backend |
| `onRetake` | `() => void` | Yes | Callback when the user wants to take another photo |

### Behavior

- **Edible state**: Shows a green "✅ EDIBLE PLANT DETECTED" banner when `edible_parts` exist and there is no toxicity warning.
- **Toxicity warning**: Shows a red "⚠️ TOXICITY WARNING" banner if the toxicity description contains danger keywords (`toxic`, `poison`, `harmful`, `danger`) and is not explicitly marked safe (`safe`, `non-toxic`, `not toxic`, etc.).
- **Unknown state**: Falls back to a red banner when no edible parts are reported.

### Accessibility

- Root `View` has `accessibilityRole="summary"` and a descriptive `accessibilityLabel` that includes the safety status.
- Plant name uses `accessibilityRole="header"`.
- "Take Another Photo" button includes both `accessibilityLabel` and `accessibilityHint`.

### Example

```tsx
<ResultCard
  result={identificationResult}
  onRetake={() => {
    setPhotoUri(null);
    setResult(null);
  }}
/>
```

---

## ErrorBoundary

Catches unhandled JavaScript errors anywhere in the component tree and renders a friendly fallback screen instead of crashing the app.

### Why it exists

Prevents the user from ever seeing a blank white screen due to an unexpected runtime error — a production-oriented pattern for any consumer-facing app.

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | The component tree to protect |

### Behavior

- Uses React's `getDerivedStateFromError` to catch render errors.
- Displays a branded fallback UI with a "Try Again" button that resets the boundary.
- In `__DEV__` mode, shows the raw error message for debugging.
- `componentDidCatch` logs the error (ready to forward to Sentry / Datadog in production).

### Usage

Wrap the root of your app (or any subtree you want to protect):

```tsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### Accessibility

The "Try Again" button has proper `accessibilityRole`, `accessibilityLabel`, and `accessibilityHint`.

---

## Testing

Both components have dedicated test suites:

- `ResultCard` → `components/__tests__/ResultCard.test.tsx`
- `ErrorBoundary` → `components/__tests__/ErrorBoundary.test.tsx`

Run all frontend tests with:

```bash
npm test
```
