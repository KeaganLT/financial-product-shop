import InfoBanner from '../InfoBanner.jsx';

export default function UnsignedContractsBanner({ count }) {
    if (count === 0) return null;

    return (
        <InfoBanner variant="warning" title={`${count} contract${count > 1 ? 's' : ''} awaiting your signature`}>
            Tap "Sign contract" on the relevant subscription below.
        </InfoBanner>
    );
}
