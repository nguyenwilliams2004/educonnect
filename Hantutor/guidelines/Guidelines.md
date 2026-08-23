System Guidelines

General & Architecture
Code style: Production-ready, modular, and self-documenting.

File size: Keep components under 150 lines. Move custom hooks, business logic, and types into separate dedicated files.

Layout: Use CSS Flexbox and Grid by default. Avoid absolute positioning unless strictly required (e.g., tooltips, popovers).

No placeholder code: Never output // TODO, // implement later, or truncate code blocks with // ... rest of code.

Clean code: Do not write obvious comments like // Render header or // Fetch data.

UI & Anti-AI Design
Colors: Stick to a refined neutral palette (zinc/slate) with a single accent color. Avoid purple/indigo neon glow and harsh gradient text.

Layout: Rely on whitespace and typography hierarchy rather than wrapping every piece of content inside bordered Card containers.

Typography: Use clean font stacks (Geist, Inter, or clean modern sans-serif). Base font size: 14px.

Transitions: Subtle CSS transitions only (150-200ms ease). No heavy, distracting entrance animations on every single element.

Component Rules
Button: Max 1 primary button per visible section. Use secondary/ghost variants for alternative actions.

Toolbar: Limit bottom/floating toolbars to a maximum of 4 action items.

Selection: Chips must appear in groups of 3+. Do not use dropdowns for datasets with 2 or fewer items (use toggle/radio instead).

Data formatting: Always format dates as "Jun 10" and monetary values with standard comma separators.