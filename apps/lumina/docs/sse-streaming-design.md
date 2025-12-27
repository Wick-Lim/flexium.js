# Lumina SSE Streaming Architecture Design

## 개요
AI 응답을 SSE(Server-Sent Events) 방식으로 스트리밍하고, 응답 스키마를 고도화하여 실시간으로 챗 메시지와 컴포넌트 코드를 점진적으로 렌더링한다.

## 현재 아키텍처 (As-Is)

```
[User Input] → [API Route] → [Gemini API] → [Full JSON Response] → [Parse & Render]
```

**문제점:**
1. 전체 응답이 완료될 때까지 대기 (체감 속도 느림)
2. 단일 componentBody로 모든 코드가 한 번에 내려옴
3. AI가 무엇을 하는지 실시간으로 알 수 없음
4. 에러 발생 시 전체 실패

## 개선 아키텍처 (To-Be)

```
[User Input] → [API Route] → [Gemini Streaming API] → [SSE Chunks] → [Progressive Render]
```

---

## 1. 응답 스키마 설계

### 1.1 Unit 타입 정의 (컴포넌트 중심)

```typescript
// types/generation.ts

/** 
 * 컴포넌트 단위 - CSS가 컴포넌트에 포함됨 (자기완결적)
 * 각 컴포넌트는 자신의 스타일을 갖고 내려옴
 */
interface ComponentUnit {
  type: 'component';
  name: string;              // "Header", "HeroSection", "ProductCard"
  code: string;              // 컴포넌트 함수 본문
  css: string;               // 이 컴포넌트에 적용되는 CSS
  children?: string[];       // 자식 컴포넌트 참조 ["ProductCard", "Button"]
  isRoot?: boolean;          // App 컴포넌트인지 여부
}

/** AI가 현재 작업을 설명하는 채팅 단위 */
interface ChatUnit {
  type: 'chat';
  content: string;  // "화장품 브랜드 사이트를 만들고 있어요..."
}

/** 에러 단위 */
interface ErrorUnit {
  type: 'error';
  message: string;
  recoverable: boolean;
}

/** 완료 단위 */
interface DoneUnit {
  type: 'done';
  summary: string;
}

type GenerationUnit = ComponentUnit | ChatUnit | ErrorUnit | DoneUnit;

// 응답은 GenerationUnit 배열
type GenerationResponse = GenerationUnit[];
```

### 설계 이점
1. **자기완결적 컴포넌트**: CSS가 컴포넌트에 포함되어 관리 용이
2. **독립적 수정 가능**: 나중에 특정 컴포넌트만 재생성 가능
3. **점진적 렌더링**: 컴포넌트 단위로 프리뷰 업데이트
4. **디버깅 용이**: 어떤 컴포넌트의 CSS인지 명확

### 1.2 예시 스트림 시퀀스

컴포넌트가 도착할 때마다 **자기 자리를 찾아서 탁탁탁** 붙는 방식:

```
→ { type: 'chat', content: '화장품 브랜드 사이트를 디자인하고 있어요 ✨' }

→ { type: 'chat', content: 'Header 컴포넌트를 만드는 중...' }
→ { 
    type: 'component', 
    name: 'Header', 
    code: "return f('header', { className: 'header' }, [...])",
    css: ".header { display: flex; backdrop-filter: blur(10px); ... }",
    children: [] 
  }
  // 🎯 Header가 화면 상단에 탁!

→ { type: 'chat', content: 'HeroSection을 작성 중...' }
→ { 
    type: 'component', 
    name: 'HeroSection', 
    code: "return f('section', { className: 'hero' }, [f(CTAButton)])",
    css: ".hero { min-height: 80vh; background: linear-gradient(...); ... }",
    children: ['CTAButton']  // CTAButton 필요함을 명시
  }
  // 🎯 HeroSection이 Header 아래에 탁! (CTAButton은 placeholder)

→ { 
    type: 'component', 
    name: 'CTAButton', 
    code: "return f('button', { className: 'cta' }, 'Shop Now')",
    css: ".cta { padding: 1rem 2rem; background: #8b5cf6; ... }",
    children: []
  }
  // 🎯 CTAButton이 HeroSection 안에 탁! (placeholder 교체)

→ { 
    type: 'component', 
    name: 'App', 
    code: "return f('div', { className: 'app' }, [f(Header), f(HeroSection)])",
    css: ".app { width: 100%; min-height: 100vh; ... }",
    children: ['Header', 'HeroSection'],
    isRoot: true  
  }
  // 🎯 App이 전체 구조를 확정!

→ { type: 'done', summary: '화장품 브랜드 사이트가 완성되었어요!' }
```

### 1.3 렌더링 흐름

```
시간 ────────────────────────────────────────────────────────►

[Header 도착]     [Hero 도착]      [CTAButton 도착]    [App 도착]
     │                 │                  │                │
     ▼                 ▼                  ▼                ▼
┌─────────┐     ┌─────────────┐    ┌─────────────┐   ┌─────────────┐
│ Header  │     │   Header    │    │   Header    │   │   Header    │
│         │     ├─────────────┤    ├─────────────┤   ├─────────────┤
│         │     │    Hero     │    │    Hero     │   │    Hero     │
│         │     │  [loading]  │    │  [CTABtn]   │   │  [CTABtn]   │
│         │     │             │    │             │   ├─────────────┤
└─────────┘     └─────────────┘    └─────────────┘   │  (Footer?)  │
                                                      └─────────────┘
                                                          완성!
```

---

## 2. API Route 구현 (SSE)

### 2.1 SSE 응답 생성

```typescript
// app/api/generate/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { message, history } = await req.json();
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: STREAMING_SYSTEM_INSTRUCTION
  });

  // SSE 스트림 생성
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      
      const sendChunk = (chunk: GenerationChunk) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
      };
      
      try {
        const chat = model.startChat({ history: history || [] });
        const result = await chat.sendMessageStream(message);
        
        let buffer = '';
        
        for await (const chunk of result.stream) {
          buffer += chunk.text();
          
          // JSON 청크가 완성되면 파싱해서 전송
          const chunks = parseBufferToChunks(buffer);
          for (const parsed of chunks.complete) {
            sendChunk(parsed);
          }
          buffer = chunks.remaining;
        }
        
        // 완료 신호
        sendChunk({ type: 'done', summary: 'Generation complete!' });
        
      } catch (error) {
        sendChunk({ 
          type: 'error', 
          message: error.message, 
          recoverable: false 
        });
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

---

## 3. 클라이언트 구현

### 3.1 SSE 핸들러

```typescript
// hooks/useGeneration.ts

interface GenerationState {
  chatMessages: string[];
  components: Map<string, ComponentUnit>;  // CSS가 컴포넌트에 포함됨
  isLoading: boolean;
  error: string | null;
}

function useGeneration() {
  const [state, setState] = useState<GenerationState>({
    chatMessages: [],
    components: new Map(),
    isLoading: false,
    error: null
  });

  const generate = async (prompt: string, history: any[]) => {
    setState(s => ({ ...s, isLoading: true, error: null, components: new Map() }));
    
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: prompt, history })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n\n').filter(Boolean);

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        
        const unit: GenerationUnit = JSON.parse(line.slice(6));
        handleUnit(unit, setState);
      }
    }
    
    setState(s => ({ ...s, isLoading: false }));
  };

  // CSS는 컴포넌트에서 추출하여 병합
  const mergedCss = useMemo(() => {
    return [...state.components.values()]
      .map(c => c.css)
      .join('\n');
  }, [state.components]);

  return { ...state, css: mergedCss, generate };
}

function handleUnit(unit: GenerationUnit, setState: Function) {
  switch (unit.type) {
    case 'chat':
      setState(s => ({
        ...s,
        chatMessages: [...s.chatMessages, unit.content]
      }));
      break;
      
    case 'component':
      // 컴포넌트 도착! 자기 자리 찾아서 탁!
      setState(s => {
        const components = new Map(s.components);
        components.set(unit.name, unit);  // CSS도 함께 저장됨
        return { ...s, components };
      });
      break;
      
    case 'error':
      setState(s => ({ ...s, error: unit.message }));
      break;
      
    case 'done':
      console.log('Generation complete:', unit.summary);
      break;
  }
}
```

### 3.2 컴포넌트 트리 병합

```typescript
// utils/mergeComponents.ts

function buildComponentTree(components: Map<string, ComponentUnit>): { code: string; css: string } {
  // 1. 루트 컴포넌트 찾기
  const rootComponent = [...components.values()].find(c => c.isRoot);
  if (!rootComponent) return { code: '', css: '' };

  // 2. 모든 컴포넌트 정의 생성
  const componentDefs = [...components.values()]
    .filter(c => !c.isRoot)
    .map(c => `function ${c.name}() { ${c.code} }`)
    .join('\n');

  // 3. 모든 CSS 병합 (각 컴포넌트의 css 필드에서)
  const mergedCss = [...components.values()]
    .map(c => `/* ${c.name} */\n${c.css}`)
    .join('\n\n');

  // 4. 최종 코드 생성
  const code = `
    ${componentDefs}
    ${rootComponent.code}
  `;

  return { code, css: mergedCss };
}
```

---

## 4. System Instruction 업데이트

```typescript
export const STREAMING_SYSTEM_INSTRUCTION = `
You are a world-class UI designer. Generate websites as a JSON array of units.

### Response Format:
Respond with a JSON array. Each element is either a chat or a component.

### Unit Types:
1. **ChatUnit**: { "type": "chat", "content": "설명..." }
2. **ComponentUnit**: { "type": "component", "name": "...", "code": "...", "css": "...", "children": [...], "isRoot": boolean }

### Component Rules:
1. 각 컴포넌트는 별도의 배열 요소로 분리
2. name: PascalCase 컴포넌트 이름 (Header, HeroSection, ProductCard)
3. code: 컴포넌트 함수 본문 (return f(...) 포함)
4. css: 이 컴포넌트에 해당하는 CSS 스타일 (자기완결적)
5. children: 사용하는 자식 컴포넌트 이름 배열
6. isRoot: true면 App 컴포넌트 (최상위)

### Chat Rules:
1. 각 작업 단계마다 chat 추가
2. 사용자에게 진행 상황 설명
3. 한국어로 친근하게

### Example Response:
[
  { "type": "chat", "content": "화장품 브랜드 사이트를 만들어볼게요 ✨" },
  { "type": "chat", "content": "먼저 헤더를 디자인할게요..." },
  { 
    "type": "component", 
    "name": "Header", 
    "code": "return f('header', { className: 'header' }, [f('h1', {}, 'Brand')])",
    "css": ".header { display: flex; backdrop-filter: blur(10px); background: rgba(0,0,0,0.5); }",
    "children": [] 
  },
  { "type": "chat", "content": "히어로 섹션을 추가하고 있어요..." },
  { 
    "type": "component", 
    "name": "HeroSection", 
    "code": "return f('section', { className: 'hero' }, [f('h1', {}, 'Welcome'), f(CTAButton)])",
    "css": ".hero { min-height: 80vh; background: linear-gradient(135deg, #8b5cf6, #3b82f6); }",
    "children": ["CTAButton"] 
  },
  { 
    "type": "component", 
    "name": "CTAButton", 
    "code": "return f('button', { className: 'cta', onclick: () => alert('Clicked!') }, 'Shop Now')",
    "css": ".cta { padding: 1rem 2rem; background: #8b5cf6; border-radius: 8px; }",
    "children": [] 
  },
  { 
    "type": "component", 
    "name": "App", 
    "code": "return f('div', { className: 'app' }, [f(Header), f(HeroSection)])",
    "css": ".app { width: 100%; min-height: 100vh; background: #09090b; }",
    "children": ["Header", "HeroSection"], 
    "isRoot": true 
  }
]
`;
```

---

## 5. UI 개선 사항

### 5.1 실시간 채팅 메시지
- AI가 보내는 `chat` 청크를 실시간으로 말풍선에 표시
- 타이핑 애니메이션 효과

### 5.2 컴포넌트 진행률
- 수신된 컴포넌트 수 / 예상 컴포넌트 수 표시
- 각 컴포넌트 완료 시 체크마크 애니메이션

### 5.3 점진적 렌더링
- 새 컴포넌트가 도착할 때마다 프리뷰 업데이트
- 부분적으로 렌더링된 상태도 표시

---

## 6. 구현 순서

### Phase 1: 기본 SSE 인프라
1. [ ] 타입 정의 (`types/generation.ts`)
2. [ ] SSE API 라우트 (`api/generate/route.ts`)
3. [ ] 클라이언트 SSE 핸들러 (`hooks/useGeneration.ts`)

### Phase 2: 스키마 고도화
4. [ ] System Instruction 업데이트
5. [ ] 컴포넌트 파싱 로직
6. [ ] 컴포넌트 트리 병합

### Phase 3: UI 개선
7. [ ] 실시간 채팅 UI
8. [ ] 진행률 표시
9. [ ] 점진적 렌더링

---

## 7. 고려 사항

### 7.1 Gemini Structured Output과 Streaming 호환성
- `responseSchema`와 `sendMessageStream`을 동시에 사용할 수 있는지 확인 필요
- 안 되면 JSON 배열을 직접 파싱하는 방식으로 대체

### 7.2 중간 상태 렌더링
- 아직 자식이 도착하지 않은 컴포넌트 처리
- placeholder 또는 skeleton UI 표시

### 7.3 에러 복구
- 일부 컴포넌트 실패 시 나머지만 렌더링
- 재시도 메커니즘

---

## 다음 단계

이 설계에 동의하시면 Phase 1부터 구현을 시작하겠습니다.
