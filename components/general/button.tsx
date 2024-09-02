type Props = {
  title: string;
  disabled?: boolean;
  onClick: (event: any) => void;
  classModifier?: string;
};

export default function Button({
  title,
  disabled,
  onClick,
  classModifier,
}: Props) {
  return (
    <button
      type="button"
      className={`w-full p-2 rounded transition-all duration-200 ease-in-out ${
        disabled
          ? "cursor-default bg-gray-500 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-500"
          : "cursor-pointer active:tracking-widest"
      } ${classModifier ? classModifier : ""}`}
      onClick={(e) => {
        if (!disabled) {
          onClick(e);
        }
      }}
    >
      {title}
    </button>
  );
}
