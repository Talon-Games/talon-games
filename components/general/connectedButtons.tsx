import Button from "./button";

type Props = {
  leftTitle: string;
  rightTitle: string;
  leftStyle: "normal" | "red" | "green";
  rightStyle: "normal" | "red" | "green";
  leftActive?: boolean;
  rightActive?: boolean;
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
  leftStyle,
  rightStyle,
  leftActive,
  rightActive,
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
      <Button
        onClick={onClickLeft}
        title={leftTitle}
        style={leftStyle}
        active={leftActive}
        disabled={leftDisabled}
        classModifier={`${leftClassModifier} rounded-tr-none rounded-br-none`}
      />
      <Button
        onClick={onClickRight}
        title={rightTitle}
        style={rightStyle}
        active={rightActive}
        disabled={rightDisabled}
        classModifier={`${rightClassModifier} rounded-tl-none rounded-bl-none`}
      />
    </div>
  );
}
