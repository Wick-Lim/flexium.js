import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { Readable } from 'stream';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import type { GenerationUnit } from '@/types/generation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Schema for AI response - chat messages and component code
const responseSchema: Schema = {
    type: SchemaType.ARRAY,
    description: "Array of generation units - chat messages and components in order",
    items: {
        type: SchemaType.OBJECT,
        description: "A single generation unit - either a chat message or component code",
        properties: {
            type: {
                type: SchemaType.STRING,
                description: "Unit type: 'chat' for messages, 'component' for Flexium component code",
                format: "enum",
                enum: ["chat", "component"]
            },
            name: {
                type: SchemaType.STRING,
                description: "For component only: the component name (e.g., 'Hero', 'Header', 'App')"
            },
            content: {
                type: SchemaType.STRING,
                description: "For chat: the message text. For component: the Flexium component body code"
            }
        },
        required: ["type", "content"]
    }
};


const SYSTEM_INSTRUCTION = `You are a PREMIUM UI designer. Generate stunning Flexium.js sites.

Output JSON array:
- Chat: {"type":"chat","content":"메시지"}
- Component: {"type":"component","name":"ComponentName","content":"...code..."}

AVAILABLE FUNCTIONS:
- f(tag, props, children) - create element
- css(styleObj) - create CSS class, returns className string
- use(initial) - create reactive state
- cx(...classes) - combine class names

RULES:
1. Use css() for ALL styling - returns className string
2. content = css declarations + return statement (NO function declarations)
3. DO NOT use props - hardcode all data
4. HTML: f('div', {className: myClass}, []) with quotes
5. Components: f(Header, {}) NO quotes
6. State: const [val, setVal] = use(0)

css() SYNTAX:
- const btn = css({ background: '#1a1a1a', padding: '1rem' })
- Pseudo: css({ background: '#fff', '&:hover': { background: '#eee' } })
- Use camelCase: fontSize, backgroundColor, borderRadius

🎨 DESIGN (CRITICAL):
- Background: linear-gradient(135deg, #0a0a0f, #1a1a2e)
- Cards: rgba(255,255,255,0.03), backdropFilter: 'blur(16px)'
- Buttons: gradient backgrounds, box shadows
- Typography: Large (4rem+), gradient text
- Animations: transition: 'all 0.3s ease'

Example:
[
  {"type":"component","name":"Hero","content":"const hero = css({ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1a1a3e, #0a0a0f)', padding: '4rem' }); const title = css({ fontSize: '5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }); const btn = css({ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '1.2rem 3rem', border: 'none', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-3px)' } }); return f('section', {className: hero}, [f('h1', {className: title}, 'Premium Shop'), f('button', {className: btn}, 'Explore')])"},
  {"type":"component","name":"App","content":"const app = css({ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', color: '#fff' }); return f('div', {className: app}, [f(Hero, {})])"}
]

Make it BEAUTIFUL. Apple/Stripe quality.

MODIFICATION MODE:
If currentComponents is provided, you are MODIFYING an existing site.
- Only return components that need to be changed
- Keep the same component names
- Don't regenerate unchanged components`;

export async function POST(req: Request) {
    const { message, history, currentComponents } = await req.json();

    // Build the actual message with current code context
    let fullMessage = message;
    if (currentComponents && currentComponents.length > 0) {
        const componentSummary = currentComponents
            .map((c: { name: string; code: string; isRoot: boolean }) =>
                `${c.name}${c.isRoot ? ' (App)' : ''}: ${c.code.slice(0, 100)}...`)
            .join('\n');
        fullMessage = `[MODIFICATION MODE - Current components:]\n${componentSummary}\n\n[User request:] ${message}`;
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-3-flash-preview',
        systemInstruction: SYSTEM_INSTRUCTION,
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema
        }
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            let closed = false;

            const send = (unit: GenerationUnit) => {
                if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(unit)} \n\n`));
            };

            const close = () => {
                if (!closed) { closed = true; controller.close(); }
            };

            try {
                send({ type: 'chat', content: '디자인 중... 🎨' });

                const chat = model.startChat({ history: history || [] });
                const result = await chat.sendMessageStream(fullMessage);

                // Create a Node.js readable stream from Gemini chunks
                const textStream = new Readable({
                    read() { }
                });

                // Setup stream-json pipeline for event-driven parsing
                const jsonParser = parser();
                const arrayStream = streamArray();

                // Pipe: textStream -> jsonParser -> arrayStream
                textStream.pipe(jsonParser).pipe(arrayStream);

                // Handle each complete array item as it's parsed
                arrayStream.on('data', ({ value }) => {
                    console.log(`[STREAM - JSON] Object parsed: `, value?.type, value?.content);

                    if (value.type === 'chat') {
                        send({ type: 'chat', content: value.content });
                    } else if (value.type === 'component' && value.name && value.content) {
                        const isRoot = value.name === 'App';
                        send({
                            type: 'component',
                            name: value.name,
                            code: value.content,
                            children: [],
                            isRoot
                        });
                        // Skip progress message for App since 'done' follows immediately
                        if (!isRoot) {
                            send({ type: 'chat', content: `✨ ${value.name} 생성됨` });
                        }
                    }
                });

                // Feed chunks from Gemini into the text stream
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    console.log(`[GEMINI] Chunk: +${text.length} chars`);
                    textStream.push(text);
                }

                // Signal end of input
                textStream.push(null);

                // Wait for parsing to complete
                await new Promise<void>((resolve, reject) => {
                    arrayStream.on('end', () => {
                        console.log('[STREAM-JSON] Parsing complete');
                        resolve();
                    });
                    arrayStream.on('error', reject);
                });

                send({ type: 'done', summary: '완료! ✨' });

            } catch (error) {
                console.error('Error:', error);
                send({ type: 'error', message: String(error), recoverable: false });
            } finally {
                close();
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
