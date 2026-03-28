import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

export interface CountryOption {
  code: string;   // ISO 3166-1 alpha-2
  flag: string;   // emoji flag
  name: string;
  currency: string;   // ISO 4217
  symbol: string;
}

// Full world list — countries with their default currencies
export const COUNTRIES: CountryOption[] = [
  { code: 'AF', flag: '🇦🇫', name: 'Afghanistan', currency: 'AFN', symbol: '؋' },
  { code: 'AL', flag: '🇦🇱', name: 'Albania', currency: 'ALL', symbol: 'L' },
  { code: 'DZ', flag: '🇩🇿', name: 'Algeria', currency: 'DZD', symbol: 'د.ج' },
  { code: 'AD', flag: '🇦🇩', name: 'Andorra', currency: 'EUR', symbol: '€' },
  { code: 'AO', flag: '🇦🇴', name: 'Angola', currency: 'AOA', symbol: 'Kz' },
  { code: 'AG', flag: '🇦🇬', name: 'Antigua & Barbuda', currency: 'XCD', symbol: '$' },
  { code: 'AR', flag: '🇦🇷', name: 'Argentina', currency: 'ARS', symbol: '$' },
  { code: 'AM', flag: '🇦🇲', name: 'Armenia', currency: 'AMD', symbol: '֏' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', currency: 'AUD', symbol: 'A$' },
  { code: 'AT', flag: '🇦🇹', name: 'Austria', currency: 'EUR', symbol: '€' },
  { code: 'AZ', flag: '🇦🇿', name: 'Azerbaijan', currency: 'AZN', symbol: '₼' },
  { code: 'BS', flag: '🇧🇸', name: 'Bahamas', currency: 'BSD', symbol: '$' },
  { code: 'BH', flag: '🇧🇭', name: 'Bahrain', currency: 'BHD', symbol: '.د.ب' },
  { code: 'BD', flag: '🇧🇩', name: 'Bangladesh', currency: 'BDT', symbol: '৳' },
  { code: 'BB', flag: '🇧🇧', name: 'Barbados', currency: 'BBD', symbol: 'Bds$' },
  { code: 'BY', flag: '🇧🇾', name: 'Belarus', currency: 'BYN', symbol: 'Br' },
  { code: 'BE', flag: '🇧🇪', name: 'Belgium', currency: 'EUR', symbol: '€' },
  { code: 'BZ', flag: '🇧🇿', name: 'Belize', currency: 'BZD', symbol: 'BZ$' },
  { code: 'BJ', flag: '🇧🇯', name: 'Benin', currency: 'XOF', symbol: 'Fr' },
  { code: 'BT', flag: '🇧🇹', name: 'Bhutan', currency: 'BTN', symbol: 'Nu' },
  { code: 'BO', flag: '🇧🇴', name: 'Bolivia', currency: 'BOB', symbol: 'Bs.' },
  { code: 'BA', flag: '🇧🇦', name: 'Bosnia & Herzegovina', currency: 'BAM', symbol: 'KM' },
  { code: 'BW', flag: '🇧🇼', name: 'Botswana', currency: 'BWP', symbol: 'P' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil', currency: 'BRL', symbol: 'R$' },
  { code: 'BN', flag: '🇧🇳', name: 'Brunei', currency: 'BND', symbol: 'B$' },
  { code: 'BG', flag: '🇧🇬', name: 'Bulgaria', currency: 'BGN', symbol: 'лв' },
  { code: 'BF', flag: '🇧🇫', name: 'Burkina Faso', currency: 'XOF', symbol: 'Fr' },
  { code: 'BI', flag: '🇧🇮', name: 'Burundi', currency: 'BIF', symbol: 'Fr' },
  { code: 'CV', flag: '🇨🇻', name: 'Cabo Verde', currency: 'CVE', symbol: '$' },
  { code: 'KH', flag: '🇰🇭', name: 'Cambodia', currency: 'KHR', symbol: '៛' },
  { code: 'CM', flag: '🇨🇲', name: 'Cameroon', currency: 'XAF', symbol: 'Fr' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', currency: 'CAD', symbol: 'CA$' },
  { code: 'CF', flag: '🇨🇫', name: 'Central African Republic', currency: 'XAF', symbol: 'Fr' },
  { code: 'TD', flag: '🇹🇩', name: 'Chad', currency: 'XAF', symbol: 'Fr' },
  { code: 'CL', flag: '🇨🇱', name: 'Chile', currency: 'CLP', symbol: '$' },
  { code: 'CN', flag: '🇨🇳', name: 'China', currency: 'CNY', symbol: '¥' },
  { code: 'CO', flag: '🇨🇴', name: 'Colombia', currency: 'COP', symbol: '$' },
  { code: 'KM', flag: '🇰🇲', name: 'Comoros', currency: 'KMF', symbol: 'Fr' },
  { code: 'CG', flag: '🇨🇬', name: 'Congo', currency: 'XAF', symbol: 'Fr' },
  { code: 'CR', flag: '🇨🇷', name: 'Costa Rica', currency: 'CRC', symbol: '₡' },
  { code: 'HR', flag: '🇭🇷', name: 'Croatia', currency: 'EUR', symbol: '€' },
  { code: 'CU', flag: '🇨🇺', name: 'Cuba', currency: 'CUP', symbol: '$' },
  { code: 'CY', flag: '🇨🇾', name: 'Cyprus', currency: 'EUR', symbol: '€' },
  { code: 'CZ', flag: '🇨🇿', name: 'Czech Republic', currency: 'CZK', symbol: 'Kč' },
  { code: 'DK', flag: '🇩🇰', name: 'Denmark', currency: 'DKK', symbol: 'kr' },
  { code: 'DJ', flag: '🇩🇯', name: 'Djibouti', currency: 'DJF', symbol: 'Fr' },
  { code: 'DM', flag: '🇩🇲', name: 'Dominica', currency: 'XCD', symbol: '$' },
  { code: 'DO', flag: '🇩🇴', name: 'Dominican Republic', currency: 'DOP', symbol: 'RD$' },
  { code: 'EC', flag: '🇪🇨', name: 'Ecuador', currency: 'USD', symbol: '$' },
  { code: 'EG', flag: '🇪🇬', name: 'Egypt', currency: 'EGP', symbol: '£' },
  { code: 'SV', flag: '🇸🇻', name: 'El Salvador', currency: 'USD', symbol: '$' },
  { code: 'GQ', flag: '🇬🇶', name: 'Equatorial Guinea', currency: 'XAF', symbol: 'Fr' },
  { code: 'ER', flag: '🇪🇷', name: 'Eritrea', currency: 'ERN', symbol: 'Nfk' },
  { code: 'EE', flag: '🇪🇪', name: 'Estonia', currency: 'EUR', symbol: '€' },
  { code: 'SZ', flag: '🇸🇿', name: 'Eswatini', currency: 'SZL', symbol: 'L' },
  { code: 'ET', flag: '🇪🇹', name: 'Ethiopia', currency: 'ETB', symbol: 'Br' },
  { code: 'FJ', flag: '🇫🇯', name: 'Fiji', currency: 'FJD', symbol: '$' },
  { code: 'FI', flag: '🇫🇮', name: 'Finland', currency: 'EUR', symbol: '€' },
  { code: 'FR', flag: '🇫🇷', name: 'France', currency: 'EUR', symbol: '€' },
  { code: 'GA', flag: '🇬🇦', name: 'Gabon', currency: 'XAF', symbol: 'Fr' },
  { code: 'GM', flag: '🇬🇲', name: 'Gambia', currency: 'GMD', symbol: 'D' },
  { code: 'GE', flag: '🇬🇪', name: 'Georgia', currency: 'GEL', symbol: '₾' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', currency: 'EUR', symbol: '€' },
  { code: 'GH', flag: '🇬🇭', name: 'Ghana', currency: 'GHS', symbol: '₵' },
  { code: 'GR', flag: '🇬🇷', name: 'Greece', currency: 'EUR', symbol: '€' },
  { code: 'GD', flag: '🇬🇩', name: 'Grenada', currency: 'XCD', symbol: '$' },
  { code: 'GT', flag: '🇬🇹', name: 'Guatemala', currency: 'GTQ', symbol: 'Q' },
  { code: 'GN', flag: '🇬🇳', name: 'Guinea', currency: 'GNF', symbol: 'Fr' },
  { code: 'GW', flag: '🇬🇼', name: 'Guinea-Bissau', currency: 'XOF', symbol: 'Fr' },
  { code: 'GY', flag: '🇬🇾', name: 'Guyana', currency: 'GYD', symbol: '$' },
  { code: 'HT', flag: '🇭🇹', name: 'Haiti', currency: 'HTG', symbol: 'G' },
  { code: 'HN', flag: '🇭🇳', name: 'Honduras', currency: 'HNL', symbol: 'L' },
  { code: 'HU', flag: '🇭🇺', name: 'Hungary', currency: 'HUF', symbol: 'Ft' },
  { code: 'IS', flag: '🇮🇸', name: 'Iceland', currency: 'ISK', symbol: 'kr' },
  { code: 'IN', flag: '🇮🇳', name: 'India', currency: 'INR', symbol: '₹' },
  { code: 'ID', flag: '🇮🇩', name: 'Indonesia', currency: 'IDR', symbol: 'Rp' },
  { code: 'IR', flag: '🇮🇷', name: 'Iran', currency: 'IRR', symbol: '﷼' },
  { code: 'IQ', flag: '🇮🇶', name: 'Iraq', currency: 'IQD', symbol: 'ع.د' },
  { code: 'IE', flag: '🇮🇪', name: 'Ireland', currency: 'EUR', symbol: '€' },
  { code: 'IL', flag: '🇮🇱', name: 'Israel', currency: 'ILS', symbol: '₪' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', currency: 'EUR', symbol: '€' },
  { code: 'JM', flag: '🇯🇲', name: 'Jamaica', currency: 'JMD', symbol: '$' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', currency: 'JPY', symbol: '¥' },
  { code: 'JO', flag: '🇯🇴', name: 'Jordan', currency: 'JOD', symbol: 'د.ا' },
  { code: 'KZ', flag: '🇰🇿', name: 'Kazakhstan', currency: 'KZT', symbol: '₸' },
  { code: 'KE', flag: '🇰🇪', name: 'Kenya', currency: 'KES', symbol: 'KSh' },
  { code: 'KI', flag: '🇰🇮', name: 'Kiribati', currency: 'AUD', symbol: 'A$' },
  { code: 'KW', flag: '🇰🇼', name: 'Kuwait', currency: 'KWD', symbol: 'د.ك' },
  { code: 'KG', flag: '🇰🇬', name: 'Kyrgyzstan', currency: 'KGS', symbol: 'с' },
  { code: 'LA', flag: '🇱🇦', name: 'Laos', currency: 'LAK', symbol: '₭' },
  { code: 'LV', flag: '🇱🇻', name: 'Latvia', currency: 'EUR', symbol: '€' },
  { code: 'LB', flag: '🇱🇧', name: 'Lebanon', currency: 'LBP', symbol: 'ل.ل' },
  { code: 'LS', flag: '🇱🇸', name: 'Lesotho', currency: 'LSL', symbol: 'L' },
  { code: 'LR', flag: '🇱🇷', name: 'Liberia', currency: 'LRD', symbol: '$' },
  { code: 'LY', flag: '🇱🇾', name: 'Libya', currency: 'LYD', symbol: 'ل.د' },
  { code: 'LI', flag: '🇱🇮', name: 'Liechtenstein', currency: 'CHF', symbol: 'Fr' },
  { code: 'LT', flag: '🇱🇹', name: 'Lithuania', currency: 'EUR', symbol: '€' },
  { code: 'LU', flag: '🇱🇺', name: 'Luxembourg', currency: 'EUR', symbol: '€' },
  { code: 'MG', flag: '🇲🇬', name: 'Madagascar', currency: 'MGA', symbol: 'Ar' },
  { code: 'MW', flag: '🇲🇼', name: 'Malawi', currency: 'MWK', symbol: 'MK' },
  { code: 'MY', flag: '🇲🇾', name: 'Malaysia', currency: 'MYR', symbol: 'RM' },
  { code: 'MV', flag: '🇲🇻', name: 'Maldives', currency: 'MVR', symbol: 'Rf' },
  { code: 'ML', flag: '🇲🇱', name: 'Mali', currency: 'XOF', symbol: 'Fr' },
  { code: 'MT', flag: '🇲🇹', name: 'Malta', currency: 'EUR', symbol: '€' },
  { code: 'MH', flag: '🇲🇭', name: 'Marshall Islands', currency: 'USD', symbol: '$' },
  { code: 'MR', flag: '🇲🇷', name: 'Mauritania', currency: 'MRU', symbol: 'UM' },
  { code: 'MU', flag: '🇲🇺', name: 'Mauritius', currency: 'MUR', symbol: '₨' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', currency: 'MXN', symbol: '$' },
  { code: 'FM', flag: '🇫🇲', name: 'Micronesia', currency: 'USD', symbol: '$' },
  { code: 'MD', flag: '🇲🇩', name: 'Moldova', currency: 'MDL', symbol: 'L' },
  { code: 'MC', flag: '🇲🇨', name: 'Monaco', currency: 'EUR', symbol: '€' },
  { code: 'MN', flag: '🇲🇳', name: 'Mongolia', currency: 'MNT', symbol: '₮' },
  { code: 'ME', flag: '🇲🇪', name: 'Montenegro', currency: 'EUR', symbol: '€' },
  { code: 'MA', flag: '🇲🇦', name: 'Morocco', currency: 'MAD', symbol: 'د.م.' },
  { code: 'MZ', flag: '🇲🇿', name: 'Mozambique', currency: 'MZN', symbol: 'MT' },
  { code: 'MM', flag: '🇲🇲', name: 'Myanmar', currency: 'MMK', symbol: 'K' },
  { code: 'NA', flag: '🇳🇦', name: 'Namibia', currency: 'NAD', symbol: '$' },
  { code: 'NR', flag: '🇳🇷', name: 'Nauru', currency: 'AUD', symbol: 'A$' },
  { code: 'NP', flag: '🇳🇵', name: 'Nepal', currency: 'NPR', symbol: '₨' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', currency: 'EUR', symbol: '€' },
  { code: 'NZ', flag: '🇳🇿', name: 'New Zealand', currency: 'NZD', symbol: 'NZ$' },
  { code: 'NI', flag: '🇳🇮', name: 'Nicaragua', currency: 'NIO', symbol: 'C$' },
  { code: 'NE', flag: '🇳🇪', name: 'Niger', currency: 'XOF', symbol: 'Fr' },
  { code: 'NG', flag: '🇳🇬', name: 'Nigeria', currency: 'NGN', symbol: '₦' },
  { code: 'NO', flag: '🇳🇴', name: 'Norway', currency: 'NOK', symbol: 'kr' },
  { code: 'OM', flag: '🇴🇲', name: 'Oman', currency: 'OMR', symbol: 'ر.ع.' },
  { code: 'PK', flag: '🇵🇰', name: 'Pakistan', currency: 'PKR', symbol: '₨' },
  { code: 'PW', flag: '🇵🇼', name: 'Palau', currency: 'USD', symbol: '$' },
  { code: 'PA', flag: '🇵🇦', name: 'Panama', currency: 'PAB', symbol: 'B/.' },
  { code: 'PG', flag: '🇵🇬', name: 'Papua New Guinea', currency: 'PGK', symbol: 'K' },
  { code: 'PY', flag: '🇵🇾', name: 'Paraguay', currency: 'PYG', symbol: '₲' },
  { code: 'PE', flag: '🇵🇪', name: 'Peru', currency: 'PEN', symbol: 'S/.' },
  { code: 'PH', flag: '🇵🇭', name: 'Philippines', currency: 'PHP', symbol: '₱' },
  { code: 'PL', flag: '🇵🇱', name: 'Poland', currency: 'PLN', symbol: 'zł' },
  { code: 'PT', flag: '🇵🇹', name: 'Portugal', currency: 'EUR', symbol: '€' },
  { code: 'QA', flag: '🇶🇦', name: 'Qatar', currency: 'QAR', symbol: 'ر.ق' },
  { code: 'RO', flag: '🇷🇴', name: 'Romania', currency: 'RON', symbol: 'lei' },
  { code: 'RU', flag: '🇷🇺', name: 'Russia', currency: 'RUB', symbol: '₽' },
  { code: 'RW', flag: '🇷🇼', name: 'Rwanda', currency: 'RWF', symbol: 'Fr' },
  { code: 'KN', flag: '🇰🇳', name: 'Saint Kitts & Nevis', currency: 'XCD', symbol: '$' },
  { code: 'LC', flag: '🇱🇨', name: 'Saint Lucia', currency: 'XCD', symbol: '$' },
  { code: 'VC', flag: '🇻🇨', name: 'Saint Vincent', currency: 'XCD', symbol: '$' },
  { code: 'WS', flag: '🇼🇸', name: 'Samoa', currency: 'WST', symbol: 'T' },
  { code: 'SM', flag: '🇸🇲', name: 'San Marino', currency: 'EUR', symbol: '€' },
  { code: 'ST', flag: '🇸🇹', name: 'São Tomé & Príncipe', currency: 'STN', symbol: 'Db' },
  { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia', currency: 'SAR', symbol: 'ر.س' },
  { code: 'SN', flag: '🇸🇳', name: 'Senegal', currency: 'XOF', symbol: 'Fr' },
  { code: 'RS', flag: '🇷🇸', name: 'Serbia', currency: 'RSD', symbol: 'din' },
  { code: 'SC', flag: '🇸🇨', name: 'Seychelles', currency: 'SCR', symbol: '₨' },
  { code: 'SL', flag: '🇸🇱', name: 'Sierra Leone', currency: 'SLL', symbol: 'Le' },
  { code: 'SG', flag: '🇸🇬', name: 'Singapore', currency: 'SGD', symbol: 'S$' },
  { code: 'SK', flag: '🇸🇰', name: 'Slovakia', currency: 'EUR', symbol: '€' },
  { code: 'SI', flag: '🇸🇮', name: 'Slovenia', currency: 'EUR', symbol: '€' },
  { code: 'SB', flag: '🇸🇧', name: 'Solomon Islands', currency: 'SBD', symbol: '$' },
  { code: 'SO', flag: '🇸🇴', name: 'Somalia', currency: 'SOS', symbol: 'Sh' },
  { code: 'ZA', flag: '🇿🇦', name: 'South Africa', currency: 'ZAR', symbol: 'R' },
  { code: 'SS', flag: '🇸🇸', name: 'South Sudan', currency: 'SSP', symbol: '£' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', currency: 'EUR', symbol: '€' },
  { code: 'LK', flag: '🇱🇰', name: 'Sri Lanka', currency: 'LKR', symbol: '₨' },
  { code: 'SD', flag: '🇸🇩', name: 'Sudan', currency: 'SDG', symbol: 'ج.س.' },
  { code: 'SR', flag: '🇸🇷', name: 'Suriname', currency: 'SRD', symbol: '$' },
  { code: 'SE', flag: '🇸🇪', name: 'Sweden', currency: 'SEK', symbol: 'kr' },
  { code: 'CH', flag: '🇨🇭', name: 'Switzerland', currency: 'CHF', symbol: 'Fr' },
  { code: 'SY', flag: '🇸🇾', name: 'Syria', currency: 'SYP', symbol: '£' },
  { code: 'TW', flag: '🇹🇼', name: 'Taiwan', currency: 'TWD', symbol: 'NT$' },
  { code: 'TJ', flag: '🇹🇯', name: 'Tajikistan', currency: 'TJS', symbol: 'SM' },
  { code: 'TZ', flag: '🇹🇿', name: 'Tanzania', currency: 'TZS', symbol: 'Sh' },
  { code: 'TH', flag: '🇹🇭', name: 'Thailand', currency: 'THB', symbol: '฿' },
  { code: 'TL', flag: '🇹🇱', name: 'Timor-Leste', currency: 'USD', symbol: '$' },
  { code: 'TG', flag: '🇹🇬', name: 'Togo', currency: 'XOF', symbol: 'Fr' },
  { code: 'TO', flag: '🇹🇴', name: 'Tonga', currency: 'TOP', symbol: 'T$' },
  { code: 'TT', flag: '🇹🇹', name: 'Trinidad & Tobago', currency: 'TTD', symbol: '$' },
  { code: 'TN', flag: '🇹🇳', name: 'Tunisia', currency: 'TND', symbol: 'د.ت' },
  { code: 'TR', flag: '🇹🇷', name: 'Turkey', currency: 'TRY', symbol: '₺' },
  { code: 'TM', flag: '🇹🇲', name: 'Turkmenistan', currency: 'TMT', symbol: 'T' },
  { code: 'TV', flag: '🇹🇻', name: 'Tuvalu', currency: 'AUD', symbol: 'A$' },
  { code: 'UG', flag: '🇺🇬', name: 'Uganda', currency: 'UGX', symbol: 'Sh' },
  { code: 'UA', flag: '🇺🇦', name: 'Ukraine', currency: 'UAH', symbol: '₴' },
  { code: 'AE', flag: '🇦🇪', name: 'United Arab Emirates', currency: 'AED', symbol: 'د.إ' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', currency: 'GBP', symbol: '£' },
  { code: 'US', flag: '🇺🇸', name: 'United States', currency: 'USD', symbol: '$' },
  { code: 'UY', flag: '🇺🇾', name: 'Uruguay', currency: 'UYU', symbol: '$' },
  { code: 'UZ', flag: '🇺🇿', name: 'Uzbekistan', currency: 'UZS', symbol: 'so\'m' },
  { code: 'VU', flag: '🇻🇺', name: 'Vanuatu', currency: 'VUV', symbol: 'Vt' },
  { code: 'VE', flag: '🇻🇪', name: 'Venezuela', currency: 'VES', symbol: 'Bs.S' },
  { code: 'VN', flag: '🇻🇳', name: 'Vietnam', currency: 'VND', symbol: '₫' },
  { code: 'YE', flag: '🇾🇪', name: 'Yemen', currency: 'YER', symbol: '﷼' },
  { code: 'ZM', flag: '🇿🇲', name: 'Zambia', currency: 'ZMW', symbol: 'ZK' },
  { code: 'ZW', flag: '🇿🇼', name: 'Zimbabwe', currency: 'ZWL', symbol: '$' },
];

interface CurrencyPickerProps {
  country: CountryOption;
  onCountryChange: (c: CountryOption) => void;
  onCurrencyOverride: (currency: string, symbol: string) => void;
  currencyOverride?: { currency: string; symbol: string };
}

const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
  country,
  onCountryChange,
  onCurrencyOverride,
  currencyOverride,
}) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'country' | 'currency'>('country');
  const [search, setSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const displayCurrency = currencyOverride?.symbol ?? country.symbol;
  const displayFlag = country.flag;

  // Unique currency list for the currency tab
  const uniqueCurrencies = Array.from(
    new Map(COUNTRIES.map(c => [c.currency, { currency: c.currency, symbol: c.symbol }])).values()
  ).sort((a, b) => a.currency.localeCompare(b.currency));

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.currency.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCurrencies = uniqueCurrencies.filter(c =>
    c.currency.toLowerCase().includes(search.toLowerCase()) ||
    c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      {/* Trigger pill */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1.5"
        aria-label="Change country or currency"
      >
        <span className="text-base leading-none">{displayFlag}</span>
        <span className="text-white text-sm font-semibold">{displayCurrency}</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
          <div
            ref={modalRef}
            className="bg-white rounded-t-2xl w-full max-w-lg"
            style={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100">
              <h3 className="font-bold text-primary-800 text-lg">Country & Currency</h3>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-600">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 px-4 pt-3 pb-2">
              {(['country', 'currency'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSearch(''); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    tab === t
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-100 text-neutral-500'
                  }`}
                >
                  {t === 'country' ? 'Country / Language' : 'Currency'}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-4 pb-2">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={tab === 'country' ? 'Search country...' : 'Search currency...'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {tab === 'country' ? (
                filteredCountries.map(c => (
                  <button
                    key={c.code}
                    onClick={() => { onCountryChange(c); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      c.code === country.code ? 'bg-primary-50 text-primary-700' : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="text-xl">{c.flag}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{c.name}</p>
                      <p className="text-xs text-neutral-400">{c.currency} · {c.symbol}</p>
                    </div>
                    {c.code === country.code && <span className="text-primary-600 text-xs font-bold">✓</span>}
                  </button>
                ))
              ) : (
                filteredCurrencies.map(c => (
                  <button
                    key={c.currency}
                    onClick={() => { onCurrencyOverride(c.currency, c.symbol); setOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      (currencyOverride?.currency ?? country.currency) === c.currency
                        ? 'bg-primary-50 text-primary-700'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <span className="font-bold text-base w-10 text-center flex-shrink-0">{c.symbol}</span>
                    <p className="font-medium text-sm">{c.currency}</p>
                    {(currencyOverride?.currency ?? country.currency) === c.currency && (
                      <span className="ml-auto text-primary-600 text-xs font-bold">✓</span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrencyPicker;
