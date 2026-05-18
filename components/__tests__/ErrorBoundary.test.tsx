import React from 'react';
import { Text } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

function ThrowOnRender({ message }: { message: string }) {
  throw new Error(message);
}

function SafeChild({ label }: { label: string }) {
  return <Text>{label}</Text>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <SafeChild label="Hello from child" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Hello from child')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });

  it('renders fallback UI when a child throws during render', () => {
    render(
      <ErrorBoundary>
        <ThrowOnRender message="boom in child" />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(
      screen.getByText('An unexpected error occurred. Please try again.')
    ).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
    if (__DEV__) {
      expect(screen.getByText('boom in child')).toBeTruthy();
    }
  });

  it('Try Again resets the boundary and renders children again', () => {
    let shouldThrow = true;

    function ToggleThrowChild() {
      if (shouldThrow) {
        throw new Error('temporary');
      }
      return <Text>Back to normal</Text>;
    }

    render(
      <ErrorBoundary>
        <ToggleThrowChild />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(screen.getByText('Try Again'));

    expect(screen.getByText('Back to normal')).toBeTruthy();
    expect(screen.queryByText('Something went wrong')).toBeNull();
  });
});
