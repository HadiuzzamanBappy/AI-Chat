/**
 * StarterTemplates Component
 * 
 * Interactive template grid that displays predefined conversation starters.
 * Features staggered animations and responsive layout to help users quickly
 * begin conversations with suggested prompts and topics.
 */

import { motion } from 'framer-motion';
import { type Starter } from '@/lib/starters';

/** Component props interface for starter template functionality */
interface StarterTemplatesProps {
    /** Array of predefined starter templates */
    starters: Starter[];
    /** Callback when user selects a starter template */
    onSelectStarter: (prompt: string) => void;
}

/**
 * Animated Template Grid
 * 
 * Displays conversation starter templates in a responsive grid layout
 * with smooth staggered entrance animations and hover interactions.
 */
export function StarterTemplates({ starters, onSelectStarter }: StarterTemplatesProps) {
    // Container animation with staggered child reveals
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    // Individual template item animations
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
                    {/* Template header with icon and title (hidden on small screens) */}
                    <div className="items-center gap-3 mb-2 hidden sm:block">
                        <starter.icon className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold text-foreground">{starter.title}</h3>
                    </div>
                    {/* Template description - always visible */}
                    <p className="text-sm text-muted-foreground">{starter.description}</p>
                </motion.div>
            ))}
        </motion.div>
    );
}