export const CATEGORY_GROUPS = [
    {
        key: 'short-term-insurance',
        label: 'Short Term Insurance',
        accent: 'var(--brand-100)',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" stroke="var(--brand-100)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'long-term-insurance',
        label: 'Long Term Insurance',
        accent: '#0D47A1',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#E8F0FE" stroke="#0D47A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'device-contract',
        label: 'Device Contracts',
        accent: '#1A3A5C',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="7" y="2" width="10" height="20" rx="2" stroke="#1A3A5C" strokeWidth="2" />
                <circle cx="12" cy="18" r="1" fill="#1A3A5C" />
            </svg>
        ),
    },
    {
        key: 'islamic-investment',
        label: 'Islamic Investments',
        accent: '#1B5E20',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C9 2 6.5 4 6.5 6.5c0 1.5.7 2.8 1.8 3.7C5.5 11.5 4 14 4 17c2 1.3 4.5 2 7.5 2h.5c3 0 5.5-.7 7.5-2 0-3-1.5-5.5-4.3-6.8A4.5 4.5 0 0 0 17.5 6.5C17.5 4 15 2 12 2z" stroke="#1B5E20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'vip-investment',
        label: 'VIP Investments',
        accent: '#4A148C',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M3 9l9-7 9 7-3.5 11H6.5L3 9z" stroke="#4A148C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'investment',
        label: 'Investments',
        accent: '#168C34',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" stroke="#168C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="16 7 22 7 22 13" stroke="#168C34" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        key: 'other',
        label: 'Other',
        accent: '#8E8E93',
        icon: (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#8E8E93" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="#8E8E93" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
    },
];

export function getCategory(productName = '') {
    const n = productName.toLowerCase();
    if (n.includes('islamic'))                                              return 'islamic-investment';
    if (n.includes('vip'))                                                  return 'vip-investment';
    if ((n.includes('short') || n.includes('retail')) && n.includes('insurance')) return 'short-term-insurance';
    if (n.includes('long') && n.includes('insurance'))                     return 'long-term-insurance';
    if (n.includes('insurance') || n.includes('commercial'))               return 'short-term-insurance';
    if (n.includes('device') || n.includes('contract'))                    return 'device-contract';
    if (n.includes('investment') || n.includes('annuity') || n.includes('fund')) return 'investment';
    return 'other';
}

export function groupSubscriptions(subscriptions) {
    const groups = {};
    for (const sub of subscriptions) {
        const prod = Array.isArray(sub.product) ? sub.product[0] : sub.product;
        const name = sub.productName ?? prod?.name ?? '';
        const key  = getCategory(name);
        if (!groups[key]) groups[key] = [];
        groups[key].push(sub);
    }
    return groups;
}
