import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './useAuth';
import * as api from '../services/api';

vi.mock('../services/api', () => ({
  login: vi.fn(),
  signup: vi.fn(),
  setAuthToken: vi.fn(),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('rehydrates token from localStorage on mount', async () => {
    localStorage.setItem('dam_jwt', 'stored-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.token).toBe('stored-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(api.setAuthToken).toHaveBeenCalledWith('stored-token');
  });

  it('logs in and persists the token', async () => {
    vi.mocked(api.login).mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z',
      },
      token: 'jwt-token',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user?.email).toBe('test@example.com');
    expect(result.current.token).toBe('jwt-token');
    expect(localStorage.getItem('dam_jwt')).toBe('jwt-token');
    expect(api.setAuthToken).toHaveBeenLastCalledWith('jwt-token');
  });

  it('signs up and persists the token', async () => {
    vi.mocked(api.signup).mockResolvedValue({
      user: {
        id: 'user-2',
        email: 'new@example.com',
        role: 'user',
        createdAt: '2024-01-01T00:00:00Z',
      },
      token: 'signup-token',
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.signup('new@example.com', 'password');
    });

    expect(result.current.user?.email).toBe('new@example.com');
    expect(result.current.token).toBe('signup-token');
    expect(localStorage.getItem('dam_jwt')).toBe('signup-token');
    expect(api.setAuthToken).toHaveBeenLastCalledWith('signup-token');
  });

  it('logs out and clears local state', async () => {
    localStorage.setItem('dam_jwt', 'stored-token');
    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem('dam_jwt')).toBeNull();
    expect(api.setAuthToken).toHaveBeenLastCalledWith(null);
  });
});
