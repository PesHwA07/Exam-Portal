const questions = [
  {
    id: 1,
    category: "Logical Reasoning",
    question: "If all Bloops are Razzies and all Razzies are Lazzies, then which of the following is definitely true?",
    options: [
      "All Bloops are Lazzies",
      "All Lazzies are Bloops",
      "All Razzies are Bloops",
      "None of the above"
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    category: "Quantitative Aptitude",
    question: "A train running at 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
    options: [
      "120 meters",
      "150 meters",
      "180 meters",
      "200 meters"
    ],
    correctAnswer: 1
  },
  {
    id: 3,
    category: "Verbal Ability",
    question: "Choose the word most similar in meaning to 'Ephemeral'.",
    options: [
      "Eternal",
      "Transient",
      "Permanent",
      "Durable"
    ],
    correctAnswer: 1
  },
  {
    id: 4,
    category: "Quantitative Aptitude",
    question: "If the price of a commodity increases by 20%, by what percent must a consumer reduce consumption to maintain the same expenditure?",
    options: [
      "16.67%",
      "20%",
      "25%",
      "15%"
    ],
    correctAnswer: 0
  },
  {
    id: 5,
    category: "Logical Reasoning",
    question: "In a certain code language, 'COMPUTER' is written as 'RFUVQNPC'. How would 'MEDICINE' be written in that code?",
    options: [
      "ENICFDEM",
      "ENIDCFEM",
      "FOJEJDNF",
      "EOJDCINM"
    ],
    correctAnswer: 2
  },
  {
    id: 6,
    category: "Data Interpretation",
    question: "A company's revenue was ₹40 Lakhs in Q1, ₹55 Lakhs in Q2, ₹45 Lakhs in Q3, and ₹60 Lakhs in Q4. What was the average quarterly revenue?",
    options: [
      "₹48 Lakhs",
      "₹50 Lakhs",
      "₹52 Lakhs",
      "₹55 Lakhs"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    category: "Quantitative Aptitude",
    question: "Two pipes A and B can fill a tank in 20 minutes and 30 minutes respectively. If both pipes are opened simultaneously, how long will it take to fill the tank?",
    options: [
      "10 minutes",
      "12 minutes",
      "15 minutes",
      "25 minutes"
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    category: "Verbal Ability",
    question: "Select the correctly punctuated sentence.",
    options: [
      "Its a beautiful day, isn't it?",
      "It's a beautiful day, isn't it?",
      "Its a beautiful day isn't it?",
      "It's a beautiful day isn't it."
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    category: "Logical Reasoning",
    question: "If 'A' is the brother of 'B', 'B' is the sister of 'C', and 'C' is the father of 'D', how is 'A' related to 'D'?",
    options: [
      "Uncle",
      "Father",
      "Grandfather",
      "Brother"
    ],
    correctAnswer: 0
  },
  {
    id: 10,
    category: "Quantitative Aptitude",
    question: "What is the compound interest on ₹10,000 at 10% per annum for 2 years, compounded annually?",
    options: [
      "₹2,000",
      "₹2,100",
      "₹2,200",
      "₹2,500"
    ],
    correctAnswer: 1
  },
  {
    id: 11,
    category: "Logical Reasoning",
    question: "Which number should come next in the series: 2, 6, 12, 20, 30, ?",
    options: [
      "38",
      "40",
      "42",
      "44"
    ],
    correctAnswer: 2
  },
  {
    id: 12,
    category: "Verbal Ability",
    question: "Choose the antonym of 'Benevolent'.",
    options: [
      "Kind",
      "Malevolent",
      "Generous",
      "Charitable"
    ],
    correctAnswer: 1
  },
  {
    id: 13,
    category: "Quantitative Aptitude",
    question: "A man walks at 5 km/hr for 6 hours and at 4 km/hr for 12 hours. What is his average speed?",
    options: [
      "4.33 km/hr",
      "4.5 km/hr",
      "4.67 km/hr",
      "5 km/hr"
    ],
    correctAnswer: 0
  },
  {
    id: 14,
    category: "Data Interpretation",
    question: "If a pie chart shows that Engineering takes up 90° of the total, what percentage does Engineering represent?",
    options: [
      "20%",
      "25%",
      "30%",
      "35%"
    ],
    correctAnswer: 1
  },
  {
    id: 15,
    category: "Logical Reasoning",
    question: "Statement: All dogs are animals. All animals are living beings. Conclusion: All dogs are living beings.",
    options: [
      "The conclusion is true",
      "The conclusion is false",
      "The conclusion is uncertain",
      "Data is insufficient"
    ],
    correctAnswer: 0
  },
  {
    id: 16,
    category: "Quantitative Aptitude",
    question: "The ratio of ages of A and B is 4:3. After 6 years, the ratio will be 5:4. What is the present age of A?",
    options: [
      "20 years",
      "24 years",
      "28 years",
      "32 years"
    ],
    correctAnswer: 1
  },
  {
    id: 17,
    category: "Verbal Ability",
    question: "Identify the figure of speech: 'The wind whispered through the trees.'",
    options: [
      "Simile",
      "Metaphor",
      "Personification",
      "Hyperbole"
    ],
    correctAnswer: 2
  },
  {
    id: 18,
    category: "Quantitative Aptitude",
    question: "A shopkeeper sells an item at 15% profit. If the cost price is ₹200, what is the selling price?",
    options: [
      "₹215",
      "₹225",
      "₹230",
      "₹240"
    ],
    correctAnswer: 2
  },
  {
    id: 19,
    category: "Logical Reasoning",
    question: "Find the odd one out: Apple, Mango, Potato, Banana.",
    options: [
      "Apple",
      "Mango",
      "Potato",
      "Banana"
    ],
    correctAnswer: 2
  },
  {
    id: 20,
    category: "Data Interpretation",
    question: "A bar graph shows that 150 students passed in 2020 and 200 in 2021. What is the percentage increase from 2020 to 2021?",
    options: [
      "25%",
      "30%",
      "33.33%",
      "50%"
    ],
    correctAnswer: 2
  }
];

export default questions;
