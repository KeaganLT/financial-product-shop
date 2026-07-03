import Section from './Section.jsx';
import InfoRow from './InfoRow.jsx';

const KEY_TERMS = [
    'Governed by South African law',
    '31-day cooling-off period',
    'Regulated by the FSCA under the FAIS Act',
    'Personal information protected under POPIA',
    'Disputes: approach the Ombud for Financial Services',
];

function getCoverPoints(productName = '') {
    const n = productName.toLowerCase();
    if (n.includes('insurance')) return ['Accidental damage', 'Theft & loss', 'International cover', 'No excess on first claim'];
    if (n.includes('islamic'))   return ['Sharia-compliant', 'Profit-sharing basis', 'No interest (riba)', 'Certified by Supervisory Board'];
    if (n.includes('vip'))       return ['Dedicated relationship manager', 'Priority support line', 'High-yield portfolio', 'Quarterly statements'];
    if (n.includes('device'))    return ['Device financing', 'Maintenance cover', 'Theft protection', 'Easy upgrades'];
    return ['Competitive returns', 'Flexible terms', 'Tax-efficient', 'Monthly statements'];
}

export default function ContractPreview({ product, profile, profileLoading, resolvedBank }) {
    const coverPoints = getCoverPoints(product?.name);

    return (
        <Section heading="Contract summary">
            <div
                className="rounded-t-[10px] px-4 py-3 flex items-center justify-between"
                style={{ background: 'linear-gradient(90deg, #1860BF 0%, #1AB0DE 100%)' }}
            >
                <div>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 13, fontWeight: 700, color: 'white' }}>FinShop (Pty) Ltd</p>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>FSP Licence No. 12345 · Authorised Financial Services Provider</p>
                </div>
                <div
                    className="px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'Roboto, sans-serif', color: 'white', fontWeight: 600 }}
                >
                    PRODUCT AGREEMENT
                </div>
            </div>

            <div className="border rounded-b-[10px] px-4 pb-4 flex flex-col gap-4" style={{ borderColor: '#E5E5EA', borderTop: 'none' }}>
                <div className="pt-3">
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Parties</p>
                    <InfoRow label="Service Provider" value="FinShop (Pty) Ltd" />
                    <InfoRow
                        label="Policyholder"
                        value={
                            profile
                                ? (`${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || profile.username || 'N/A')
                                : (profileLoading ? 'Loading…' : 'N/A')
                        }
                    />
                </div>

                <div>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Product details</p>
                    <InfoRow label="Product" value={product.name} />
                    <InfoRow label="Monthly premium" value={`R${Number(product.price).toFixed(2)}`} />
                    {resolvedBank && (
                        <>
                            <InfoRow label="Debit bank" value={resolvedBank.bankName} />
                            <InfoRow label="Account" value={`${resolvedBank.accountType} ••••${resolvedBank.last4}`} />
                            <InfoRow label="Debit date" value={`${resolvedBank.debitDay}${resolvedBank.debitDay === 1 ? 'st' : 'th'} of each month`} />
                        </>
                    )}
                </div>

                <div>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>What's covered</p>
                    <ul className="flex flex-col gap-1.5">
                        {coverPoints.map((p) => (
                            <li key={p} className="flex items-center gap-2">
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <circle cx="7" cy="7" r="7" fill="#E6F9ED" />
                                    <path d="M4 7l2.5 2.5 4-4" stroke="#168C34" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43' }}>{p}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: 11, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Key terms</p>
                    <ul className="flex flex-col gap-1.5">
                        {KEY_TERMS.map((t) => (
                            <li key={t} style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: '#3C3C43', paddingLeft: 12, position: 'relative' }}>
                                <span style={{ position: 'absolute', left: 0, color: '#1860BF' }}>·</span>
                                {t}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Section>
    );
}
