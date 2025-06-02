import {
  Rank,
  rankToString,
  getRankFromCutoff,
} from "@/utils/games/spelling-bee/rank";
import { CutOffs } from "@/app/games/spelling-bee/page";

function Row({
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
      className={`flex flex-col p-2 rounded-lg ${rank == currentRank ? "bg-secondary-400" : null} ${points > min && rank != currentRank ? "text-gray-400" : ""}`}
    >
      <div className="flex gap-2 w-full">
        <p className={`${rank == currentRank ? "font-semibold" : "hidden"}`}>
          {points}
        </p>
        <div className="flex justify-between w-full">
          <p className={`${rank == currentRank ? "font-semibold" : null}`}>
            {rankToString(rank)}
          </p>
          <p>{min}</p>
        </div>
      </div>
    </div>
  );
}

export default function RankingModal({
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
      className="fixed flex flex-col items-center justify-center left-0 top-0 w-full h-full bg-accent-900 bg-opacity-50 z-20"
      onClick={toggleModal}
    >
      <div
        className="p-10 bg-background-50 rounded-xl w-7/12 flex flex-col max-lg:w-5/6 max-sm:w-11/12"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="font-semibold text-xl px-32">Rankings</h2>
        <section className="py-5 px-32">
          <div className="flex justify-between text-sm pb-2">
            <p>Rank</p>
            <p>Minimum Score</p>
          </div>
          {/*I can not be bothered to actually reverse the order*/}
          <div className="flex flex-col-reverse">
            <Row
              rank={Rank.Beginner}
              currentRank={rank}
              points={points}
              min={cutOffs.beginner}
            />
            <Row
              rank={Rank.GoodStart}
              currentRank={rank}
              points={points}
              min={cutOffs.goodStart}
            />
            <Row
              rank={Rank.MovingUp}
              currentRank={rank}
              points={points}
              min={cutOffs.movingUp}
            />
            <Row
              rank={Rank.Good}
              currentRank={rank}
              points={points}
              min={cutOffs.good}
            />
            <Row
              rank={Rank.Solid}
              currentRank={rank}
              points={points}
              min={cutOffs.solid}
            />
            <Row
              rank={Rank.Nice}
              currentRank={rank}
              points={points}
              min={cutOffs.nice}
            />
            <Row
              rank={Rank.Great}
              currentRank={rank}
              points={points}
              min={cutOffs.great}
            />
            <Row
              rank={Rank.Amazing}
              currentRank={rank}
              points={points}
              min={cutOffs.amazing}
            />
            <Row
              rank={Rank.Genius}
              currentRank={rank}
              points={points}
              min={cutOffs.genius}
            />
          </div>
        </section>
      </div>
    </section>
  );
}
