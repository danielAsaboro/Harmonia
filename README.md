# Harmonia

An AI-powered community management platform for Web3 communities, focusing on Twitter and Telegram integration.

## Overview

Harmonia is a comprehensive suite of tools designed to streamline community management through AI-powered automation, intelligent content scheduling, and enhanced member engagement tracking.

## Key Features

### 🤖 Content Studio
- Advanced tweet composer with thread support
- Smart scheduling system with timezone awareness
- Draft management and collaboration features
- Media upload and preview capabilities

### 📚 Knowledge Base Management
- Document upload and processing
- RAG (Retrieval-Augmented Generation) configuration
- Automated response testing
- Content verification system

### 👥 Member Management
- Intelligent member matching
- Skill and interest tracking
- Project history management
- Engagement analytics

### 📊 System Configuration
- LLM configuration options
- API integration settings
- Privacy controls
- Backup and restore functionality

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Node.js with SQLite (better-sqlite3)
- **AI/ML**: Custom LLM integration
- **Authentication**: Twitter OAuth 2.0
- **State Management**: Custom React Context
- **UI Components**: Radix UI primitives
- **Styling**: TailwindCSS with custom theme system

## Getting Started

### Prerequisites

- Node.js (LTS version)
- Yarn package manager
- Twitter Developer Account with OAuth 2.0 credentials

### Environment Setup

Create a `.env.local` file with the following variables:

```env
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_token_secret
TWITTER_BEARER_TOKEN=your_bearer_token
TWITTER_CLIENT_ID=your_client_id
TWITTER_CLIENT_SECRET=your_client_secret
NEXT_PUBLIC_SITE_URL=http://localhost:3000
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
USER_CACHE_DURATION=604800000
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Superteam-AI-supercharge/harmonia.git

# Navigate to project directory
cd harmonia

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Development Scripts

- `yarn dev`: Start development server
- `yarn build`: Create production build
- `yarn start`: Start production server
- `yarn lint`: Run ESLint checks

## Project Structure

```
harmonia/
├── app/               # Next.js app directory
├── components/        # React components
├── lib/              # Core utilities and services
├── public/           # Static assets
├── styles/           # Global styles
├── types/            # TypeScript type definitions
└── utils/            # Helper utilities
```

## Features in Detail

### Content Studio
- Rich text editor for tweets and threads
- Media upload with preview
- Scheduling system with timezone support
- Draft management
- Collaboration tools

### Knowledge Base
- Document processing
- Content verification
- Response testing interface
- Training data management

### Member Management
- Profile matching
- Skill tracking
- Project history
- Analytics dashboard

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Superteam DAO for support and resources
- Twitter API for platform integration
- Open source community for various tools and libraries used

## Support

For support, email [support@harmonia.ai](mailto:support@harmonia.ai) or join our [Discord community](https://discord.gg/harmonia).