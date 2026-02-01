# Auto-Generated UI Components

⚠️ **CRITICAL: DO NOT MANUALLY EDIT FILES IN THIS DIRECTORY** ⚠️

---

## About These Components

These components are **auto-generated and managed by [Shadcn UI](https://ui.shadcn.com/)**.

### What is Shadcn UI?

Shadcn UI is a collection of reusable components built on:
- **Radix UI** - Unstyled, accessible components
- **Tailwind CSS** - Utility-first styling
- **Class Variance Authority (CVA)** - Component variants

Components are **copied into your project** (not installed as dependencies), allowing for customization while maintaining update paths.

---

## ⚠️ Why You Should NOT Edit These Files

1. **Regeneration Risk**: Running `shadcn-ui add` will **overwrite your changes**
2. **Update Conflicts**: Manual edits break when updating component versions
3. **Consistency**: Components should maintain standard Shadcn patterns
4. **Maintainability**: Custom changes should be in wrapper components

---

## ✅ How to Customize Components

### Option 1: Create Wrapper Components (Recommended)

Instead of editing `button.tsx`, create a custom wrapper:

```tsx
// client/src/components/CustomButton.tsx
import { Button } from './ui/button';

export function PrimaryButton({ children, ...props }) {
  return (
    <Button
      variant="default"
      className="bg-blue-600 hover:bg-blue-700"
      {...props}
    >
      {children}
    </Button>
  );
}
```

**Benefits**:
- ✅ Preserves original component
- ✅ Safe from regeneration
- ✅ Easy to update base component
- ✅ Clear separation of concerns

---

### Option 2: Use className for One-Off Styling

```tsx
// In your component
<Button className="custom-class-here">
  Click Me
</Button>
```

**When to use**:
- ✅ One-time styling needs
- ✅ Page-specific modifications
- ✅ Quick prototyping

---

### Option 3: Extend Tailwind Config

Modify `tailwind.config.js` to add global styles:

```javascript
// client/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#your-color',
      },
    },
  },
};
```

**Then use in components**:
```tsx
<Button className="bg-brand-primary">
  Styled Button
</Button>
```

---

## 🔄 How to Update Components

### Add a New Component

```bash
cd client
npx shadcn-ui@latest add <component-name>
```

**Examples**:
```bash
npx shadcn-ui@latest add tooltip
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add sheet
```

### Update Existing Component

```bash
cd client
npx shadcn-ui@latest add <component-name> --overwrite
```

⚠️ **Warning**: This will overwrite any manual edits!

### Check Available Components

Visit: https://ui.shadcn.com/docs/components

---

## 📋 Currently Installed Components

This project includes the following Shadcn UI components:

- `accordion.tsx` - Collapsible content panels
- `alert.tsx` - Alert messages
- `alert-dialog.tsx` - Modal confirmations
- `aspect-ratio.tsx` - Aspect ratio containers
- `avatar.tsx` - User avatars
- `badge.tsx` - Status badges
- `breadcrumb.tsx` - Navigation breadcrumbs
- `button.tsx` - Buttons with variants
- `calendar.tsx` - Date picker calendar
- `card.tsx` - Content cards
- `carousel.tsx` - Image/content carousels
- `chart.tsx` - Data visualization charts
- `checkbox.tsx` - Checkbox inputs
- `collapsible.tsx` - Collapsible sections
- `command.tsx` - Command palette
- `context-menu.tsx` - Right-click menus
- `dialog.tsx` - Modal dialogs
- `drawer.tsx` - Slide-out drawers
- `dropdown-menu.tsx` - Dropdown menus
- `form.tsx` - Form components
- ... and more

**Full list**: See `client/components.json` for the component registry.

---

## 🎨 Component Variants

Most components support variants via props:

### Button Variants
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

### Card Usage
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

---

## 🔍 Component Structure

Each component typically includes:

1. **Imports**: Radix UI primitives, utilities
2. **Variants**: CVA-based style variants
3. **Component**: React component with forwardRef
4. **Exports**: Named exports for subcomponents

**Example Structure** (`button.tsx`):
```tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "base-styles...",
  {
    variants: {
      variant: { ... },
      size: { ... },
    },
  }
);

const Button = React.forwardRef(({ ... }) => {
  return <button {...props} />;
});

export { Button, buttonVariants };
```

---

## 🐛 Troubleshooting

### "Component not found" error
**Solution**: Install the component first
```bash
npx shadcn-ui@latest add <component-name>
```

### Styles not applying
**Solution**: Ensure Tailwind is configured properly in `tailwind.config.js`

### TypeScript errors
**Solution**: Check that `@/` path alias is configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Component looks broken after update
**Solution**: You may have manually edited it. Restore from Git or regenerate:
```bash
npx shadcn-ui@latest add <component-name> --overwrite
```

---

## 📚 Documentation

- **Shadcn UI Docs**: https://ui.shadcn.com/docs
- **Radix UI Docs**: https://www.radix-ui.com/primitives/docs/overview/introduction
- **Tailwind CSS Docs**: https://tailwindcss.com/docs

---

## 🚨 For AI Agents

**CRITICAL RULES**:

1. ❌ **NEVER** manually edit files in `client/src/components/ui/`
2. ❌ **NEVER** modify component styles directly in these files
3. ❌ **NEVER** add custom props to these components

**INSTEAD**:

1. ✅ Create wrapper components in `client/src/components/`
2. ✅ Use `className` prop for custom styling
3. ✅ Extend Tailwind config for global theme changes

**If you need to customize**:
- Create a new component in `client/src/components/YourComponent.tsx`
- Import the base UI component: `import { Button } from './ui/button'`
- Wrap it with your customizations

**Example**:
```tsx
// ✅ CORRECT: client/src/components/DangerButton.tsx
import { Button } from './ui/button';

export function DangerButton(props) {
  return <Button variant="destructive" {...props} />;
}
```

```tsx
// ❌ WRONG: Editing client/src/components/ui/button.tsx
// Don't do this! Changes will be lost.
```

---

## 📦 Component Registry

The component configuration is stored in:
```
client/components.json
```

This file defines:
- Component installation paths
- Style configuration
- Alias paths
- Tailwind config location

**Do not modify unless you know what you're doing.**

---

**Last Updated**: 2026-02-01
**Managed By**: Shadcn UI CLI
**Status**: Auto-Generated - Do Not Edit Directly
