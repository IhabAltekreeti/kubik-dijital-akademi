import { type HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'bg-white rounded-2xl border border-navy-100 shadow-card',
          hover ? 'transition-all duration-200 hover:shadow-card-hover hover:border-navy-200' : '',
          paddingStyles[padding],
          className ?? '',
        ].join(' ')}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
export default Card;
