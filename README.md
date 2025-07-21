# CyberMinds Dashboard

AI-powered LinkedIn content generator for finance professionals.

## Features

- 🧠 **AI Content Generation**: Create authentic LinkedIn posts tailored to finance professionals
- 🎯 **Multiple Content Types**: Framework posts, stories, trend takes, mistake stories, and metrics
- 🎭 **Tone Matching**: Choose from different professional voices (Insightful CFO, Bold Operator, etc.)
- 📊 **Usage Analytics**: Track your content generation and engagement
- 💾 **Content Management**: Save and organize your generated posts
- 📈 **Trending Topics**: Stay current with finance trends
- 🔐 **Secure Authentication**: User accounts with Supabase
- 📱 **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cyberminds-dashboard.git
   cd cyberminds-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://rixyiajkpfjyvgnvphmd.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Deployment to Vercel

1. **Push your code to GitHub**
2. **Import the project in Vercel**
3. **Add environment variables in Vercel dashboard**
4. **Deploy!**

## Database Schema

The app uses three main tables:

- **user_profiles**: User account information and preferences
- **generated_content**: Saved LinkedIn posts and generation history
- **trending_topics**: Current finance trends for content inspiration

## Project Structure

```
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main dashboard page
├── components/
│   ├── Dashboard.tsx        # Main dashboard interface
│   ├── Login.tsx            # Authentication component
│   └── Loading.tsx          # Loading screen
├── contexts/
│   └── AuthContext.tsx      # Authentication state management
├── lib/
│   └── supabase.ts          # Supabase client and helpers
└── [config files]
```

## Features Overview

### Content Generation
- Select content type (Framework, Story, Trend Take, etc.)
- Customize tone and style
- Generate multiple variations
- Save favorites for later use

### User Dashboard
- Track monthly usage statistics
- View recent saved content
- Monitor trending finance topics
- Manage account settings

### Authentication
- Secure email/password authentication
- User profile management
- Plan-based access control

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Support

For support, email support@cyberminds.com or join our Slack channel.
