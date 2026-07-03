import insuranceRetail from './insurance-retail.svg';
import insuranceCommercial from './insurance-commercial.svg';
import deviceContract from './device-contract.svg';
import investment from './investment.svg';
import islamicInvestment from './islamic-investment.svg';
import vipInvestment from './vip-investment.svg';
import defaultPlaceholder from '../product-placeholder.svg';

export function getProductPlaceholder(productName = '') {
    const name = productName.toLowerCase();
    if (name.includes('islamic')) return islamicInvestment;
    if (name.includes('vip')) return vipInvestment;
    if (name.includes('device') || name.includes('contract')) return deviceContract;
    if (name.includes('commercial')) return insuranceCommercial;
    if (name.includes('insurance')) return insuranceRetail;
    if (name.includes('investment') || name.includes('annuity') || name.includes('fund')) return investment;
    return defaultPlaceholder;
}
