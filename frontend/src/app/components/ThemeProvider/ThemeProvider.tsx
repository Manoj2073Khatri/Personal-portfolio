'use client';

import { ThemeProvider } from 'next-themes';
import {ReactNode, useEffect, useState} from 'react';

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
        </ThemeProvider>
    );
}
