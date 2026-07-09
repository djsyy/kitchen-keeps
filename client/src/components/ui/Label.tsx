type LabelProps = React.ComponentProps<'label'>;

export default function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`text-sm font-bold text-text-800 ${className ?? ''}`}
      {...props}
    >
      {children}
    </label>
  );
}
