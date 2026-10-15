import type { SVGProps } from 'react';

export function ArrowIcon({
  direction = 'up-right', className = '', ...props
}: SVGProps<SVGSVGElement> & { direction?: 'up-right' | 'right' | 'left' | 'down' }) {
  const rotation = { 'up-right': 0, right: 45, down: 135, left: 225 }[direction];
  return <svg {...props} className={`arrow-icon ${className}`} viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden="true" focusable="false">
    <g transform={`rotate(${rotation} 12 12)`}><path d="M7 17 17 7M7 7h10v10" /></g>
  </svg>;
}
