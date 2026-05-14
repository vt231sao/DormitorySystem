import { render, screen } from '@testing-library/react'
import KanbanBoard from '@/components/requests/kanban-board'

jest.mock('@/actions/request', () => ({
    updateRequestStatus: jest.fn(),
    deleteRequest: jest.fn(),
}))

describe('KanbanBoard Component', () => {
    it('renders all columns correctly', () => {
        render(<KanbanBoard initialRequests={[]} isStudent={false} />)

        expect(screen.getByText('Нові')).toBeInTheDocument()
        expect(screen.getByText('В процесі')).toBeInTheDocument()
        expect(screen.getByText('Вирішено')).toBeInTheDocument()
    })

    it('shows empty state when no requests', () => {
        render(<KanbanBoard initialRequests={[]} isStudent={false} />)

        const emptyMessages = screen.getAllByText('Немає заявок')
        expect(emptyMessages).toHaveLength(3)
    })
})