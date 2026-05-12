import { render, screen } from '@testing-library/react'
import MassBillingButton from '@/components/dashboard/mass-billing-button'

jest.mock('@/actions/finance', () => ({
    massAccrueDebt: jest.fn(),
}))

describe('MassBillingButton Component', () => {
    it('renders the billing button correctly', () => {
        render(<MassBillingButton />)

        const button = screen.getByRole('button', { name: /Нарахувати плату/i })
        expect(button).toBeInTheDocument()
    })
})