import GameNavBar from "@/components/general/gameNavBar";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between py-2">
      <h1 className="font-heading text-8xl text-accent-800 max-sm:text-7xl max-xs:text-6xl">
        Talon Games
      </h1>
      <GameNavBar />
    </main>
  );
}
