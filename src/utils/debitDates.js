export function getNextDebitDate(debitDay) {
    if (!debitDay) return null;
    const now    = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), debitDay);
    if (target <= now) target.setMonth(target.getMonth() + 1);
    return target;
}

export function formatDebitDate(date) {
    if (!date) return '';
    return date.toLocaleDateString('en-ZA', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function ordinalDay(day) {
    if (day === 1) return '1st';
    if (day === 2) return '2nd';
    if (day === 3) return '3rd';
    return `${day}th`;
}
