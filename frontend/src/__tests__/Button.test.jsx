import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../components/Button';

describe('Button Component', () => {
  it('renders the button with the correct label', () => {
    render(<Button label="Click me" onClick={() => {}} />);
    
    // Verifica que el botón tenga el texto correcto
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('calls the onClick function when clicked', () => {
    // Crea una función mock
    const handleClick = jest.fn();
    
    render(<Button label="Click me" onClick={handleClick} />);
    
    // Simula un clic en el botón
    fireEvent.click(screen.getByRole('button'));
    
    // Verifica que la función se haya llamado
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Button label="Click me" onClick={() => {}} disabled={true} />);
    
    // Verifica que el botón esté deshabilitado
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

