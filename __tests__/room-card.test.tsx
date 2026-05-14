import { render, screen } from '@testing-library/react'
import RoomCardDialog from '@/components/rooms/room-card-dialog'

jest.mock('@/actions/placement', () => ({
    checkInStudent: jest.fn(),
    checkOutStudent: jest.fn(),
    toggleRoomStatus: jest.fn(),
}))

const mockRoom = {
    id: "1",
    number: "404",
    floor: 4,
    capacity: 3,
    status: "active",
    roomGender: "M",
    placements: []
}

describe('RoomCardDialog Component', () => {
    it('renders room number and initial status', () => {
        render(<RoomCardDialog room={mockRoom} availableStudents={[]} />)

        expect(screen.getByText('404')).toBeInTheDocument()
    })
})