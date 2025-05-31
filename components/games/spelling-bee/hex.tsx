export default function Hex({
  letter,
  center = false,
}: {
  letter?: string;
  center?: boolean;
}) {
  return (
    <svg viewBox="0 0 120 104" className="h-[74px] w-[74px]">
      <polygon
        points="0,52 30,0 90,0 120,52 90,104 30,104"
        className={`${
          center
            ? "fill-secondary-400 hover:fill-secondary-500"
            : "fill-gray-200 hover:fill-gray-300"
        } transition-all duration-200 ease-in-out`}
      />
      <text
        x="50%"
        y="50%"
        dy="10.75%"
        textAnchor="middle"
        className="text-black text-[32px] font-bold font-sans select-none"
      >
        {letter?.toUpperCase()}
      </text>
    </svg>
  );
}
