import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="56" height="56" rx="18" fill="#111111" />
            <rect x="12" y="12" width="18" height="18" rx="7" fill="#FFD84D" />
            <rect x="34" y="12" width="18" height="18" rx="7" fill="#2563EB" />
            <rect x="12" y="34" width="18" height="18" rx="7" fill="#EF4444" />
            <path
                d="M37 36h9c3.866 0 7 3.134 7 7v9H37V36Z"
                fill="white"
            />
            <path
                d="M42 21h2.8c3.424 0 6.2 2.776 6.2 6.2V30H37v-2.8C37 23.776 39.776 21 43.2 21H42Z"
                fill="white"
                opacity="0.95"
            />
        </svg>
    );
}
