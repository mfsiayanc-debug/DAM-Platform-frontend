import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./hooks/useAuth', () => {
  return {
    useAuth: () => ({
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

describe('App', () => {
  it('shows auth form when not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });
});
