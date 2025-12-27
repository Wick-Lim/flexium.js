// Generation Unit Types
// Styles are now inside code using css() function

/** 
 * Component Unit - styles are in code using css() function
 * Each component uses css() for styling
 */
export interface ComponentUnit {
    type: 'component';
    name: string;              // "Header", "HeroSection", "ProductCard"
    code: string;              // Component code with css() calls
    children?: string[];       // Child component references
    isRoot?: boolean;          // True if this is the App component
}

/** Chat Unit - AI explains what it's doing */
export interface ChatUnit {
    type: 'chat';
    content: string;           // "화장품 브랜드 사이트를 만들고 있어요..."
}

/** Error Unit */
export interface ErrorUnit {
    type: 'error';
    message: string;
    recoverable: boolean;
}

/** Done Unit - Generation complete */
export interface DoneUnit {
    type: 'done';
    summary: string;
}

export type GenerationUnit = ComponentUnit | ChatUnit | ErrorUnit | DoneUnit;

/** Full response is an array of units */
export type GenerationResponse = GenerationUnit[];

/** Parsed state from SSE stream */
export interface GenerationState {
    chatMessages: string[];
    components: Map<string, ComponentUnit>;
    isLoading: boolean;
    error: string | null;
}
