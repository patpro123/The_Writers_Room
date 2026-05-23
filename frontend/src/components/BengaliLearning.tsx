import React, { useState, useEffect, useRef } from 'react';
import { 
  Languages, Volume2, Mic, Eraser, BookMarked, Award, 
  ChevronLeft, BookOpen, Compass, Search, CheckCircle2, 
  X, RefreshCw, Check, AlertCircle, ArrowRight, Keyboard 
} from 'lucide-react';
import { API_BASE_URL } from '../config';

interface BengaliProgress {
  id: number;
  userId: number;
  masteredLetters: string;
  masteredWords: string;
  spokenWordsCount: number;
  currentPhase: number;
  quizScores: string; // JSON string
  learningPlan: string;
  planStartDate: string | null;
  diagnosticScore: number | null;
  updatedAt: string;
}

const LITERATURE_PASSAGES = [
  {
    author: "Rabindranath Tagore",
    book: "Kabuliwala (কাবুলিওয়ালা)",
    title: "Mini and Kabuliwala",
    text: "আমার পাঁচ বছরের ছোট মেয়ে মিনি এক দণ্ড কথা না কহিয়া থাকিতে পারে না। পৃথিবীতে জন্মগ্রহণ করিয়া ভাষা শিক্ষা করিতে সে কেবল একটি বৎসর কাল ব্যয় করিয়াছিল, তাহার পর হইতে যতক্ষণ সে জাগিয়া থাকে এক মুহূর্ত মৌন হইয়া থাকা তাহার পক্ষে অসম্ভব। তাহার মা অনেক সময় ধমক দিয়া তাহার মুখ বন্ধ করিয়া দেয়, কিন্তু আমি তাহা পারি না। মিনি চুপ করিয়া থাকিলে কেমন এক রকম অস্বাভাবিক দেখায়, সেই জন্য তাহার বকবকানি আমি দীর্ঘকাল ধরিয়া সহ্য করিয়া আসি।",
    translation: "My five-year-old daughter Mini cannot stop talking for a single moment..."
  },
  {
    author: "Rabindranath Tagore",
    book: "Gitanjali (গীতাঞ্জলি)",
    title: "Let Pride Dissolve",
    text: "আমার মাথা নত করে দাও হে তোমার চরণধুলার تলে। সকল অহংকার আমার ডুবিয়ে দাও চোখের জলে। নিজেরে করিতে গৌরবদান নিজেরে কেবলই করি অপমান, আপনারে শুধু ঘেরিয়া ঘেরিয়া ঘুরিয়া মরি ক্ষণে ক্ষণে। সকল অহংকার আমার ডুবিয়ে দাও চোখের জলে।",
    translation: "Bow my head to the dust of your feet. Let all my pride dissolve in tears..."
  },
  {
    author: "Rabindranath Tagore",
    book: "Chuti (ছুটি)",
    title: "Phatik and the River Wood",
    text: "ফটিক চক্রবর্তীদের পাড়ায় নতুন একটি ছেলে আসিয়াছে, তাহার নাম মাখনলাল। সে ফটিকের কনিষ্ঠ ভ্রাতা। ফটিক তাহার সঙ্গীদের লইয়া নদীর ধারে আসিয়া উপস্থিত হইল। নদীর ধারে একটি প্রকাণ্ড শালকাষ্ঠ পড়িয়াছিল; সে কাঠটি নদীর উপর ভাসাইয়া লইয়া যাইবার জন্য সেখানে রাখা হইয়াছিল। ফটিকের দল স্থির করিল, তাহারা সকলে মিলিযা ঠেলিয়া কাঠটি নদীমধ্যে নিক্ষেপ করিবে।",
    translation: "A new boy named Makhanlal came to Phatik's neighborhood..."
  },
  {
    author: "Sukumar Ray",
    book: "Abol Tabol (আবোল তাবোল)",
    title: "Khichuri (The Blend)",
    text: "হাঁস ছিল সজারু, ব্যাকরণ মানি না, হয়ে গেল 'হাঁসজারু' কেমনে তা জানি না। বক কহে কচ্ছপে বাহবা বাহবা, ডিম্বটি চমৎকার, নয় কোনো ফাহবা! হাতি আর তিমি মিলে হল 'হাতিমি', জলে চলে স্থলে চলে নাহি কোনো খেদ যে। সিংহ আর হরিণের মিশেলে হল 'সিং হরিণ', মাথায় তার শিং গজায় দেখে লাগে ভয় যে।",
    translation: "A duck was combined with a porcupine..."
  },
  {
    author: "Sukumar Ray",
    book: "Abol Tabol (আবোল তাবোল)",
    title: "Baburam Sapure",
    text: "বাবুরাম সাপুড়ে, কোথা যাস্ বাপুরে? আয় বাবা দেখে যা, দুটো সাপ রেখে যা! যে সাপের চোখ নেই, শিং নেই, নোখ নেই, ছোটে না কি হাঁটে না, কাউকে যে কাটে না, করে নাকো ফোঁসফাঁস, মারে নাকো ঢোকঢাক, নেই কোনো উৎপাত, খায় শুধু দুধ-ভাত— সেই সাপ জ্যান্ত, গোটা দুই আন তো!",
    translation: "Baburam the snake charmer..."
  },
  {
    author: "Sukumar Ray",
    book: "HaJaBaRaLa (হযবরল)",
    title: "The Laughing Cat",
    text: "গ্রীষ্মকালের এক দুপুরবেলা। গরমে বুক ফেটে যাচ্ছে, ছাতি শুকিয়ে কাঠ হয়ে গেছে। আমি একটা গাছের ছায়ায় বসেছিলুম। এমন সময় হঠাৎ কোত্থেকে একটা বেড়াল এসে ফ্যাচফ্যাচ করে হাসতে লাগল। আমি বললুম, হাসছ কেন? বেড়ালটা বলল, হাসব না তো কী? তোমার মতন একটা বোকা মানুষের কাণ্ড দেখে কার না হাসি পায়!",
    translation: "A hot summer afternoon..."
  },
  {
    author: "Bibhutibhushan Banerjee",
    book: "Pather Panchali (পথের পাঁচালী)",
    title: "Apu and Durga",
    text: "অপু ও দুর্গা দুই ভাইবোন। দুর্গা বয়সে বড়, অপু ছোট। তাহারা গ্রামের ধূলিমাটি মাখিয়া গড়াগড়ি খাইয়া খেলা করে। গ্রামের চারিপাশে বাঁশবাগান, আমবাগান ও নানা বুনো লতাপাতার ঝোপঝাড়। দুর্গা বনে বুনো ফল তুলিয়া বেড়ায় আর অপুকে ডাক দিয়া বলে, 'অপু, দেখবি আয় কী এনেছি।' অপু চোখ গোল গোল করিয়া ছুটিয়া আসে। উহাদের শৈশব দারিদ্র্যের মধ্যে কাটিলেও প্রকৃতির অফুরন্ত স্নেহে ধন্য হইয়াছিল।",
    translation: "Apu and Durga are siblings..."
  },
  {
    author: "Bibhutibhushan Banerjee",
    book: "Chander Pahar (চাঁদের পাহাড়)",
    title: "Shankar's Dream",
    text: "শঙ্কর রায়চৌধুরী নামক এক বাঙালি যুবকের আফ্রিকার গভীর জঙ্গলে অ্যাডভেঞ্চারের রোমাঞ্চকর কাহিনী। শঙ্কর স্বপ্ন দেখিত দেশ-দেশান্তর ঘুরিয়া বেড়াইবার। তাহার সুযোগ ঘটিল যখন সে পূর্ব আফ্রিকায় রেলওয়েতে চাকরি পাইল। কিন্তু সেখানে তাহার জন্য অপেক্ষা করিতেছিল ভয়ানক সিংহ, বিষাক্ত সাপ আর রহস্যময় বুনিপের গুহা। শঙ্কর অসীম সাহসের সহিত সকল বিপদের মোকাবেলা করিল।",
    translation: "The thrilling adventure of Shankar..."
  },
  {
    author: "Satyajit Ray",
    book: "Feluda (ফেলুদা)",
    title: "Feluda's Brainpower",
    text: "ফেলুদার আসল নাম প্রদোষচন্দ্র মিত্র। সে এক অদ্ভুত গোয়েন্দা। তাহার তীক্ষ্ণ বুদ্ধি ও পর্যবেক্ষণ ক্ষমতার জন্য সে অতি কঠিন রহস্যের সমাধান করে। ফেলুদা লণ্ডন বা অন্য কোনো দেশের গোয়েন্দাদের মতো পিস্তল ব্যবহার করিতে ভালোবাসে না, তাহার প্রধান অস্ত্র হইল মগজাস্ত্র। তাহার সহযোগী তোপসে এবং জটায়ু সর্বদাই তাহার পাশে থাকে। ফেলুদার প্রতিটি অভিযান রোমাঞ্চকর।",
    translation: "Feluda's real name is Pradosh Chandra Mitter..."
  },
  {
    author: "Satyajit Ray",
    book: "Professor Shonku (প্রফেসর শঙ্কু)",
    title: "Shonku's Laboratory",
    text: "প্রফেসর ত্রিলোকেশ্বর শঙ্কু একজন বিশ্ববিখ্যাত বিজ্ঞানী ও আবিষ্কারক। তিনি গিরিডিতে তাঁহার গবেষণাগারে বসিয়া অদ্ভুত সব বৈজ্ঞানিক যন্ত্র আবিষ্কার করেন। তাঁহার আবিষ্কারের তালিকায় রহিয়াছে মিরাকিউর বড়ি যা সর্বরোগনাশক, এবং অ্যানিহিলেশন গান যা যে কোনো বস্তুকে অদৃশ্য করিয়া দেয়। প্রফেসর শঙ্কু তাঁহার বিড়াল নিউটনকে লইয়া নানাবিধ বৈজ্ঞানিক পরীক্ষা-নিরীক্ষা চালান।",
    translation: "Professor Trilokeshwar Shonku is a world-famous scientist..."
  }
];

const DIAGNOSTIC_QUESTIONS = [
  {
    question: "What phonetic sound does 'অ' make?",
    options: ["O (as in hot)", "Aa (as in far)", "Ee (as in meet)", "U (as in put)"],
    correct: 0
  },
  {
    question: "Which character represents the sound 'Aa' (as in 'far')?",
    options: ["অ", "আ", "ই", "উ"],
    correct: 1
  },
  {
    question: "Identify the consonant 'ক'. How is it pronounced?",
    options: ["Ko", "Kho", "Go", "Gho"],
    correct: 0
  },
  {
    question: "What phonetic sound does the consonant 'ম' make?",
    options: ["Mo", "No", "Po", "Bo"],
    correct: 0
  },
  {
    question: "Translate the word 'বই' (Boi) to English.",
    options: ["Book", "Pen", "Water", "House"],
    correct: 0
  },
  {
    question: "Translate the word 'জল' (Jol) to English.",
    options: ["Water", "Fire", "Bread", "Milk"],
    correct: 0
  },
  {
    question: "What is the Bengali word for 'Fish'?",
    options: ["মাছ (Machh)", "পাখি (Pakhi)", "ফুল (Phul)", "ফল (Phol)"],
    correct: 0
  },
  {
    question: "Translate the sentence: 'আমি বই পড়ি।'",
    options: ["I read books.", "I write letters.", "I eat rice.", "I go home."],
    correct: 0
  },
  {
    question: "Translate the sentence: 'আমি ভাত খাই।'",
    options: ["I eat rice.", "I drink water.", "I read books.", "I sleep."],
    correct: 0
  },
  {
    question: "What is the Bengali word for 'Sun'?",
    options: ["সূর্য (Surjo)", "চাঁদ (Chaand)", "নদী (Nodi)", "পাহাড় (Pahar)"],
    correct: 0
  }
];

const VOWELS = [
  { letter: "অ", sound: "O", desc: "Short 'o' as in hot", example: "অজগর", exTrans: "Python (snake)" },
  { letter: "আ", sound: "Aa", desc: "Long 'a' as in far", example: "আম", exTrans: "Mango" },
  { letter: "ই", sound: "I", desc: "Short 'i' as in pin", example: "ইঁদুর", exTrans: "Mouse" },
  { letter: "ঈ", sound: "Ee", desc: "Long 'e' as in meet", example: "ঈগল", exTrans: "Eagle" },
  { letter: "উ", sound: "U", desc: "Short 'u' as in put", example: "উট", exTrans: "Camel" },
  { letter: "ঊ", sound: "Uu", desc: "Long 'oo' as in boot", example: "ঊষা", exTrans: "Dawn" },
  { letter: "ঋ", sound: "Ri", desc: "Vocalic 'r' as in rhythm", example: "ঋষি", exTrans: "Sage" },
  { letter: "এ", sound: "E", desc: "Short 'e' as in play", example: "একতারা", exTrans: "One-stringed instrument" },
  { letter: "ঐ", sound: "Oi", desc: "Diphthong 'oy' as in boy", example: "ঐরাবত", exTrans: "Elephant" },
  { letter: "ও", sound: "O", desc: "Close-mid 'o' as in note", example: "ওল", exTrans: "Yam" },
  { letter: "ঔ", sound: "Ou", desc: "Diphthong 'ow' as in house", example: "ঔষধ", exTrans: "Medicine" }
];

const CONSONANTS = [
  { letter: "ক", sound: "Ko", desc: "Unaspirated 'k'", example: "কলা", exTrans: "Banana" },
  { letter: "খ", sound: "Kho", desc: "Aspirated 'k'", example: "খাতা", exTrans: "Notebook" },
  { letter: "গ", sound: "Go", desc: "Unaspirated 'g'", example: "গরু", exTrans: "Cow" },
  { letter: "ঘ", sound: "Gho", desc: "Aspirated 'g'", example: "ঘর", exTrans: "House" },
  { letter: "ঙ", sound: "Ungo", desc: "Nasal 'ng'", example: "ব্যাং", exTrans: "Frog" },
  { letter: "চ", sound: "Cho", desc: "Unaspirated 'ch' as in chat", example: "চশমা", exTrans: "Glasses" },
  { letter: "ছ", sound: "Chho", desc: "Aspirated 'ch'", example: "ছাতা", exTrans: "Umbrella" },
  { letter: "জ", sound: "Jo", desc: "Unaspirated 'j'", example: "জল", exTrans: "Water" },
  { letter: "ঝ", sound: "Jho", desc: "Aspirated 'j'", example: "ঝুড়ি", exTrans: "Basket" },
  { letter: "ঞ", sound: "Nyo", desc: "Palatal nasal 'ny'", example: "মিয়াঁ", exTrans: "Mister" },
  { letter: "ট", sound: "To", desc: "Retroflex 't'", example: "টমেটো", exTrans: "Tomato" },
  { letter: "ঠ", sound: "Tho", desc: "Retroflex 'th'", example: "ठेলাগাড়ি", exTrans: "Pushcart" },
  { letter: "ড", sound: "Do", desc: "Retroflex 'd'", example: "ডাব", exTrans: "Green Coconut" },
  { letter: "ঢ", sound: "Dho", desc: "Retroflex 'dh'", example: "ঢাক", exTrans: "Drum" },
  { letter: "ণ", sound: "No", desc: "Retroflex 'n'", example: "হরিণ", exTrans: "Deer" },
  { letter: "ত", sound: "To", desc: "Dental 't'", example: "তবলা", exTrans: "Tabla drums" },
  { letter: "থ", sound: "Tho", desc: "Dental 'th'", example: "থালা", exTrans: "Plate" },
  { letter: "দ", sound: "Do", desc: "Dental 'd'", example: "দই", exTrans: "Yogurt" },
  { letter: "ধ", sound: "Dho", desc: "Dental 'dh'", example: "ধান", exTrans: "Rice paddy" },
  { letter: "ন", sound: "No", desc: "Dental 'n'", example: "নৌকা", exTrans: "Boat" },
  { letter: "প", sound: "Po", desc: "Unaspirated 'p'", example: "পাখি", exTrans: "Bird" },
  { letter: "ফ", sound: "Pho", desc: "Aspirated 'p' / 'f'", example: "ফুল", exTrans: "Flower" },
  { letter: "ব", sound: "Bo", desc: "Unaspirated 'b'", example: "বই", exTrans: "Book" },
  { letter: "ভ", sound: "Vho", desc: "Aspirated 'b' / 'v'", example: "ভাত", exTrans: "Cooked rice" },
  { letter: "ম", sound: "Mo", desc: "Labial 'm'", example: "মাছ", exTrans: "Fish" },
  { letter: "য", sound: "Yo", desc: "Unvoiced palatal 'y'", example: "যাতা", exTrans: "Grindstone" },
  { letter: "র", sound: "Ro", desc: "Alveolar flap 'r'", example: "রথ", exTrans: "Chariot" },
  { letter: "ল", sound: "Lo", desc: "Lateral 'l'", example: "লাটিম", exTrans: "Spinning top" },
  { letter: "শ", sound: "Sho", desc: "Palatal 'sh'", example: "শাপলা", exTrans: "Water lily" },
  { letter: "ষ", sound: "Sho", desc: "Retroflex 'sh'", example: "ষাঁড়", exTrans: "Bull" },
  { letter: "স", sound: "So", desc: "Dental 's'", example: "সবুজ", exTrans: "Green" },
  { letter: "হ", sound: "Ho", desc: "Glottal 'h'", example: "হাতি", exTrans: "Elephant" },
  { letter: "ড়", sound: "Ro", desc: "Retroflex flap 'r'", example: "পাহাড়", exTrans: "Mountain" },
  { letter: "ঢ়", sound: "Rho", desc: "Aspirated retroflex flap 'r'", example: "আষাঢ়", exTrans: "Monsoon month" },
  { letter: "য়", sound: "Yo", desc: "Semi-vowel 'y'", example: "আয়না", exTrans: "Mirror" },
  { letter: "ৎ", sound: "Khanda-Ta", desc: "Final unreleased 't'", example: "শরৎ", exTrans: "Autumn" },
  { letter: "ং", sound: "Anusvara", desc: "Nasal sound 'ng'", example: "সিংহ", exTrans: "Lion" },
  { letter: "ঃ", sound: "Visarga", desc: "Voiceless h-like echo", example: "দুঃখ", exTrans: "Sadness" },
  { letter: "ঁ", sound: "Chandrabindu", desc: "Nasalization of vowel", example: "চাঁদ", exTrans: "Moon" }
];

const VOCAB_WORDS = [
  { word: "বই", sound: "Boi", meaning: "Book" },
  { word: "জল", sound: "Jol", meaning: "Water" },
  { word: "কলম", sound: "Kolom", meaning: "Pen" },
  { word: "বাড়ি", sound: "Bari", meaning: "House" },
  { word: "মাছ", sound: "Machh", meaning: "Fish" },
  { word: "পাখি", sound: "Pakhi", meaning: "Bird" },
  { word: "ফুল", sound: "Phul", meaning: "Flower" },
  { word: "সূর্য", sound: "Surjo", meaning: "Sun" },
  { word: "নদী", sound: "Nodi", meaning: "River" },
  { word: "ফল", sound: "Phol", meaning: "Fruit" }
];

const SENTENCES = [
  { bengali: "আমি বই পড়ি।", pronunciation: "Ami boi pori.", translation: "I read books." },
  { bengali: "সে জল চায়।", pronunciation: "She jol chay.", translation: "He/She wants water." },
  { bengali: "আমাদের একটি সুন্দর বাড়ি আছে।", pronunciation: "Amader ekti sundor bari achhe.", translation: "We have a beautiful house." },
  { bengali: "আমি মাছ খেতে ভালোবাসি।", pronunciation: "Ami machh khete bhalobashi.", translation: "I love to eat fish." },
  { bengali: "আকাশে সূর্য উঠেছে।", pronunciation: "Akashe surjo uthechhe.", translation: "The sun has risen in the sky." }
];

export default function BengaliLearning({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<BengaliProgress | null>(null);
  
  // Navigation states
  const [view, setView] = useState<'onboarding' | 'diagnostic-test' | 'diagnostic-results' | 'plan-select' | 'dashboard' | 'phase1' | 'phase2' | 'phase3' | 'flashcards'>('onboarding');
  
  // Placement Test states
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [diagnosticAnswers, setDiagnosticAnswers] = useState<number[]>([]);
  
  // Drawing Canvas states
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  // Letter overlay detail
  const [selectedLetter, setSelectedLetter] = useState<typeof VOWELS[0] | null>(null);
  const [letterTab, setLetterTab] = useState<'vowels' | 'consonants'>('vowels');

  // Flashcards state
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardDeck, setFlashcardDeck] = useState<any[]>([]);
  const [flashcardXP, setFlashcardXP] = useState(0);
  
  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechSuccess, setSpeechSuccess] = useState<boolean | null>(null);
  const [spokenText, setSpokenText] = useState("");
  const [micError, setMicError] = useState("");
  const recognitionRef = useRef<any>(null);

  // Google Books search state
  const [bookQuery, setBookQuery] = useState("Rabindranath Tagore");
  const [searchedBooks, setSearchedBooks] = useState<any[]>([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [addedBooks, setAddedBooks] = useState<number[]>([]);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);

  // Phase Quizzes states
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [currentQuizQ, setCurrentQuizQ] = useState(0);
  const [quizSelectedAns, setQuizSelectedAns] = useState<number | null>(null);

  // Wikipedia Search states
  const [wikiQuery, setWikiQuery] = useState("রবীন্দ্রনাথ ঠাকুর");
  const [wikiExtract, setWikiExtract] = useState("");
  const [wikiTitle, setWikiTitle] = useState("");
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [wikiError, setWikiError] = useState("");
  const [hasAwardedWikiXP, setHasAwardedWikiXP] = useState(false);

  // Typing Practice states
  const [typingTarget, setTypingTarget] = useState<{ text: string, type: 'word' | 'sentence', pronunciation?: string, translation?: string } | null>(null);
  const [typingInput, setTypingInput] = useState("");
  const [typingSuccess, setTypingSuccess] = useState<boolean | null>(null);

  // Literature states
  const [litAuthor, setLitAuthor] = useState("All");
  const [litExtract, setLitExtract] = useState("");
  const [litTitle, setLitTitle] = useState("");
  const [litError, setLitError] = useState("");
  const [hasAwardedLitXP, setHasAwardedLitXP] = useState(false);
  
  useEffect(() => {
    fetchProgress();
  }, [token]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setProgress(data);
      if (data.learningPlan) {
        setView('dashboard');
      } else {
        setView('onboarding');
      }
    } catch (err) {
      console.error("Error loading progress:", err);
    } finally {
      setLoading(false);
    }
  };

  // Web Speech API Pronunciation
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      // Clear previous spoken items
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'bn-BD';
      
      // Try to find a Bengali voice specifically
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find(voice => voice.lang.startsWith('bn'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in this browser.");
    }
  };

  // Web Speech Recognition
  const startSpeechRecognition = (targetWord: string) => {
    setMicError("");
    setSpeechSuccess(null);
    setSpokenText("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError("Speech recognition is not supported in this browser.");
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.lang = 'bn-BD';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setSpokenText(transcript);
        
        // Clean both strings of punctuation for comparison
        const cleanTranscript = transcript.replace(/[।,.:?!]/g, '').trim();
        const cleanTarget = targetWord.replace(/[।,.:?!]/g, '').trim();

        if (cleanTranscript === cleanTarget || cleanTranscript.includes(cleanTarget) || cleanTarget.includes(cleanTranscript)) {
          setSpeechSuccess(true);
          // Award XP
          try {
            const res = await fetch(`${API_BASE_URL}/api/progress/bengali/word`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ word: targetWord, mastered: false, isSpoken: true })
            });
            const data = await res.json();
            setProgress(data);
          } catch (e) {
            console.error("Error saving speaking progress", e);
          }
        } else {
          setSpeechSuccess(false);
        }
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          setMicError("Microphone access denied. Please check permissions.");
        } else {
          setMicError(`Speech error: ${event.error}`);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (e) {
      console.error(e);
      setMicError("Failed to initiate microphone.");
    }
  };

  // Google Books Search preconfigured for Bengali
  const searchBengaliBooks = async () => {
    if (!bookQuery.trim()) return;
    try {
      setSearchingBooks(true);
      const res = await fetch(`${API_BASE_URL}/api/books/google-search?q=${encodeURIComponent(bookQuery)}&lang=bn`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSearchedBooks(data);
    } catch (e) {
      console.error("Search books error", e);
    } finally {
      setSearchingBooks(false);
    }
  };

  const addBookToShelf = async (book: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          genre: book.genre || 'Bengali Literature',
          coverUrl: book.coverUrl,
          status: 'Want to Read'
        })
      });
      if (res.ok) {
        setAddedBooks(prev => [...prev, book.googleId]);
        setSearchSuccess(`"${book.title}" added to your Reading Shelf!`);
        setTimeout(() => setSearchSuccess(null), 3000);
      }
    } catch (e) {
      console.error("Add book error", e);
    }
  };

  const fetchWikiPassage = async (titleStr: string) => {
    setLoadingWiki(true);
    setWikiError("");
    setWikiExtract("");
    setWikiTitle("");
    setHasAwardedWikiXP(false);

    try {
      const url = `https://bn.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=extracts&exsentences=5&explaintext=true&titles=${encodeURIComponent(titleStr)}`;
      const response = await fetch(url);
      const data = await response.json();
      
      const pages = data.query?.pages;
      if (!pages) {
        setWikiError("No pages found on Wikipedia.");
        return;
      }
      
      const pageId = Object.keys(pages)[0];
      if (pageId === "-1") {
        setWikiError("No article found matching that title. Please try another term in Bengali.");
        return;
      }

      const page = pages[pageId];
      setWikiTitle(page.title);
      setWikiExtract(page.extract);
    } catch (e) {
      console.error(e);
      setWikiError("Failed to connect to Wikipedia. Check your network.");
    } finally {
      setLoadingWiki(false);
    }
  };

  const awardWikiXP = async () => {
    if (hasAwardedWikiXP) return;
    setHasAwardedWikiXP(true);
    try {
      await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase: 3, score: 0 })
      });
      fetchProgress();
    } catch (e) {
      console.error(e);
    }
  };

  const checkTypingResult = async () => {
    if (!typingTarget) return;
    
    const cleanTarget = typingTarget.text.trim().replace(/[।.?!,]/g, "");
    const cleanInput = typingInput.trim().replace(/[।.?!,]/g, "");
    
    const isCorrect = cleanTarget === cleanInput;
    setTypingSuccess(isCorrect);
    
    if (isCorrect) {
      try {
        await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phase: progress?.currentPhase || 2, score: 0 })
        });
        fetchProgress();
      } catch (e) {
        console.error(e);
      }
    }
  };


  const awardLitXP = async () => {
    if (hasAwardedLitXP) return;
    setHasAwardedLitXP(true);
    try {
      await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase: 3, score: 0 })
      });
      fetchProgress();
    } catch (e) {
      console.error(e);
    }
  };

  // Onboarding Selection
  const selectLearningPlan = async (plan: string) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      setProgress(data);
      setView('dashboard');
    } catch (e) {
      console.error("Failed to select plan", e);
    } finally {
      setLoading(false);
    }
  };

  // Placement Test Actions
  const handleDiagnosticAnswer = (index: number) => {
    const updated = [...diagnosticAnswers, index];
    setDiagnosticAnswers(updated);
    if (diagnosticStep + 1 < DIAGNOSTIC_QUESTIONS.length) {
      setDiagnosticStep(prev => prev + 1);
    } else {
      // Calculate score
      let score = 0;
      updated.forEach((ans, idx) => {
        if (ans === DIAGNOSTIC_QUESTIONS[idx].correct) score++;
      });
      saveDiagnosticScore(score);
    }
  };

  const saveDiagnosticScore = async (score: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/diagnostic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ score })
      });
      const data = await res.json();
      setProgress(data);
      setView('diagnostic-results');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRecommendedPlan = (score: number | null) => {
    if (score === null) return { name: "3-Month Plan", code: "3-month", reason: "Standard paced learning." };
    if (score <= 3) {
      return { 
        name: "6-Month Plan (Deep Study)", 
        code: "6-month", 
        reason: "You scored beginner. Starting with writing stroke order, fundamental phonics, and spaced compound letters will lay a solid foundation." 
      };
    } else if (score <= 7) {
      return { 
        name: "3-Month Plan (Standard)", 
        code: "3-month", 
        reason: "You show intermediate understanding! This balanced plan will focus on grammar rules, daily conversational vocabulary, and speaking checks." 
      };
    } else {
      return { 
        name: "2-Month Plan (Intensive)", 
        code: "2-month", 
        reason: "Excellent! You already know the basics. This accelerated track will jump directly to literature reading, sentence structures, and fluid speech checks." 
      };
    }
  };

  // Mastery toggles
  const toggleLetterMastery = async (letter: string, isMastered: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ letter, mastered: !isMastered })
      });
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWordMastery = async (word: string, isMastered: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/word`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ word, mastered: !isMastered, isSpoken: false })
      });
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Phase update
  const updatePhase = async (phase: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/phase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase })
      });
      const data = await res.json();
      setProgress(data);
      setView(`phase${phase}` as any);
    } catch (e) {
      console.error(e);
      setView(`phase${phase}` as any);
    }
  };

  // Drawing Canvas setup
  useEffect(() => {
    if (selectedLetter && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 300 * 2; // high res
      canvas.height = 300 * 2;
      canvas.style.width = '300px';
      canvas.style.height = '300px';

      const context = canvas.getContext('2d');
      if (context) {
        context.scale(2, 2);
        context.lineCap = 'round';
        context.strokeStyle = 'var(--color-primary)';
        context.lineWidth = 6;
        contextRef.current = context;
        
        // Draw the background watermark letter
        context.font = 'bold 150px Merriweather, serif';
        context.fillStyle = 'rgba(140, 74, 50, 0.1)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(selectedLetter.letter, 150, 140);
      }
    }
  }, [selectedLetter]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    let clientX, clientY;
    if ('touches' in nativeEvent) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect && contextRef.current) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = ({ nativeEvent }: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !contextRef.current) return;
    
    let clientX, clientY;
    if ('touches' in nativeEvent) {
      clientX = nativeEvent.touches[0].clientX;
      clientY = nativeEvent.touches[0].clientY;
    } else {
      clientX = nativeEvent.clientX;
      clientY = nativeEvent.clientY;
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    }
    
    // Prevent scrolling on mobile touch
    if (nativeEvent.cancelable) {
      nativeEvent.preventDefault();
    }
  };

  const stopDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
    }
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && contextRef.current && selectedLetter) {
      contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw watermark
      contextRef.current.font = 'bold 150px Merriweather, serif';
      contextRef.current.fillStyle = 'rgba(140, 74, 50, 0.1)';
      contextRef.current.textAlign = 'center';
      contextRef.current.textBaseline = 'middle';
      contextRef.current.fillText(selectedLetter.letter, 150, 140);
    }
  };

  // Flashcards Setup
  const initiateFlashcards = () => {
    // Combine vowels and basic vocab for a nice deck
    const deck = [
      ...VOWELS.slice(0, 5).map(v => ({ type: 'letter', value: v.letter, sound: v.sound, meaning: v.desc, ex: v.example, exT: v.exTrans })),
      ...VOCAB_WORDS.slice(0, 5).map(w => ({ type: 'word', value: w.word, sound: w.sound, meaning: w.meaning, ex: "", exT: "" }))
    ];
    // Shuffle
    deck.sort(() => Math.random() - 0.5);
    setFlashcardDeck(deck);
    setFlashcardIndex(0);
    setIsFlipped(false);
    setFlashcardXP(0);
    setView('flashcards');
  };

  const handleFlashcardKnow = async (know: boolean) => {
    if (know) {
      setFlashcardXP(prev => prev + 2);
    }
    setIsFlipped(false);
    
    setTimeout(() => {
      if (flashcardIndex + 1 < flashcardDeck.length) {
        setFlashcardIndex(prev => prev + 1);
      } else {
        // Deck finished, award XP
        awardFlashcardXP();
      }
    }, 200);
  };

  const awardFlashcardXP = async () => {
    if (flashcardXP > 0) {
      try {
        // Send a dummy letter mastery with high XP or create custom endpoint
        // Let's use the toggleLetterMastery API logic to quietly trigger progress update or just log word
        await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ phase: progress?.currentPhase || 1, score: 0 }) // dummy trigger to refresh profile
        });
      } catch (e) {
        console.error(e);
      }
    }
    fetchProgress();
  };

  // Phase Quiz Setup
  const startPhaseQuiz = () => {
    setQuizScore(0);
    setCurrentQuizQ(0);
    setQuizSelectedAns(null);
    setShowQuiz(true);
  };

  const handleQuizAnswer = (optionIdx: number) => {
    setQuizSelectedAns(optionIdx);
  };

  const submitQuizAnswer = () => {
    if (quizSelectedAns === null) return;
    
    const isCorrect = quizSelectedAns === DIAGNOSTIC_QUESTIONS[currentQuizQ].correct;
    if (isCorrect) setQuizScore(prev => prev + 1);

    setTimeout(() => {
      if (currentQuizQ + 1 < 5) { // 5 questions per quiz
        setCurrentQuizQ(prev => prev + 1);
        setQuizSelectedAns(null);
      } else {
        // Finished
        saveQuizResults();
      }
    }, 800);
  };

  const saveQuizResults = async () => {
    const finalPercentage = Math.round((quizScore / 5) * 100);
    try {
      const res = await fetch(`${API_BASE_URL}/api/progress/bengali/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ phase: progress?.currentPhase || 1, score: finalPercentage })
      });
      const data = await res.json();
      setProgress(data);
    } catch (e) {
      console.error(e);
    }
  };

  // Render Plan Progress & Weeks
  const getWeeksElapsed = () => {
    if (!progress?.planStartDate) return 1;
    const start = new Date(progress.planStartDate).getTime();
    const now = new Date().getTime();
    const elapsedDays = Math.floor((now - start) / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.floor(elapsedDays / 7) + 1);
  };

  if (loading) {
    return <div className="text-center" style={{ marginTop: '50px' }}>Loading Bengali Study Module...</div>;
  }

  // ----------------------------------------------------
  // VIEW: Onboarding Welcome Screen
  // ----------------------------------------------------
  if (view === 'onboarding') {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }} className="flex flex-col">
        <div className="text-center mb-6">
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--color-primary-light)', 
            color: 'white',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Languages size={32} />
          </div>
          <h1 className="font-serif mb-2" style={{ fontSize: '32px' }}>বাংলা শিখুন</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>
            Welcome to the Bengali learning corner. Expand your bilingual horizons through classic literary study.
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <h3 className="font-serif mb-2" style={{ fontSize: '18px' }}>Placement Assessment</h3>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            If you have some experience reading or speaking Bengali, take a quick 10-question placement quiz. We will recommend the perfect study timeline.
          </p>
          <button 
            onClick={() => setView('diagnostic-test')}
            className="btn-primary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Take 5-Min Diagnostic <ArrowRight size={16} />
          </button>
        </div>

        <div className="text-center">
          <button 
            onClick={() => setView('plan-select')}
            style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'underline' }}
          >
            I want to select a plan directly
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Diagnostic Placement Test
  // ----------------------------------------------------
  if (view === 'diagnostic-test') {
    const q = DIAGNOSTIC_QUESTIONS[diagnosticStep];
    const progressPercent = Math.round(((diagnosticStep) / DIAGNOSTIC_QUESTIONS.length) * 100);

    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('onboarding')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Diagnostic Quiz (Question {diagnosticStep + 1} of {DIAGNOSTIC_QUESTIONS.length})
          </span>
        </div>

        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px', marginBottom: '32px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--color-primary)', transition: 'width 0.3s' }} />
        </div>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '24px'
        }}>
          <h2 className="font-serif mb-6" style={{ fontSize: '22px' }}>{q.question}</h2>
          
          <div className="flex flex-col gap-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleDiagnosticAnswer(idx)}
                style={{
                  textAlign: 'left',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontSize: '15px',
                  fontWeight: 500,
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                  e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Diagnostic Quiz Results
  // ----------------------------------------------------
  if (view === 'diagnostic-results') {
    const recommended = getRecommendedPlan(progress?.diagnosticScore ?? 0);
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <h1 className="font-serif mb-2 text-center" style={{ fontSize: '28px' }}>Diagnostic Complete</h1>
        <p className="text-center mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Here is your language proficiency diagnostic summary.
        </p>

        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '32px 24px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            Your Placement Score
          </div>
          <div className="font-serif" style={{ fontSize: '48px', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '24px' }}>
            {progress?.diagnosticScore} / 10
          </div>

          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-full)', 
            backgroundColor: 'rgba(140, 74, 50, 0.08)',
            color: 'var(--color-primary)',
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            <Award size={18} /> Recommended: {recommended.name}
          </div>

          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
            {recommended.reason}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => selectLearningPlan(recommended.code)}
            className="btn-primary"
            style={{ width: '100%' }}
          >
            Enroll in Recommended Plan ({recommended.name})
          </button>
          
          <button 
            onClick={() => setView('plan-select')}
            className="btn-secondary"
            style={{ width: '100%' }}
          >
            Review all learning plans
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Plan Selector (Timeline Choices)
  // ----------------------------------------------------
  if (view === 'plan-select') {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('onboarding')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '24px' }}>Select Learning Plan</h1>
        </div>

        <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Choose a timeline that fits your study cadence. Each plan is tailored with specific milestone targets:
        </p>

        <div className="flex flex-col gap-4 mb-6">
          {/* Plan 2 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('2-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>2-Month Plan (Intensive)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>8 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              Designed for quick script mastery and immediate reading start. Good if you already know basic phonetics.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-2:</strong> Shorboborno & Byonjonborno alphabets<br />
              <strong>W3-5:</strong> Spoken vocabulary checks & writing practice<br />
              <strong>W6-8:</strong> Simple sentences & search classic texts
            </div>
          </div>

          {/* Plan 3 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('3-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>3-Month Plan (Standard)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>12 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              The standard track. Balanced pace focusing on letters, vocabulary building, pronunciation, and reading.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-4:</strong> Script writing, pronunciations & vowels<br />
              <strong>W5-8:</strong> 100+ Vocabulary words & microphone speaking checks<br />
              <strong>W9-12:</strong> Short conversations & library book collection search
            </div>
          </div>

          {/* Plan 6 Month */}
          <div style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer',
            transition: 'border 0.2s'
          }}
          onClick={() => selectLearningPlan('6-month')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>6-Month Plan (Deep Study)</h3>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>24 weeks</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>
              An immersive path. Deep focus on reading flow, calligraphy stroke orders, compound conjunct letters, and Tagore poetry study.
            </p>
            <div style={{ fontSize: '12px', paddingLeft: '8px', borderLeft: '2px solid var(--color-primary-light)' }}>
              <strong>W1-6:</strong> Complete letter-drawing strokes & pronunciation details<br />
              <strong>W7-14:</strong> Comprehensive grammar, vocabulary, and microphone dialogue<br />
              <strong>W15-24:</strong> Translate Bengali short stories & add literature to Shelf
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Main Bengali Dashboard
  // ----------------------------------------------------
  if (view === 'dashboard') {
    const planName = progress?.learningPlan === '2-month' ? '2-Month Plan (Intensive)' : 
                     progress?.learningPlan === '3-month' ? '3-Month Plan (Standard)' : 
                     '6-Month Plan (Deep Study)';
    
    const weeksElapsed = getWeeksElapsed();
    const totalWeeks = progress?.learningPlan === '2-month' ? 8 : 
                       progress?.learningPlan === '3-month' ? 12 : 24;

    const progressPercentage = Math.round((weeksElapsed / totalWeeks) * 100);

    // Dynamic focus based on plan and active week
    let currentFocus = "Study basic vowels and consonants.";
    if (progress?.learningPlan === '2-month') {
      if (weeksElapsed <= 2) currentFocus = "Phase 1: Memorizing vowels & consonants.";
      else if (weeksElapsed <= 5) currentFocus = "Phase 2: Master 50 vocabulary words and pronunciation.";
      else currentFocus = "Phase 3: Read simple Bengali sentences & find literature classics.";
    } else if (progress?.learningPlan === '3-month') {
      if (weeksElapsed <= 4) currentFocus = "Phase 1: Alphabet drawing strokes & basic sounds.";
      else if (weeksElapsed <= 8) currentFocus = "Phase 2: Master 100 core vocabulary words and microphone checks.";
      else currentFocus = "Phase 3: Conversational sentence matching & search Bengali books.";
    } else {
      if (weeksElapsed <= 6) currentFocus = "Phase 1: Calligraphy stroke-order details & compounds.";
      else if (weeksElapsed <= 14) currentFocus = "Phase 2: Advanced vocabulary words, grammar, and pronunciation.";
      else currentFocus = "Phase 3: Literary translations, poetry, and book-shelf collection.";
    }

    const masteredLCount = progress?.masteredLetters ? progress.masteredLetters.split(',').filter(Boolean).length : 0;
    const masteredWCount = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean).length : 0;

    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 className="font-serif" style={{ fontSize: '28px' }}>বাংলা পাঠশালা</h1>
          <button 
            onClick={() => setView('plan-select')}
            style={{ fontSize: '11px', color: 'var(--color-primary)', textDecoration: 'underline' }}
          >
            Change Plan
          </button>
        </div>

        {/* Plan Progress Card */}
        <div style={{
          backgroundColor: 'var(--color-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
            <span>Active: <strong>{planName}</strong></span>
            <span>Week {weeksElapsed} of {totalWeeks}</span>
          </div>
          
          <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-bg)', borderRadius: '3px', marginBottom: '16px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(100, progressPercentage)}%`, height: '100%', backgroundColor: 'var(--color-primary)', borderRadius: '3px' }} />
          </div>

          <div style={{ fontSize: '13px', backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--color-primary)' }}>
            <strong>Current Target:</strong> {currentFocus}
          </div>
        </div>

        {/* Study Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div 
            onClick={() => initiateFlashcards()}
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <RefreshCw size={28} color="var(--color-primary)" className="mb-2" />
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Flashcards</h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Quick Study Review</span>
          </div>

          <div 
            onClick={() => {
              const currentP = progress?.currentPhase || 1;
              setView(`phase${currentP}` as any);
            }}
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '20px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
          >
            <Compass size={28} color="var(--color-primary)" className="mb-2" />
            <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Active Phase</h4>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Resume Phase {progress?.currentPhase || 1}</span>
          </div>
        </div>

        {/* Phases Tracker */}
        <h3 className="font-serif mb-3" style={{ fontSize: '18px' }}>Learning Phases</h3>
        <div className="flex flex-col gap-3">
          {/* Phase 1 Card */}
          <div 
            onClick={() => updatePhase(1)}
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${progress?.currentPhase === 1 ? 'var(--color-primary)' : 'var(--color-border)'}`,
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              width: '100%'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                  PHASE 1
                </span>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Basic Alphabets</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Master {masteredLCount} / 50 vowels and consonants. Practice strokes & sounds.
              </div>
            </div>
            <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
          </div>

          {/* Phase 2 Card */}
          <div 
            onClick={() => updatePhase(2)}
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${progress?.currentPhase === 2 ? 'var(--color-primary)' : 'var(--color-border)'}`,
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              width: '100%'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                  PHASE 2
                </span>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Words & Speech Recognition</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Learn {masteredWCount} / 10 words. Practice speaking via microphone check.
              </div>
            </div>
            <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
          </div>

          {/* Phase 3 Card */}
          <div 
            onClick={() => updatePhase(3)}
            style={{
              backgroundColor: 'var(--color-surface)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${progress?.currentPhase === 3 ? 'var(--color-primary)' : 'var(--color-border)'}`,
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'between',
              width: '100%'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                  PHASE 3
                </span>
                <span style={{ fontWeight: 600, fontSize: '15px' }}>Sentences & Literary Search</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Practice reading sentences. Search and save Bengali literature.
              </div>
            </div>
            <ChevronLeft style={{ transform: 'rotate(180deg)', color: 'var(--color-text-muted)' }} size={20} />
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Flashcards Study Quiz
  // ----------------------------------------------------
  if (view === 'flashcards') {
    if (flashcardDeck.length === 0) return null;
    const card = flashcardDeck[flashcardIndex];
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }} className="flex flex-col items-center">
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Flashcards Study (Card {flashcardIndex + 1} of {flashcardDeck.length})
          </span>
        </div>

        {/* 3D Flipping Flashcard */}
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{
            perspective: '1000px',
            width: '300px',
            height: '240px',
            cursor: 'pointer',
            marginBottom: '32px'
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transition: 'transform 0.6s',
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'none',
          }}>
            {/* Front Side */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: 'var(--color-surface)',
              border: '2px dashed var(--color-primary-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)'
            }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                {card.type}
              </span>
              <span className="font-serif" style={{ fontSize: '64px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {card.value}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
                (Tap to Flip)
              </span>
            </div>

            {/* Back Side */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              backgroundColor: 'var(--color-surface)',
              border: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              transform: 'rotateY(180deg)',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h2 className="font-serif mb-1" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>{card.sound}</h2>
              <p style={{ fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>{card.meaning}</p>
              
              {card.ex && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  Example: <strong>{card.ex}</strong> ({card.exT})
                </div>
              )}

              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  speakWord(card.value);
                }}
                style={{
                  marginTop: '16px',
                  backgroundColor: 'rgba(140, 74, 50, 0.08)',
                  padding: '8px',
                  borderRadius: '50%',
                  color: 'var(--color-primary)'
                }}
              >
                <Volume2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', width: '300px' }}>
          <button 
            onClick={() => handleFlashcardKnow(false)}
            className="btn-secondary" 
            style={{ flex: 1, padding: '12px', fontSize: '14px' }}
          >
            Review Later
          </button>
          <button 
            onClick={() => handleFlashcardKnow(true)}
            className="btn-primary" 
            style={{ flex: 1, padding: '12px', fontSize: '14px' }}
          >
            I Know It!
          </button>
        </div>

        <div style={{ marginTop: '24px', fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
          Session XP Gained: +{flashcardXP} XP
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Phase 1 (Basic Alphabets)
  // ----------------------------------------------------
  if (view === 'phase1') {
    const masteredLettersArray = progress?.masteredLetters ? progress.masteredLetters.split(',').filter(Boolean) : [];

    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 1: Basic Alphabets</h1>
        </div>

        {/* Toggle headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '20px' }}>
          <button 
            onClick={() => setLetterTab('vowels')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 600,
              borderBottom: letterTab === 'vowels' ? '2px solid var(--color-primary)' : 'none',
              color: letterTab === 'vowels' ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            Vowels (স্বরবর্ণ - 11)
          </button>
          <button 
            onClick={() => setLetterTab('consonants')}
            style={{
              flex: 1,
              padding: '12px',
              fontWeight: 600,
              borderBottom: letterTab === 'consonants' ? '2px solid var(--color-primary)' : 'none',
              color: letterTab === 'consonants' ? 'var(--color-primary)' : 'var(--color-text-muted)'
            }}
          >
            Consonants (ব্যঞ্জনবর্ণ - 39)
          </button>
        </div>

        {/* Grid display */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {(letterTab === 'vowels' ? VOWELS : CONSONANTS).map(item => {
            const isMastered = masteredLettersArray.includes(item.letter);
            return (
              <div 
                key={item.letter}
                onClick={() => setSelectedLetter(item)}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative'
                }}
              >
                {isMastered && (
                  <CheckCircle2 size={12} color="var(--color-primary)" style={{ position: 'absolute', top: '4px', right: '4px' }} />
                )}
                <span style={{ fontSize: '28px', fontWeight: 'bold', fontFamily: 'Merriweather' }}>{item.letter}</span>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>{item.sound}</span>
              </div>
            );
          })}
        </div>

        {/* Practice Quiz Trigger */}
        <div className="text-center" style={{ marginTop: '32px' }}>
          <button 
            onClick={() => startPhaseQuiz()}
            className="btn-primary" 
            style={{ width: '100%' }}
          >
            Take Phase 1 Practice Quiz
          </button>
        </div>

        {/* Detailed letter modal overlay */}
        {selectedLetter && (
          <div className="overlay" style={{ padding: '16px' }} onClick={() => setSelectedLetter(null)}>
            <div className="modal" style={{ width: '100%', maxWidth: '360px' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Character Study
                </span>
                <button onClick={() => setSelectedLetter(null)}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '44px',
                  fontWeight: 'bold',
                  fontFamily: 'Merriweather'
                }}>
                  {selectedLetter.letter}
                </div>
                <div>
                  <h3 className="font-serif" style={{ fontSize: '22px' }}>Pronounced: "{selectedLetter.sound}"</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{selectedLetter.desc}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <button 
                  onClick={() => speakWord(selectedLetter.letter)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  <Volume2 size={16} /> Listen Letter
                </button>
                <button 
                  onClick={() => speakWord(selectedLetter.example)}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, padding: '10px', fontSize: '13px' }}
                >
                  <Volume2 size={16} /> Listen Word
                </button>
              </div>

              <div style={{ backgroundColor: 'var(--color-bg)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', fontSize: '13px' }}>
                <strong>Example Vocabulary:</strong><br />
                <span className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{selectedLetter.example}</span>
                <span style={{ color: 'var(--color-text-muted)', marginLeft: '8px' }}>({selectedLetter.exTrans})</span>
              </div>

              {/* Tracing canvas watermark */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                  Draw & Practice Stroke Order
                </div>
                <div style={{ position: 'relative', width: '300px', height: '300px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: '#fff', overflow: 'hidden' }}>
                  <canvas 
                    ref={canvasRef} 
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  <button 
                    onClick={clearCanvas}
                    style={{ position: 'absolute', bottom: '12px', right: '12px', padding: '6px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', cursor: 'pointer' }}
                  >
                    <Eraser size={16} />
                  </button>
                </div>
              </div>

              {/* Mastery toggle */}
              <button 
                onClick={() => {
                  const alreadyMastered = masteredLettersArray.includes(selectedLetter.letter);
                  toggleLetterMastery(selectedLetter.letter, alreadyMastered);
                }}
                className="btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {masteredLettersArray.includes(selectedLetter.letter) ? (
                  <> <Check size={16} /> Mastered! (Click to Undo) </>
                ) : (
                  <> Mark as Mastered (+10 XP) </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Phase Quiz Modal */}
        {showQuiz && (
          <div className="overlay" style={{ padding: '16px' }}>
            <div className="modal" style={{ width: '100%', maxWidth: '380px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  Phase 1 Quiz
                </span>
                <button onClick={() => setShowQuiz(false)}>
                  <X size={20} />
                </button>
              </div>

              {currentQuizQ < 5 ? (
                <div>
                  <h3 className="font-serif mb-6" style={{ fontSize: '20px' }}>
                    {DIAGNOSTIC_QUESTIONS[currentQuizQ].question}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mb-6">
                    {DIAGNOSTIC_QUESTIONS[currentQuizQ].options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        style={{
                          textAlign: 'left',
                          padding: '12px',
                          borderRadius: 'var(--radius-md)',
                          border: `1px solid ${quizSelectedAns === idx ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          backgroundColor: quizSelectedAns === idx ? 'rgba(140, 74, 50, 0.05)' : 'var(--color-bg)',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={submitQuizAnswer}
                    disabled={quizSelectedAns === null}
                    className="btn-primary"
                    style={{ width: '100%', opacity: quizSelectedAns === null ? 0.6 : 1 }}
                  >
                    Submit Answer
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <h3 className="font-serif mb-2" style={{ fontSize: '24px' }}>Quiz Finished!</h3>
                  <div style={{ fontSize: '44px', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: '16px' }}>
                    {quizScore} / 5
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    {quizScore === 5 ? "Excellent! Perfect score earned." : "Great attempt! Keep practicing."}
                  </p>
                  <button 
                    onClick={() => {
                      setShowQuiz(false);
                      fetchProgress();
                    }}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    Back to Study
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Phase 2 (Words & Speech Recognition)
  // ----------------------------------------------------
  if (view === 'phase2') {
    const masteredWordsArray = progress?.masteredWords ? progress.masteredWords.split(',').filter(Boolean) : [];

    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 2: Vocabulary & Speech</h1>
        </div>

        <p className="mb-6" style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
          Master key nouns and conversational words. Toggle mastery to earn XP, and practice speaking using the voice-recognition check.
        </p>

        <div className="flex flex-col gap-4">
          {VOCAB_WORDS.map(item => {
            const isMastered = masteredWordsArray.includes(item.word);
            return (
              <div 
                key={item.word}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isMastered ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h3 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>{item.word}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                      <strong>{item.sound}</strong> — {item.meaning}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => speakWord(item.word)}
                      style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-primary)'
                      }}
                      title="Read Aloud"
                    >
                      <Volume2 size={16} />
                    </button>
                    <button 
                      onClick={() => startSpeechRecognition(item.word)}
                      style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-primary)'
                      }}
                      title="Practice Pronunciation"
                    >
                      <Mic size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setTypingTarget({ text: item.word, type: 'word', pronunciation: item.sound, translation: item.meaning });
                        setTypingInput("");
                        setTypingSuccess(null);
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bg)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-primary)'
                      }}
                      title="Practice Typing"
                    >
                      <Keyboard size={16} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-bg)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    Practice microphone audio check to earn XP
                  </span>
                  
                  <button 
                    onClick={() => toggleWordMastery(item.word, isMastered)}
                    style={{
                      fontSize: '12px',
                      color: isMastered ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isMastered ? (
                      <> <CheckCircle2 size={14} /> Mastered </>
                    ) : (
                      <> Mark Mastered (+15 XP) </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Microphone Recognition Modal */}
        {isListening && (
          <div className="overlay">
            <div className="modal text-center" style={{ width: '100%', maxWidth: '300px' }}>
              <div style={{ animation: 'pulse 1.5s infinite', display: 'inline-flex', padding: '16px', borderRadius: '50%', backgroundColor: 'rgba(140, 74, 50, 0.1)', color: 'var(--color-primary)', marginBottom: '16px' }}>
                <Mic size={32} />
              </div>
              <h3 className="font-serif mb-2">Listening...</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                Pronounce the word into your microphone now.
              </p>
              <button 
                onClick={() => {
                  if (recognitionRef.current) recognitionRef.current.stop();
                  setIsListening(false);
                }}
                className="btn-secondary"
                style={{ width: '100%' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Microphone Result Overlay */}
        {(speechSuccess !== null || micError) && (
          <div className="overlay">
            <div className="modal text-center" style={{ width: '100%', maxWidth: '320px' }}>
              {micError ? (
                <>
                  <AlertCircle size={48} color="#EF4444" className="mb-4" style={{ display: 'inline-block' }} />
                  <h3 className="font-serif mb-2">Microphone Error</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    {micError}
                  </p>
                </>
              ) : speechSuccess ? (
                <>
                  <CheckCircle2 size={48} color="var(--color-primary)" className="mb-4" style={{ display: 'inline-block' }} />
                  <h3 className="font-serif mb-2">Excellent Pronunciation!</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                    You spoke: <strong>"{spokenText}"</strong>
                  </p>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '24px' }}>
                    Awarded +10 XP!
                  </p>
                </>
              ) : (
                <>
                  <X size={48} color="#EF4444" className="mb-4" style={{ display: 'inline-block', border: '2px solid #EF4444', borderRadius: '50%', padding: '8px' }} />
                  <h3 className="font-serif mb-2">Try Again</h3>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                    Spoken audio evaluated as: <strong>"{spokenText || "(unrecognized)"}"</strong>
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                    Please speak clearly and close to your microphone.
                  </p>
                </>
              )}

              <button 
                onClick={() => {
                  setSpeechSuccess(null);
                  setMicError("");
                }}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Typing Practice Modal */}
        {typingTarget && (
          <div className="overlay" style={{ zIndex: 1000 }}>
            <div className="modal" style={{ width: '95%', maxWidth: '500px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-serif" style={{ fontSize: '18px' }}>Typing Practice (টাইপিং অনুশীলন)</h3>
                <button onClick={() => setTypingTarget(null)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Target text
                </div>
                <div className="font-serif" style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                  {typingTarget.text}
                </div>
                {typingTarget.pronunciation && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Pronunciation: <strong>{typingTarget.pronunciation}</strong>
                  </div>
                )}
                {typingTarget.translation && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Translation: <em>{typingTarget.translation}</em>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text"
                  value={typingInput}
                  onChange={e => {
                    setTypingInput(e.target.value);
                    setTypingSuccess(null);
                  }}
                  placeholder="Type in Bengali here..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${typingSuccess === true ? '#10B981' : typingSuccess === false ? '#EF4444' : 'var(--color-border)'}`,
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              {/* Bengali Helper Keyboard */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Bengali Character Helper:
                  </span>
                  <button 
                    onClick={() => {
                      setTypingInput(prev => prev.slice(0, -1));
                      setTypingSuccess(null);
                    }}
                    style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Backspace
                  </button>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px', 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  padding: '8px', 
                  backgroundColor: 'var(--color-bg)', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  {/* Vowels */}
                  {["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"].map(char => (
                    <button
                      key={char}
                      onClick={() => {
                        setTypingInput(prev => prev + char);
                        setTypingSuccess(null);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '14px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {char}
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                  {/* Consonants */}
                  {["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ", "।"].map(char => (
                    <button
                      key={char}
                      onClick={() => {
                        setTypingInput(prev => prev + char);
                        setTypingSuccess(null);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '14px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTypingInput("")}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Clear
                </button>
                <button
                  onClick={checkTypingResult}
                  className="btn-primary"
                  style={{ flex: 2, padding: '10px' }}
                >
                  Verify
                </button>
              </div>

              {/* Feedback Success/Error */}
              {typingSuccess === true && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} /> Perfect Match! +10 XP Awarded!
                </div>
              )}

              {typingSuccess === false && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#EF4444', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <X size={16} style={{ border: '2px solid currentColor', borderRadius: '50%', padding: '1px' }} /> Typing does not match. Please verify characters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW: Phase 3 (Sentences & Literary Search)
  // ----------------------------------------------------
  if (view === 'phase3') {
    return (
      <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 3: Sentences & Books</h1>
        </div>

        {/* Section 1: Sentences */}
        <h3 className="font-serif mb-3" style={{ fontSize: '18px' }}>1. Read Sentences (পড়ুন)</h3>
        <div className="flex flex-col gap-3 mb-6">
          {SENTENCES.map((item, idx) => (
            <div 
              key={idx}
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h4 className="font-serif" style={{ fontSize: '18px', color: 'var(--color-primary)' }}>{item.bengali}</h4>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  {item.pronunciation} — <em>{item.translation}</em>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => speakWord(item.bengali)}
                  style={{
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)'
                  }}
                  title="Read Aloud"
                >
                  <Volume2 size={16} />
                </button>
                <button 
                  onClick={() => {
                    setTypingTarget({ text: item.bengali, type: 'sentence', pronunciation: item.pronunciation, translation: item.translation });
                    setTypingInput("");
                    setTypingSuccess(null);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-bg)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-primary)'
                  }}
                  title="Practice Typing"
                >
                  <Keyboard size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Section 2: Google Books Search */}
        <h3 className="font-serif mb-2" style={{ fontSize: '18px' }}>2. Search Bengali Literature</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Find classic Bengali books (Tagore, Sarat Chandra, Nazrul, etc.) to add to your Reading Shelf.
        </p>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{
            position: 'relative',
            flex: 1
          }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              value={bookQuery}
              onChange={e => setBookQuery(e.target.value)}
              placeholder="Search author or book in Bengali..."
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '14px'
              }}
            />
          </div>
          <button 
            onClick={searchBengaliBooks}
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
          >
            Search
          </button>
        </div>

        {searchSuccess && (
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'rgba(140, 74, 50, 0.08)', 
            color: 'var(--color-primary)', 
            fontSize: '13px', 
            fontWeight: 600, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '16px' 
          }}>
            <CheckCircle2 size={16} /> {searchSuccess}
          </div>
        )}

        {searchingBooks ? (
          <div className="text-center" style={{ padding: '24px' }}>Searching books...</div>
        ) : (
          <div className="flex flex-col gap-3">
            {searchedBooks.map(book => {
              const alreadyAdded = addedBooks.includes(book.googleId);
              return (
                <div 
                  key={book.googleId}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  {book.coverUrl ? (
                    <img src={book.coverUrl} alt="Cover" style={{ width: '48px', height: '64px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '48px', height: '64px', backgroundColor: 'var(--color-bg)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={20} color="var(--color-text-muted)" />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>{book.title}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>{book.author}</p>
                  </div>
                  
                  <button 
                    onClick={() => addBookToShelf(book)}
                    disabled={alreadyAdded}
                    className="btn-secondary"
                    style={{ 
                      padding: '6px 12px', 
                      borderRadius: 'var(--radius-sm)', 
                      fontSize: '11px',
                      opacity: alreadyAdded ? 0.6 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {alreadyAdded ? (
                      <> <Check size={12} /> Added </>
                    ) : (
                      <> <BookMarked size={12} /> Add to Shelf </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Section 3: Advanced Wikipedia Passages */}
        <h3 className="font-serif mb-2" style={{ fontSize: '18px', marginTop: '32px' }}>3. Wikipedia Advanced Reading (উন্নত পঠন)</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Fetch actual encyclopedia passages in Bengali to practice reading complex topics.
        </p>

        {/* Curated list */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          {[
            { label: "Rabindranath", query: "রবীন্দ্রনাথ ঠাকুর" },
            { label: "Satyajit Ray", query: "সত্যজিৎ রায়" },
            { label: "Dhaka", query: "ঢাকা" },
            { label: "Kolkata", query: "কলকাতা" },
            { label: "Science", query: "বিজ্ঞান" },
            { label: "Space", query: "মহাবিশ্ব" }
          ].map(topic => (
            <button
              key={topic.label}
              onClick={() => {
                setWikiQuery(topic.query);
                fetchWikiPassage(topic.query);
              }}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: wikiQuery === topic.query ? 'rgba(140, 74, 50, 0.1)' : 'var(--color-surface)',
                border: `1px solid ${wikiQuery === topic.query ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: wikiQuery === topic.query ? 'var(--color-primary)' : 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Custom query input */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input 
            type="text" 
            value={wikiQuery}
            onChange={e => setWikiQuery(e.target.value)}
            placeholder="Type topic name in Bengali..."
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '14px'
            }}
          />
          <button 
            onClick={() => fetchWikiPassage(wikiQuery)}
            className="btn-primary"
            style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', fontSize: '14px' }}
          >
            Fetch Passage
          </button>
        </div>

        {/* Wikipedia Extract Display */}
        {loadingWiki && (
          <div className="text-center" style={{ padding: '24px' }}>Loading Bengali passage from Wikipedia...</div>
        )}

        {wikiError && (
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: '#FEE2E2', 
            color: '#991B1B', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '16px' 
          }}>
            <AlertCircle size={16} /> {wikiError}
          </div>
        )}

        {wikiExtract && (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s'
          }}>
            <h4 className="font-serif mb-2" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>{wikiTitle}</h4>
            <p className="font-serif" style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--color-text)', marginBottom: '20px', textAlign: 'justify' }}>
              {wikiExtract}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-bg)', paddingTop: '16px' }}>
              <button
                onClick={() => speakWord(wikiExtract)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <Volume2 size={16} /> Read Aloud
              </button>
              
              <button
                onClick={awardWikiXP}
                disabled={hasAwardedWikiXP}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, padding: '10px', fontSize: '13px', justifyContent: 'center', opacity: hasAwardedWikiXP ? 0.6 : 1 }}
              >
                {hasAwardedWikiXP ? (
                  <><Check size={16} /> Completed (+25 XP)</>
                ) : (
                  <>I Read This (+25 XP)</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Section 4: Classic Bengali Literature */}
        <h3 className="font-serif mb-2" style={{ fontSize: '18px', marginTop: '32px' }}>4. Classic Bengali Literature (বাংলা সাহিত্য)</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
          Read authentic passages (under 200 words) from famous Bengali authors. Satyajit Ray is copyrighted until 2052, but you can read masterpieces from Tagore, Sukumar Ray, and Bibhutibhushan Bandyopadhyay.
        </p>

        {/* Author filter tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {["All", "Rabindranath Tagore", "Sukumar Ray", "Bibhutibhushan Banerjee"].map(author => (
            <button
              key={author}
              onClick={() => setLitAuthor(author)}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: litAuthor === author ? 'rgba(140, 74, 50, 0.1)' : 'var(--color-surface)',
                border: `1px solid ${litAuthor === author ? 'var(--color-primary)' : 'var(--color-border)'}`,
                color: litAuthor === author ? 'var(--color-primary)' : 'var(--color-text)',
                cursor: 'pointer'
              }}
            >
              {author === "All" ? "All Authors" : author.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Curated list & Refresh */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
          {LITERATURE_PASSAGES.filter(p => litAuthor === "All" || p.author === litAuthor).map(passage => (
            <button
              key={passage.title}
              onClick={() => {
                setLitTitle(`${passage.book} — ${passage.title}`);
                setLitExtract(passage.text);
                setLitError("");
                setHasAwardedLitXP(false);
              }}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
            >
              {passage.title}
            </button>
          ))}
          
          <button
            onClick={() => {
              const filtered = LITERATURE_PASSAGES.filter(p => litAuthor === "All" || p.author === litAuthor);
              if (filtered.length > 0) {
                const randomPassage = filtered[Math.floor(Math.random() * filtered.length)];
                setLitTitle(`${randomPassage.book} — ${randomPassage.title}`);
                setLitExtract(randomPassage.text);
                setLitError("");
                setHasAwardedLitXP(false);
              }
            }}
            className="btn-secondary"
            style={{
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RefreshCw size={12} /> Dynamic Refresh (Random)
          </button>
        </div>
        {/* Literature Extract Display */}

        {litError && (
          <div style={{ 
            padding: '12px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: '#FEE2E2', 
            color: '#991B1B', 
            fontSize: '13px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            marginBottom: '16px' 
          }}>
            <AlertCircle size={16} /> {litError}
          </div>
        )}

        {litExtract && (
          <div style={{
            backgroundColor: 'var(--color-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '20px',
            animation: 'fadeIn 0.3s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <h4 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-primary)', margin: 0 }}>{litTitle}</h4>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                  Author: <strong>{LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.author || "Bengali Literature Classic"}</strong>
                </p>
              </div>
              <span style={{ fontSize: '11px', backgroundColor: 'var(--color-bg)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                {litExtract.split(/\s+/).length} words
              </span>
            </div>
            
            <p className="font-serif" style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--color-text)', marginBottom: '20px', textAlign: 'justify' }}>
              {litExtract}
            </p>
            
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--color-bg)', paddingTop: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => speakWord(litExtract)}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 120px', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <Volume2 size={16} /> Read Aloud
              </button>
              
              <button
                onClick={() => {
                  setTypingTarget({ text: litExtract, type: 'sentence', pronunciation: "Literature Passage Reading" });
                  setTypingInput("");
                  setTypingSuccess(null);
                }}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 120px', padding: '10px', fontSize: '13px', justifyContent: 'center' }}
              >
                <Keyboard size={16} /> Practice Typing
              </button>
              
              <button
                onClick={awardLitXP}
                disabled={hasAwardedLitXP}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '2 1 200px', padding: '10px', fontSize: '13px', justifyContent: 'center', opacity: hasAwardedLitXP ? 0.6 : 1 }}
              >
                {hasAwardedLitXP ? (
                  <><Check size={16} /> Completed (+30 XP)</>
                ) : (
                  <>I Read This (+30 XP)</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Typing Practice Modal */}
        {typingTarget && (
          <div className="overlay" style={{ zIndex: 1000 }}>
            <div className="modal" style={{ width: '95%', maxWidth: '500px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-serif" style={{ fontSize: '18px' }}>Typing Practice (টাইপিং অনুশীলন)</h3>
                <button onClick={() => setTypingTarget(null)} style={{ color: 'var(--color-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Target text
                </div>
                <div className="font-serif" style={{ fontSize: '28px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px' }}>
                  {typingTarget.text}
                </div>
                {typingTarget.pronunciation && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Pronunciation: <strong>{typingTarget.pronunciation}</strong>
                  </div>
                )}
                {typingTarget.translation && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    Translation: <em>{typingTarget.translation}</em>
                  </div>
                )}
              </div>

              {/* Text Input */}
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="text"
                  value={typingInput}
                  onChange={e => {
                    setTypingInput(e.target.value);
                    setTypingSuccess(null);
                  }}
                  placeholder="Type in Bengali here..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${typingSuccess === true ? '#10B981' : typingSuccess === false ? '#EF4444' : 'var(--color-border)'}`,
                    backgroundColor: 'var(--color-surface)',
                    color: 'var(--color-text)',
                    fontSize: '18px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              {/* Bengali Helper Keyboard */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                    Bengali Character Helper:
                  </span>
                  <button 
                    onClick={() => {
                      setTypingInput(prev => prev.slice(0, -1));
                      setTypingSuccess(null);
                    }}
                    style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline' }}
                  >
                    Backspace
                  </button>
                </div>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px', 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  padding: '8px', 
                  backgroundColor: 'var(--color-bg)', 
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-border)'
                }}>
                  {/* Vowels */}
                  {["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ"].map(char => (
                    <button
                      key={char}
                      onClick={() => {
                        setTypingInput(prev => prev + char);
                        setTypingSuccess(null);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '14px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {char}
                    </button>
                  ))}
                  
                  {/* Divider */}
                  <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />

                  {/* Consonants */}
                  {["ক", "খ", "গ", "ঘ", "ঙ", "চ", "ছ", "জ", "ঝ", "ঞ", "ট", "ঠ", "ড", "ঢ", "ণ", "ত", "থ", "দ", "ধ", "ন", "প", "ফ", "ব", "ভ", "ম", "য", "র", "ল", "শ", "ষ", "স", "হ", "ড়", "ঢ়", "য়", "ৎ", "ং", "ঃ", "ঁ", "।"].map(char => (
                    <button
                      key={char}
                      onClick={() => {
                        setTypingInput(prev => prev + char);
                        setTypingSuccess(null);
                      }}
                      style={{
                        padding: '6px 10px',
                        fontSize: '14px',
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setTypingInput("")}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Clear
                </button>
                <button
                  onClick={checkTypingResult}
                  className="btn-primary"
                  style={{ flex: 2, padding: '10px' }}
                >
                  Verify
                </button>
              </div>

              {/* Feedback Success/Error */}
              {typingSuccess === true && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: '#10B981', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <CheckCircle2 size={16} /> Perfect Match! +20 XP Awarded!
                </div>
              )}

              {typingSuccess === false && (
                <div style={{ 
                  marginTop: '16px', 
                  padding: '12px', 
                  borderRadius: 'var(--radius-sm)', 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  color: '#EF4444', 
                  fontSize: '14px', 
                  fontWeight: 600,
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <X size={16} style={{ border: '2px solid currentColor', borderRadius: '50%', padding: '1px' }} /> Typing does not match. Please verify characters.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
