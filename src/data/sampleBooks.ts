import { Book, ReadingStats } from '@/types/book';

import coverShadowGarden from '@/assets/cover-shadow-garden.jpg';
import coverLettersKyoto from '@/assets/cover-letters-kyoto.jpg';
import coverPridePrejudice from '@/assets/cover-pride-prejudice.jpg';
import coverMidnightProtocol from '@/assets/cover-midnight-protocol.jpg';
import coverVenetianMasquerade from '@/assets/cover-venetian-masquerade.jpg';
import coverGlassMountain from '@/assets/cover-glass-mountain.jpg';

export const sampleBooks: Book[] = [
  {
    id: '1',
    title: 'The Shadow Garden',
    author: 'Eleanor Vance',
    cover: coverShadowGarden,
    genre: 'thriller',
    progress: 67,
    currentChapter: 14,
    totalChapters: 22,
    emotionalTone: 75,
    tensionLevel: 82,
    wordCount: 89000,
    estimatedReadTime: 320,
    lastReadAt: new Date(),
  },
  {
    id: '2',
    title: 'Letters from Kyoto',
    author: 'Yuki Tanaka',
    cover: coverLettersKyoto,
    genre: 'emotional',
    progress: 34,
    currentChapter: 8,
    totalChapters: 24,
    emotionalTone: 45,
    tensionLevel: 25,
    wordCount: 72000,
    estimatedReadTime: 280,
    lastReadAt: new Date(Date.now() - 86400000),
  },
  {
    id: '3',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    cover: coverPridePrejudice,
    genre: 'classic',
    progress: 89,
    currentChapter: 54,
    totalChapters: 61,
    emotionalTone: 55,
    tensionLevel: 40,
    wordCount: 122000,
    estimatedReadTime: 420,
    lastReadAt: new Date(Date.now() - 172800000),
  },
  {
    id: '4',
    title: 'The Midnight Protocol',
    author: 'Marcus Chen',
    cover: coverMidnightProtocol,
    genre: 'scifi',
    progress: 12,
    currentChapter: 3,
    totalChapters: 28,
    emotionalTone: 60,
    tensionLevel: 70,
    wordCount: 95000,
    estimatedReadTime: 350,
  },
  {
    id: '5',
    title: 'Venetian Masquerade',
    author: 'Isabella Romano',
    cover: coverVenetianMasquerade,
    genre: 'romance',
    progress: 45,
    currentChapter: 12,
    totalChapters: 26,
    emotionalTone: 65,
    tensionLevel: 55,
    wordCount: 78000,
    estimatedReadTime: 290,
  },
  {
    id: '6',
    title: 'The Glass Mountain',
    author: 'Freya Lindström',
    cover: coverGlassMountain,
    genre: 'mystery',
    progress: 0,
    currentChapter: 0,
    totalChapters: 32,
    emotionalTone: 50,
    tensionLevel: 60,
    wordCount: 102000,
    estimatedReadTime: 380,
  },
];

export const sampleStats: ReadingStats = {
  totalBooksRead: 24,
  currentStreak: 7,
  longestStreak: 21,
  totalReadingTime: 4320, // 72 hours
  averageSessionLength: 35,
  genrePreferences: {
    thriller: 28,
    classic: 22,
    emotional: 18,
    mystery: 15,
    romance: 10,
    scifi: 7,
  },
  moodHistory: [
    { date: '2024-01-20', mood: 'calm', intensity: 60 },
    { date: '2024-01-21', mood: 'tense', intensity: 75 },
    { date: '2024-01-22', mood: 'joyful', intensity: 85 },
    { date: '2024-01-23', mood: 'melancholic', intensity: 55 },
    { date: '2024-01-24', mood: 'tense', intensity: 90 },
    { date: '2024-01-25', mood: 'calm', intensity: 45 },
    { date: '2024-01-26', mood: 'joyful', intensity: 70 },
  ],
  weeklyProgress: [
    { day: 'Mon', minutes: 45, pagesRead: 32 },
    { day: 'Tue', minutes: 30, pagesRead: 21 },
    { day: 'Wed', minutes: 60, pagesRead: 45 },
    { day: 'Thu', minutes: 25, pagesRead: 18 },
    { day: 'Fri', minutes: 55, pagesRead: 40 },
    { day: 'Sat', minutes: 90, pagesRead: 68 },
    { day: 'Sun', minutes: 75, pagesRead: 55 },
  ],
};

export const sampleChapterContent = `
The garden had always been a place of secrets. Even as a child, Eleanor had sensed the weight of unspoken histories buried beneath the overgrown paths and tangled rose bushes. Now, standing at the rusted iron gate, she understood why her grandmother had kept her away.

The evening light cast long shadows through the ancient oaks, their branches reaching toward her like gnarled fingers. Somewhere deep within the garden, a nightingale began its melancholy song—a sound so pure and sorrowful it seemed to come from another world entirely.

She pushed open the gate. The hinges screamed in protest, a sound that echoed through the twilight and sent a flutter of wings from the nearby hedgerow. The path before her was barely visible, consumed by decades of neglect, yet something drew her forward with an inexorable pull.

Each step revealed new wonders and new horrors. A stone fountain, its basin cracked and filled with dark water. A sundial whose face had been worn smooth by time. And everywhere, roses—not the cultivated beauties of a proper English garden, but wild things, their thorns like daggers, their blooms the color of old blood.

The deeper she ventured, the more the world outside seemed to fade. The sounds of the village—the distant church bells, the murmur of evening traffic—grew faint until they disappeared entirely. Here, in the heart of the shadow garden, time moved differently. She could feel it in her bones, a slowing of her pulse, a heaviness in her limbs.

And then she saw it: the statue at the center of the maze. Not marble, as she had expected, but something darker—obsidian, perhaps, or some stone she couldn't name. It depicted a woman, her face turned skyward, her arms outstretched as if reaching for something just beyond her grasp. Around her feet, stone roses bloomed eternally, their petals so finely carved they seemed almost alive.

Eleanor approached slowly, her heart hammering against her ribs. There was something familiar about the statue's face, something that tugged at the edges of her memory. The curve of the jaw. The set of the eyes. The slight, knowing smile that played about the lips.

"Grandmother," she whispered, and the word hung in the air like a spell.

The nightingale fell silent. The wind stilled. And in that moment of perfect quiet, Eleanor heard it—a voice, soft as moth wings, rising from somewhere beneath the earth.

"You came," it said. "After all these years, you finally came."

She should have run. Every instinct, every rational thought, screamed at her to flee this cursed place and never return. But her feet remained rooted to the spot, held fast by something stronger than fear.

Curiosity. Recognition. The terrible, wonderful pull of truth.

"I'm here," she answered, her voice steadier than she felt. "I'm ready to learn."

The ground beneath her feet began to tremble.
`;
