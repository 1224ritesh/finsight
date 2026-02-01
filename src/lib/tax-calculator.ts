// Indian Income Tax Calculation Utilities (FY 2025-26)

export type TaxRegime = 'old' | 'new'

export interface TaxCalculationInput {
    annualCTC: number
    regime: TaxRegime
}

export interface TaxCalculationResult {
    regime: TaxRegime
    annualCTC: number
    taxableIncome: number
    totalTax: number
    effectiveTaxRate: number
    taxBreakdown: {
        slab: string
        rate: number
        amount: number
    }[]
    explanation: string
}

// Old Tax Regime Slabs (unchanged - with standard deduction of ₹50,000)
const OLD_REGIME_SLABS = [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 5 },
    { min: 500000, max: 1000000, rate: 20 },
    { min: 1000000, max: Infinity, rate: 30 },
]

// New Tax Regime Slabs (FY 2025-26 - Budget 2025 updated rates)
// Standard deduction of ₹75,000
const NEW_REGIME_SLABS = [
    { min: 0, max: 400000, rate: 0 },           // Up to ₹4 lakh - Nil
    { min: 400000, max: 800000, rate: 5 },      // ₹4-8 lakh - 5%
    { min: 800000, max: 1200000, rate: 10 },    // ₹8-12 lakh - 10%
    { min: 1200000, max: 1600000, rate: 15 },   // ₹12-16 lakh - 15%
    { min: 1600000, max: 2000000, rate: 20 },   // ₹16-20 lakh - 20%
    { min: 2000000, max: 2400000, rate: 25 },   // ₹20-24 lakh - 25%
    { min: 2400000, max: Infinity, rate: 30 },  // Above ₹24 lakh - 30%
]

// Health and Education Cess (4% of income tax)
const CESS_RATE = 0.04

// Rebate under Section 87A (FY 2025-26)
const REBATE_LIMIT_NEW = 1200000  // ₹12 lakh for new regime
const REBATE_AMOUNT_NEW = 60000   // Max rebate ₹60,000 for new regime
const REBATE_LIMIT_OLD = 500000   // ₹5 lakh for old regime
const REBATE_AMOUNT_OLD = 12500   // Max rebate ₹12,500 for old regime

export function calculateTax(input: TaxCalculationInput): TaxCalculationResult {
    const { annualCTC, regime } = input

    // Standard deduction
    const standardDeduction = regime === 'new' ? 75000 : 50000
    const taxableIncome = Math.max(0, annualCTC - standardDeduction)

    // Select appropriate slabs
    const slabs = regime === 'new' ? NEW_REGIME_SLABS : OLD_REGIME_SLABS

    // Calculate tax
    let tax = 0
    const taxBreakdown: { slab: string; rate: number; amount: number }[] = []

    for (let i = 0; i < slabs.length; i++) {
        const slab = slabs[i]
        const taxableInSlab = Math.min(
            Math.max(0, taxableIncome - slab.min),
            slab.max - slab.min
        )

        if (taxableInSlab > 0) {
            const slabTax = (taxableInSlab * slab.rate) / 100
            tax += slabTax

            taxBreakdown.push({
                slab: `₹${slab.min.toLocaleString('en-IN')} - ${slab.max === Infinity ? 'Above' : `₹${slab.max.toLocaleString('en-IN')}`
                    }`,
                rate: slab.rate,
                amount: slabTax,
            })
        }
    }

    // Add cess
    const cess = tax * CESS_RATE
    const totalTaxBeforeRebate = tax + cess

    // Apply rebate under Section 87A
    let rebate = 0
    if (regime === 'new' && taxableIncome <= REBATE_LIMIT_NEW) {
        rebate = Math.min(totalTaxBeforeRebate, REBATE_AMOUNT_NEW)
    } else if (regime === 'old' && taxableIncome <= REBATE_LIMIT_OLD) {
        rebate = Math.min(totalTaxBeforeRebate, REBATE_AMOUNT_OLD)
    }

    const totalTax = totalTaxBeforeRebate - rebate

    // Calculate effective tax rate
    const effectiveTaxRate = annualCTC > 0 ? (totalTax / annualCTC) * 100 : 0

    // Generate explanation
    const explanation = generateExplanation(annualCTC, taxableIncome, totalTax, regime, standardDeduction, rebate)

    return {
        regime,
        annualCTC,
        taxableIncome,
        totalTax: Math.round(totalTax),
        effectiveTaxRate: Math.round(effectiveTaxRate * 100) / 100,
        taxBreakdown,
        explanation,
    }
}

function generateExplanation(
    ctc: number,
    taxableIncome: number,
    totalTax: number,
    regime: TaxRegime,
    standardDeduction: number,
    rebate: number
): string {
    const monthlyTax = totalTax / 12
    const takeHome = ctc - totalTax
    const monthlyTakeHome = takeHome / 12

    let rebateInfo = ''
    if (rebate > 0) {
        rebateInfo = `\n• Rebate u/s 87A: ₹${rebate.toLocaleString('en-IN')} (Tax reduced to zero)`
    }

    return `Under the ${regime === 'new' ? 'New' : 'Old'} Tax Regime:
• Annual CTC: ₹${ctc.toLocaleString('en-IN')}
• Standard Deduction: ₹${standardDeduction.toLocaleString('en-IN')}
• Taxable Income: ₹${taxableIncome.toLocaleString('en-IN')}
• Total Tax (including 4% cess): ₹${Math.round(totalTax).toLocaleString('en-IN')}${rebateInfo}
• Monthly Tax: ₹${Math.round(monthlyTax).toLocaleString('en-IN')}
• Annual Take-Home: ₹${Math.round(takeHome).toLocaleString('en-IN')}
• Monthly Take-Home: ₹${Math.round(monthlyTakeHome).toLocaleString('en-IN')}`
}

export function compareTaxRegimes(annualCTC: number): {
    old: TaxCalculationResult
    new: TaxCalculationResult
    recommendation: string
} {
    const oldResult = calculateTax({ annualCTC, regime: 'old' })
    const newResult = calculateTax({ annualCTC, regime: 'new' })

    const savings = oldResult.totalTax - newResult.totalTax
    const recommendation =
        savings > 0
            ? `The New Tax Regime saves you ₹${Math.abs(savings).toLocaleString('en-IN')} annually.`
            : savings < 0
                ? `The Old Tax Regime saves you ₹${Math.abs(savings).toLocaleString('en-IN')} annually.`
                : 'Both regimes result in the same tax liability.'

    return {
        old: oldResult,
        new: newResult,
        recommendation,
    }
}
