# SKILLS Academy Mobile Positioning Issues & Road Connection Challenges

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
- Added `-translate-y-[200px]` for mobile to move it up significantly
- Desktop positioning remains unchanged with its translate-y
- Note: Negative translate-y values move elements UP, positive values move DOWN

## Testing Notes
Always test positioning changes on actual mobile viewport (or dev tools mobile view) as the calculations can differ significantly from desktop.

## Road Connection Issues on Mobile

### Problem
Roads were zigzagging erratically on mobile instead of flowing naturally through buildings due to complex CSS transforms.

### Why This Happened
1. **Multiple Transform Layers**: Each building has scale, translate, and margin transforms
2. **getBoundingClientRect() Confusion**: The container div's position doesn't match the visual position of the scaled/translated SVG inside
3. **Grid vs Visual Position**: Buildings appear in different positions than their grid cells due to transforms

### Solution
Instead of using the container element's position, we now:
1. Find the actual `<img>` element inside each building card
2. Get the IMG's bounding rectangle (which accounts for all transforms)
3. Use that position as the road connection point
4. Add small per-building adjustments for visual appeal

This ensures roads connect to where buildings visually appear, not where their containers are positioned.