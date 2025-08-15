import React from 'react';

const SudokuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm0 8h6v6H3v-6zm8-16h6v6h-6V3zm0 8h6v6h-6v-6zm0 8h6v6h-6v-6zm8-16h6v6h-6V3zm0 8h6v6h-6v-6zm0 8h6v6h-6v-6z" opacity="0.4"/>
        <path d="M4 4h4v4H4V4zm8 0h4v4h-4V4zm8 0h4v4h-4V4zM4 12h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4zM4 20h4v4H4v-4zm8 0h4v4h-4v-4zm8 0h4v4h-4v-4z" />
    </svg>
);

export default SudokuIcon;
