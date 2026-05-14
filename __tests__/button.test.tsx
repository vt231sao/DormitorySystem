import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renders button correctly', () => {
        render(<Button>Click Me</Button>)
        expect(screen.getByRole('button', { name: /Click Me/i })).toBeInTheDocument()
    })

    it('handles click events', () => {
        const handleClick = jest.fn()
        render(<Button onClick={handleClick}>Submit</Button>)

        const button = screen.getByRole('button', { name: /Submit/i })
        fireEvent.click(button)

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('renders as disabled when disabled prop is passed', () => {
        render(<Button disabled>Disabled Button</Button>)
        const button = screen.getByRole('button', { name: /Disabled Button/i })
        expect(button).toBeDisabled()
    })
})