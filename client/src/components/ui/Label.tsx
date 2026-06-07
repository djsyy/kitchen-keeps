type LabelProps = React.ComponentProps<'label'>;

export default function Label({ children, className, ...props }: LabelProps) {
  return (
    <div className="">
      <label className={`tx-lg ${className ?? ''}`} {...props}>
        {children}
      </label>
    </div>
  );
}
