type Props = {
  leftTitle: string;
  rightTitle: string;
  disabled?: boolean;
  rightDisabled?: boolean;
  leftDisabled?: boolean;
  onClickLeft: (event: any) => void;
  onClickRight: (event: any) => void;
  containerClassModifier?: string;
  leftClassModifier?: string;
  rightClassModifier?: string;
};

export default function ConnectedButton({
  leftTitle,
  rightTitle,
  disabled,
  rightDisabled,
  leftDisabled,
  onClickLeft,
  onClickRight,
  containerClassModifier,
  leftClassModifier,
  rightClassModifier,
}: Props) {
  return (
    <div
      className={`flex ${containerClassModifier ? containerClassModifier : ""}`}
    >
      <button
        type="button"
        className={`w-full p-2 rounded-tl rounded-bl transition-all duration-200 ease-in-out bg-secondary-400 hover:bg-secondary-500 ${
          leftClassModifier ? leftClassModifier : ""
        } ${
          disabled || leftDisabled
            ? "cursor-not-allowed bg-gray-500 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-500"
            : "cursor-pointer active:tracking-widest"
        }`}
        onClick={(e) => {
          if (!disabled && !leftDisabled) {
            onClickLeft(e);
          }
        }}
      >
        {leftTitle}
      </button>
      <button
        type="button"
        className={`w-full p-2 rounded-tr rounded-br transition-all duration-200 ease-in-out bg-secondary-400 hover:bg-secondary-500 ${
          rightClassModifier ? rightClassModifier : ""
        } ${
          disabled || rightDisabled
            ? "cursor-not-allowed bg-gray-500 hover:bg-gray-500 dark:bg-gray-500 dark:hover:bg-gray-500"
            : "cursor-pointer active:tracking-widest"
        }`}
        onClick={(e) => {
          if (!disabled && !rightDisabled) {
            onClickRight(e);
          }
        }}
      >
        {rightTitle}
      </button>
    </div>
  );
}
