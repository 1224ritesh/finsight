import { NextRequest, NextResponse } from 'next/server'
import { calculateTax, compareTaxRegimes } from '@/lib/tax-calculator'
import { z } from 'zod'

const taxCalculationSchema = z.object({
    annualCTC: z.number().positive('Annual CTC must be positive'),
    regime: z.enum(['old', 'new']),
    compare: z.boolean().optional(),
})

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const validation = taxCalculationSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { annualCTC, regime, compare } = validation.data

        if (compare) {
            const comparison = compareTaxRegimes(annualCTC)
            return NextResponse.json(comparison)
        }

        const result = calculateTax({ annualCTC, regime })
        return NextResponse.json(result)
    } catch (error) {
        console.error('Tax calculation error:', error)
        return NextResponse.json(
            { error: 'Failed to calculate tax' },
            { status: 500 }
        )
    }
}
