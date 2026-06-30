// South African ID: YYMMDDGGGGSAZ  (13 digits)
// YYMMDD = date of birth, GGGG = gender (0000-4999 F, 5000-9999 M),
// S = citizenship (0=SA citizen, 1=permanent resident), A = legacy race digit, Z = Luhn check

export function validateSAId(id) {
    if (!/^\d{13}$/.test(id)) return false;

    // Luhn check: sum odd-indexed digits + digit-sum of (even-indexed concat * 2)
    const oddSum = [0, 2, 4, 6, 8, 10].reduce((s, i) => s + Number(id[i]), 0);
    const evenDigits = [1, 3, 5, 7, 9, 11].map((i) => id[i]).join('');
    const evenSum = String(Number(evenDigits) * 2)
        .split('')
        .reduce((s, d) => s + Number(d), 0);
    if ((oddSum + evenSum + Number(id[12])) % 10 !== 0) return false;

    // Date of birth
    const yy = Number(id.slice(0, 2));
    const mm = Number(id.slice(2, 4));
    const dd = Number(id.slice(4, 6));
    const year = yy + (yy <= new Date().getFullYear() % 100 ? 2000 : 1900);
    const date = new Date(year, mm - 1, dd);
    if (date.getFullYear() !== year || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
        return false;
    }

    // Citizenship digit must be 0 or 1
    if (id[10] !== '0' && id[10] !== '1') return false;

    return true;
}