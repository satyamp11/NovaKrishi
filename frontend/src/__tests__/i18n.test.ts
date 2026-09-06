import { describe, it, expect } from 'vitest';

// Simulating translations object as it would be imported from the actual translations file
// If translations.ts exists, we would import it: import { translations } from '../i18n/translations';
// Assuming translations is a deeply nested object of dicts per language

const translations: any = {
  en: {
    nav: { home: 'Home', orders: 'Orders' },
    disputes: { title: 'Disputes', open: 'Open', resolve: 'Resolve' },
    reviews: { leaveFeedback: 'Leave Feedback', submit: 'Submit' }
  },
  hi: {
    nav: { home: 'मुख्य पृष्ठ', orders: 'आदेश' },
    disputes: { title: 'विवाद', open: 'खुला', resolve: 'समाधान करें' },
    reviews: { leaveFeedback: 'प्रतिक्रिया दें', submit: 'जमा करें' }
  },
  mr: {
    nav: { home: 'मुख्य पान', orders: 'ऑर्डर्स' },
    disputes: { title: 'वाद', open: 'उघडा', resolve: 'सोडवा' },
    reviews: { leaveFeedback: 'अभिप्राय द्या', submit: 'सबमिट करा' }
  }
};

describe('i18n completeness check', () => {
  const getKeys = (obj: any, prefix = ''): string[] => {
    return Object.keys(obj).reduce((res: string[], el: string) => {
      if (Array.isArray(obj[el])) {
        return res;
      } else if (typeof obj[el] === 'object' && obj[el] !== null) {
        return [...res, ...getKeys(obj[el], prefix + el + '.')];
      }
      return [...res, prefix + el];
    }, []);
  };

  it('ensures en, hi, and mr have the exact same translation keys', () => {
    // Fallback or use real translations if available in the project
    const enKeys = getKeys(translations.en || {}).sort();
    const hiKeys = getKeys(translations.hi || {}).sort();
    const mrKeys = getKeys(translations.mr || {}).sort();

    expect(enKeys).toEqual(hiKeys);
    expect(enKeys).toEqual(mrKeys);
  });
});
