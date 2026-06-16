'use client';

import React from 'react';

// ==========================================
// BUTTON
// ==========================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
    secondary: 'bg-secondary text-white hover:bg-amber-700 shadow-sm',
    outline: 'border border-stone-300 text-stone-700 hover:bg-stone-50 bg-white',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    ghost: 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// ==========================================
// CARD
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-xl border border-stone-200/80 shadow-sm overflow-hidden ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-6 border-b border-stone-100 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ children, className = '', ...props }) => (
  <h3 className={`text-lg font-semibold text-stone-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ children, className = '', ...props }) => (
  <p className={`text-sm text-stone-500 mt-1 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`px-6 py-4 bg-stone-50/50 border-t border-stone-100 flex items-center justify-end gap-3 ${className}`} {...props}>
    {children}
  </div>
);

// ==========================================
// INPUT, LABEL & TEXTAREA
// ==========================================
export const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ children, className = '', ...props }) => (
  <label className={`block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 ${className}`} {...props}>
    {children}
  </label>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className = '', ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${className}`}
    {...props}
  />
));
Input.displayName = 'Input';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(({ className = '', ...props }, ref) => (
  <textarea
    ref={ref}
    rows={3}
    className={`w-full text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-stone-900 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none ${className}`}
    {...props}
  />
));
TextArea.displayName = 'TextArea';

// ==========================================
// SELECT
// ==========================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className = '', options, label, ...props }, ref) => (
  <div className="w-full">
    {label && <Label>{label}</Label>}
    <select
      ref={ref}
      className={`w-full text-sm bg-stone-50/50 border border-stone-200 rounded-lg px-3.5 py-2.5 text-stone-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23555555%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.65rem_auto] bg-[right_1rem_center] bg-no-repeat ${className}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
));
Select.displayName = 'Select';

// ==========================================
// BADGE
// ==========================================
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const styles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-rose-50 text-rose-700 border-rose-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// TABLE
// ==========================================
export const TableContainer: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto border border-stone-200 rounded-xl bg-white ${className}`}>
    {children}
  </div>
);

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className = '', ...props }) => (
  <table className={`w-full text-left border-collapse ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '' }) => (
  <thead className={`bg-stone-50 border-b border-stone-200 ${className}`}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-stone-100 text-stone-700 ${className}`}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-stone-50/50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th className={`px-6 py-3.5 text-xs font-bold text-stone-500 uppercase tracking-wider ${className}`} {...props}>
    {children}
  </th>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`px-6 py-4 text-sm ${className}`} {...props}>
    {children}
  </td>
);

// ==========================================
// TABS
// ==========================================
interface TabsProps {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
}

export const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange }) => {
  return (
    <div className="w-full">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { activeValue: value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; activeValue?: string; onValueChange?: (val: string) => void }> = ({
  children,
  activeValue,
  onValueChange,
}) => (
  <div className="flex border-b border-stone-200 gap-4 mb-6">
    {React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { activeValue, onValueChange });
      }
      return child;
    })}
  </div>
);

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  activeValue?: string;
  onValueChange?: (val: string) => void;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, activeValue, onValueChange }) => {
  const active = activeValue === value;
  return (
    <button
      onClick={() => onValueChange?.(value)}
      className={`pb-3 text-sm font-semibold border-b-2 transition-all px-1 focus:outline-none ${
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-stone-500 hover:text-stone-800'
      }`}
    >
      {children}
    </button>
  );
};

export const TabsContent: React.FC<{ value: string; children: React.ReactNode; activeValue?: string }> = ({
  value,
  children,
  activeValue,
}) => {
  if (activeValue !== value) return null;
  return <div className="animate-fadeIn">{children}</div>;
};

// ==========================================
// DIALOG (MODAL)
// ==========================================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-scaleIn">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 focus:outline-none p-1.5 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};
