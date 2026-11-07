/* ==========================================================================
   The thread through the machines: one letter, seven chapters. Each machine
   keeps its own chapter where its documents are kept, and each knows which
   machine the visitor just came from and which is still to see. Every
   chapter ties what was new in that year to something really built.
   ========================================================================== */
window.STORY = (function () {
  /* Where each one is kept. They are all things that were thrown out or left
     behind, so a visitor finds the first by poking around, and each after
     that by being told where to dig. */
  const WHERE = { 1983: 'on the 1974 Sommitron, if you think to UNDELETE', 1991: 'in the Trash on the Sommitosh 128k', 1998: 'in the Trash on the iSommi G3', 2007: 'in the Trash on the iSommi Aluminum', nokia: 'in the Extras on the 2000 phone', pocket: 'at the very bottom of the Extras on the 2004 music player', iphone: 'at the bottom of the Notes on the iPhone' };
  const COMPUTERS = ['1983', '1991', '1998', '2007'], PHONES = ['nokia', 'pocket', 'iphone'];
  const CHAPTERS = {
    1983: {
      n: 1, name: 'the 1974 Sommitron',
      lines: ['This is where it starts: a blinking cursor. No icons and no help. You type, it answers, and it does exactly what you said.', 'I still like it down here. I wrote a file system in C++ and a small language of my own, SommiScript, mostly to find out what’s underneath a prompt like this one.']
    },
    1991: {
      n: 2, name: 'the 1984 Sommitosh 128k',
      lines: ['Same idea, but somebody decided a computer should meet people halfway. A desk, some folders, a Trash you can drag things to.', 'That’s the part I care about most: thinking about the person using it. It’s also the kind of machine I can’t leave alone. I once put a 2012 board in a 2011 MacBook just to bring it back.']
    },
    1998: {
      n: 3, name: 'the 1998 iSommi G3',
      lines: ['Now the computer talks to other computers, as long as nobody picks up the phone. Everything starts to be about connecting people.', 'GatorGoods came from the same feeling: a place for UF students to buy and sell from each other.']
    },
    nokia: {
      n: 4, name: 'the 2000 phone',
      lines: ['The computer leaves the desk. It has one small screen and a battery that lasts all week, and it simply cannot fail.', 'At Hunter I built remote resets for more than 100,000 alignment machines out in the world. The same rule applies: when it’s far away, it has to work.']
    },
    pocket: {
      n: 5, name: 'the 2004 music player',
      lines: ['One wheel, and a thousand songs in your pocket. Something complicated, made to feel simple.', 'I chase that feeling at work. At Toyota I replaced a manual spreadsheet with a live dashboard, and data entry got five times faster.']
    },
    2007: {
      n: 6, name: 'the 2007 iSommi Aluminum',
      lines: ['Glass and a dock, and everything has its place. By now computers mostly run themselves, and the work moves to making them trustworthy.', 'At JM Family I built automatic checks in Azure that catch people holding the wrong access, so nobody has to go looking by hand.']
    },
    iphone: {
      n: 7, name: 'the 2007 iPhone',
      lines: ['And then it all fits in one hand: phone, music, the web, with no keys at all. Our tools got smarter from here, and they haven’t stopped.', 'I think that makes solving problems well matter more, not less. At ADT I designed an AI check for false alarms, with real people on the other end of the call.']
    }
  };
  const trail = [];
  const arrive = (id) => { if (CHAPTERS[id] && trail[trail.length - 1] !== id) trail.push(id); };
  const seen = (id) => trail.includes(id);

  /* The letter, as paragraphs, for whichever machine is showing it. */
  const paragraphs = (id) => {
    const c = CHAPTERS[id], at = trail.lastIndexOf(id);
    const from = at > 0 ? trail[at - 1] : null;
    const set = COMPUTERS.includes(id) ? COMPUTERS : PHONES;
    const next = set.slice(set.indexOf(id) + 1).concat(set.slice(0, set.indexOf(id))).find((m) => !seen(m));
    const out = [`Chapter ${c.n} of 7.${from && CHAPTERS[from] ? ` You just came from ${CHAPTERS[from].name}.` : ''}`, ...c.lines];
    if (next) out.push(`The next part is ${WHERE[next]}.`);
    else out.push(`That’s every machine here. The rest of the story is on a ${set === COMPUTERS ? 'phone' : 'computer'}, and today’s version is on the standard site.`);
    out.push('Ajay');
    return out;
  };
  const html = (id) => { window.EGGS.find('letter'); return paragraphs(id).map((p) => `<p>${p}</p>`).join(''); };
  const text = (id) => paragraphs(id).join('\n\n');
  return { arrive, seen, paragraphs, html, text };
})();
