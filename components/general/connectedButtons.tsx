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
  leftGaEvent?: string;
  rightGaEvent?: string;
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
  leftGaEvent,
  rightGaEvent,
}: Props) {
  return (
    <div
      className={`flex ${containerClassModifier ? containerClassModifier : ""}`}
    >
      <Button
        onClickAction={onClickLeft}
        title={leftTitle}
        style={leftStyle}
        active={leftActive}
        disabled={leftDisabled}
        classModifier={`${leftClassModifier} rounded-tr-none rounded-br-none`}
        gaEvent={leftGaEvent}
      />
      <Button
        onClickAction={onClickRight}
        title={rightTitle}
        style={rightStyle}
        active={rightActive}
        disabled={rightDisabled}
        classModifier={`${rightClassModifier} rounded-tl-none rounded-bl-none`}
        gaEvent={rightGaEvent}
      />
    </div>
  );
}
