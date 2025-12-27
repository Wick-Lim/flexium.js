import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import type { GenerationUnit } from '@/types/generation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Schema without css - styles are in code using css() function
const responseSchema: Schema = {
    type: SchemaType.ARRAY,
    items: {
        type: SchemaType.OBJECT,
        properties: {
            type: {
                type: SchemaType.STRING,
                format: "enum",
                enum: ["chat", "component"]
            },
            content: { type: SchemaType.STRING },  // chat: message, component: name
            code: { type: SchemaType.STRING }      // component only - includes css() calls
        },
        required: ["type", "content"]
    }
};

const SYSTEM_INSTRUCTION = `You are a PREMIUM UI designer. Generate stunning Flexium.js sites.

Output JSON array:
- Chat: {"type":"chat","content":"메시지"}
- Component: {"type":"component","content":"Name","code":"..."}

AVAILABLE FUNCTIONS:
- f(tag, props, children) - create element
- css(styleObj) - create CSS class, returns className string
- use(initial) - create reactive state
- cx(...classes) - combine class names

RULES:
1. Use css() for ALL styling - returns className string
2. code = css declarations + return statement (NO function declarations)
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
  {"type":"component","content":"Hero","code":"const hero = css({ minHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at top, #1a1a3e, #0a0a0f)', padding: '4rem' }); const title = css({ fontSize: '5rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }); const btn = css({ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', padding: '1.2rem 3rem', border: 'none', borderRadius: '50px', cursor: 'pointer', transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-3px)' } }); return f('section', {className: hero}, [f('h1', {className: title}, 'Premium Shop'), f('button', {className: btn}, 'Explore')])"},
  {"type":"component","content":"App","code":"const app = css({ minHeight: '100vh', background: 'linear-gradient(135deg, #0a0a0f, #1a1a2e)', color: '#fff' }); return f('div', {className: app}, [f(Hero, {})])"}
]

Make it BEAUTIFUL. Apple/Stripe quality.`;

export async function POST(req: Request) {
    const { message, history } = await req.json();

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
                if (!closed) controller.enqueue(encoder.encode(`data: ${JSON.stringify(unit)}\n\n`));
            };

            const close = () => {
                if (!closed) { closed = true; controller.close(); }
            };

            try {
                send({ type: 'chat', content: '디자인 중... 🎨' });

                const chat = model.startChat({ history: history || [] });
                const result = await chat.sendMessage(message);
                const text = result.response.text();

                console.log('Response:', text.substring(0, 500));

                const units = JSON.parse(text) as Array<{ type: string; content: string; code?: string }>;

                for (const u of units) {
                    if (u.type === 'chat') {
                        send({ type: 'chat', content: u.content });
                    } else if (u.type === 'component' && u.code) {
                        send({
                            type: 'component',
                            name: u.content,
                            code: u.code,
                            children: [],
                            isRoot: u.content === 'App'
                        });
                    }
                    await new Promise(r => setTimeout(r, 50));
                }

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
