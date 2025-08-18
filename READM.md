# AI Chat Website - Frontend + Backend Integration Guide

This project is built with:
- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

The goal is to create a **ChatGPT-like AI website** with a clean, modular structure that can be extended later with backend integration.

---

## 🚀 Project Structure

```bash
ai-chat-website/
│── src/
│   ├── components/       # Reusable UI components (Button, ChatBubble, Sidebar, etc.)
│   ├── layouts/          # App layouts (MainLayout, AuthLayout)
│   ├── pages/            # Page-level components (Home, Chat, Settings)
│   ├── hooks/            # Custom React hooks (useChat, useAuth)
│   ├── context/          # React Context API (AuthContext, ChatContext)
│   ├── services/         # API calls, backend integration (chatService.ts, authService.ts)
│   ├── utils/            # Utility functions & helpers
│   ├── types/            # TypeScript type definitions
│   ├── App.tsx           # Root React component
│   ├── main.tsx          # Entry point
│── public/               # Static assets (favicon, icons, images)
│── index.html            # Main HTML template
│── tailwind.config.js    # Tailwind CSS config
│── tsconfig.json         # TypeScript config
│── vite.config.ts        # Vite config
│── package.json          # Dependencies & scripts
│── README.md             # Documentation (this file)
```

---

## ⚡ Project Setup

1. **Create Project**
```bash
npm create vite@latest ai-chat-website --template react-ts
cd ai-chat-website
```

2. **Install Dependencies**
```bash
npm install tailwindcss postcss autoprefixer @radix-ui/react-dialog @radix-ui/react-toast @radix-ui/react-dropdown-menu class-variance-authority tailwind-variants lucide-react
```

3. **Initialize Tailwind**
```bash
npx tailwindcss init -p
```

Update `tailwind.config.js`:
```js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

4. **Setup shadcn/ui**
```bash
npx shadcn-ui init
```

---

## 🖼️ UI Development Workflow

- Create components inside `src/components/`
- Organize pages in `src/pages/`
- Use `src/layouts/` for consistent layouts (Sidebar + Chat Window)
- Manage state with `src/context/`
- Use `src/services/` for API calls

---

## 🔗 Integrating Backend Later

When backend (e.g., **Node.js/Express, Python FastAPI, or Spring Boot**) is ready:

1. **Create API service files** inside `src/services/`
   ```ts
   // src/services/chatService.ts
   export async function sendMessage(message: string) {
     const res = await fetch("http://localhost:5000/api/chat", {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({ message }),
     });
     return res.json();
   }
   ```

2. **Use the service in context or hooks**
   ```ts
   import { sendMessage } from "../services/chatService";

   export function useChat() {
     async function handleSend(msg: string) {
       const response = await sendMessage(msg);
       return response.reply;
     }
     return { handleSend };
   }
   ```

3. **Backend placement**
   - Keep backend in a separate folder: `server/`
   - Example structure:
   ```bash
   ai-chat-website/
   │── src/           # Frontend code
   │── server/        # Backend code (Node.js, Python, etc.)
   │── package.json
   ```

4. **Proxy setup for dev**
   In `vite.config.ts`:
   ```ts
   export default defineConfig({
     server: {
       proxy: {
         "/api": "http://localhost:5000",
       },
     },
   });
   ```

5. **Deployment**
   - Frontend → Deploy on **Vercel/Netlify**
   - Backend → Deploy on **Railway/Render/Heroku/AWS**

---

## ✅ Next Steps

- Build static UI first (Chat Window, Sidebar, Input Box, etc.)
- Integrate dummy data for testing
- Connect backend when ready
- Add authentication (JWT, OAuth)
- Add database (PostgreSQL, MongoDB, or MySQL)
- Optimize performance with caching & pagination

---

## 📌 Notes

- Keep UI clean and modular.
- Use context & hooks for state management.
- All backend communication should go through `src/services/`.
- This ensures **separation of concerns** → easy to maintain and scale.
