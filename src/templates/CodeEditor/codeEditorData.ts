import type { ISelectOption } from '@trimble-oss/moduswebcomponents';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type ProblemExample = {
  title: string;
  input: string;
  output: string;
  explanation: string;
};

export type Problem = {
  number: number;
  title: string;
  difficulty: Difficulty;
  solved: boolean;
  description: string[];
  examples: ProblemExample[];
  constraints: string[];
};

export const problem: Problem = {
  number: 3899,
  title: 'Angles of a triangle',
  difficulty: 'Medium',
  solved: true,
  description: [
    'You are given a positive integer array sides of length 3.',
    'Determine if there exists a triangle with positive area whose side lengths are given by the elements of sides.',
    'If such a triangle exists, return an array of three floating-point numbers representing its internal angles (in degrees), sorted in non-decreasing order. Otherwise, return an empty array.',
    'Answers within 10^-5 of the actual answer will be accepted.',
  ],
  examples: [
    {
      title: 'Example 1:',
      input: 'sides = [3,4,5]',
      output: '[36.86990,53.13010,90.00000]',
      explanation:
        'You can form a right-angled triangle with side lengths 3, 4, and 5. The internal angles of this triangle are approximately 36.869897646, 53.130102354, and 90 degrees respectively.',
    },
    {
      title: 'Example 2:',
      input: 'sides = [2,4,2]',
      output: '[]',
      explanation: 'You cannot form a triangle with positive area using side lengths 2, 4, and 2.',
    },
  ],
  constraints: ['sides.length == 3', '1 <= sides[i] <= 1000'],
};

export const languageOptions: ISelectOption[] = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python3', value: 'python3' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
];

export const initialCode = `/**
 * @param {number[]} sides
 * @return {number[]}
 */
var internalAngles = function(sides) {

};
`;

export type TestCase = {
  id: string;
  label: string;
  value: string;
};

export const initialTestCases: TestCase[] = [
  { id: 'case-1', label: 'Case 1', value: '3,4,5' },
  { id: 'case-2', label: 'Case 2', value: '2,4,2' },
];
