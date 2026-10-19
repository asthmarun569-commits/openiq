/*
 * Original starter items for software demonstration only.
 * These items have NOT been psychometrically validated.
 * Do not interpret results as IQ.
 */
window.OPENIQ_QUESTIONS = [
  {
    id: "num-01", domain: "Numerical reasoning",
    prompt: "What number comes next in the sequence?",
    visual: "3, 6, 12, 24, ?",
    options: ["30", "36", "48", "54"], answer: 2,
    explanation: "Each term is doubled: 3 → 6 → 12 → 24 → 48."
  },
  {
    id: "ver-01", domain: "Verbal relationships",
    prompt: "Bird is to nest as bee is to…",
    options: ["Cave", "Hive", "Web", "Stable"], answer: 1,
    explanation: "A nest is a bird's home; a hive is a bee colony's home."
  },
  {
    id: "logic-01", domain: "Logical reasoning",
    prompt: "All glims are norks. All norks are vels. Which statement must be true?",
    options: ["All vels are glims", "All glims are vels", "No glims are vels", "All norks are glims"], answer: 1,
    explanation: "If every glim belongs to the nork group and every nork belongs to the vel group, every glim is a vel."
  },
  {
    id: "num-02", domain: "Numerical reasoning",
    prompt: "Which number does not fit the pattern?",
    visual: "4, 9, 16, 20, 25",
    options: ["9", "16", "20", "25"], answer: 2,
    explanation: "4, 9, 16 and 25 are perfect squares; 20 is not."
  },
  {
    id: "ver-02", domain: "Verbal relationships",
    prompt: "Choose the word closest in meaning to 'brief'.",
    options: ["Short", "Heavy", "Bright", "Quiet"], answer: 0,
    explanation: "'Brief' commonly means short in duration or length."
  },
  {
    id: "logic-02", domain: "Logical reasoning",
    prompt: "Mira is older than Dev. Dev is older than Anil. Who is youngest?",
    options: ["Mira", "Dev", "Anil", "Cannot be determined"], answer: 2,
    explanation: "The order from oldest to youngest is Mira, Dev, Anil."
  },
  {
    id: "num-03", domain: "Numerical reasoning",
    prompt: "If 5 notebooks cost ₹60 at the same price per notebook, what do 8 notebooks cost?",
    options: ["₹84", "₹90", "₹96", "₹100"], answer: 2,
    explanation: "Each notebook costs ₹12, so 8 cost 8 × ₹12 = ₹96."
  },
  {
    id: "logic-03", domain: "Logical reasoning",
    prompt: "Some artists are teachers. All teachers are readers. What must be true?",
    options: ["All artists are readers", "Some artists are readers", "No readers are artists", "All readers are teachers"], answer: 1,
    explanation: "The artists who are teachers must also be readers."
  },
  {
    id: "ver-03", domain: "Verbal relationships",
    prompt: "Seed is to plant as egg is to…",
    options: ["Bird", "Nest", "Feather", "Branch"], answer: 0,
    explanation: "A seed can develop into a plant; an egg can develop into a bird."
  },
  {
    id: "num-04", domain: "Numerical reasoning",
    prompt: "What number completes the sequence?",
    visual: "2, 5, 8, 11, ?",
    options: ["12", "13", "14", "15"], answer: 2,
    explanation: "The sequence increases by 3 each time; the next number is 14."
  },
  {
    id: "logic-04", domain: "Logical reasoning",
    prompt: "A box contains only red and blue cards. You draw one card and it is not red. What colour is it?",
    options: ["Red", "Blue", "Green", "Cannot be determined"], answer: 1,
    explanation: "If the only possible colours are red and blue, a card that is not red must be blue."
  },
  {
    id: "ver-04", domain: "Verbal relationships",
    prompt: "Which pair has the same relationship as 'thermometer : temperature'?",
    options: ["Clock : time", "Book : author", "Cup : water", "Road : car"], answer: 0,
    explanation: "A thermometer measures temperature; a clock measures or indicates time."
  }
];
