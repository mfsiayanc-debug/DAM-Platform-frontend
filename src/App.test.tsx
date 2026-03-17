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

vi.mock('./hooks/useAssets', () => {
  return {
    useAssets: () => ({
      assets: [],
      loading: false,
      error: null,
      loadAssets: vi.fn(),
      updateAsset: vi.fn(),
      removeAsset: vi.fn(),
    }),
  };
});

vi.mock('./hooks/useUpload', () => {
  return {
    useUpload: () => ({
      uploadJobs: [],
      startUpload: vi.fn(),
    }),
  };
});

describe('App', () => {
  it('shows auth form when not authenticated', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});
