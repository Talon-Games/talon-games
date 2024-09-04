import GameNavBar from "@/components/general/gameNavBar";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between">
      <section className="bg-secondary-300 p-60 w-full flex items-center justify-center">
        <h1 className="font-heading text-9xl text-accent-900 max-sm:text-7xl max-xs:text-6xl">
          Talon Games
        </h1>
      </section>
      <GameNavBar />
    </main>
  );
}
