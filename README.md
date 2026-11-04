# ⚡ DevFlow

### Your work. In flow.

DevFlow is a full-stack task management application that helps users organize tasks, track progress, and manage their workflow through a clean and intuitive Kanban board.

Built with modern web technologies, DevFlow combines secure authentication, personalized task management, and a responsive user interface to make productivity simpler.

## ✨ Features

- 🔐 **Authentication** – Secure sign-up and sign-in with Neon Auth.
- 📋 **Task Management** – Create, edit, and delete tasks.
- 📊 **Kanban Board** – Organize tasks into To Do, In Progress, and Completed.
- 🎯 **Priority Management** – Set Low, Medium, and High priorities.
- 📈 **Live Statistics** – Track total tasks, in-progress tasks, completed tasks, and completion rate.
- 👤 **User-Specific Workspace** – Each user can manage their own tasks.
- 🌓 **Dark & Light Mode** – Switch between themes.
- 📱 **Responsive UI** – Optimized for different screen sizes.
- ✅ **Form Validation** – Input validation using Zod.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack framework |
| React | UI development |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Prisma ORM | Database ORM |
| Neon PostgreSQL | Database |
| Neon Auth | Authentication |
| Zod | Form validation |
| Vercel | Deployment |

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm
- Neon PostgreSQL account
- Neon Auth configuration

### 1. Clone the repository

```bash
https://github.com/cd-queue/devFlow.git
```

### 2. Navigate to the project

```bash
cd devflow
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="your_database_url"
NEON_AUTH_BASE_URL="your_neon_auth_base_url"
NEON_AUTH_COOKIE_SECRET="your_auth_cookie_secret"
```

Replace the placeholder values with your actual credentials.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

### 6. Apply database migrations

```bash
npx prisma migrate deploy
```

Run this when your Prisma migrations are configured and available.

### 7. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## 📂 Project Structure

```text
devflow/
├── generated/
│   └── prisma/
├── prisma/
│   └── schema.prisma
├── public/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   ├── auth/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   └── lib/
│       ├── auth/
│       ├── validations/
│       └── prisma.ts
├── package.json
└── README.md
```

## 🔒 Security

- Secure authentication using Neon Auth.
- User-specific task access.
- Server-side task operations.
- Zod input validation.
- Sensitive credentials stored in environment variables.

**Never commit your `.env` file or expose private credentials.**

## 🌐 Live Demo

**Live Website:** https://dev-flow-beta-virid.vercel.app/

## 👨‍💻 Author

**Ajahar Uddin**

BCA Final-Year Student | Full-Stack Web Developer

- GitHub: https://github.com/cd-queue
- LinkedIn: www.linkedin.com/in/ajahar-uddin-848779335
## ⭐ Show Your Support

If you like this project, consider giving the repository a ⭐ on GitHub!

---

Built with ❤️ by Ajahar Uddin
