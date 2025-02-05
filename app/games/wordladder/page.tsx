export default function WordLadder() {
  return (
    <section className="flex flex-col align-center w-1/2 p-5 mx-auto gap-1">
      <div className="flex justify-between align-center gap-5 p-3">
        <p className="flex-1 text-center">stars</p>
        <p className="flex-1">to shine as an actor or singer</p>
      </div>
      <div className="flex justify-between align-center gap-1">
        <input
          type="text"
          className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 rounded text-center"
        />{" "}
        <p className="flex-1 p-3">to fly at a great height</p>
      </div>
      <div className="flex justify-between align-center gap-1">
        <input
          type="text"
          className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 rounded text-center"
        />{" "}
        <p className="flex-1 p-3">to fly at a great height</p>
      </div>
      <div className="flex justify-between align-center gap-1">
        <input
          type="text"
          className="border-b border-b-black focus:outline-none flex-1 bg-secondary-300 pl-1 pt-5 rounded text-center"
        />{" "}
        <p className="flex-1 p-3">to fly at a great height</p>
      </div>
      <div className="flex justify-between align-center gap-5 p-3">
        <p className="flex-1 text-center">locks</p>
        <p className="flex-1">to secure with a fastening device</p>
      </div>
    </section>
  );
}
