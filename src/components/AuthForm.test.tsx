import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthForm } from './AuthForm';

vi.mock('../hooks/useAuth', () => {
  const login = vi.fn();
  const signup = vi.fn();

  return {
    useAuth: () => ({
      login,
      signup,
    }),
  };
});

describe('AuthForm', () => {
  it('renders login by default and can switch to signup', () => {
    render(<AuthForm onAuthenticated={() => {}} />);

    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();

    const switchButton = screen.getByText(/Sign up/i);
    fireEvent.click(switchButton);

    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
  });
});
