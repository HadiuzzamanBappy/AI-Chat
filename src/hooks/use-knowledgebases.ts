import { useState, useEffect } from 'react';
import { type Knowledgebase } from '@/lib/types';

const STORAGE_KEY = 'app_knowledgebases';
const ACTIVE_KNOWLEDGEBASE_KEY = 'user_knowledgebase';

export function useKnowledgebases() {
    // UPDATED: This now *only* loads from localStorage, or defaults to a truly empty array.
    const [knowledgebases, setKnowledgebases] = useState<Knowledgebase[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load knowledgebases:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            const activeKb = knowledgebases.find(kb => kb.isActive);
            const combinedContent = activeKb
                ? [activeKb.content, ...activeKb.files.map(f => `\n--- File: ${f.name} ---\n${f.content}`)].join('\n')
                : '';

            // We only save user-created knowledgebases here.
            localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledgebases));

            // The active key is now ONLY for user-activated KBs.
            if (combinedContent) {
                localStorage.setItem(ACTIVE_KNOWLEDGEBASE_KEY, combinedContent);
            } else {
                localStorage.removeItem(ACTIVE_KNOWLEDGEBASE_KEY);
            }
        } catch (error) {
            console.error('Failed to save knowledgebases:', error);
        }
    }, [knowledgebases]);

    const addKnowledgebase = (name: string) => {
        const newKb: Knowledgebase = {
            id: Date.now().toString(),
            name,
            content: '',
            files: [],
            isActive: false,
        };
        setKnowledgebases(prev => [...prev, newKb]);
    };

    const deleteKnowledgebase = (id: string) => {
        setKnowledgebases(prev => prev.filter(kb => kb.id !== id));
    };

    const updateKnowledgebase = (id: string, updates: Partial<Knowledgebase>) => {
        setKnowledgebases(prev =>
            prev.map(kb => (kb.id === id ? { ...kb, ...updates } : kb))
        );
    };

    const setActiveKnowledgebase = (id: string | null) => {
        setKnowledgebases(prev =>
            prev.map(kb => ({ ...kb, isActive: kb.id === id }))
        );
    };

    return {
        knowledgebases,
        addKnowledgebase,
        deleteKnowledgebase,
        updateKnowledgebase,
        setActiveKnowledgebase,
    };
}