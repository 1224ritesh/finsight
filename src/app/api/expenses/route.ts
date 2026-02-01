import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const expenseSchema = z.object({
    amount: z.number().positive('Amount must be positive'),
    category: z.string().min(1, 'Category is required'),
    date: z.string().datetime(),
    description: z.string().optional(),
})

async function getSession(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })
    return session
}

// GET - List expenses
export async function GET(req: NextRequest) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')
        const category = searchParams.get('category')

        const where: {
            userId: string
            date?: { gte?: Date; lte?: Date }
            category?: string
        } = {
            userId: session.user.id,
        }

        if (startDate || endDate) {
            where.date = {}
            if (startDate) where.date.gte = new Date(startDate)
            if (endDate) where.date.lte = new Date(endDate)
        }

        if (category) {
            where.category = category
        }

        const expenses = await prisma.expense.findMany({
            where,
            orderBy: { date: 'desc' },
        })

        return NextResponse.json(expenses)
    } catch (error) {
        console.error('Error fetching expenses:', error)
        return NextResponse.json(
            { error: 'Failed to fetch expenses' },
            { status: 500 }
        )
    }
}

// POST - Create expense
export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req)

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const validation = expenseSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const expense = await prisma.expense.create({
            data: {
                ...validation.data,
                date: new Date(validation.data.date),
                userId: session.user.id,
            },
        })

        return NextResponse.json(expense, { status: 201 })
    } catch (error) {
        console.error('Error creating expense:', error)
        return NextResponse.json(
            { error: 'Failed to create expense' },
            { status: 500 }
        )
    }
}
