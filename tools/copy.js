/* The words for each place, shared by the street (build-town.js) and the
   phone layout (build-mobile.js), so both tell the same story. */
const STORY = {
  rjax: "Taught a competition robot to aim by itself. I wrote the camera code that spotted targets mid match, so it lined up its shots without the driver's help.",
  shiva: "Helped more families find robotics classes: search visits grew 20% in one summer after I reworked the academy's site around what parents were actually searching for.",
  rfa: "Saved volunteers hours every week. My scripts filed each family's sign up details and sent their confirmation emails automatically, so nobody had to copy them by hand.",
  fics: "Found weak spots in AI chatbots before bad actors could. I built tools that automatically tried to trick ChatGPT into misbehaving, and helped work out how to block those tricks.",
  toyota: "Caught bad tire packages before they became recalls: 20% fewer tire warranty claims and over $150k saved. I tracked tire readings from Hunter balancers (sent through HunterNet) across 51,000 vehicles and flagged any package over the limit. I also automated work that saved about 350 hours a year.",
  jm: "Made it easy to spot employees with access they shouldn't have, using an automated check across Microsoft Graph, Salesforce and MuleSoft. I also analyzed 100k+ events from JM Lexus and Toyota dealerships and helped set up GPT agents that answer questions about them.",
  hunter: "Made it possible to reset Hunter's alignment machines remotely instead of sending a technician, across 100,000+ machines worldwide. I designed and built the secure reset myself, and fixed crashes during machine setup.",
  adt: "Designed an AI check that catches false alarms before emergency responders are sent, and pitched it to senior leadership. I also kept ADT's Salesforce platform under its limits and got releases shipping again."
};

const ABOUT = {
  rjax: 'A student robotics team in Jacksonville that builds robots for head to head competitions.',
  shiva: 'A robotics academy that teaches kids to build and code robots.',
  rfa: 'A volunteer run nonprofit that teaches kids robotics and coding, often for free.',
  fics: 'The University of Florida’s cybersecurity research institute, where researchers work out how computer systems (and now AI) get attacked, and how to stop it.',
  toyota: 'Southeast Toyota gets new Toyotas from the factory to more than 170 dealerships across five southeastern states. It’s part of JM Family.',
  jm: 'One of the largest privately owned companies in the US, based in Florida. It runs Southeast Toyota, which delivers new Toyotas to dealers across the Southeast, and JM Lexus, its own Lexus dealership, along with car loan and warranty businesses.',
  hunter: 'Hunter makes the machines repair shops use to align wheels and balance tires.',
  adt: 'The security company behind the blue sign.'
};

/* The things I've built, told the way the off the clock stories are. */
const PROJ_TEXT = {
  avl: "I wanted to really understand how a tree keeps itself balanced, so I built one: an AVL tree in C++ that rotates itself back into shape on every insert and delete, so lookups stay fast however much you throw at it.",
  gatorgoods: "A place for UF students to buy and sell things to each other. I built it end to end on the MERN stack: sign in securely, post a listing, and browse what other Gators are selling, all on a clean API underneath.",
  sommiscript: "What does it take to make a programming language? I found out by making one: a small scripting language with syntax borrowed from Python and JavaScript, and an interpreter I wrote in Java to run it.",
  betai: "It started as an NFL betting model. Now I'm turning it into a marketplace where anyone can build their own model, test it against past games, and sell access to their live picks.",
  wadfs: "I wrote a file system from scratch in C++ that lives inside WAD archives, folders and files and all. Then I hooked it up to FUSE, so you can mount it and click around in it like any other drive.",
  crash: "I dug into vehicle fatality data from 1996 to 2022 to see which makes, models and years were really the safest, built interactive charts around it, and found places where the real numbers don't line up with the official safety ratings."
};

module.exports = { STORY, ABOUT, PROJ_TEXT };
