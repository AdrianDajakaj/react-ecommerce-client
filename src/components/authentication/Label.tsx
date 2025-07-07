import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * Label component for form elements, styled with Tailwind CSS.
 * This component should be used with htmlFor prop to associate with form controls.
 *
 * @param {React.LabelHTMLAttributes<HTMLLabelElement>} props - The props for the label component.
 * @returns {JSX.Element} The rendered label element.
 */
interface LabelProps extends Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  readonly htmlFor: string; // Make htmlFor required
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, htmlFor, ...props }, ref) => (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={cn(
        'text-sm font-medium text-black dark:text-white leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  )
);
Label.displayName = 'Label';

export { Label };
