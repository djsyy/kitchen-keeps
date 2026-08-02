type InputProps = React.ComponentProps<'input'>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`border-background-300 bg-background-50 text-text-900 placeholder:text-text-400 focus:border-primary focus:ring-primary-100 w-full rounded-md border px-3 py-2 text-base transition outline-none focus:ring-2 ${className ?? ''}`}
      {...props}
    />
  );
}
