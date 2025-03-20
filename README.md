# Task Board for Telegram

A task management mini-app for Telegram groups that allows users to create, manage, and track tasks within Telegram.

## Technology Stack

### Frontend
- **Framework**: Next.js 15
- **UI Library**: Chakra UI v2
- **Language**: TypeScript
- **State Management**: React Hooks
- **Telegram Integration**: 
  - `@telegram-apps/sdk-react` - For Telegram Mini App SDK integration
  - `@twa-dev/sdk` - For Telegram Web App functionality

### Backend
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Authentication (planned)
- **Hosting**: Vercel (web app), Railway.app (bot)

### Bot
- **Framework**: Telegraf.js
- **Language**: TypeScript/Node.js
- **Runtime**: Node.js

## Architecture

The application consists of two main components:

1. **Web Application (Next.js)**
   - Functions as a Telegram mini-app
   - Provides UI for task management
   - Communicates with Firebase database
   - Supports dark/light mode based on system preferences
   - Responsive design for mobile devices

2. **Telegram Bot**
   - Provides entry point to the mini-app
   - Handles command-based interactions
   - Enables group-specific task management
   - Processes Telegram WebApp callbacks

## Key Features

- Group-specific task boards
- Real-time task updates
- Dark/light mode support
- Task creation, completion, and deletion
- Optimized for mobile devices
- Responsive and accessible UI

## Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Telegram Bot Token
- Firebase project with Realtime Database

### Development Setup

1. Clone the repository
```bash
git clone https://github.com/your-username/task-board-telegram.git
cd task-board-telegram
```

2. Install dependencies
```bash
npm install
```

3. Create a `.env.local` file in the project root with the required environment variables:
```env
# Development Bot Configuration
BOT_TOKEN=your_bot_token
WEBAPP_URL=http://localhost:3000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Start the development server
```bash
# For the web app
npm run dev

# For the bot (in a separate terminal)
npm run bot:dev
```

## Deployment

### Web Application (Vercel)

The application is deployed to Vercel with the following workflow:

1. Create a feature branch for development
```bash
git checkout -b feature/your-feature-name
```

2. Push changes after development is complete
```bash
git add .
git commit -m "feat: your commit message"
git push origin feature/your-feature-name
```

3. Vercel automatically creates a preview deployment
   - Test your changes at the preview URL

4. Merge to main when ready
```bash
git checkout main
git pull
git merge feature/your-feature-name
git push
```

5. Vercel automatically deploys to production from the main branch

### Telegram Bot (Railway.app)

The bot is deployed to Railway.app with the following environment variables:

```
BOT_TOKEN=your_production_bot_token
WEBAPP_URL=https://your-production-app-url.vercel.app
NODE_ENV=production
```

## Testing Locally

To test the application with a specific group ID:

```
http://localhost:3000?startapp=base64_encoded_group_id
```

Example for testing with group ID "test-group-1":
```
http://localhost:3000?startapp=dGVzdC1ncm91cC0x
```

## Contribution Guidelines

1. Create a feature branch
2. Implement and test your changes
3. Submit a pull request with a clear description
4. Ensure all tests pass and code follows project style guidelines

## License

This project is licensed under the MIT License - see the LICENSE file for details.
