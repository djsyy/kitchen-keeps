type InputProps = React.ComponentProps<'input'>;

export default function Input({
  id: elementId,
  ref,
  value,
  placeholder,
  onChange,
}: InputProps) {
  return (
    <div className="">
      <input
        className="rounded-md border-black border-2"
        id={elementId}
        type="text"
        ref={ref}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      ></input>
    </div>
  );
}
