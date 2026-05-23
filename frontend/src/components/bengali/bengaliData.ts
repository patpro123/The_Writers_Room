export interface BengaliProgress {
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

export interface WordItem {
  word: string;
  sound: string;
  meaning: string;
}

export interface SentenceItem {
  text: string;
  sound: string;
  translation: string;
}

export interface PrimerItem {
  title: string;
  author: string;
  sentences: SentenceItem[];
  words: WordItem[];
}

export const LITERATURE_PASSAGES = [
  {
    author: "Rabindranath Tagore",
    book: "Kabuliwala (কাবুলিওয়ালা)",
    title: "Mini and Kabuliwala",
    difficulty: "Difficult",
    text: "আমার পাঁচ বছরের ছোট মেয়ে মিনি এক দণ্ড কথা না কহিয়া থাকিতে পারে না। পৃথিবীতে জন্মগ্রহণ করিয়া ভাষা শিক্ষা করিতে সে কেবল একটি বৎসর কাল ব্যয় করিয়াছিল, তাহার পর হইতে যতক্ষণ সে জাগিয়া থাকে এক মুহূর্ত মৌন হইয়া থাকা তাহার পক্ষে অসম্ভব। তাহার মা অনেক সময় ধমক দিয়া তাহার মুখ বন্ধ করিয়া দেয়, কিন্তু আমি তাহা পারি না। মিনি চুপ করিয়া থাকিলে কেমন এক রকম অস্বাভাবিক দেখায়, সেই জন্য তাহার বকবকানি আমি দীর্ঘকাল ধরিয়া সহ্য করিয়া আসি।",
    translation: "My five-year-old daughter Mini cannot stop talking for a single moment..."
  },
  {
    author: "Rabindranath Tagore",
    book: "Gitanjali (গীতাঞ্জলি)",
    title: "Let Pride Dissolve",
    difficulty: "Difficult",
    text: "আমার মাথা নত করে দাও হে তোমার চরণধুলার তলে। সকল অহংকার আমার ডুবিয়ে দাও চোখের জলে। নিজেরে করিতে গৌরবদান নিজেরে কেবলই করি অপমান, আপনারে শুধু ঘেরিয়া ঘেরিয়া ঘুরিয়া মরি ক্ষণে ক্ষণে। সকল অহংকার আমার ডুবিয়ে দাও চোখের জলে।",
    translation: "Bow my head to the dust of your feet. Let all my pride dissolve in tears..."
  },
  {
    author: "Rabindranath Tagore",
    book: "Chuti (ছুটি)",
    title: "Phatik and the River Wood",
    difficulty: "Difficult",
    text: "ফটিক চক্রবর্তীদের পাড়ায় নতুন একটি ছেলে আসিয়াছে, তাহার নাম মাখনলাল। সে ফটিকের কনিষ্ঠ ভ্রাতা। ফটিক তাহার সঙ্গীদের লইয়া নদীর ধারে আসিয়া উপস্থিত হইল। নদীর ধারে একটি প্রকাণ্ড শালকাষ্ঠ পড়িয়াছিল; সে কাঠটি নদীর উপর ভাসাইয়া লইয়া যাইবার জন্য সেখানে রাখা হইয়াছিল। ফটিকের দল স্থির করিল, তাহারা সকলে মিলিযা ঠেলিয়া কাঠটি নদীমধ্যে নিক্ষেপ করিবে।",
    translation: "A new boy named Makhanlal came to Phatik's neighborhood..."
  },
  {
    author: "Sukumar Ray",
    book: "Abol Tabol (আবোল তাবোল)",
    title: "Khichuri (The Blend)",
    difficulty: "Easy",
    text: "হাঁস ছিল সজারু, ব্যাকরণ মানি না, হয়ে গেল 'হাঁসজারু' কেমনে তা জানি না। বক কহে কচ্ছপে বাহবা বাহবা, ডিম্বটি চমৎকার, নয় কোনো ফাহবা! হাতি আর তিমি মিলে হল 'হাতিমি', জলে চলে স্থলে চলে নাহি কোনো খেদ যে। সিংহ আর হরিণের মিশেলে হল 'সিং হরিণ', মাথায় তার শিং গজায় দেখে লাগে ভয় যে।",
    translation: "A duck was combined with a porcupine..."
  },
  {
    author: "Sukumar Ray",
    book: "Abol Tabol (আবোল তাবোল)",
    title: "Baburam Sapure",
    difficulty: "Easy",
    text: "বাবুরাম সাপুড়ে, কোথা যাস্ বাপুরে? আয় বাবা দেখে যা, দুটো সাপ রেখে যা! যে সাপের চোখ নেই, শিং নেই, নোখ নেই, ছোটে না কি হাঁটে না, কাউকে যে কাটে না, করে নাকো ফোঁসফাঁস, মারে নাকো ঢোকঢাক, নেই কোনো উৎপাত, খায় শুধু দুধ-ভাত— সেই সাপ জ্যান্ত, গোটা দুই আন তো!",
    translation: "Baburam the snake charmer..."
  },
  {
    author: "Sukumar Ray",
    book: "HaJaBaRaLa (হযবরল)",
    title: "The Laughing Cat",
    difficulty: "Easy",
    text: "গ্রীষ্মকালের এক দুপুরবেলা। গরমে বুক ফেটে যাচ্ছে, ছাতি শুকিয়ে কাঠ হয়ে গেছে। আমি একটা গাছের ছায়ায় বসেছিলুম। এমন সময় হঠাৎ কোত্থেকে একটা বেড়াল এসে ফ্যাচফ্যাচ করে হাসতে লাগল। আমি বললুম, হাসছ কেন? বেড়ালটা বলল, হাসব না তো কী? তোমার মতন একটা বোকা মানুষের কাণ্ড দেখে কার না হাসি পায়!",
    translation: "A hot summer afternoon..."
  },
  {
    author: "Bibhutibhushan Banerjee",
    book: "Pather Panchali (পথের পাঁচালী)",
    title: "Apu and Durga",
    difficulty: "Medium",
    text: "অপু ও দুর্গা দুই ভাইবোন। দুর্গা বয়সে বড়, অপু ছোট। তাহারা গ্রামের ধূলিমাটি মাখিয়া গড়াগড়ি খাইয়া খেলা করে। গ্রামের চারিপাশে বাঁশবাগান, আমবাগান ও নানা বুনো লতাপাতার ঝোপঝাড়। দুর্গা বনে বুনো ফল তুলিয়া বেড়ায় আর অপুকে ডাক দিয়া বলে, 'অপু, দেখবি আয় কী এনেছি।' অপু চোখ গোল গোল করিয়া ছুটিয়া আসে। উহাদের শৈশব দারিদ্র্যের মধ্যে কাটিলে প্রকৃতির অফুরন্ত স্নেহে ধন্য হইয়াছিল।",
    translation: "Apu and Durga are siblings..."
  },
  {
    author: "Bibhutibhushan Banerjee",
    book: "Chander Pahar (চাঁদের পাহাড়)",
    title: "Shankar's Dream",
    difficulty: "Medium",
    text: "শঙ্কর রায়চৌধুরী নামক এক বাঙালি যুবকের আফ্রিকার গভীর জঙ্গলে অ্যাডভেঞ্চারের রোমাঞ্চকর কাহিনী। শঙ্কর স্বপ্ন দেখিত দেশ-দেশান্তর ঘুরিয়া বেড়াইবার। তাহার সুযোগ ঘটিল যখন সে পূর্ব আফ্রিকায় রেলওয়েতে চাকরি পাইল। কিন্তু সেখানে তাহার জন্য অপেক্ষা করিতেছিল ভয়ানক সিংহ, বিষাক্ত সাপ আর রহস্যময় বুনিপের গুহা। শঙ্কর অসীম সাহসের সহিত সকল বিপদের মোকাবেলা করিল।",
    translation: "The thrilling adventure of Shankar..."
  },
  {
    author: "Satyajit Ray",
    book: "Feluda (ফেলুদা)",
    title: "Feluda's Brainpower",
    difficulty: "Easy",
    text: "ফেলুদার আসল নাম প্রদোষচন্দ্র মিত্র। সে এক অদ্ভুত গোয়েন্দা। তাহার তীক্ষ্ণ বুদ্ধি ও পর্যবেক্ষণ ক্ষমতার জন্য সে অতি কঠিন রহস্যের সমাধান করে। ফেলুদা লণ্ডন বা অন্য কোনো দেশের গোয়েন্দাদের মতো পিস্তল ব্যবহার করিতে ভালোবাসে না, তাহার প্রধান অস্ত্র হইল মগজাস্ত্র। তাহার সহযোগী তোপসে এবং জটায়ু সর্বদাই তাহার পাশে থাকে। ফেলুদার প্রতিটি অভিযান রোমাঞ্চকর।",
    translation: "Feluda's real name is Pradosh Chandra Mitter..."
  },
  {
    author: "Satyajit Ray",
    book: "Professor Shonku (প্রফেসর শঙ্কু)",
    title: "Shonku's Laboratory",
    difficulty: "Easy",
    text: "প্রফেসর ত্রিলোকেশ্বর শঙ্কু একজন বিশ্ববিখ্যাত বিজ্ঞানী ও আবিষ্কারক। তিনি গিরিডিতে তাঁহার গবেষণাগারে বসিয়া অদ্ভুত সব বৈজ্ঞানিক যন্ত্র আবিষ্কার করেন। তাঁহার আবিষ্কারের তালিকায় রহিয়াছে মিরাকিউর বড়ি যা সর্বরোগনাশক, এবং অ্যানিহিলেশন গান যা যে কোনো বস্তুকে অদৃশ্য করিয়া দেয়। প্রফেসর শঙ্কু তাঁহার বিড়াল নিউটনকে লইয়া নানাবিধ বৈজ্ঞানিক পরীক্ষা-নিরীক্ষা চালান।",
    translation: "Professor Trilokeshwar Shonku is a world-famous scientist..."
  }
];

export const DIAGNOSTIC_QUESTIONS = [
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

export const VOWELS = [
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

export const CONSONANTS = [
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
  { letter: "ঠ", sound: "Tho", desc: "Retroflex 'th'", example: "ঠেলাগাড়ি", exTrans: "Pushcart" },
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

export const VOCAB_WORDS = [
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

export const SENTENCES = [
  { bengali: "আমি বই পড়ি।", pronunciation: "Ami boi pori.", translation: "I read books." },
  { bengali: "সে জল চায়।", pronunciation: "She jol chay.", translation: "He/She wants water." },
  { bengali: "আমাদের একটি সুন্দর বাড়ি আছে।", pronunciation: "Amader ekti sundor bari achhe.", translation: "We have a beautiful house." },
  { bengali: "আমি মাছ খেতে ভালোবাসি।", pronunciation: "Ami machh khete bhalobashi.", translation: "I love to eat fish." },
  { bengali: "আকাশে সূর্য উঠেছে।", pronunciation: "Akashe surjo uthechhe.", translation: "The sun has risen in the sky." }
];

export const BENGALI_MATRAS = [
  { symbol: "া", name: "Aakar (আ-কার)", sound: "aa", example: "কা (ka - as in কাক)", meaning: "Crow" },
  { symbol: "ি", name: "Hraswa I-kar (ই-কার)", sound: "i", example: "কি (ki - as in কিন্তু)", meaning: "But" },
  { symbol: "ী", name: "Dirgha I-kar (ঈ-কার)", sound: "ee", example: "কী (kee - as in কী)", meaning: "What" },
  { symbol: "ু", name: "Hraswa U-kar (উ-কার)", sound: "u", example: "কু (ku - as in কুকুর)", meaning: "Dog" },
  { symbol: "ূ", name: "Dirgha U-kar (ঊ-কার)", sound: "oo", example: "কূ (koo - as in কূয়া)", meaning: "Well" },
  { symbol: "ৃ", name: "Ri-kar (ঋ-কার)", sound: "ri", example: "কৃ (kri - as in কৃষক)", meaning: "Farmer" },
  { symbol: "ে", name: "E-kar (এ-কার)", sound: "e", example: "কে (ke - as in কেক)", meaning: "Cake" },
  { symbol: "ৈ", name: "Oi-kar (ঐ-কার)", sound: "oi", example: "কৈ (koi - as in কৈশোর)", meaning: "Youth" },
  { symbol: "ো", name: "O-kar (ও-কার)", sound: "o", example: "কো (ko - as in কোণ)", meaning: "Corner" },
  { symbol: "ৌ", name: "Ou-kar (ঔ-কার)", sound: "ou", example: "কৌ (kou - as in কৌতূহল)", meaning: "Curiosity" },
  { symbol: "্র", name: "Rafala (র-ফলা)", sound: "r (blend)", example: "ক্র (kro - as in ক্রন্দন)", meaning: "Crying" },
  { symbol: "্য", name: "Yafala (য-ফলা)", sound: "y (blend)", example: "ক্য (kyo - as in বাক্য)", meaning: "Sentence" },
  { symbol: "র্ক", name: "Reph (রেফ)", sound: "r (pre-consonant)", example: "র্ক (rko - as in তর্ক)", meaning: "Argument" }
];

export const BENGALI_JUKTAKHOR = [
  { symbol: "ক্ষ", components: "ক + ষ", name: "Kshya", sound: "k-sha", example: "শিক্ষা (shikkha)", meaning: "Education" },
  { symbol: "জ্ঞ", components: "জ + ঞ", name: "Ggya", sound: "g-ya", example: "জ্ঞান (gyan)", meaning: "Knowledge" },
  { symbol: "ন্দ", components: "ন + দ", name: "N-da", sound: "nd", example: "আনন্দ (anondo)", meaning: "Joy" },
  { symbol: "ত্ত্ব", components: "ত + ত", name: "T-ta", sound: "tt", example: "উত্তর (uttor)", meaning: "Answer" },
  { symbol: "চ্চ", components: "চ + চ", name: "C-ca", sound: "cc", example: "উচ্চ (ucco)", meaning: "High" },
  { symbol: "ষ্ট", components: "ষ + ট", name: "Sh-ta", sound: "sh-ta", example: "কষ্ট (koshto)", meaning: "Trouble" },
  { symbol: "দ্ধ", components: "দ + ধ", name: "D-dha", sound: "ddh", example: "বুদ্ধি (buddhi)", meaning: "Intelligence" },
  { symbol: "ম্প", components: "ম + প", name: "M-pa", sound: "mp", example: "কম্পন (kompon)", meaning: "Vibration" },
  { symbol: "ন্ত", components: "ন + ত", name: "N-ta", sound: "nt", example: "শান্ত (shanto)", meaning: "Calm" },
  { symbol: "ক্ত", components: "ক + ত", name: "K-ta", sound: "kt", example: "রক্ত (rokto)", meaning: "Blood" }
];

export const BASIC_PRIMERS: PrimerItem[] = [
  {
    title: "Borno Porichoy (বর্ণপরিচয়)",
    author: "Ishwar Chandra Vidyasagar",
    sentences: [
      { text: "জল পড়ে। পাতা নড়ে।", sound: "Jol pore. Pata nore.", translation: "Rain falls. Leaves rustle." },
      { text: "পথ ছাড়। জল খাও।", sound: "Path chhar. Jol khao.", translation: "Move aside. Drink water." },
      { text: "মেঘ ডাকে। খেলা করে।", sound: "Megh daake. Khela kore.", translation: "Clouds thunder. He plays." },
      { text: "পাখি ওড়ে। বাতাস বয়।", sound: "Pakhi ore. Batash boy.", translation: "Birds fly. Wind blows." },
      { text: "কথা কয়। হাত ধর।", sound: "Kotha koy. Haat dhor.", translation: "He speaks. Hold hands." }
    ],
    words: [
      { word: "জল", sound: "jol", meaning: "Water" },
      { word: "পাতা", sound: "pata", meaning: "Leaf" },
      { word: "পথ", sound: "path", meaning: "Path" },
      { word: "মেঘ", sound: "megh", meaning: "Cloud" },
      { word: "খেলা", sound: "khela", meaning: "Play" }
    ]
  },
  {
    title: "Sahaj Path (সহজ পাঠ)",
    author: "Rabindranath Tagore",
    sentences: [
      { text: "ছোট খোকা বলে অ আ।", sound: "Choto khoka bole o aa.", translation: "The little boy says O Aa." },
      { text: "শেখে নি সে কথা কওয়া।", sound: "Shekhe ni se kotha kowa.", translation: "He has not yet learned to talk." },
      { text: "হ্রস্ব ই দীর্ঘ ঈ বসে খায় ক্ষীর খই।", sound: "Hraswo i deergho ee bose khay ksheer khoi.", translation: "Short I and long EE sit and eat puffed rice." },
      { text: "হ্রস্ব উ দীর্ঘ ঊ ডাক ছাড়ে ঘেউ ঘেউ।", sound: "Hraswo u deergho oo daak chhare gheu gheu.", translation: "Short U and long OO bark like a dog." },
      { text: "ঋষি মশাই বসেন পূজায়।", sound: "Rishi moshai bosen pujoay.", translation: "The sage sits in prayer." }
    ],
    words: [
      { word: "খোকা", sound: "khoka", meaning: "Little boy" },
      { word: "কথা", sound: "kotha", meaning: "Word/Speech" },
      { word: "খায়", sound: "khay", meaning: "Eats" },
      { word: "ডাক", sound: "daak", meaning: "Call/Bark" },
      { word: "ঋষি", sound: "rishi", meaning: "Sage" }
    ]
  }
];
