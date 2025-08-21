import {
  Rank,
  rankToString,
  getRankFromCutoff,
} from "@/utils/games/spelling-bee/rank";
import { CutOffs } from "@/app/games/spelling-bee/page";

function Mark({
  rank,
  currentRank,
  points,
  min,
}: {
  rank: Rank;
  currentRank: Rank;
  points: number;
  min: number;
}) {
  return (
    <div
      className={`block ${points < min ? "bg-gray-200" : "bg-secondary-400"} ${currentRank == rank ? "h-8 w-8" : "h-2 w-2"} rounded-full flex items-center justify-center text-sm`}
    >
      {currentRank == rank ? points : ""}
    </div>
  );
}

export default function RankingBar({
  cutOffs,
  points,
  toggleModal,
}: {
  cutOffs: CutOffs;
  points: number;
  toggleModal: () => void;
}) {
  const rank = getRankFromCutoff(points, cutOffs);
  return (
    <section
      className="flex justify-between gap-1 cursor-pointer max-lg:flex-col"
      onClick={toggleModal}
    >
      <p className="font-semibold text-lg w-1/4">{rankToString(rank)}</p>
      <div className="flex-1 flex items-center justify-between select-none relative">
        <Mark
          rank={Rank.Beginner}
          currentRank={rank}
          points={points}
          min={cutOffs.beginner}
        />
        <Mark
          rank={Rank.GoodStart}
          currentRank={rank}
          points={points}
          min={cutOffs.goodStart}
        />
        <Mark
          rank={Rank.MovingUp}
          currentRank={rank}
          points={points}
          min={cutOffs.movingUp}
        />
        <Mark
          rank={Rank.Good}
          currentRank={rank}
          points={points}
          min={cutOffs.good}
        />
        <Mark
          rank={Rank.Solid}
          currentRank={rank}
          points={points}
          min={cutOffs.solid}
        />
        <Mark
          rank={Rank.Nice}
          currentRank={rank}
          points={points}
          min={cutOffs.nice}
        />
        <Mark
          rank={Rank.Great}
          currentRank={rank}
          points={points}
          min={cutOffs.great}
        />
        <Mark
          rank={Rank.Amazing}
          currentRank={rank}
          points={points}
          min={cutOffs.amazing}
        />
        <Mark
          rank={Rank.Genius}
          currentRank={rank}
          points={points}
          min={cutOffs.genius}
        />
        <div className="absolute w-full h-0.5 bg-gray-200 -z-10"></div>
      </div>
    </section>
  );
}
