import React from 'react';

const BlackRookIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" {...props}>
        <g fill="#000" stroke="#FFF" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5" strokeLinecap="butt"/>
            <path d="M34 14l-3 3H14l-3-3"/>
            <path d="M31 17v12.5H14V17"/>
            <path d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
            <path d="M14 17h17" fill="none" stroke="#FFF"/>
        </g>
    </svg>
);

export default BlackRookIcon;