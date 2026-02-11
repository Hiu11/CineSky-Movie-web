# Copilot Instructions for Movie Booking Web Application

## Project Overview
A React-based movie booking platform featuring a dark-themed UI with Vietnamese localization. The app allows users to browse movies, filter by genre, book tickets, register/login, and provide feedback.

## Architecture & Key Patterns

### Tech Stack
- **Frontend Framework**: React 19 (Create React App)
- **Routing**: React Router v6
- **Styling**: Custom CSS with Tailwind CSS (v4.1) + Tailwind PostCSS
- **Storage**: `localStorage` (persistent) for user registration, `sessionStorage` for active session
- **Node**: >=24.13.0

### Component Structure
- **`src/App.jsx`**: Root router with auth state management (`user`, `isLoggedIn`, `searchQuery`)
- **Layout Components**: `Header.jsx`, `Footer.jsx` (shared across all routes)
- **Page Components**: `HomePage.jsx`, `FilterPage.jsx`, `AboutPage.jsx`, `Login.jsx`, `Register.jsx`, `Booking.jsx`, `MovieDetail.jsx`, `FeedbackPage.jsx`
- **Reusable Components**: `MovieCard.jsx` (renders movie cards with showtimes)

### Data Flow Patterns
1. **Auth Flow**: User registration → stored in `localStorage` as JSON → login validates against `localStorage` → successful login stores user in `sessionStorage` and app state
2. **Search**: Search query passed from `Header` → stored in `App.jsx` state → passed to `HomePage` for real-time filtering
3. **Movie Data**: Hardcoded in `HomePage.jsx` component (7 movies array with Vietnamese titles, showtimes, ratings)
4. **Navigation**: All page links use `useNavigate()` from React Router for client-side routing

## Developer Workflows

### Local Development
```bash
cd Frontend
npm install
npm run dev  # or npm start
```
Server runs on `http://localhost:3000`, auto-reloads on file changes.

### Building
```bash
npm run build
```
Creates optimized production build in `build/` folder.

### Testing
```bash
npm test
```
Runs Jest tests using React Testing Library (in watch mode).

### Debugging
- Check browser console (F12) for React warnings and errors
- Use React DevTools browser extension for component state inspection
- Session data visible in DevTools → Application → Session Storage

## Code Conventions & Patterns

### CSS & Theming
- **Color Variables** defined in `:root` of `App.css`:
  - Primary gold (`#f7b400`), secondary purple (`#5d2e8c`), navy blue header (`#0f172a`)
  - Dark radial gradient background applied to `body`
- **Layout**: Fixed header (z-index 1000), body has `padding-top: 110px` to account for fixed nav
- **Text Utilities**: Use CSS classes `.text-white`, `.text-gray` (defined as `#ccc`)

### Component Patterns
1. **Pages use local state** with `useState` for forms and tabs (e.g., `HomePage` tabs: 'now', 'soon', 'special')
2. **Text Normalization**: `HomePage.jsx` uses custom `normalizeText()` function for accent-insensitive search (`.normalize("NFD")`)
3. **Movie Objects**: Include `id`, `title`, `poster` (URL), `genre`, `duration`, `rating`, `ratingClass`, `ratingDesc`, `times[]`
4. **Navigation**: Always use `useNavigate()` for programmatic routing; `MovieCard` navigates to `/movie/{id}`

### File Structure
- Pages end with `.jsx`; locate all pages in `src/pages/`
- Components end with `.jsx`; locate in `src/components/`
- Styles in `App.css` (global) or inline styles for layout
- No separate config files—all app config is in `package.json`

## Integration Points

### External URLs (Image Posters)
- Uses Wikipedia URLs and local image paths (e.g., `/assets/images/Tử chiến.jpg`)
- Ensure poster URLs are valid or fallback gracefully

### User Authentication
- **Registration**: Stores `{email, password, ...userData}` in `localStorage` under key `"users"` (array)
- **Login**: Validates email/password, stores session user in `sessionStorage` and app state
- **Logout**: Removes from `sessionStorage` and clears app state

### Movie Ratings
- Rating classes: `t13`, `t18`, `t16`, `p-rating` (styling variants in CSS)
- Ratings display with localized Vietnamese descriptions

## Common Tasks

### Add a New Page
1. Create file in `src/pages/NewPage.jsx` with functional component
2. Import in `App.jsx`
3. Add `<Route path="/path" element={<NewPage />} />` in Router
4. Add navigation link in `Header.jsx` or relevant component

### Add a Movie
1. Update `allMovies` array in `HomePage.jsx`
2. Include required fields: `id`, `title`, `poster`, `genre`, `duration`, `rating`, `ratingClass`, `ratingDesc`, `times`

### Modify Styling
1. For component-level: Edit `App.css` (use CSS classes) or add inline styles
2. For global theme: Update CSS variables in `App.css `:root`
3. Tailwind classes available via `className` in JSX

## Important Caveats
- No backend API currently; all data is hardcoded
- `localStorage` persists across sessions; `sessionStorage` clears on browser close
- Images using absolute URLs (Wikipedia) or relative paths to `/public/assets/`
- No error boundaries—unhandled exceptions will crash the app
