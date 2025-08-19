import { type Knowledgebase } from "./types";

export const defaultKnowledgebase: Knowledgebase = {
    id: 'default-kb-1',
    name: 'Default Personal Context',
    content: `
        My name is Hadiuzzaman Bappy. I am a senior UI/UX designer and frontend developer, currently working as an IT Officer at a bank. 
        My primary tech stack includes Ui/Ux Design, React, TypeScript, Vite, and Tailwind CSS.
        When providing code examples, please adhere to modern best practices, focusing on clarity, maintainability, and strong typing.
        When discussing design, prioritize accessibility (WCAG 2.1), intuitive user flows, and a clean, minimalist aesthetic.
        You can assume I have a high level of technical expertise in these areas.
    `.trim(),
    files: [],
    isActive: true,
};