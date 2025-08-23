// src/components/StarterTemplates.tsx

import { motion } from 'framer-motion';
import { type Starter } from '@/lib/starters';

interface StarterTemplatesProps {
    starters: Starter[];
    onSelectStarter: (prompt: string) => void;
}

export function StarterTemplates({ starters, onSelectStarter }: StarterTemplatesProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-4"
        >
            {starters.map((starter) => (
                <motion.div
                    key={starter.title}
                    variants={itemVariants}
                    className="bg-gray-500/10 hover:bg-secondary-hover p-4 rounded-lg cursor-pointer transition-colors"
                    onClick={() => onSelectStarter(starter.prompt)}
                >
                    <div className="items-center gap-3 mb-2 hidden sm:block">
                        <starter.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{starter.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{starter.description}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}