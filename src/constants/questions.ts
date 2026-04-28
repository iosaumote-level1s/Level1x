export interface Question {
  id: string;
  text: string;
  category: string;
  type: 'select' | 'number' | 'text' | 'boolean';
  options?: string[];
}

export const ASSESSMENT_QUESTIONS: Question[] = [
  // FITNESS & ENERGY
  { id: 'q_fit_01', text: 'How many days per week do you perform intense physical exercise?', category: 'Fitness & Energy', type: 'number' },
  { id: 'q_fit_03', text: 'Rate your current physical fitness on a scale of 1-10.', category: 'Fitness & Energy', type: 'select', options: ['1-2', '3-4', '5-6', '7-8', '9-10'] },
  { id: 'q_fit_05', text: 'Average hours of sleep per night?', category: 'Fitness & Energy', type: 'number' },
  { id: 'q_fit_08', text: 'How often do you consume processed foods or refined sugars?', category: 'Fitness & Energy', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Never'] },
  { id: 'q_fit_10', text: 'How many liters of water do you drink daily?', category: 'Fitness & Energy', type: 'number' },
  { id: 'q_fit_13', text: 'Do you currently track your macronutrients (Protein/Carbs/Fats)?', category: 'Fitness & Energy', type: 'boolean' },

  // DISCIPLINE & HABITS
  { id: 'q_disc_01', text: 'Do you follow a strictly written daily routine?', category: 'Discipline & Habits', type: 'boolean' },
  { id: 'q_disc_05', text: 'Do you use a professional planning system (Calendar/To-Do List)?', category: 'Discipline & Habits', type: 'boolean' },
  { id: 'q_disc_08', text: 'Estimated hours of low-value digital consumption (Social Media/TV) per day?', category: 'Discipline & Habits', type: 'number' },
  { id: 'q_disc_14', text: 'Do you plan your upcoming day every single night?', category: 'Discipline & Habits', type: 'boolean' },
  { id: 'q_disc_16', text: 'Do you practice any form of voluntary hardship (Cold Showers/Fasting)?', category: 'Discipline & Habits', type: 'boolean' },

  // MONEY & WEALTH
  { id: 'q_wealth_01', text: 'What is your current monthly gross income?', category: 'Money & Wealth', type: 'number' },
  { id: 'get_wealth_02', text: 'Do you have multiple independent streams of income?', category: 'Money & Wealth', type: 'boolean' },
  { id: 'q_wealth_03', text: 'What percentage of your income do you save/invest monthly?', category: 'Money & Wealth', type: 'select', options: ['< 10%', '10-25%', '25-50%', '50%+'] },
  { id: 'q_wealth_05', text: 'Do you own income-producing assets (Real Estate/Stocks/Business)?', category: 'Money & Wealth', type: 'boolean' },
  { id: 'q_wealth_10', text: 'Do you have a liquid emergency fund covering 6+ months of expenses?', category: 'Money & Wealth', type: 'boolean' },

  // LEARNING & SKILLS
  { id: 'q_learn_01', text: 'Hours dedicated to high-income skill acquisition per week?', category: 'Learning & Skills', type: 'number' },
  { id: 'q_learn_08', text: 'How many non-fiction books did you finish in the last 12 months?', category: 'Learning & Skills', type: 'number' },
  { id: 'q_learn_13', text: 'Do you possess a skill that could realistically earn you ₹8 Lakhs/month?', category: 'Learning & Skills', type: 'boolean' },
  { id: 'q_learn_14', text: 'Do you have an active mentor or belong to a high-level mastermind?', category: 'Learning & Skills', type: 'boolean' },

  // NETWORK & RELATIONSHIPS
  { id: 'q_net_01', text: 'Rate the quality of your immediate network (The "5 people" rule).', category: 'Network & Relationships', type: 'select', options: ['1-2 (Anchor)', '3-4 (Neutral)', '5-6 (Average)', '7-8 (Strong)', '9-10 (Elite)'] },
  { id: 'q_net_05', text: 'Do you have a personal board of advisors or accountability partners?', category: 'Network & Relationships', type: 'boolean' },
  { id: 'q_net_10', text: 'How many conversations with top-tier performers do you have weekly?', category: 'Network & Relationships', type: 'number' },

  // MINDSET & FOCUS
  { id: 'q_mind_03', text: 'Average hours of "Deep Work" (no distractions) achieved daily?', category: 'Mindset & Focus', type: 'number' },
  { id: 'q_mind_10', text: 'Do you practice daily meditation or mindfulness?', category: 'Mindset & Focus', type: 'boolean' },
  { id: 'q_mind_12', text: 'Do you have a clear, written 10-year vision for your life?', category: 'Mindset & Focus', type: 'boolean' },
  { id: 'q_mind_16', text: 'Do you practice daily journaling or reflection?', category: 'Mindset & Focus', type: 'boolean' },

  // FINAL VISION (Critical)
  { id: 'vision3Year', text: 'Describe exactly who you want to become in 3 years. What does your life look like?', category: '1% Vision', type: 'text' },
  { id: 'targetIncome', text: 'What is your target annual income (in Rupees) to achieve absolute freedom?', category: '1% Vision', type: 'number' },
  { id: 'dreamCareer', text: 'What is your dream career, business, or contribution to the world?', category: '1% Vision', type: 'text' },
  { id: 'fitnessGoal', text: 'What is your peak physical goal? (e.g., body fat %, specific strength stats)', category: '1% Vision', type: 'text' },
];
