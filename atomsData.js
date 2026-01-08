
export const MASTER_ATOMS = [
  {
    "atom_id": "PV-1.3",
    "strand": "Place Value",
    "title": "Zero as Placeholder",
    "description": "Identify that '10' is different from '1' because the '0' holds a place.",
    "misconceptions": ["Thinking 0 means the column doesn't exist", "Writing 10 as 1"],
    "mastery_level": "Grey",
    "last_tested": null
  },
  {
    "atom_id": "PV-2.1",
    "strand": "Place Value",
    "title": "Teen vs. Ty",
    "description": "Distinguish between 13 (thirteen) and 30 (thirty) by sound and symbol.",
    "misconceptions": ["Writing 30 when hearing thirteen", "Confusing the suffix -teen and -ty"],
    "mastery_level": "Grey",
    "last_tested": null
  },
  {
    "atom_id": "TT-1.2",
    "strand": "Times Tables",
    "title": "Repeated Addition",
    "description": "Transform 2+2+2 into 3 x 2.",
    "misconceptions": ["Confusing the number of groups with the size of the group"],
    "mastery_level": "Grey",
    "last_tested": null
  },
  {
    "atom_id": "TT-2.1",
    "strand": "Times Tables",
    "title": "Commutativity",
    "description": "Understand that 5 x 2 and 2 x 5 have the same product.",
    "misconceptions": ["Thinking the order changes the total result"],
    "mastery_level": "Grey",
    "last_tested": null
  }
];

export const MASTER_SESSIONS = [
  {
    "session_number": 1,
    "strand": "Place Value",
    "learning_intention": "To explain the importance of zero in two-digit numbers.",
    "core_atoms": ["PV-1.3"],
    "teacher_notes": "",
    "status": "Not Taught",
    "resources": [
      { "name": "Place Value Chart", "url": "https://polypad.org" },
      { "name": "Intro Video", "url": "https://youtube.com" }
    ]
  },
  {
    "session_number": 2,
    "strand": "Place Value",
    "learning_intention": "To accurately identify and write teen and ty numbers.",
    "core_atoms": ["PV-2.1"],
    "teacher_notes": "",
    "status": "Not Taught",
    "resources": []
  },
  {
    "session_number": 1,
    "strand": "Times Tables",
    "learning_intention": "To relate addition sequences to multiplication facts.",
    "core_atoms": ["TT-1.2"],
    "teacher_notes": "",
    "status": "Not Taught",
    "resources": [
      { "name": "Counter Arrays", "url": "https://polypad.org" }
    ]
  },
  {
    "session_number": 2,
    "strand": "Times Tables",
    "learning_intention": "To demonstrate that factors can be multiplied in any order.",
    "core_atoms": ["TT-2.1"],
    "teacher_notes": "",
    "status": "Not Taught",
    "resources": []
  }
];
