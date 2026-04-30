/**
 * Question Parser Engine
 * Extracts structured questions from raw text (PDF/DOCX/TXT output).
 * Supports: numbered MCQs, bullet options, answer keys, true/false, subjective.
 */

/**
 * Main entry: parse raw text into structured question array.
 * @param {string} rawText — Full text content from document
 * @returns {{ questions: Array, errors: Array }}
 */
export function parseQuestions(rawText) {
  const lines = rawText
    .split(/\r?\n/)
    .map(l => l.trimEnd())
    .filter(l => l.trim().length > 0);

  if (lines.length === 0) {
    return { questions: [], errors: ['Document appears to be empty.'] };
  }

  // Extract exam title if present
  let examTitle = '';
  const titleMatch = lines[0]?.match(/^(?:EXAM\s*TITLE|TITLE)\s*[:=]\s*(.+)/i);
  if (titleMatch) {
    examTitle = titleMatch[1].trim();
  }

  // Extract default category if present
  let defaultCategory = 'General';
  for (const line of lines.slice(0, 5)) {
    const catMatch = line.match(/^CATEGORY\s*[:=]\s*(.+)/i);
    if (catMatch) {
      defaultCategory = catMatch[1].trim();
      break;
    }
  }

  const blocks = splitIntoQuestionBlocks(lines);
  const questions = [];
  const errors = [];

  blocks.forEach((block, idx) => {
    try {
      const parsed = parseBlock(block, idx + 1, defaultCategory);
      if (parsed) {
        questions.push(parsed);
      }
    } catch (err) {
      errors.push(`Question ${idx + 1}: ${err.message}`);
    }
  });

  if (questions.length === 0 && errors.length === 0) {
    errors.push('Could not detect any questions in the document. Please check the format.');
  }

  return { questions, errors, examTitle };
}

/**
 * Split text lines into separate question blocks.
 * A new question starts with patterns like: 1., Q1., Q1), 1), Q:, etc.
 */
function splitIntoQuestionBlocks(lines) {
  const blocks = [];
  let current = [];

  // Patterns that indicate start of a new question
  const questionStartPattern = /^(?:Q\.?\s*)?(\d+)\s*[.):\-]\s+.+/i;
  const altStartPattern = /^(?:Question)\s*(\d+)\s*[.):]\s*/i;
  const qColonPattern = /^Q\s*:\s*.+/i;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip metadata lines
    if (/^(?:EXAM\s*TITLE|TITLE|CATEGORY)\s*[:=]/i.test(trimmed)) {
      continue;
    }

    const isNewQuestion =
      questionStartPattern.test(trimmed) ||
      altStartPattern.test(trimmed) ||
      qColonPattern.test(trimmed);

    if (isNewQuestion && current.length > 0) {
      blocks.push([...current]);
      current = [];
    }

    current.push(trimmed);
  }

  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

/**
 * Parse a single question block into structured data.
 */
function parseBlock(blockLines, fallbackId, defaultCategory) {
  if (blockLines.length === 0) return null;

  // Extract question text from first line
  let questionText = blockLines[0];

  // Remove leading number/Q prefix
  questionText = questionText
    .replace(/^(?:Q\.?\s*)?(\d+)\s*[.):\-]\s*/i, '')
    .replace(/^(?:Question)\s*(\d+)\s*[.):]\s*/i, '')
    .replace(/^Q\s*:\s*/i, '')
    .trim();

  // Check if question spans multiple lines (before options start)
  const optionStartIndex = findOptionsStart(blockLines);
  if (optionStartIndex > 1) {
    questionText = blockLines
      .slice(0, optionStartIndex)
      .map(l =>
        l.replace(/^(?:Q\.?\s*)?(\d+)\s*[.):\-]\s*/i, '')
          .replace(/^(?:Question)\s*(\d+)\s*[.):]\s*/i, '')
          .replace(/^Q\s*:\s*/i, '')
          .trim()
      )
      .join(' ')
      .trim();
  }

  if (!questionText || questionText.length < 3) {
    return null;
  }

  // Extract options
  const { options, correctFromMarker } = extractOptions(blockLines);

  // Extract answer from "Answer:" line
  const correctFromAnswer = extractAnswerLine(blockLines, options.length);

  // Determine correct answer
  let correctAnswer = -1;
  if (correctFromMarker >= 0) {
    correctAnswer = correctFromMarker;
  } else if (correctFromAnswer >= 0) {
    correctAnswer = correctFromAnswer;
  }

  // Determine question type
  let type = 'subjective';
  if (options.length > 0) {
    const isTrueFalse = options.length === 2 &&
      options.every(o => /^(true|false|t|f|yes|no)$/i.test(o.trim()));
    type = isTrueFalse ? 'true_false' : 'mcq';
  }

  // Detect category from question text or use default
  const category = detectCategory(questionText, defaultCategory);

  return {
    id: fallbackId,
    question: questionText,
    type,
    category,
    options,
    correctAnswer,
  };
}

/**
 * Find where options start in a block.
 */
function findOptionsStart(lines) {
  const optionPattern = /^(?:[A-Da-d][.)]\s|[A-Da-d]\)\s|\([A-Da-d]\)\s|[ivx]+[.)]\s|-\s|•\s|[1-4][.)]\s(?!.*\?))/;
  for (let i = 1; i < lines.length; i++) {
    if (optionPattern.test(lines[i])) {
      return i;
    }
  }
  return lines.length;
}

/**
 * Extract options from block lines.
 * Returns { options: string[], correctFromMarker: number }
 */
function extractOptions(lines) {
  const options = [];
  let correctFromMarker = -1;

  // Common option patterns
  const optionPatterns = [
    /^([A-Da-d])\s*[.)]\s*(.+)/,          // A) or A. or a) or a.
    /^\(([A-Da-d])\)\s*(.+)/,              // (A) or (a)
    /^([ivx]+)\s*[.)]\s*(.+)/i,            // i. ii. iii. iv.
    /^-\s+(.+)/,                            // - option
    /^•\s*(.+)/,                            // • option
  ];

  for (const line of lines) {
    // Skip answer lines
    if (/^(?:Answer|Correct|Ans)\s*[:=]/i.test(line)) continue;

    // Check for correct answer marker (* or ✓ prefix)
    const hasMarker = /^[*✓✔]\s*/.test(line) || /\s*[*✓✔]\s*$/.test(line);
    const cleanLine = line.replace(/^[*✓✔]\s*/, '').replace(/\s*[*✓✔]\s*$/, '');

    for (const pattern of optionPatterns) {
      const match = cleanLine.match(pattern);
      if (match) {
        const optText = (match[2] || match[1]).trim();
        if (optText) {
          if (hasMarker) {
            correctFromMarker = options.length;
          }
          options.push(optText);
        }
        break;
      }
    }
  }

  return { options, correctFromMarker };
}

/**
 * Extract correct answer from "Answer: X" line.
 */
function extractAnswerLine(lines, optionCount) {
  for (const line of lines) {
    const match = line.match(/^(?:Answer|Correct|Ans)\s*[:=]\s*(.+)/i);
    if (match) {
      const ansVal = match[1].trim();

      // Letter answer: A, B, C, D
      const letterMatch = ansVal.match(/^([A-Da-d])(?:\s|$|[.):])/);
      if (letterMatch) {
        return letterMatch[1].toUpperCase().charCodeAt(0) - 65; // A=0, B=1...
      }

      // Just a single letter
      if (/^[A-Da-d]$/i.test(ansVal)) {
        return ansVal.toUpperCase().charCodeAt(0) - 65;
      }

      // Numeric answer: 1, 2, 3, 4
      const numMatch = ansVal.match(/^(\d+)/);
      if (numMatch) {
        const num = parseInt(numMatch[1]);
        if (num >= 1 && num <= optionCount) {
          return num - 1; // Convert to 0-indexed
        }
      }

      // Text match against options (check if answer text matches an option)
      // This is handled by the caller if needed
    }
  }
  return -1;
}

/**
 * Auto-detect question category from content keywords.
 */
function detectCategory(questionText, defaultCategory) {
  const text = questionText.toLowerCase();

  const categoryKeywords = {
    'Logical Reasoning': ['logic', 'reasoning', 'pattern', 'series', 'syllogism', 'analogy', 'odd one out', 'sequence', 'deduction', 'conclusion'],
    'Quantitative Aptitude': ['calculate', 'ratio', 'percentage', 'profit', 'loss', 'interest', 'speed', 'distance', 'time', 'probability', 'average', 'algebra', 'geometry', 'area', 'volume', 'arithmetic'],
    'Verbal Ability': ['synonym', 'antonym', 'grammar', 'sentence', 'vocabulary', 'punctuat', 'comprehension', 'spelling', 'meaning', 'figure of speech', 'idiom'],
    'Data Interpretation': ['graph', 'chart', 'table', 'pie chart', 'bar graph', 'data', 'interpret', 'trend', 'percentage increase', 'percentage decrease'],
    'General Knowledge': ['capital', 'country', 'history', 'geography', 'president', 'prime minister', 'constitution', 'invention', 'discovery'],
    'Science': ['physics', 'chemistry', 'biology', 'atom', 'molecule', 'cell', 'element', 'photosynthesis', 'gravity', 'energy', 'force'],
    'Mathematics': ['equation', 'theorem', 'integral', 'derivative', 'matrix', 'polynomial', 'function', 'trigonometry'],
    'Computer Science': ['algorithm', 'programming', 'database', 'network', 'software', 'hardware', 'operating system', 'binary', 'compiler', 'loop'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }

  return defaultCategory;
}

/**
 * Extract text from uploaded files based on type.
 */
export async function extractTextFromFile(filePath, mimeType) {
  const fs = await import('fs');

  if (mimeType === 'text/plain' || filePath.endsWith('.txt')) {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${mimeType || filePath}`);
}
