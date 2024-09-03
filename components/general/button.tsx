type Props = {
  title: string;
  disabled?: boolean;
  active?: boolean;
  onClick: (event: any) => void;
  style: "normal" | "green" | "red";
  classModifier?: string;
};

export default function Button({
  title,
  disabled,
  active,
  onClick,
  style,
  classModifier,
}: Props) {
  const getStyle = (style: "normal" | "green" | "red") => {
    switch (style) {
      case "normal":
        return "bg-secondary-400 hover:bg-secondary-500";
      case "green":
        return "bg-green-500 hover:bg-green-600";
      case "red":
        return "bg-red-500 hover:bg-red-600";
    }
  };

  const getActiveStyle = (style: "normal" | "green" | "red") => {
    switch (style) {
      case "normal":
        return "!bg-secondary-500";
      case "green":
        return "!bg-green-600";
      case "red":
        return "!bg-red-600";
    }
  };

  return (
    <button
      type="button"
      className={`w-full p-2 rounded transition-all duration-200 ease-in-out ${
        disabled
          ? "cursor-default bg-gray-500 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-500"
          : "cursor-pointer active:tracking-widest"
      } ${getStyle(style)} ${active ? getActiveStyle(style) : ""} ${
        classModifier ? classModifier : ""
      }`}
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
