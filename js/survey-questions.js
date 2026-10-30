// The bike security survey (axolokl.co.uk/survey), copied from the Google Form "How do you secure your bike?".
// Shared by survey.html (asks it) and go.axolokl.co.uk/admin/survey.html (charts the answers), so wording,
// option order and branching live in one place. Keys q1..q30 match the Google Form's question numbers.
//
//   type: one (pick one) | many (tick all, `max` = pick up to N) | text | long | email | grid (one per row)
//   other: true adds an "Other:" option with a text box, saved as qN_other; other: 'Label' gives that existing option the text box
//   none: an option that clears the others when ticked ("None of these")
//   go: where each answer leads (by option), else the next question in the list
//   optional: can be skipped
//   pics: {option: [picture, one-line hint]} shows options as picture cards (assets/img/axle-*.svg)
//   redirect: {answer: {set, to, message}} = that answer changes earlier answers and jumps to another question
//   suggest: 'countries' | 'uk_places' = type-ahead from js/countries.js / js/uk-places.js, saved as the standard name
window.AXO_SURVEY = (() => {
  const SECTIONS = {
    uk: { title: 'Living in the UK' },
    abroad: { title: 'Living elsewhere' },
    nobike: { title: 'No bike at the moment' },
    // people with no bike now reach this section through q9/q10 ("had one in the last 3 years")
    bike: { title: 'Your bike', note: (path) => path.includes('q9') || path.includes('q10')
      ? 'Answer about the bike you last had.' : 'Answer about the bike you ride most.' },
    secure: { title: 'Securing your bike' },
    worry: { title: 'Worry and theft' },
    theft: { title: 'What happened' },
    putoff: { title: 'What puts you off having a bike' },
    interview: { title: 'Interview (optional)', note: "This research is for Axolokl. We're building the ultimate solution against wheel theft, and we'd like to hear more from some of you in a 15-minute online interview." },
  };

  const BIKES = ['0', '1', '2', '3', '4 or more'];
  const HAD = ['Yes, but it was stolen', 'Yes, but I no longer have it for another reason', 'No'];
  const PARTS = ['Wheels or other parts being stolen'];

  const Q = [
    { id: 'q1', type: 'one', title: 'How old are you?',
      options: ['16 to 17', '18 to 24', '25 to 34', '35 to 44', '45 to 54', '55 to 64', '65 or over', 'Prefer not to say'] },
    { id: 'q2', type: 'one', title: 'What is your gender?', options: ['Woman', 'Man', 'Non-binary', 'Prefer not to say'] },
    { id: 'q3', type: 'one', title: 'Which best describes you?', other: true,
      options: ['At school or college', 'At university', 'Employed', 'Self-employed', 'Not working', 'Retired'] },
    { id: 'q4', type: 'one', title: 'Do you live in the UK?', options: ['Yes', 'No'], go: { Yes: 'q5', No: 'q7' } },

    { id: 'q5', section: 'uk', type: 'text', suggest: 'uk_places', title: 'Which town or city do you live in?' },
    { id: 'q6', section: 'uk', type: 'one', title: 'How many bikes do you have in the UK?', options: BIKES,
      go: { 0: 'q9', '*': 'q11' } },

    { id: 'q7', section: 'abroad', type: 'text', suggest: 'countries', title: 'Which country do you live in?',
      // said "not in the UK" but then picked the UK: correct q4 and send them to the UK questions
      redirect: { 'United Kingdom': { set: { q4: 'Yes' }, to: 'q5',
        message: 'You selected the United Kingdom as your country of residence. Your answer to "Do you live in the UK?" has been updated to Yes, and the following questions are for UK residents.' } } },
    { id: 'q8', section: 'abroad', type: 'one', title: 'How many bikes do you have where you live?', options: BIKES,
      go: { 0: 'q10', '*': 'q11' } },

    { id: 'q9', section: 'nobike', type: 'one', title: 'Have you had a bike in the UK in the last 3 years?', options: HAD,
      go: { No: 'q29', '*': 'q11' } },
    { id: 'q10', section: 'nobike', type: 'one', title: 'Have you had a bike where you live in the last 3 years?', options: HAD,
      go: { No: 'q29', '*': 'q11' } },

    { id: 'q11', section: 'bike', type: 'one', title: 'How often do you typically use your bike?',
      note: 'Think about the last 12 months as a whole.',
      options: ['Most days', 'Every week', 'Every month', 'Several times a year', 'Less than once a year', 'Never'] },
    { id: 'q12', section: 'bike', type: 'one', title: 'What do you mostly use your bike for?',
      options: ['Getting to work', 'Getting to uni or college', 'Errands or shopping', 'Leisure or socialising', 'Fitness or sport', 'Deliveries or other work', 'Something else'],
      other: 'Something else' },
    { id: 'q13', section: 'bike', type: 'one', title: 'What kind of bike is it?', other: true,
      options: ['Road or gravel', 'Mountain', 'Hybrid or city', 'Folding', 'Cargo', 'Electric (any type)'] },
    { id: 'q14', section: 'bike', type: 'one', title: 'Roughly how much would a bike like yours cost to buy new today?',
      options: ['Under £100', '£100 to £199', '£200 to £499', '£500 to £999', '£1,000 or more', 'Not sure'] },
    { id: 'q15', section: 'bike', type: 'one', title: 'How are your bike wheels held on?',
      options: ['Quick release', 'Thru axle', 'Bolt-on', 'Locking axle', 'Not sure'],
      pics: {
        'Quick release': ['assets/img/axle-quick-release.svg?v=3', 'A lever you flip open, no tools'],
        'Thru axle': ['assets/img/axle-thru-axle.svg?v=3', 'A thick axle, with a lever or a bolt'],
        'Bolt-on': ['assets/img/axle-bolt-on.svg?v=3', 'Nuts on each side, needs a spanner'],
        'Locking axle': ['assets/img/axle-locking-axle.svg?v=3', 'Needs its own special key'],
      } },
    { id: 'q16', section: 'bike', type: 'many', title: "When you're out, where do you leave your bike?", other: true,
      options: ['On the street (stand, railing or post)', 'Secure parking (locked room, cage or cycle hub)', 'A train station bike park', 'I keep it with me'] },
    { id: 'q17', section: 'bike', type: 'one', title: "On a typical day, what's the longest you leave it in one place?",
      options: ['I never leave it parked', 'Under 30 minutes', '30 minutes to 2 hours', '2 to 5 hours', 'Over 5 hours', 'Overnight'] },

    { id: 'q18', section: 'secure', type: 'many', title: 'Which type of locks do you typically use when you lock your bike up?', other: true,
      options: ['U lock', 'Chain lock', 'Cable lock', 'Folding lock', "I don't use a lock"], none: "I don't use a lock" },
    { id: 'q19', section: 'secure', type: 'many', title: 'Do you have any other security equipment on your bike?', other: true,
      options: ['Security skewers for wheels', 'Handlebar / steering lock', 'Seatpost / saddle lock', 'Bluetooth tracker (e.g. Tile, Apple AirTag)', 'GPS tracker',
        'Security measures integrated with e-bike (e.g. motor immobilisation, GPS tracking)', 'None of the above'], none: 'None of the above' },
    { id: 'q20', section: 'secure', type: 'one', title: 'Roughly how much did the security you use now cost in total?',
      note: 'Locks, chains, trackers, security skewers and so on, for all your bikes where you live.',
      options: ["Nothing, I don't use any", 'Under £50', '£50 to £99', '£100 to £149', '£150 to £199', '£200 to £249', '£250 to £299', '£300 or more', 'Not sure'] },
    { id: 'q21', section: 'secure', type: 'many', max: 3, title: 'Which of these matter most to you when you leave your bike?', other: true,
      options: ['Locking up is quick', 'One lock is enough for the whole bike', 'I can lock it wherever I need to', 'The wheels stay on it',
        'Other parts (saddle, lights) stay on it', 'I can take a wheel off myself when I need to (for a puncture, or to fit it in a car)',
        "I don't have to carry a key", 'No codes to remember', "I know it's secure enough", "A thief couldn't use or sell anything they took",
        "If it's stolen, I get it back", "If it's stolen, the cost is covered"] },
    { id: 'q22', section: 'secure', type: 'many', max: 3, title: 'What frustrates you about how you secure your bike now?', other: true,
      options: ['Locking up takes too long', 'Needing more than one lock', 'Finding somewhere to lock it', 'Wheel(s) could still be taken',
        'Other parts (saddle, lights) could still be taken', 'Security makes it hard to take a wheel off myself',
        'Carrying keys, or worrying about losing them', 'Remembering codes', "Not knowing if it's secure enough", 'Nothing'], none: 'Nothing' },

    { id: 'q23', section: 'worry', type: 'grid', title: 'When you leave your bike, how worried are you about',
      rows: [['q23a', 'The whole bike being stolen'], ['q23b', PARTS[0]]],
      options: ['Not at all', 'A little', 'Moderately', 'Very', 'Extremely'] },
    { id: 'q24', section: 'worry', type: 'many', title: 'Because of worry about theft, have you done any of these in the last 3 years?',
      options: ['Not cycled somewhere', 'Left your bike somewhere less convenient', 'Ridden an older or cheaper bike', 'Put off buying a bike',
        'Taken a part off and carried it with you', 'None of these'], none: 'None of these' },
    { id: 'q25', section: 'worry', type: 'one', title: 'Have you ever had a bike or bike part stolen?', options: ['Yes', 'No'],
      go: { Yes: 'q26', No: 'q30' } },

    { id: 'q26', section: 'theft', type: 'many', title: 'What was stolen?', other: true,
      options: ['My whole bike', 'A front wheel', 'A rear wheel', 'A saddle or seat post', 'Lights', 'An e-bike battery'] },
    { id: 'q27', section: 'theft', type: 'one', title: 'Following theft, was the frequency with which you cycle affected?',
      options: ['Yes, I stopped cycling for a period of time', 'Yes, I stopped cycling permanently', 'Yes, I now cycle less than I did before', 'No, I cycle the same amount as I did before'] },
    { id: 'q28', section: 'theft', type: 'long', optional: true, title: 'Want to tell us more about what happened?',
      note: 'For example, where the bike was, how it was locked and what was taken. Describe as many thefts as you like.', go: { '*': 'q30' } },

    { id: 'q29', section: 'putoff', type: 'many', optional: true, title: 'What, if anything, puts you off having a bike?', other: true,
      options: ['Traffic and road safety', 'Weather', 'Distances are too far', 'Nowhere secure to leave a bike', 'Worry about it being stolen',
        'No space to keep a bike at home', 'Cost', 'Health or fitness', 'I use hire or shared bikes instead', "I'm not interested in cycling"] },

    { id: 'q30', section: 'interview', type: 'email', optional: true,
      title: "If you're 18 or over and happy to be contacted about an interview, leave your email.",
      note: "We'll only use it to arrange the interview and will delete it by April 2027." },
  ];

  const byId = Object.fromEntries(Q.map((q) => [q.id, q]));
  // The question after q, given the answers so far (null = the end)
  function next(q, answers) {
    if (q.go) {
      const a = answers[q.id];
      const to = q.go[a] || q.go['*'];
      if (to) return to;
    }
    const i = Q.indexOf(q);
    return Q[i + 1] ? Q[i + 1].id : null;
  }
  return { SECTIONS, QUESTIONS: Q, byId, next, first: 'q1' };
})();
