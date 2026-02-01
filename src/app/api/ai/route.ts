import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { google } from '@ai-sdk/google'
import { streamText } from 'ai'
import { z } from 'zod'
import { calculateTax } from '@/lib/tax-calculator'

const aiChatSchema = z.object({
    messages: z.array(z.object({
        id: z.string().optional(),
        role: z.enum(['user', 'assistant', 'system']),
        parts: z.array(z.object({
            type: z.string(),
            text: z.string().optional(),
        })).optional(),
    })),
    includeContext: z.boolean().default(true),
    annualCTC: z.number().optional(),
    taxRegime: z.enum(['old', 'new']).optional(),
})

async function getSession(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })
    return session
}

async function getUserContext(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
    })

    const expenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 100, // Last 100 expenses for better context
    })

    // Calculate expense summary
    const totalExpenses = expenses.reduce((sum: number, exp: { amount: number; category: string; date: Date; description: string | null }) => sum + exp.amount, 0)
    const categoryTotals = expenses.reduce((acc: Record<string, number>, exp: { amount: number; category: string; date: Date; description: string | null }) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount
        return acc
    }, {} as Record<string, number>)

    // Calculate monthly average
    const monthlyAverage = expenses.length > 0 ? totalExpenses / Math.min(12, expenses.length) : 0

    return {
        userName: user?.name || 'User',
        totalExpenses,
        monthlyAverage,
        expenseCount: expenses.length,
        categoryBreakdown: categoryTotals,
        recentExpenses: expenses.slice(0, 10).map((exp: {
            amount: number;
            category: string;
            date: Date;
            description: string | null;
        }) => ({
            amount: exp.amount,
            category: exp.category,
            date: exp.date,
            description: exp.description,
        })),
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession(req)

        if (!session) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const body = await req.json()
        const validation = aiChatSchema.safeParse(body)

        if (!validation.success) {
            return new Response(
                JSON.stringify({ error: 'Invalid input', details: validation.error.issues }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        const { messages, includeContext, annualCTC, taxRegime } = validation.data

        let contextInfo = ''

        if (includeContext) {
            const userContext = await getUserContext(session.user.id)

            // Calculate tax if CTC provided
            let taxInfo = ''
            if (annualCTC && taxRegime) {
                const taxResult = calculateTax({ annualCTC, regime: taxRegime })
                taxInfo = `
                    Tax Calculation (${taxRegime.toUpperCase()} Regime):
                    - Annual CTC: ₹${annualCTC.toLocaleString('en-IN')}
                    - Taxable Income: ₹${taxResult.taxableIncome.toLocaleString('en-IN')}
                    - Total Tax: ₹${taxResult.totalTax.toLocaleString('en-IN')}
                    - Effective Tax Rate: ${taxResult.effectiveTaxRate}%
                    - Annual Take-Home: ₹${(annualCTC - taxResult.totalTax).toLocaleString('en-IN')}
                    - Monthly Take-Home: ₹${((annualCTC - taxResult.totalTax) / 12).toLocaleString('en-IN')}
                `
            }

            // Build expense section only if there are expenses
            let expenseInfo = ''
            if (userContext.expenseCount > 0) {
                expenseInfo = `
                    Expense Summary:
                    - Total Expenses Tracked: ₹${userContext.totalExpenses.toLocaleString('en-IN')}
                    - Monthly Average: ₹${Math.round(userContext.monthlyAverage).toLocaleString('en-IN')}
                    - Number of Transactions: ${userContext.expenseCount}
                    - Expense Breakdown by Category:
                    ${Object.entries(userContext.categoryBreakdown)
                        .map(([cat, amt]) => `  • ${cat}: ₹${(amt as number).toLocaleString('en-IN')} (${Math.round((amt as number) / userContext.totalExpenses * 100)}%)`)
                        .join('\n')}

                    Recent Expenses (Last 10):
                    ${userContext.recentExpenses.map((exp: { amount: number; category: string; date: Date; description: string | null }) =>
                            `  • ₹${exp.amount.toLocaleString('en-IN')} - ${exp.category} - ${new Date(exp.date).toLocaleDateString('en-IN')}${exp.description ? ` (${exp.description})` : ''}`
                        ).join('\n')}
            `
            } else {
                expenseInfo = `
                    Expense Summary:
                    - No expenses tracked yet. User hasn't started tracking expenses in FinSight.
                `
            }

            contextInfo = `
                User Profile: ${userContext.userName}

                ${taxInfo}
                ${expenseInfo}
            `
        }

        const systemPrompt = `You are an expert Indian financial advisor with deep knowledge of:
            - Indian Income Tax Act and current tax laws (FY 2025-26)
            - Investment options in India (PPF, EPF, ELSS, NPS, Mutual Funds, etc.)
            - Tax-saving instruments under Section 80C, 80D, etc.
            - Budgeting and expense management
            - Financial planning for young professionals

            ${contextInfo}

            Provide personalized, actionable advice based on the user's actual financial data. Be concise yet comprehensive, and format your responses with clear sections and bullet points for readability.
        `

        // Stream the response using Gemini 3 Flash
        const result = streamText({
            model: google('gemini-3-flash-preview'),
            system: systemPrompt,
            messages: messages.map(m => ({
                role: m.role as 'user' | 'assistant',
                content: m.parts?.find(p => p.type === 'text')?.text || '',
            })),
        })

        return result.toUIMessageStreamResponse()
    } catch (error) {
        console.error('AI advisor error:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to get AI response. Please try again later.' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        )
    }
}
