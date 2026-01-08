
export const master_atoms = [
  // PHASE 1 & 2
  { atom_id: "PV-1.1", strand: "Place Value", title: "The 10 Symbols", description: "Recognizing that 0-9 are the building blocks of all numbers.", misconceptions: ["Confusing digit value with position"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.1", strand: "Times Tables", title: "Equal Groups", description: "Identifying groups with the same quantity.", misconceptions: ["Treating unequal groups as equal"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-1.3", strand: "Place Value", title: "Zero as Placeholder", description: "Using 0 to hold a place so digits maintain their value (e.g., 10 vs 1).", misconceptions: ["Thinking 0 means nothing exists there"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.2", strand: "Times Tables", title: "Repeated Addition", description: "Seeing 2+2+2 as 3 groups of 2.", misconceptions: ["Adding the wrong number of groups"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-1.4", strand: "Place Value", title: "Unitizing Tens", description: "Understanding that 10 ones is the same as 1 ten.", misconceptions: ["Seeing a ten as just 10 separate ones"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.4", strand: "Times Tables", title: "The Array", description: "Organizing items into rows and columns.", misconceptions: ["Confusing rows with columns"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-1.5", strand: "Place Value", title: "Counting 10s", description: "Fluency in skip counting by 10.", misconceptions: ["Losing track after 90"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.5", strand: "Times Tables", title: "10x Table", description: "The 'moving digits' rule for 10x.", misconceptions: ["Just 'adding a zero' without understanding PV"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-1.2", strand: "Place Value", title: "2-Digit Composition", description: "Breaking 24 into 20 and 4.", misconceptions: ["Thinking 24 is 2 and 4"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.6", strand: "Times Tables", title: "5x Table", description: "Connecting 5s to 10s (half of 10).", misconceptions: ["Confusing 5s with 2s"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-1.6", strand: "Place Value", title: "Number Lines to 100", description: "Estimating position on a 0-100 line.", misconceptions: ["Clumping numbers at one end"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-1.7", strand: "Times Tables", title: "2x Table", description: "Multiplication as doubling.", misconceptions: ["Confusing doubling with adding 2"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.1", strand: "Place Value", title: "The Hundred Flat", description: "Recognizing 100 as a unit of 10 tens.", misconceptions: ["Not seeing 100 as a single bundle"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.1", strand: "Times Tables", title: "Commutativity", description: "Factors can switch order (a x b = b x a).", misconceptions: ["Thinking 2x5 is different from 5x2"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.2", strand: "Place Value", title: "3-Digit Composition", description: "Standard form of H, T, O.", misconceptions: ["Writing 100203 for 123"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.2", strand: "Times Tables", title: "3x Table Intro", description: "Skip counting in 3s.", misconceptions: ["Skipping numbers in the sequence"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.3", strand: "Place Value", title: "Crossing 100", description: "Counting across the 100 threshold.", misconceptions: ["Saying 'one hundred and ten-one'"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.3", strand: "Times Tables", title: "3x Table Patterns", description: "Odd/Even alternating pattern.", misconceptions: ["Thinking all 3s are odd"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.4", strand: "Place Value", title: "Midpoints to 100", description: "Finding 50 as the balance point.", misconceptions: ["Thinking 60 is the middle"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.4", strand: "Times Tables", title: "3x Fluency", description: "Rapid recall of 3x facts.", misconceptions: ["Slow counting on fingers"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.5", strand: "Place Value", title: "Internal Zeros", description: "Handling zeros in the tens place (e.g., 104).", misconceptions: ["Writing 14 for 104"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.5", strand: "Times Tables", title: "Inverse Intro", description: "Division as the opposite of multiplication.", misconceptions: ["Thinking they are unrelated"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "PV-2.6", strand: "Place Value", title: "Magnitude", description: "Using < and > to compare 3-digit numbers.", misconceptions: ["Focusing on the ones place instead of hundreds"], last_tested: null, mastery_level: "Grey" },
  { atom_id: "TT-2.6", strand: "Times Tables", title: "Fact Families", description: "The relationship between three numbers (e.g., 3, 4, 12).", misconceptions: ["Forgetting one of the four facts"], last_tested: null, mastery_level: "Grey" }
];

export const master_sessions = [
  // PHASE 1
  { session_id: 1, strand: "Place Value", title: "The 10 Symbols", li: "Recognize 0-9 build all numbers.", atoms: ["PV-1.1"], status: "grey", notes: "" },
  { session_id: 1, strand: "Times Tables", title: "Equal Groups", li: "Identify equal vs unequal groups.", atoms: ["TT-1.1"], status: "grey", notes: "" },
  { session_id: 2, strand: "Place Value", title: "Zero as Placeholder", li: "Use 0 to hold a place in 10, 20, etc.", atoms: ["PV-1.3"], status: "grey", notes: "" },
  { session_id: 2, strand: "Times Tables", title: "Repeated Addition", li: "Write addition as multiplication.", atoms: ["TT-1.2"], status: "grey", notes: "" },
  { session_id: 3, strand: "Place Value", title: "Unitizing Tens", li: "Bundle 10 ones into 1 ten.", atoms: ["PV-1.4"], status: "grey", notes: "" },
  { session_id: 3, strand: "Times Tables", title: "The Array", li: "Represent multiplication as a grid.", atoms: ["TT-1.4"], status: "grey", notes: "" },
  { session_id: 4, strand: "Place Value", title: "Counting 10s", li: "Count fluently in tens to 100.", atoms: ["PV-1.5"], status: "grey", notes: "" },
  { session_id: 4, strand: "Times Tables", title: "10x Table", li: "Master the 10s using the '0' rule.", atoms: ["TT-1.5"], status: "grey", notes: "" },
  { session_id: 5, strand: "Place Value", title: "2-Digit Composition", li: "Partition numbers into Tens and Ones.", atoms: ["PV-1.2"], status: "grey", notes: "" },
  { session_id: 5, strand: "Times Tables", title: "5x Table", li: "Connect 5s to the clock and 10s.", atoms: ["TT-1.6"], status: "grey", notes: "" },
  { session_id: 6, strand: "Place Value", title: "Number Lines to 100", li: "Place 2-digit numbers on a line.", atoms: ["PV-1.6"], status: "grey", notes: "" },
  { session_id: 6, strand: "Times Tables", title: "2x Table", li: "Understand doubling as 2x.", atoms: ["TT-1.7"], status: "grey", notes: "" },
  { session_id: 7, strand: "Place Value", title: "Phase 1 Review", li: "Review 2-digit PV and 2,5,10 tables.", atoms: ["PV-1.1", "TT-1.7"], status: "grey", notes: "" },
  { session_id: 7, strand: "Times Tables", title: "Knowledge Test 1", li: "Test retrieval of Phase 1.", atoms: ["TT-1.5", "TT-1.6", "TT-1.7"], status: "grey", notes: "" },

  // PHASE 2
  { session_id: 8, strand: "Place Value", title: "The Hundred Flat", li: "10 tens make 1 hundred.", atoms: ["PV-2.1"], status: "grey", notes: "" },
  { session_id: 8, strand: "Times Tables", title: "Commutativity", li: "Understand 5x2 is the same as 2x5.", atoms: ["TT-2.1"], status: "grey", notes: "" },
  { session_id: 9, strand: "Place Value", title: "3-Digit Composition", li: "Build H, T, and O.", atoms: ["PV-2.2"], status: "grey", notes: "" },
  { session_id: 9, strand: "Times Tables", title: "3x Table Intro", li: "Skip count in 3s fluently.", atoms: ["TT-2.2"], status: "grey", notes: "" },
  { session_id: 10, strand: "Place Value", title: "Crossing 100", li: "Bridge the 100 barrier (99 to 101).", atoms: ["PV-2.3"], status: "grey", notes: "" },
  { session_id: 10, strand: "Times Tables", title: "3x Table Patterns", li: "Identify even/odd patterns in 3s.", atoms: ["TT-2.3"], status: "grey", notes: "" },
  { session_id: 11, strand: "Place Value", title: "Midpoints to 100", li: "Find 50 as the halfway mark.", atoms: ["PV-2.4"], status: "grey", notes: "" },
  { session_id: 11, strand: "Times Tables", title: "3x Fluency", li: "Rapid recall of 3x table.", atoms: ["TT-2.4"], status: "grey", notes: "" },
  { session_id: 12, strand: "Place Value", title: "Internal Zeros", li: "Write numbers like 104 and 308.", atoms: ["PV-2.5"], status: "grey", notes: "" },
  { session_id: 12, strand: "Times Tables", title: "Inverse Intro", li: "Understand division as the opposite.", atoms: ["TT-2.5"], status: "grey", notes: "" },
  { session_id: 13, strand: "Place Value", title: "Magnitude", li: "Compare 3-digit numbers using < >.", atoms: ["PV-2.6"], status: "grey", notes: "" },
  { session_id: 13, strand: "Times Tables", title: "Fact Families", li: "Relate 3, 4, and 12 together.", atoms: ["TT-2.6"], status: "grey", notes: "" },
  { session_id: 14, strand: "Place Value", title: "Phase 2 Review", li: "Review 3-digit PV and 3s.", atoms: ["PV-2.1", "PV-2.5"], status: "grey", notes: "" },
  { session_id: 14, strand: "Times Tables", title: "Knowledge Test 2", li: "Test retrieval of Phase 2.", atoms: ["TT-2.4", "TT-2.5"], status: "grey", notes: "" }
];
