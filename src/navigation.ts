import {createSharedPathnamesNavigation} from 'next-intl/navigation';


export const locales = ['en', 'fr', 'uk'] as const;
export type Locale = 'en' | 'fr' | 'uk';

export const {Link, redirect, usePathname, useRouter} =
  createSharedPathnamesNavigation({locales});
