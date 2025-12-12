/**
 * Owner & Scope Management
 * 
 * 이 파일의 역할:
 * 1. Owner 스코프 관리 (getOwner, setOwner)
 * 2. Cleanup 관리 (cleanups 배열)
 * 3. Context 관리 (context 객체)
 * 4. root() 함수 (새로운 스코프 생성)
 * 
 * 핵심 원리:
 * - Owner는 반응성 스코프를 나타냄
 * - Owner가 dispose되면 모든 cleanup 함수 실행
 * - Context는 Owner 체인을 통해 전파됨
 * 
 * 다른 파일과의 관계:
 * - effect.ts: getOwner() 사용 (EffectNode가 Owner에 등록)
 * - context.ts: getOwner() 사용 (Context 값 조회)
 * 
 * Note: activeEffect 관리는 proxy.ts에 있음 (의존성 추적의 핵심)
 */

// ==================================================================================
// 1. Owner & Scope Management
// ==================================================================================

export interface Owner {
    cleanups: (() => void)[]
    context: Record<symbol, unknown> | null
    owner: Owner | null // Parent owner
}

let owner: Owner | null = null

/**
 * Get the current owner (scope)
 * @internal
 */
export function getOwner(): Owner | null {
    return owner
}

/**
 * Set the current owner (scope)
 * @internal
 */
export function setOwner(newOwner: Owner | null): void {
    owner = newOwner
}

/**
 * Creates a disposal scope.
 * The return value of the function is returned, and a dispose function is returned.
 *
 * @param fn - Function to run within a new root scope
 * @returns [return value of fn, dispose function]
 *
 * @example
 * ```tsx
 * const [val, dispose] = root((dispose) => {
 *   effect(() => console.log('Inside root'));
 *   return 123;
 * });
 * dispose(); // Cleans up all effects created inside
 * ```
 */
export function root<T>(fn: (dispose: () => void) => T): T {
    const prevOwner = owner
    const newOwner: Owner = {
        cleanups: [],
        context: prevOwner ? Object.create(prevOwner.context) : null,
        owner: prevOwner,
    }

    owner = newOwner

    const dispose = () => {
        // Performance: Fast path when no cleanups
        if (newOwner.cleanups.length === 0) return
        
        for (const cleanup of newOwner.cleanups) {
            cleanup()
        }
        newOwner.cleanups = []
    }

    try {
        return fn(dispose)
    } finally {
        owner = prevOwner
    }
}


