import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Label component for form elements, styled with Tailwind CSS.
 * This component should be used with htmlFor prop to associate with form controls.
 *
 * @param {React.LabelHTMLAttributes<HTMLLabelElement>} props - The props for the label component.
 * @returns {JSX.Element} The rendered label element.
 */
const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
      className
    )}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
