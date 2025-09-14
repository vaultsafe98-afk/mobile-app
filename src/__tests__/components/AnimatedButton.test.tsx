import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AnimatedButton from '../../components/AnimatedButton';

describe('AnimatedButton', () => {
  it('renders correctly with default props', () => {
    const { getByText } = render(<AnimatedButton title="Test Button" />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('renders with different variants', () => {
    const { getByText: getByTextPrimary } = render(
      <AnimatedButton title="Primary" variant="primary" />
    );
    const { getByText: getByTextSecondary } = render(
      <AnimatedButton title="Secondary" variant="secondary" />
    );
    const { getByText: getByTextDanger } = render(
      <AnimatedButton title="Danger" variant="danger" />
    );
    const { getByText: getByTextOutline } = render(
      <AnimatedButton title="Outline" variant="outline" />
    );

    expect(getByTextPrimary('Primary')).toBeTruthy();
    expect(getByTextSecondary('Secondary')).toBeTruthy();
    expect(getByTextDanger('Danger')).toBeTruthy();
    expect(getByTextOutline('Outline')).toBeTruthy();
  });

  it('renders with different sizes', () => {
    const { getByText: getByTextSmall } = render(
      <AnimatedButton title="Small" size="small" />
    );
    const { getByText: getByTextMedium } = render(
      <AnimatedButton title="Medium" size="medium" />
    );
    const { getByText: getByTextLarge } = render(
      <AnimatedButton title="Large" size="large" />
    );

    expect(getByTextSmall('Small')).toBeTruthy();
    expect(getByTextMedium('Medium')).toBeTruthy();
    expect(getByTextLarge('Large')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { getByText } = render(
      <AnimatedButton title="Test Button" loading={true} />
    );
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Test Button" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Test Button" onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('does not call onPress when loading', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <AnimatedButton title="Test Button" onPress={onPress} loading={true} />
    );
    
    fireEvent.press(getByText('Loading...'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
