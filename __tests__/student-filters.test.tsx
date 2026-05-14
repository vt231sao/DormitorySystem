import { render, screen } from '@testing-library/react'
import StudentFilters from '@/components/students/student-filters'

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn(),
    }),
    usePathname: () => '/students',
}))

describe('StudentFilters Component', () => {
    it('renders search input and select correctly', () => {
        render(<StudentFilters />)
        expect(screen.getByPlaceholderText('Пошук за ПІБ чи групою...')).toBeInTheDocument()
        expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
})