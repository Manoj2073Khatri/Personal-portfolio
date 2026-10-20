'use client';

import { ThemeProvider } from 'next-themes';
import {ReactNode, useSyncExternalStore} from 'react';

const subscribe = () => () => {};

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    const mounted = useSyncExternalStore(subscribe, () => true, () => false);

    if (!mounted) return null;

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}
