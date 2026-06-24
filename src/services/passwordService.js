const PWNED_RANGE_URL = 'https://api.pwnedpasswords.com/range';

async function sha1Hex(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-1', bytes);
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

// Checks a password against the Have I Been Pwned Pwned Passwords range API
// using k-anonymity: only the first 5 hex characters of the SHA-1 hash are
// ever sent, so the real password never leaves the browser. Returns the
// number of times the password has appeared in known breaches (0 if none).
export async function checkPasswordPwned(password) {
    const hash = await sha1Hex(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`${PWNED_RANGE_URL}/${prefix}`, {
        headers: { 'Add-Padding': 'true' },
    });
    if (!response.ok) {
        throw new Error(`Pwned Passwords check failed (${response.status})`);
    }

    const text = await response.text();
    for (const line of text.split('\n')) {
        const [lineSuffix, count] = line.trim().split(':');
        if (lineSuffix === suffix) {
            return Number(count) || 0;
        }
    }
    return 0;
}
