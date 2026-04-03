import { fireEvent, render, screen } from '@testing-library/react-native';

import { MatveckanApp } from './MatveckanApp';

describe('MatveckanApp', () => {
  it('shows onboarding first and lets the user create a profile', () => {
    render(<MatveckanApp />);

    expect(screen.getByText('Matveckan')).toBeTruthy();
    fireEvent.press(screen.getByText('Skapa profil'));

    expect(screen.getByText(/Hej Fredrik/)).toBeTruthy();
    expect(screen.getByText('Upptack recept')).toBeTruthy();
  });
});
