import { render } from '@testing-library/react'
import OccupancyChart from '@/components/dashboard/occupancy-chart'

jest.mock('recharts', () => ({
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    PieChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Pie: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Cell: () => <div data-testid="recharts-cell" />,
    Tooltip: () => <div data-testid="recharts-tooltip" />,
    Legend: () => <div data-testid="recharts-legend" />
}))

describe('OccupancyChart Component', () => {
    it('renders without crashing with valid data', () => {
        const { container } = render(<OccupancyChart occupied={120} free={30} />)
        expect(container).toBeInTheDocument()
    })

    it('renders without crashing with zero data', () => {
        const { container } = render(<OccupancyChart occupied={0} free={0} />)
        expect(container).toBeInTheDocument()
    })
})