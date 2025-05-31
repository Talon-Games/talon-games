import Hex from "@/components/games/spelling-bee/hex";

export default function Hive({
  center,
  outer,
  hexPressed,
}: {
  center: string;
  outer: string[];
  hexPressed: (string: string) => void;
}) {
  return (
    <div className="inline-block scale-[1.5] origin-top relative w-[300px] h-[300px]">
      {/* Top */}
      <div
        className="absolute top-[45px] left-1/2 -translate-x-1/2 cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[0])}
      >
        <Hex letter={outer[0]} />
      </div>

      {/* Upper Left */}
      <div
        className="absolute top-[79px] left-[54px] cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[1])}
      >
        <Hex letter={outer[1]} />
      </div>

      {/* Upper Right */}
      <div
        className="absolute top-[79px] right-[54px] cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[2])}
      >
        <Hex letter={outer[2]} />
      </div>

      {/* Center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer active:scale-95"
        onClick={() => hexPressed(center)}
      >
        <Hex letter={center} center />
      </div>

      {/* Lower Left */}
      <div
        className="absolute bottom-[79px] left-[54px] cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[3])}
      >
        <Hex letter={outer[3]} />
      </div>

      {/* Lower Right */}
      <div
        className="absolute bottom-[79px] right-[54px] cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[4])}
      >
        <Hex letter={outer[4]} />
      </div>

      {/* Bottom */}
      <div
        className="absolute bottom-[45px] left-1/2 -translate-x-1/2 cursor-pointer active:scale-95"
        onClick={() => hexPressed(outer[5])}
      >
        <Hex letter={outer[5]} />
      </div>
    </div>
  );
}
