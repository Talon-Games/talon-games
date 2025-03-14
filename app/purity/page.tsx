"use client";

import Button from "@/components/general/button";
import { useState } from "react";

export default function Purity() {
  const [states, setStates] = useState<boolean[]>(new Array(100).fill(false));
  const [score, setScore] = useState<number | null>(null);

  const questions: string[] = [
    "Cheated on a test",
    "Copied someone’s homework",
    "Let someone copy your homework",
    "Used ChatGPT (or similar) to help with homework",
    "Turned in an assignment late",
    "Skipped doing homework completely",
    "Pulled an all-nighter to finish an assignment",
    "Faked a reason for an extension",
    "Submitted something you copied from a friend who took the class before you",
    "Wrote an essay without actually reading the book",
    "Used SparkNotes or YouTube instead of reading",
    "Taken a test without studying at all",
    "Purposely bombed a test",
    "Changed an answer after grading and claimed it was correct",
    "Asked for extra credit even though you didn’t need it",
    'Taken a class just because it was "easy"',
    "Used Google to find test answers during an online test",
    "Got away with not doing a project or assignment at all",
    "Written a paper for someone else",
    "Got caught cheating",
    "Fallen asleep in class",
    "Been caught using your phone in class",
    "Talked while the teacher was talking",
    "Passed notes during class (or texted instead)",
    "Walked into class late without a pass",
    "Used a fake excuse to leave class (e.g., “bathroom” but went somewhere else)",
    "Argued with a teacher about a grade",
    "Played games on your school Chromebook/laptop",
    "Watched YouTube or Netflix during class",
    "Had a full conversation with a friend during class",
    "Made a TikTok in class",
    "Laughed so hard in class you got in trouble",
    "Made up a fake excuse to get out of a test",
    "Helped distract the teacher to delay an assignment",
    "Left class without permission",
    "Ate food in class when you weren’t supposed to",
    "Used someone else’s paper as a template for your own",
    "Tried to hide your phone but still got caught",
    "Played a prank on a teacher or classmate",
    "Had a teacher call you out in front of the whole class",
    "Skipped a class without permission",
    "Skipped a school day",
    "Snuck out during a pep rally or assembly",
    "Made a fake hall pass",
    "Roamed the halls instead of going to class",
    "Got caught sneaking food into the library",
    "Got detention for any reason",
    "Got suspended or expelled",
    "Pretended to be sick to get out of school",
    "Went to school but left early for no real reason",
    "Had a friend sign you in when you were late",
    "Showed up to school and immediately wanted to leave",
    "Used a fake doctor’s note or parental excuse",
    "Got kicked out of class",
    "Made fun of a teacher behind their back",
    "Had a secret hiding spot at school",
    "Got written up for dress code violations",
    "Made fun of a teacher to their face",
    "Faked a family emergency to leave school early",
    "Ditched a field trip",
    "Ditched a club meeting or practice without telling anyone",
    "Lied to a teacher about why you didn’t do something",
    "Used a group project to slack off while others worked",
    "Crammed for a test the period before",
    "Studied for another class while in a different class",
    "Told a teacher you loved the class when you didn’t",
    "Pretended to like a subject just to impress someone",
    "Had a crush on a teacher",
    "Faked an injury to get out of gym class",
    "Used your best friend as an excuse for something",
    "Left your backpack or other item in a random place and forgot where they were",
    "Got someone else in trouble to avoid punishment",
    "Lied about your grade on a test to avoid embarrassment",
    "Dressed up for Spirit Week just for the fun of it",
    "Lied to your parents about school-related stuff",
    "Spread or started a rumor at school",
    "Got caught gossiping about a teacher",
    "Got into a fight at school (physical or verbal)",
    "Had your note or message read out loud to the class",
    "Staged a fake argument just to be funny",
    "Used ChatGPT (or similar) to write an essay and got caught",
    "Gave answers to a friend during a test",
    "Used a calculator when you weren’t supposed to",
    "AirDropped or texted someone answers",
    "Created a shared Google Doc for answers",
    "Changed a document’s font size/spacing to hit a page requirement",
    "\“Accidentally\” turned in the wrong file",
    "Used a website blocker to trick a teacher into thinking a site was down",
    'Left a Google Meet or Zoom call and blamed it on "WiFi issues"',
    "Put a fake name on a school Kahoot or Quizizz game",
    "Made a fake email to sign up for something school-related",
    "Used a YouTube video to fake a computer crash",
    "Played music or sounds out loud in class as a joke",
    "Submitted a blank file or corrupted document to buy time",
    "Spammed the class group chat with memes instead of studying",
    "Used a fake email to prank a teacher",
    "Watched a full movie in class instead of paying attention",
    "Got caught taking a picture of the whiteboard instead of writing notes",
    "Accidentally sent the wrong message to a teacher or class group",
    "Got blocked by a teacher or school administrator on social media",
  ];

  const toggleState = (index: number) => {
    const updatedStates = [...states];
    updatedStates[index] = !updatedStates[index];
    setStates(updatedStates);
  };

  const calculateScore = () => {
    const checkedCount = states.filter((checked) => checked).length;
    const finalScore = 100 - checkedCount;
    setScore(finalScore);
  };

  const getScoreLabel = () => {
    if (score === null) return "";
    if (score >= 90) return "Model student 🍎 (You’re what teachers dream of)";
    if (score >= 70)
      return "Mostly good, but a little sneaky 📖 (You bend the rules just enough)";
    if (score >= 50)
      return "Classic high schooler 🏫 (A mix of good and bad decisions)";
    if (score >= 30)
      return "Risk-taker, but still surviving 🚨 (Teachers definitely know your name)";
    return "Absolute menace 🚔 (You probably have your own chair in detention)";
  };

  const clear = () => {
    setStates(new Array(100).fill(false));
    setScore(null);
  };

  return (
    <main className="w-9/12 ml-auto mr-auto max-lg:w-10/12 max-sm:w-11/12 flex flex-col items-center">
      <h1 className="font-heading text-center mb-4 text-8xl max-sm:text-7xl max-xs:text-6xl">
        School Purity Test
      </h1>
      <p className="text-center font-bold">
        Caution: This is not a bucket list. Completion of all items on this test
        will likely result in death.
      </p>

      <section className="w-1/2 max-lg:w-3/4 max-sm:w-full max-sm:gap-0 flex flex-col gap-2 mt-2">
        {questions.map((question: string, i: number) => (
          <div key={i} className="flex gap-2 items-center">
            <div
              className={`w-7 h-7 min-w-[28px] max-sm:w-6 max-sm:h-6 max-sm:min-w-[24px] 
      max-xs:w-5 max-xs:h-5 max-xs:min-w-[20px]
      ${states[i] ? "bg-secondary-400 hover:bg-secondary-500" : "hover:bg-secondary-200"}
      block rounded border-secondary-600 border cursor-pointer transition-all flex-shrink-0`}
              onClick={() => toggleState(i)}
            ></div>

            <p className="text-base max-md:text-lg max-sm:text-sm">
              {`${i + 1}. ${question}?`}
            </p>
          </div>
        ))}
      </section>

      <div className="flex gap-2 w-1/2 max-md:w-3/4 max-sm:w-full mt-2">
        <Button
          title="Calculate My Score!"
          style="normal"
          onClickAction={calculateScore}
        />
        <Button title="Clear Checkboxes" style="normal" onClickAction={clear} />
      </div>

      {score !== null && (
        <div className="mt-4 text-center font-heading">
          <p className="text-4xl max-sm:text-3xl max-xs:text-2xl font-bold">
            {score}/100
          </p>
          <p className="text-xl max-sm:text-lg">{getScoreLabel()}</p>
        </div>
      )}
    </main>
  );
}
