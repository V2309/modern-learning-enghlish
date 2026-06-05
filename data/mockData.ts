export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
  category: string;
  partOfSpeech: 'Noun' | 'Verb' | 'Adjective' | 'Adverb' | 'Phrase' | 'Other';
  imageUrl?: string;
  pronunciation?: string; // New field
  examples?: string[]; // Multiple examples support
}

export interface VocabularyTopic {
  id: string;
  name: string;
  description?: string;
  words: Vocabulary[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  description?: string; // Content or description of the lesson
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  lessons: Lesson[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const TOPICS_DATA: VocabularyTopic[] = [
  {
    id: 't1',
    name: 'Greetings',
    description: 'Common ways to say hello and goodbye.',
    words: [
      { id: 'w1', word: 'Hi', meaning: 'Chào', example: 'Hi, how are you?', category: 'Greetings', partOfSpeech: 'Phrase', pronunciation: '/haɪ/' },
      { id: 'w2', word: 'Hello', meaning: 'Xin chào', example: 'Hello there!', category: 'Greetings', partOfSpeech: 'Phrase', pronunciation: '/həˈloʊ/' },
      { id: 'w3', word: 'Good morning', meaning: 'Chào buổi sáng', example: 'Good morning, everyone.', category: 'Greetings', partOfSpeech: 'Phrase', pronunciation: '/ɡʊd ˈmɔːrnɪŋ/' },
    ]
  },
  {
    id: 't2',
    name: 'Food',
    description: 'Essential words for eating and drinking.',
    words: [
      { id: 'w4', word: 'Apple', meaning: 'Quả táo', example: 'I eat an apple every day.', category: 'Food', partOfSpeech: 'Noun', pronunciation: '/ˈæpəl/' },
      { id: 'w5', word: 'Bread', meaning: 'Bánh mì', example: 'I like fresh bread.', category: 'Food', partOfSpeech: 'Noun', pronunciation: '/brɛd/' },
      { id: 'w6', word: 'Rice', meaning: 'Cơm/Gạo', example: 'Rice is a staple food.', category: 'Food', partOfSpeech: 'Noun', pronunciation: '/raɪs/' },
    ]
  }
];

export const COURSES_DATA: Course[] = [
  {
    id: 'c1',
    title: 'Mastering Business English',
    description: '# Professional Communication\n\nLearn how to communicate effectively in a professional environment.\n\n- **Business Etiquette**\n- **Email Mastery**\n- **Negotiation**',
    thumbnail: 'https://picsum.photos/seed/business/800/450',
    level: 'Intermediate',
    lessons: [
      { id: 'l1', title: 'Introduction', duration: '10:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', completed: false, description: 'Welcome to Mastering Business English. In this lesson, we will explore the foundational principles of professional communication and outline the core topics of the syllabus.' },
    ]
  }
];
