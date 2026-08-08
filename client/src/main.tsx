import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@fontsource/inter/index.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/700.css';
import './styles.css';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LibraryList from './pages/LibraryList';
import LibraryPage from './pages/LibraryPage';
import RecipePage from './pages/RecipePage';
import RecipeListPage from './pages/RecipeListPage';
import CookSessionPage from './pages/CookSessionPage';
import PantryPage from './pages/PantryPage';
import { RequireAuth } from './components/auth/RequireAuth';
import { GuestOnly } from './components/auth/GuestOnly';

const queryClient = new QueryClient();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/dashboard',
            element: <DashboardPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/recipes',
            element: <RecipeListPage />,
          },
          {
            path: '/recipes/:id',
            element: <RecipePage />,
          },
          {
            path: '/cook-sessions/:id',
            element: <CookSessionPage />,
          },
          {
            path: '/library',
            element: <LibraryList />,
          },
          {
            path: '/library/:id',
            element: <LibraryPage />,
          },
          {
            path: '/pantry',
            element: <PantryPage />,
          },
        ],
      },
    ],
  },

  {
    element: <GuestOnly />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
    ],
  },
]);

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
