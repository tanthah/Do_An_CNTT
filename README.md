# English Learning Web Application

A comprehensive web application designed to help users learn English through interactive AI chat, speech practice, and vocabulary management.

## Features

-   **User Authentication**: Secure Login and Registration system using JWT.
-   **AI Chat Assistant**: Interactive practice with an AI tutor powered by **DeepSeek**.
-   **Text-to-Speech (TTS)**: High-quality audio responses using **Edge TTS** (Python).
-   **Speech-to-Text (STT)**: Voice input support for conversational practice.
-   **Listening & Vocabulary**: Dedicated modules for improving listening skills and building vocabulary.
-   **Admin Dashboard**: comprehensive tools for administrators:
    -   Manage Users & Feedback.
    -   File Management system.
    -   Content management for lessons.
-   **Feedback System**: Users can rate and review their learning experience.

## Technology Stack

### Frontend
-   **Framework**: React (Vite)
-   **State Management**: Redux Toolkit
-   **Styling**: Bootstrap, CSS Modules
-   **Routing**: React Router
-   **HTTP Client**: Axios

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Authentication**: Passport.js (JWT, Google OAuth)
-   **File Storage**: Local storage (Multer)

### AI & Services
-   **LLM Provider**: DeepSeek API (via OpenAI SDK)
-   **Text-to-Speech**: `edge-tts` (Python CLI tool)
-   **Speech-to-Text**: Google Cloud Speech / Browser Native (as configured)

## Prerequisites

Before running the project, ensure you have the following installed:
-   **Node.js** (v18 or higher recommended)
-   **npm** or **yarn**
-   **MongoDB** (Local instance or Atlas connection string)
-   **Python 3.x** (Required for text-to-speech)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd english-learning-web
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

**Install Python Dependencies (Required for TTS):**
```bash
pip install edge-tts
```

**Configuration (.env):**
Create a `.env` file in the `backend` directory with the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
DEEPSEEK_API_KEY=your_deepseek_api_key
client_URL=http://localhost:5173
```

### 3. Frontend Setup
Navigate to the frontend directory and install dependencies:
```bash
cd ../frontend
npm install
```

**Configuration (.env):**
Create a `.env` file in the `frontend` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Start the Backend
```bash
# In the backend directory
npm run dev
```
The server will start on `http://localhost:5000`.

### Start the Frontend
```bash
# In the frontend directory
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## Project Structure

```
english-learning-web/
├── backend/            # Express.js Server
│   ├── src/
│   │   ├── config/     # Database & AI configs
│   │   ├── controllers/# Route controllers
│   │   ├── models/     # Mongoose models
│   │   ├── routes/     # API routes
│   │   └── services/   # Business logic (TTS, etc.)
│   └── uploads/        # Local storage for uploaded files
│
└── frontend/           # React Application
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Application pages
    │   ├── redux/      # State management
    │   └── services/   # API calls
    └── public/         # Static assets
```

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
[ISC](LICENSE)
