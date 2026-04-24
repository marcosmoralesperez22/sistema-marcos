// =============================================
// DEFAULT TASKS — Pre-configured tasks per category
// =============================================

export const CATEGORIES = {
    UNIVERSITY: { id: 'university', name: 'Universidad', emoji: 'menu_book', color: '#e8884f', tagClass: 'tag-university' },
    KLIKIQ: { id: 'klikiq', name: 'KLIKIQ', emoji: 'work', color: '#d4713a', tagClass: 'tag-klikiq' },
    YOUTUBE: { id: 'youtube', name: 'YouTube', emoji: 'play_circle', color: '#f0a070', tagClass: 'tag-youtube' },
    LEARNING: { id: 'aprendizaje', name: 'Aprendizaje', emoji: 'lightbulb', color: '#a09080', tagClass: 'tag-learning' },
    OTHER: { id: 'other', name: 'Otras', emoji: 'sticky_note_2', color: '#5a5048', tagClass: 'tag-other' },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

// Default daily/recurring tasks (not for habits, which are in their own module)
export const DEFAULT_TASKS = [
    // Real "Tasks" go here (one-off or specific items)
];
