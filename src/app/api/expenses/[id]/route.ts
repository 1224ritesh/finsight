import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const expenseUpdateSchema = z.object({
    amount: z.number().positive().optional(),
    category: z.string().min(1).optional(),
    date: z.iso.datetime().optional(),
    description: z.string().optional(),
})

async function getSession(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })
    return session
}

// GET - Get single expense
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const expense = await prisma.expense.findUnique({
            where: { id },
        })

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }

        if (expense.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json(expense)
    } catch (error) {
        console.error('Error fetching expense:', error)
        return NextResponse.json(
            { error: 'Failed to fetch expense' },
            { status: 500 }
        )
    }
}

// PUT - Update expense
export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const expense = await prisma.expense.findUnique({
            where: { id },
        })

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }

        if (expense.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await req.json()
        const validation = expenseUpdateSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const updateData: Partial<{
            amount: number
            category: string
            date: Date
            description: string
        }> = {}

        if (validation.data.amount !== undefined) updateData.amount = validation.data.amount
        if (validation.data.category) updateData.category = validation.data.category
        if (validation.data.date) updateData.date = new Date(validation.data.date)
        if (validation.data.description !== undefined) updateData.description = validation.data.description

        const updatedExpense = await prisma.expense.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json(updatedExpense)
    } catch (error) {
        console.error('Error updating expense:', error)
        return NextResponse.json(
            { error: 'Failed to update expense' },
            { status: 500 }
        )
    }
}

// DELETE - Delete expense
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const expense = await prisma.expense.findUnique({
            where: { id },
        })

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
        }

        if (expense.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.expense.delete({
            where: { id },
        })

        return NextResponse.json({ message: 'Expense deleted successfully' })
    } catch (error) {
        console.error('Error deleting expense:', error)
        return NextResponse.json(
            { error: 'Failed to delete expense' },
            { status: 500 }
        )
    }
}
