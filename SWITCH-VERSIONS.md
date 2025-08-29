# HOW TO SWITCH BETWEEN V1 AND V2

## Current Status:
- **DEFAULT (npm run dev)**: V2 Professional App with simplified CSS
- **V1**: Original app with old styling

## To Switch to V1 (Original):

### Method 1: Edit main.tsx
Change `src/main.tsx`:
```typescript
// Change FROM:
import './styles/simple-v2.css'
import AppV2 from './App.v2.tsx'

// Change TO:
import './styles/v1.css'
import App from './App.v1.tsx'
```

### Method 2: Use V1 specific command
```bash
npm run dev:v1
```

## To Switch Back to V2 (Professional):

Change `src/main.tsx` back to:
```typescript
import './styles/simple-v2.css'
import AppV2 from './App.v2.tsx'
```

## File Structure:
- `App.v1.tsx` + `styles/v1.css` = Original amateur-looking app
- `App.v2.tsx` + `styles/simple-v2.css` = Professional redesigned app

## Comparison:
- **V1**: Emoji icons, mixed styling, amateur appearance
- **V2**: Professional SVG icons, consistent design, business-grade UI