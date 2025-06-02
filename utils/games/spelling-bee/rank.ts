import { CutOffs } from "@/app/games/spelling-bee/page";

export enum Rank {
  Beginner,
  GoodStart,
  MovingUp,
  Good,
  Solid,
  Nice,
  Great,
  Amazing,
  Genius,
}

export function getRankFromCutoff(points: number, cutOffs: CutOffs): Rank {
  if (points >= cutOffs.genius) return Rank.Genius;
  if (points >= cutOffs.amazing) return Rank.Amazing;
  if (points >= cutOffs.great) return Rank.Great;
  if (points >= cutOffs.nice) return Rank.Nice;
  if (points >= cutOffs.solid) return Rank.Solid;
  if (points >= cutOffs.good) return Rank.Good;
  if (points >= cutOffs.movingUp) return Rank.MovingUp;
  if (points >= cutOffs.goodStart) return Rank.GoodStart;
  return Rank.Beginner;
}

export function rankToString(rank: Rank): string {
  switch (rank) {
    case Rank.Beginner:
      return "Beginner";
    case Rank.GoodStart:
      return "Good Start";
    case Rank.MovingUp:
      return "Moving Up";
    case Rank.Good:
      return "Good";
    case Rank.Solid:
      return "Solid";
    case Rank.Nice:
      return "Nice";
    case Rank.Great:
      return "Great";
    case Rank.Amazing:
      return "Amazing";
    case Rank.Genius:
      return "Genius";
    default:
      return "Unknown";
  }
}
