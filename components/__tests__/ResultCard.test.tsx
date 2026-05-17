import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ResultCard } from '../ResultCard';
import { PlantIdentificationResult } from '../../types';

const mockOnRetake = jest.fn();

function makeResult(overrides: any = {}): PlantIdentificationResult {
  return {
    classification: {
      suggestions: [
        {
          name: 'Test Plant',
          probability: 0.85,
          details: {
            common_names: ['Common Test'],
            edible_parts: [],
            toxicity: undefined,
            ...overrides,
          },
        },
      ],
    },
  };
}

describe('ResultCard', () => {
  it('renders edible state when edible_parts exist and no toxicity', () => {
    const result = makeResult({ edible_parts: ['leaves', 'flowers'] });
    render(<ResultCard result={result} onRetake={mockOnRetake} />);

    expect(screen.getByText('✅ EDIBLE PLANT DETECTED')).toBeTruthy();
    expect(screen.getByText('Edible parts: leaves, flowers')).toBeTruthy();
  });

  it('shows toxicity warning for danger keywords', () => {
    const result = makeResult({
      toxicity: 'Toxic if ingested in large quantities',
    });
    render(<ResultCard result={result} onRetake={mockOnRetake} />);

    expect(screen.getByText('⚠️ TOXICITY WARNING')).toBeTruthy();
    expect(screen.getByText(/Toxic if ingested/)).toBeTruthy();
  });

  it('treats "safe and non-toxic" descriptions as non-toxic', () => {
    const result = makeResult({
      edible_parts: ['leaves'],
      toxicity: 'This plant is generally considered safe and non-toxic.',
    });
    render(<ResultCard result={result} onRetake={mockOnRetake} />);

    expect(screen.getByText('✅ EDIBLE PLANT DETECTED')).toBeTruthy();
    expect(screen.queryByText('⚠️ TOXICITY WARNING')).toBeNull();
  });

  it('includes proper accessibility attributes', () => {
    const result = makeResult({ edible_parts: ['roots'] });
    render(<ResultCard result={result} onRetake={mockOnRetake} />);

    const summary = screen.getByLabelText(/Edible plant detected/);
    expect(summary.props.accessibilityLabel).toContain('Edible plant detected');
    expect(screen.getByRole('header')).toBeTruthy();
    expect(screen.getByRole('button')).toBeTruthy();
  });
});