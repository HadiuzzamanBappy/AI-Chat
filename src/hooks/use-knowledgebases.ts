/**
 * useKnowledgebases Hook
 * 
 * Manages knowledge base storage and activation with localStorage persistence.
 * Combines content and files into unified context for active knowledge bases.
 */

import { useState, useEffect } from 'react';
import { type Knowledgebase } from '@/lib/types';

const STORAGE_KEY = 'app_knowledgebases';
const ACTIVE_KNOWLEDGEBASE_KEY = 'user_knowledgebase';

/**
 * Knowledge Base Management Hook
 * 
 * Handles CRUD operations and active knowledge base content compilation.
 * Automatically syncs active content to separate storage key for quick access.
 */
export function useKnowledgebases() {
    // Initialize from localStorage or empty array
    const [knowledgebases, setKnowledgebases] = useState<Knowledgebase[]>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load knowledgebases:', error);
            return [];
        }
    });

    // Effect: Save knowledge bases and compile active content
    useEffect(() => {
        try {
            const activeKb = knowledgebases.find(kb => kb.isActive);
            const combinedContent = activeKb
                ? [activeKb.content, ...activeKb.files.map(f => `\n--- File: ${f.name} ---\n${f.content}`)].join('\n')
                : '';

            // Save knowledge bases to primary storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(knowledgebases));

            // Save active content to separate key for quick access
            if (combinedContent) {
                localStorage.setItem(ACTIVE_KNOWLEDGEBASE_KEY, combinedContent);
            } else {
                localStorage.removeItem(ACTIVE_KNOWLEDGEBASE_KEY);
            }
        } catch (error) {
            console.error('Failed to save knowledgebases:', error);
        }
    }, [knowledgebases]);

    /** Creates new empty knowledge base */
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

    /** Removes knowledge base by ID */
    const deleteKnowledgebase = (id: string) => {
        setKnowledgebases(prev => prev.filter(kb => kb.id !== id));
    };

    /** Updates knowledge base properties */
    const updateKnowledgebase = (id: string, updates: Partial<Knowledgebase>) => {
        setKnowledgebases(prev =>
            prev.map(kb => (kb.id === id ? { ...kb, ...updates } : kb))
        );
    };

    /** Sets active knowledge base (only one can be active) */
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