# SKILLS Academy Mobile Positioning Issues

## Problem
The SKILLS Academy building (learning_lodge) was not responding to translate-y changes on mobile view.

## Why This Was Challenging

1. **Multiple Transform Properties**: The element has multiple transform properties applied:
   - `scale-[0.748]` - Makes it smaller
   - `mt-[10%]` - Margin top percentage
   - `-ml-[25%]` - Negative margin left
   - `translate-y` - Vertical translation
   
   When multiple transforms interact, they can override or interfere with each other.

2. **Percentage vs Fixed Units**: Using `mt-[10%]` (percentage) combined with `translate-y` (pixels) can create unpredictable behavior as the percentage is relative to parent height.

3. **Order of CSS Classes**: In Tailwind, the order of utility classes can matter when they affect the same property.

4. **Mobile vs Desktop Split**: The responsive classes (md:) create different behaviors that need to be tested separately.

## Solution
- Changed from positive margin-top (`mt-[10%]`) to negative margin-top (`-mt-[5%]`) to lift the element
- Removed the translate-y property on mobile to avoid conflicts
- Desktop positioning remains unchanged with its translate-y

## Testing Notes
Always test positioning changes on actual mobile viewport (or dev tools mobile view) as the calculations can differ significantly from desktop.