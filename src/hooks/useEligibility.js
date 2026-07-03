import { useState, useEffect } from 'react';
import { getEligibility } from '../services/subscriptionService';
import { getProfile, getKycBackendStatus } from '../services/customerService';
import { getRequiredCustomerTypes } from '../utils/productDetails';

export function useEligibility(id, product, auth, isLoggedIn) {
    const [eligibility, setEligibility]       = useState(null);
    const [eligibilityChecks, setEligibilityChecks] = useState(null);

    useEffect(() => {
        if (!isLoggedIn || !id || !product) return;

        Promise.all([
            getEligibility([Number(id)], auth.token),
            getProfile(auth.token),
        ])
            .then(async ([results, profile]) => {
                const result = Array.isArray(results)
                    ? results.find((r) => String(r.productId) === String(id))
                    : null;
                setEligibility(result ?? null);

                if (!result || result.isEligible) return;

                const numericId  = profile?.id;
                const kycBackend = numericId
                    ? await getKycBackendStatus(numericId, auth.token)
                    : null;

                const required        = getRequiredCustomerTypes(product.name);
                const currentTypeName = (profile?.customerType?.name ?? '').toUpperCase();
                const customerTypePass = required
                    ? (!!currentTypeName && required.map((t) => t.toUpperCase()).includes(currentTypeName))
                    : true;

                const taxStatus = (kycBackend?.taxCompliance ?? '').toLowerCase();
                const taxPass   = taxStatus === 'amber' || taxStatus === 'green';

                const porPass    = kycBackend?.primaryIndicator === true;
                const selfiePass = kycBackend?.secondaryIndicator === true;

                const accounts    = profile?.customerAccounts ?? profile?.accounts ?? [];
                const accountPass = accounts.length > 0;

                setEligibilityChecks({
                    customerType: {
                        pass: customerTypePass,
                        label: 'Customer type',
                        detail: customerTypePass
                            ? `${profile?.customerType?.name ?? 'Set'}`
                            : required
                                ? `Required: ${required.join(', ')}${currentTypeName ? ` (yours: ${profile?.customerType?.name})` : ' (not set)'}`
                                : 'Not set',
                    },
                    taxCompliance: {
                        pass: taxPass,
                        label: 'Tax compliance',
                        detail: taxPass
                            ? `Status: ${kycBackend.taxCompliance}`
                            : kycBackend
                                ? 'Tax compliance must be amber or green'
                                : 'Not verified yet',
                    },
                    proofOfResidence: {
                        pass: porPass,
                        label: 'Proof of residence',
                        detail: porPass ? 'Uploaded' : 'Not yet uploaded',
                    },
                    selfie: {
                        pass: selfiePass,
                        label: 'Identity selfie',
                        detail: selfiePass ? 'Uploaded' : 'Not yet uploaded',
                    },
                    account: {
                        pass: accountPass,
                        label: 'Linked account',
                        detail: accountPass
                            ? `${accounts.length} account${accounts.length > 1 ? 's' : ''} linked`
                            : 'No account linked',
                    },
                });
            })
            .catch(() => setEligibility(null));
    }, [isLoggedIn, id, auth?.token, product]);

    return { eligibility, eligibilityChecks };
}
