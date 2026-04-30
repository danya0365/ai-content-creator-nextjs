<div align="center">
  <br />
  <h1>✨ AI Content Creator</h1>
  <p>
    <strong>A next-generation, 3D-enhanced platform for AI-driven content generation, scheduling, and analytics.</strong>
  </p>
  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" /></a>
    <a href="https://supabase.com"><img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" /></a>
    <a href="https://docs.pmnd.rs/react-three-fiber"><img src="https://img.shields.io/badge/R3F-3D_Graphics-black?style=for-the-badge&logo=react&logoColor=white" alt="React Three Fiber" /></a>
  </p>
</div>

---

## 🚀 Overview

**AI Content Creator** is a modern web application designed to streamline the entire content creation lifecycle. By combining state-of-the-art AI generation tools with an immersive **3D-interactive workspace** (powered by React Three Fiber), the platform offers a uniquely engaging experience for creators, marketers, and social media managers.

From initial ideation to visual gallery management, scheduling, and real-time analytics, everything is housed within a beautiful, ultra-responsive Next.js interface.

## ✨ Key Features

- 🧠 **AI Content Generation**: Seamlessly generate, refine, and iterate on high-quality content.
- 🧊 **Immersive 3D Experience**: Cinematic, interactive UI elements powered by `@react-three/fiber` and `@react-three/rapier` physics.
- 📊 **Advanced Analytics**: Real-time dashboard to monitor content performance and user engagement metrics.
- 📅 **Smart Scheduling & Timeline**: Visual content calendars and timelines native to the application.
- 🖼️ **Asset Gallery**: Comprehensive media and asset management right out of the box.
- 🔐 **Secure Authentication**: Enterprise-grade identity management powered by Supabase Auth.
- 🌙 **Dark Mode Native**: Complete `next-themes` integration for a flawless viewing experience in any lighting.

## 💻 Tech Stack

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **UI/Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [Clsx](https://github.com/lukeed/clsx)
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Drei](https://github.com/pmndrs/drei), [Rapier](https://rapier.rs/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Backend & Database**: [Supabase](https://supabase.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Animations**: [React Spring](https://react-spring.dev/)

## 📂 Project Structure

Following best practices and Domain-Driven Design principles, the project is structured to scale:

```text
ai-content-creator-nextjs/
├── app/                  # Next.js App Router (pages & layouts)
│   ├── analytics/        # Performance metrics
│   ├── content/          # Content creation & generation
│   ├── dashboard/        # Main 3D-enhanced workspace
│   ├── gallery/          # Media management
│   ├── schedule/         # Calendar & timeline views
│   └── settings/         # User preferences
├── src/
│   ├── domain/           # Core business logic & TypeScript types
│   ├── infrastructure/   # External services (Supabase clients, APIs)
│   ├── application/      # Application use-cases & Zustand stores
│   └── presentation/     # UI Components (3D scenes, buttons, forms, layout)
└── supabase/             # Database migrations, seed data, and Edge Functions
```

## 🛠️ Getting Started

### Prerequisites

- **Node.js**: `v20` or higher
- **Package Manager**: npm, yarn, pnpm, or bun
- **Supabase CLI**: For local database development

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/ai-content-creator.git
   cd ai-content-creator-nextjs
   ```

2. **Install dependencies:**
   ```bash
   yarn install
   ```

3. **Start the local Supabase instance:**
   ```bash
   yarn supabase-start
   ```

4. **Run the development server:**
   ```bash
   yarn dev
   ```

5. **Open the app:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Available Scripts

- `yarn dev` - Starts the development server with Turbopack.
- `yarn build` - Builds the application for production.
- `yarn start` - Runs the production build.
- `yarn supabase-*` - A suite of commands (start, stop, reset, migrate, generate types) for managing the local Supabase backend.
- `yarn lint` - Runs ESLint to ensure code quality.
- `yarn type-check` - Verifies TypeScript type safety across the project.

## 🤝 Contributing

Contributions are always welcome! Please read the contribution guidelines first.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential. Unauthorized copying of this project, via any medium, is strictly prohibited.
