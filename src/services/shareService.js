export function getProductUrl(productId) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/products/${productId}`;
}

export function buildShareText(product) {
    const price = product?.price != null ? ` from R${Number(product.price).toFixed(0)}/month` : '';
    return `Check out ${product?.name ?? 'this product'}${price} on InsureTechGuard`;
}

export async function shareProduct(product) {
    const url  = getProductUrl(product.id);
    const text = buildShareText(product);
    const title = product?.name ?? 'InsureTechGuard';

    if (typeof navigator !== 'undefined' && navigator.share) {
        try {
            await navigator.share({ title, text, url });
            return { shared: true, method: 'native' };
        } catch (err) {
            if (err?.name === 'AbortError') return { shared: false, method: 'native' };
        }
    }
    return { shared: false, method: 'fallback' };
}

export async function copyProductLink(product) {
    const url = getProductUrl(product.id);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        return true;
    }
    return false;
}

export function getSocialShareLinks(product) {
    const url  = encodeURIComponent(getProductUrl(product.id));
    const text = encodeURIComponent(buildShareText(product));

    return [
        { key: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${url}` },
        { key: 'x',        label: 'X',        href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
        { key: 'facebook', label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}` },
        { key: 'linkedin', label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}` },
        { key: 'email',    label: 'Email',    href: `mailto:?subject=${encodeURIComponent(product?.name ?? 'InsureTechGuard product')}&body=${text}%20${url}` },
    ];
}
