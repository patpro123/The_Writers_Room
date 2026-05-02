# Brainstorming: Reading Journal & AI Book Chatbot

This is a fantastic feature idea! A dedicated space for your daughter to track her reading journey, write personal notes, and have an intelligent "Book Club Companion" to discuss the literature with is incredibly valuable for a young reader. 

Here is my brainstormed plan for how we can build this end-to-end.

## User Review Required

> [!IMPORTANT]
> Please review the brainstorming points below. Specifically, look at the **AI Chatbot Persona** and the **External APIs** section and let me know if you agree with the approach!

## Open Questions for Brainstorming

> [!NOTE]
> 1. **Book Covers**: Would you like me to integrate the free Google Books API so that when she types in a book title (e.g., "Harry Potter"), it automatically fetches the real book cover and genre?
> 2. **Chatbot Persona**: How should the AI act? Should it act like a knowledgeable librarian, a peer/friend in a book club, or an English teacher asking her probing questions?
> 3. **Spoiler Prevention**: Do you want the AI to ask her what chapter she is on before discussing, to strictly avoid spoiling the ending?

---

## Proposed Architecture

### 1. Database Schema Additions (`schema.prisma`)
We will add three new models to support this ecosystem:
- **`Book`**: Stores `title`, `author`, `genre`, `coverUrl`, `status` (Reading, Completed, Wishlist), and `userId`.
- **`BookNote`**: Stores personal notes, quotes, or thoughts she saves about a specific book.
- **`BookChat`**: Stores the conversation history (User and AI messages) so the chatbot remembers what they discussed previously about that specific book.

### 2. Backend Engine & AI (`backend/services/ai.ts`)
- **Book Chat Engine**: We will create a new Gemini prompt specifically tailored for book discussions. 
- **Context Injection**: When she chats with the bot, the backend will feed the AI the book's title, author, and her personal notes, so the AI has context on what she thinks so far.

### 3. Frontend UI (`frontend/src`)
- **The Reading Shelf (New Tab)**: A beautiful, visual bookshelf layout grouping her books by Genre (Fantasy, Mystery, Classics, Non-Fiction, etc.).
- **Book Detail Page**: Clicking a book opens its page where she can add quick notes.
- **Floating Chatbot Widget**: A sleek, pop-up chat window embedded on the Book Detail page. It will look like a modern messenger app (like iMessage) where she can text the AI companion specifically about that book.

## Verification Plan
1. Apply the database migration to the Neon database.
2. Build the API endpoints and integrate the Google Books API.
3. Build the Frontend Shelf and Chat UI.
4. Test the chatbot's ability to maintain context about a specific book.
