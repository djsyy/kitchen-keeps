type LabelProps = React.ComponentProps<'label'>;

export default function Label({ children, className, ...props }: LabelProps) {
  return (
    <label
      className={`text-text-800 text-sm font-bold ${className ?? ''}`}
      {...props}
    >
      {children}
    </label>
  );
}
