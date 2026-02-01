# Archived Components

⚠️ **WARNING: DO NOT IMPORT FROM THIS FOLDER** ⚠️

This directory contains **deprecated components** kept for reference only.

---

## Status: DEPRECATED

All files in this folder have been replaced by newer implementations and should **NOT** be used in active code.

---

## Archived Components

### Layout Components (Replaced)
- **`Footer.tsx`** - Old footer implementation
  - **Current**: Custom footer in individual page components
- **`Header.tsx`** - Old header implementation
  - **Current**: Custom headers in page components
- **`Layout.tsx`** - Old layout wrapper
  - **Current**: Page-specific layouts

### Authentication (Replaced)
- **`ProtectedRoute.tsx`** - Old route protection
  - **Current**: Authentication handled in `App.tsx` and `components/SiteLogin.tsx`

### Utilities (Replaced)
- **`SimpleEditButton.tsx`** - Old editing UI
  - **Current**: CMS components in `components/cms/`
- **`useMobile.tsx`** - Old mobile detection hook
  - **Current**: Tailwind responsive utilities

---

## Migration Guide

If you need functionality from archived components:

1. ✅ **DO NOT** import these files directly
2. ✅ Check `client/src/components/` for current implementations
3. ✅ Check `client/src/pages/` for page-specific components
4. ✅ Reference this archive for historical context only

### Finding Current Implementations

| Archived File | Current Location |
|--------------|------------------|
| `Footer.tsx` | Custom footers in individual pages |
| `Header.tsx` | Custom headers in individual pages |
| `Layout.tsx` | Page components handle their own layout |
| `ProtectedRoute.tsx` | `App.tsx` + `components/SiteLogin.tsx` |
| `SimpleEditButton.tsx` | `components/cms/*` components |
| `useMobile.tsx` | Use Tailwind responsive classes instead |

---

## Why Keep These Files?

These files are retained for:
- **Historical reference** - Understanding past implementation decisions
- **Code archaeology** - Tracking evolution of features
- **Potential code reuse** - Extracting useful patterns (with updates)

---

## Deletion Plan

This folder should be:
1. Reviewed periodically (every 6 months)
2. Cleared of files no longer needed for reference
3. Eventually removed once all historical context is documented elsewhere

---

## For AI Agents

⚠️ **CRITICAL**: Never import from this folder.

If you're looking for components:
- ✅ Use `client/src/components/` for reusable components
- ✅ Use `client/src/pages/` for page components
- ✅ Use `client/src/hooks/` for custom hooks

**This folder is a dead end** - treat it as read-only historical documentation.

---

**Last Updated**: 2026-02-01
**Status**: Archived - Do Not Use
