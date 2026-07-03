export const PRODUCT_DETAILS = {
    default: {
        benefits: [
            'Theft and loss recovery',
            'Comprehensive coverage',
            'Hardware malfunction coverage',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Have an account with us in good standing',
        ],
    },
    insurance: {
        benefits: [
            'Full device replacement',
            'Accidental damage cover',
            'International coverage',
            'No excess on first claim',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Active qualifying cheque account',
            'No outstanding claims',
        ],
    },
    investment: {
        benefits: [
            'Competitive interest rates',
            'Flexible investment terms',
            'Tax-efficient returns',
            'Monthly interest payments',
        ],
        requirements: [
            'Minimum age of 18 years old',
            'South African resident',
            'Valid SA ID number',
            'Minimum investment of R1,000',
        ],
    },
};

export const PRODUCT_CUSTOMER_TYPES = {
    'Retail Short Term Insurance':     ['INDIVIDUAL'],
    'Retail Long-Term Insurance':      ['INDIVIDUAL'],
    'Commercial Short Term Insurance': ['SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Commercial Long-Term Insurance':  ['SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Device Contract':                 ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Short-Term Investment Product':   ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Long-Term investment Product':    ['INDIVIDUAL', 'SOLE PROP', 'NON-PROFIT', 'CIPC'],
    'Islamic Investment Product':      ['INDIVIDUAL', 'NON-PROFIT'],
    'VIP Investment Product':          ['INDIVIDUAL'],
};

export function getRequiredCustomerTypes(productName = '') {
    const entry = Object.entries(PRODUCT_CUSTOMER_TYPES).find(([key]) =>
        productName.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(productName.toLowerCase())
    );
    return entry ? entry[1] : null;
}

export function getProductDetails(productName = '') {
    const name = productName.toLowerCase();
    if (name.includes('insurance') || name.includes('device') || name.includes('contract')) {
        return PRODUCT_DETAILS.insurance;
    }
    if (name.includes('investment') || name.includes('annuity') || name.includes('fund')) {
        return PRODUCT_DETAILS.investment;
    }
    return PRODUCT_DETAILS.default;
}
