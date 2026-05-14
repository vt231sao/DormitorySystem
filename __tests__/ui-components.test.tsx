import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

describe('UI Components', () => {
    it('renders Badge correctly', () => {
        render(<Badge>Test Badge</Badge>)
        expect(screen.getByText('Test Badge')).toBeInTheDocument()
    })

    it('renders destructive Badge correctly', () => {
        render(<Badge variant="destructive">Error Badge</Badge>)
        expect(screen.getByText('Error Badge')).toHaveClass('text-destructive')
    })

    it('renders Card correctly', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                </CardHeader>
                <CardContent>Card Content</CardContent>
            </Card>
        )
        expect(screen.getByText('Card Title')).toBeInTheDocument()
        expect(screen.getByText('Card Content')).toBeInTheDocument()
    })

    it('renders Input correctly', () => {
        render(<Input placeholder="Enter text" />)
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('renders Label correctly', () => {
        render(<Label htmlFor="test-input">Test Label</Label>)
        expect(screen.getByText('Test Label')).toBeInTheDocument()
    })
})