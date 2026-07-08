type LabelProps = React.ComponentProps<'label'>;

export default function Label({ children, className, ...props }: LabelProps) {
  return (
    <label className={`text-lg ${className ?? ''}`} {...props}>
      {children}
    </label>
  );
}
