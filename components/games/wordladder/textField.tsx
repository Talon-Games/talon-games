"use client";

type Props = {
  value?: string;
  placeholder: string;
  onChangeAction: (event: any) => void;
  classModifier?: string;
};

export default function WordLadderTextField({
  value,
  placeholder,
  onChangeAction,
  classModifier,
}: Props) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChangeAction(e)}
      className={`border-b border-b-black focus:outline-none flex-1 bg-secondary-200 rounded text-center p-3 placeholder-accent-700 max-sm:p-2 ${
        classModifier ? classModifier : ""
      }`}
    />
  );
}
