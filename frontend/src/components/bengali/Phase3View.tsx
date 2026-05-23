import React, { useState } from 'react';
import { ChevronLeft, Volume2, Keyboard, Search, BookOpen, BookMarked, Check, RefreshCw, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { SENTENCES, LITERATURE_PASSAGES } from './bengaliData';
import { API_BASE_URL } from '../../config';

interface Phase3ViewProps {
  setView: (view: 'dashboard') => void;
  speakWord: (text: string) => void;
  fetchProgress: () => Promise<void>;
  token: string;
}

export const Phase3View: React.FC<Phase3ViewProps> = ({
  setView,
  speakWord,
  fetchProgress,
  token,
}) => {
  // Books Search
  const [bookQuery, setBookQuery] = useState("");
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [searchedBooks, setSearchedBooks] = useState<any[]>([]);
  const [addedBooks, setAddedBooks] = useState<string[]>([]);
  const [searchSuccess, setSearchSuccess] = useState<string | null>(null);

  // Wikipedia
  const [wikiQuery, setWikiQuery] = useState("");
  const [wikiTitle, setWikiTitle] = useState("");
  const [wikiExtract, setWikiExtract] = useState("");
  const [loadingWiki, setLoadingWiki] = useState(false);
  const [wikiError, setWikiError] = useState("");
  const [hasAwardedWikiXP, setHasAwardedWikiXP] = useState(false);

  // Curated Literature
  const [litAuthor, setLitAuthor] = useState("All");
  const [litDifficulty, setLitDifficulty] = useState("All");
  const [litTitle, setLitTitle] = useState("");
  const [litExtract, setLitExtract] = useState("");
  const [litError, setLitError] = useState("");
  const [hasAwardedLitXP, setHasAwardedLitXP] = useState(false);

  // Typing
  const [typingTarget, setTypingTarget] = useState<any | null>(null);
  const [typingInput, setTypingInput] = useState("");
  const [typingSuccess, setTypingSuccess] = useState<boolean | null>(null);

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
      await fetchProgress();
    } catch (e) {
      console.error(e);
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
      await fetchProgress();
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
          body: JSON.stringify({ phase: 3, score: 0 })
        });
        await fetchProgress();
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Filter passages by author and difficulty
  const filteredPassages = LITERATURE_PASSAGES.filter(p => {
    const matchesAuthor = litAuthor === "All" || p.author === litAuthor;
    const matchesDifficulty = litDifficulty === "All" || p.difficulty === litDifficulty;
    return matchesAuthor && matchesDifficulty;
  });

  return (
    <div style={{ animation: 'fadeIn 0.4s', paddingBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={() => setView('dashboard')} style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-serif" style={{ fontSize: '24px' }}>Phase 3: Sentences & Books</h1>
      </div>

      {/* Section 1: Sentences */}
      <h3 className="font-serif mb-3" style={{ fontSize: '18px', textAlign: 'left' }}>1. Read Sentences (পড়ুন)</h3>
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
            <div style={{ textAlign: 'left' }}>
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
                  color: 'var(--color-primary)',
                  cursor: 'pointer'
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
                  color: 'var(--color-primary)',
                  cursor: 'pointer'
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
      <h3 className="font-serif mb-2" style={{ fontSize: '18px', textAlign: 'left' }}>2. Search Bengali Literature</h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'left' }}>
        Find classic Bengali books (Tagore, Sarat Chandra, Nazrul, etc.) to add to your Reading Shelf.
      </p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
                <div style={{ flex: 1, textAlign: 'left' }}>
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
      <h3 className="font-serif mb-2" style={{ fontSize: '18px', marginTop: '32px', textAlign: 'left' }}>3. Wikipedia Advanced Reading (উন্নত পঠন)</h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'left' }}>
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
          <h4 className="font-serif mb-2" style={{ fontSize: '20px', color: 'var(--color-primary)', textAlign: 'left' }}>{wikiTitle}</h4>
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
      <h3 className="font-serif mb-2" style={{ fontSize: '18px', marginTop: '32px', textAlign: 'left' }}>4. Classic Bengali Literature (বাংলা সাহিত্য)</h3>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'left' }}>
        Read authentic passages (under 200 words) from famous Bengali authors. Check the difficulty badges and filter by complexity.
      </p>

      {/* Author and Difficulty Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        {/* Author filter tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

        {/* Difficulty Filter Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Difficulty Level:</span>
          <select
            value={litDifficulty}
            onChange={e => setLitDifficulty(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '12px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy (সহজ)</option>
            <option value="Medium">Medium (মাঝারি)</option>
            <option value="Difficult">Difficult (কঠিন)</option>
          </select>
        </div>
      </div>

      {/* Curated list & Refresh */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
        {filteredPassages.map(passage => (
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
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
          >
            <span>{passage.title}</span>
            <span style={{
              fontSize: '9px',
              fontWeight: 'bold',
              padding: '1px 5px',
              borderRadius: '3px',
              backgroundColor: passage.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' :
                               passage.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color:           passage.difficulty === 'Easy' ? '#10B981' :
                               passage.difficulty === 'Medium' ? '#F59E0B' : '#EF4444'
            }}>
              {passage.difficulty}
            </span>
          </button>
        ))}
        
        <button
          onClick={() => {
            if (filteredPassages.length > 0) {
              const randomPassage = filteredPassages[Math.floor(Math.random() * filteredPassages.length)];
              setLitTitle(`${randomPassage.book} — ${randomPassage.title}`);
              setLitExtract(randomPassage.text);
              setLitError("");
              setHasAwardedLitXP(false);
            }
          }}
          className="btn-secondary"
          style={{
            fontSize: '12px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw size={12} /> Dynamic Refresh (Random)
        </button>
      </div>



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
            <div style={{ textAlign: 'left' }}>
              <h4 className="font-serif" style={{ fontSize: '20px', color: 'var(--color-primary)', margin: 0 }}>{litTitle}</h4>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '2px 0 0 0' }}>
                Author: <strong>{LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.author || "Bengali Literature Classic"}</strong>
              </p>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <span style={{
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.difficulty === 'Easy' ? 'rgba(16, 185, 129, 0.1)' :
                                 LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.difficulty === 'Medium' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color:           LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.difficulty === 'Easy' ? '#10B981' :
                                 LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.difficulty === 'Medium' ? '#F59E0B' : '#EF4444'
              }}>
                {LITERATURE_PASSAGES.find(p => litTitle.includes(p.title))?.difficulty}
              </span>
              <span style={{ fontSize: '11px', backgroundColor: 'var(--color-bg)', padding: '4px 8px', borderRadius: '4px', color: 'var(--color-primary)', fontWeight: 'bold' }}>
                {litExtract.split(/\s+/).length} words
              </span>
            </div>
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
          <div className="modal" style={{ width: '95%', maxWidth: '500px', padding: '24px' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 className="font-serif" style={{ fontSize: '18px' }}>Typing Practice (টাইপিং অনুশীলন)</h3>
              <button onClick={() => setTypingTarget(null)} style={{ color: 'var(--color-text-muted)', border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Target text
              </div>
              <div className="font-serif" style={{ fontSize: '24px', color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '8px', wordBreak: 'break-all' }}>
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
              <textarea 
                value={typingInput}
                onChange={e => {
                  setTypingInput(e.target.value);
                  setTypingSuccess(null);
                }}
                placeholder="Type in Bengali here..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${typingSuccess === true ? '#10B981' : typingSuccess === false ? '#EF4444' : 'var(--color-border)'}`,
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '16px',
                  textAlign: 'center',
                  outline: 'none',
                  resize: 'none'
                }}
                autoFocus
              />
            </div>

            {/* Bengali Helper Keyboard */}
            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  Bengali Character Helper:
                </span>
                <button 
                  onClick={() => {
                    setTypingInput(prev => prev.slice(0, -1));
                    setTypingSuccess(null);
                  }}
                  style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer' }}
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
                {["অ", "আ", "ই", "ঈ", "উ", "ঊ", "ঋ", "এ", "ঐ", "ও", "ঔ", "া", "ি", "ী", "ু", "ূ", "ৃ", "ে", "ৈ", "ো", "ৌ", "্"].map(char => (
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
};
