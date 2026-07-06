const GENERIC_WORDS = new Set(['product', 'products', 'the', 'a', 'an', 'and', 'of', 'for', 'with']);

function significantWords(name = '') {
    return name
        .toLowerCase()
        .split(/[^a-z]+/)
        .filter((word) => word.length > 1 && !GENERIC_WORDS.has(word));
}

export function rankRelatedProducts(product, candidates) {
    const baseWords = new Set(significantWords(product?.name));

    const scored = candidates.map((candidate) => {
        const words = significantWords(candidate.name);
        const nameScore = words.filter((w) => baseWords.has(w)).length;
        const typeScore = candidate.fulfilmentType && candidate.fulfilmentType === product?.fulfilmentType ? 1 : 0;
        return { candidate, score: nameScore * 2 + typeScore };
    });

    const related = scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score);
    const rest    = scored.filter((s) => s.score === 0);

    return [...related, ...rest].map((s) => s.candidate);
}
