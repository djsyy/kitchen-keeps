type InputProps = React.ComponentProps<'input'>;

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={`w-full rounded-md border border-background-300 bg-background-50 px-3 py-2 text-base text-text-900 outline-none transition placeholder:text-text-400 focus:border-primary focus:ring-2 focus:ring-primary-100 ${className ?? ''}`}
      {...props}
    />
  );
}
