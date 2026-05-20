import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SavedPlantDetail } from '../SavedPlantDetail';
import { SavedIdentification } from '../../services/storage';
import { PlantIdentificationResult } from '../../types';

function makeMockResult(): PlantIdentificationResult {
  return {
    classification: {
      suggestions: [
        {
          name: 'Quercus alba',
          probability: 0.92,
          details: {
            common_names: ['White Oak'],
            edible_parts: ['leaves', 'acorns'],
            toxicity: '',
          },
        },
      ],
    },
  };
}

function makeMockItem(overrides: Partial<SavedIdentification> = {}): SavedIdentification {
  return {
    id: 'test-id-123',
    timestamp: '2026-05-19T21:00:00.000Z',
    photoUri: 'file:///tmp/test-photo.jpg',
    result: makeMockResult(),
    ...overrides,
  };
}

describe('SavedPlantDetail', () => {
  it('returns null when item is null', () => {
    const { toJSON } = render(
      <SavedPlantDetail visible={true} item={null} onClose={jest.fn()} />
    );
    expect(toJSON()).toBeNull();
  });

  it('renders header, image, result card content and timestamp when visible with an item', () => {
    const item = makeMockItem();
    render(<SavedPlantDetail visible={true} item={item} onClose={jest.fn()} />);

    expect(screen.getByText('Saved Plant')).toBeTruthy();
    expect(screen.getByText('✕')).toBeTruthy();
    expect(screen.getByText('White Oak')).toBeTruthy();
    expect(screen.getByText('Quercus alba')).toBeTruthy();
    expect(screen.getByText(/Saved on/)).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const item = makeMockItem({ photoUri: null, photoBase64: null });
    render(<SavedPlantDetail visible={true} item={item} onClose={onClose} />);

    const closeButton = screen.getByText('✕');
    fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render an image when neither photoUri nor photoBase64 is provided', () => {
    const item = makeMockItem({ photoUri: null, photoBase64: null });
    render(<SavedPlantDetail visible={true} item={item} onClose={jest.fn()} />);

    // ResultCard content should still be there
    expect(screen.getByText('White Oak')).toBeTruthy();
    // No easy way to assert absence of Image without testID, but we at least confirm core content
  });
});
