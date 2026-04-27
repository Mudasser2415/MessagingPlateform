# MessagingPlatefromUI - Frontend Architecture & Guidelines

This document outlines the architecture, design principles, and coding standards for the MessagingPlatefromUI React application. Adhering to these guidelines ensures a scalable, maintainable, and premium user experience.

---

## 1. Design Principles
- **Simplicity**: Every element should have a clear purpose. Avoid clutter.
- **Consistency**: Use a unified design system. Buttons, inputs, and spacing should be identical across all views.
- **Accessibility (A11Y)**: The UI must be usable by everyone, regardless of their ability.
- **Responsiveness**: A mobile-first approach. The app must feel native on mobile, tablet, and desktop.
- **Performance**: Instant feedback and smooth transitions are non-negotiable.

---

## 2. Folder Structure
We follow a scalable feature-based structure within the `src` directory:

```text
/src
  /assets         # Static assets (images, icons, global fonts)
  /components     # Shared, generic UI components (Buttons, Cards, Inputs)
    /ui           # Base atomic components (Radix/ShadCN style)
    /common       # More complex shared molecules
  /layouts        # Page layouts (AuthLayout, DashboardLayout)
  /pages          # Page components (Route endpoints)
  /hooks          # Custom reusable React hooks
  /services       # API service abstraction (Axios instances)
  /store          # Global state management (Zustand/Context)
  /types          # TypeScript interfaces and global type definitions
  /utils          # Helper functions and constants
  /features       # Feature-specific components and logic (optional for larger apps)
  App.tsx         # Main application entry
  main.tsx        # DOM entry point
```

---

## 3. Component Design
### Atomic Design & Reusability
- **Atoms**: Basic building blocks (Input, Button, Label).
- **Molecules**: Groups of atoms (FormGroup, SearchBar).
- **Organisms**: Complex UI sections (NavigationHeader, Sidebar).

### Best Practices
- **Single Responsibility**: One component should do one thing well.
- **Name Conventions**: Use `PascalCase` for files and components (e.g., `PrimaryButton.tsx`).
- **Props Typing**: Always use TypeScript interfaces.

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => { ... };
```

---

## 4. Styling Guidelines (Tailwind CSS)
- **Utility-First**: Leverage Tailwind's utility classes for 90% of styling.
- **Avoid Inline Styles**: Use `className` exclusively.
- **Design Tokens**: Define branding colors and spacing in `tailwind.config.js`.
- **Dynamic Classes**: Use the `clsx` or `tailwind-merge` utility for conditional classes.

```tsx
// Example of clean tailwind usage
<button className={cn(
  "px-4 py-2 rounded-md transition-colors",
  variant === 'primary' ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-gray-100"
)}>
  Submit
</button>
```

---

## 5. UI/UX Best Practices
- **Layout Consistency**: Navigation and Sidebar must persist across related views.
- **Visual Hierarchy**: Use typography and color to guide the user's eye to the Primary Action.
- **States**:
  - **Loading**: Use Shimmer/Skeleton screens instead of blank spinners where possible.
  - **Empty**: Provide clear illustrations and CTA (Call to Action) for empty data states.
  - **Error**: Meaningful error messages that help the user recover.

---

## 6. Accessibility (A11Y)
- Use **Semantic HTML**: `<main>`, `<nav>`, `<section>`, `<article>`.
- **Keyboard support**: Ensure all interactive elements are focusable and have a visible focus ring.
- **ARIA**: Use `aria-label` for icon buttons and `aria-live` for dynamic alerts.
- **Contrast**: Maintain a contrast ratio of at least 4.5:1 for text.

---

## 7. Performance
- **Lazy Loading**: Use `React.lazy()` for routes to reduce initial bundle size.
- **Optimization**: Wrapped expensive computations in `useMemo` and functions in `useCallback`.
- **Image Optimization**: Use modern formats (WebP) and responsive image sizes.

---

## 8. State Management
- **Local State**: Use `useState` for UI-limited state (toggles, input values).
- **Global State**: Use **Zustand** for application-wide data (Auth user, Preferences).
- **Server State**: Use **React Query** for all API data. Do not mirror API data in global stores.

---

## 9. API Integration
- **Abstraction**: Keep Axios calls inside `/services`. Never call axios directly in components.
- **Error Handling**: Implement global interceptors for 401 (Unauthorized) and 500 (Server Error).
- **Environment**: Use `.env` files for Base URLs.

---

## 10. Form Handling
- **Library**: Use **React Hook Form** for performance and validation.
- **Validation**: Use **Zod** or **Yup** for schema-based validation.
- **User Feedback**: Inline error messages should appear only after field "touch".

---

## 11. Naming Conventions
- **Variables/Functions**: `camelCase` (e.g., `isLoading`, `handleSubmit`).
- **Components**: `PascalCase` (e.g., `UserProfile`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `API_RETRY_LIMIT`).
- **Hooks**: Start with `use` (e.g., `useAuth`).

---

## 12. Code Quality & Standards
- **Linter**: Strictly follow ESLint rules.
- **Clean Code**: Keep functions small. Use descriptive names. Avoid comments that explain "what" code does (code should be self-explanatory); use comments for "why".
- **Prettier**: Consistent formatting on save.

---

## 13. Testing
- **Unit Testing**: Focus on logic in `utils` and complex `hooks` using Vitest/Jest.
- **Component Testing**: Use **React Testing Library** to test user behavior (e.g., "clicking button submits form") rather than implementation details.

---

## 14. Git & Version Control
- **Branching**: `feature/feature-name`, `bugfix/issue-description`, `hotfix/issue-description`.
- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat: add login validation`
  - `fix: correct sidebar overlap on mobile`
  - `refactor: optimize auth hook`

---

## 15. Responsive Design
- **Mobile First**: Design for the smallest screen first.
- **Breakpoints**: Use standard Tailwind breakpoints:
  - `sm`: 640px (Phones)
  - `md`: 768px (Tablets)
  - `lg`: 1024px (Desktops)
  - `xl`: 1280px (Large screens)

---

## 16. Security
- **Sensitive Data**: Never store passwords or secrets in `localStorage`. Use secure HttpOnly cookies where possible.
- **Input Sanitization**: Always sanitize user input to prevent XSS.
- **Env Security**: Prefix keys with `VITE_` only if they MUST be public.
