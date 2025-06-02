import { CutOffs } from "@/app/games/spelling-bee/page";

export default function calculateCutOffs(totalPoints: number): CutOffs {
  return {
    beginner: 0,
    goodStart: Math.ceil(totalPoints * 0.02),
    movingUp: Math.ceil(totalPoints * 0.05),
    good: Math.ceil(totalPoints * 0.08),
    solid: Math.ceil(totalPoints * 0.15),
    nice: Math.ceil(totalPoints * 0.25),
    great: Math.ceil(totalPoints * 0.4),
    amazing: Math.ceil(totalPoints * 0.5),
    genius: Math.ceil(totalPoints * 0.7),
  };
}
