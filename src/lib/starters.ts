// src/lib/starters.ts

import { Code, Database, Brush, GitMerge } from "lucide-react";

export interface Starter {
    title: string;
    description: string;
    prompt: string;
    icon: React.ElementType;
}

export const starterTemplates: Starter[] = [
    {
        title: "Create React Component",
        description:
            "Generate a functional component with TypeScript and Tailwind CSS.",
        prompt: `Create a new React functional component named 'MyComponent'. It should use TypeScript for props and state. The component should render a simple div with Tailwind CSS classes for styling. Include a basic example of using the useState and useEffect hooks.`,
        icon: Code,
    },
    {
        title: "Optimize SQL Query",
        description: "Provide an SQL query to analyze and suggest improvements.",
        prompt: `I have the following SQL query that is running slowly. Please analyze it, explain the potential bottlenecks, and provide an optimized version. Here is the query:\n\n-- Paste your SQL query here --`,
        icon: Database,
    },
    {
        title: "Review UI/UX Design",
        description: "Get feedback on a design concept or user flow.",
        prompt: `I am working on a UI/UX design for a new feature. Here is the concept: [Describe your design concept, user goal, and target audience].\n\nPlease provide feedback from a user-centric perspective. What are the potential usability issues? What are the strengths of this design? How could the user flow be improved?`,
        icon: Brush,
    },
    {
        title: "Explain Git Command",
        description: "Get a clear explanation of a complex Git command.",
        prompt: `Please explain the Git command 'git rebase -i HEAD~5' in simple terms. What does it do, what is the '-i' flag for, and what is a common use case for this command? Provide a step-by-step example.`,
        icon: GitMerge,
    },
];
