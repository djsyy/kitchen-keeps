type InputProps = React.ComponentProps<'input'>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <div>
      <input
        className={`rounded-md border-2 border-text px-2 py-1 ${className ?? ''}`}
        {...props}
      />
    </div>
  );
}
