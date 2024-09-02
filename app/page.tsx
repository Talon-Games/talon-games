import GameNavBar from "@/components/general/gameNavBar";

export default function Home() {
  return (
    <main className='flex flex-col items-center justify-between'>
      <section className='bg-secondary-300 w-full h-96 flex items-center justify-center'>
        <h1 className='font-heading text-8xl text-accent-900 max-sm:text-7xl max-xs:text-6xl'>
          Talon Games
        </h1>
      </section>
      <GameNavBar />
    </main>
  );
}
