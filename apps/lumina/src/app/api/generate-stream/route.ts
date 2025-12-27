import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import type { GenerationUnit } from '@/types/generation';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Minimal schema - type determines how content is used
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
            code: { type: SchemaType.STRING },     // component only
            css: { type: SchemaType.STRING }       // component only
        },
        required: ["type", "content"]
    }
};

const SYSTEM_INSTRUCTION = `You are a PREMIUM UI designer. Generate stunning Flexium.js sites.

Output JSON array:
- Chat: {"type":"chat","content":"메시지"}
- Component: {"type":"component","content":"Name","code":"...","css":"..."}

RULES:
1. code = ONLY return statement (NO function declarations)
2. DO NOT use props - hardcode all data
3. HTML: f('div', {}, []) with quotes
4. Components: f(Header, {}) NO quotes
5. State: const [val, setVal] = use(0)

🎨 DESIGN REQUIREMENTS (CRITICAL):
- Background: Deep gradients (linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%))
- Cards: Glassmorphism (background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1))
- Accent: Vibrant gradient buttons (linear-gradient(135deg, #667eea, #764ba2))
- Typography: Large hero text (4rem+), elegant spacing
- Spacing: Generous padding (3rem+), breathing room
- Shadows: Layered (0 25px 50px -12px rgba(0,0,0,0.5))
- Animations: Smooth transitions (0.3s ease), hover transforms (translateY, scale)
- Images: Use picsum.photos with ?grayscale for premium feel
- Borders: Subtle gradients or glowing borders

CSS patterns to use:
- .card { background: rgba(255,255,255,0.03); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; }
- .btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 10px 40px rgba(102,126,234,0.4); }
- .hero { background: radial-gradient(ellipse at top, #1a1a3e, #0a0a0f); min-height: 80vh; }

Example:
[
  {"type":"component","content":"Hero","code":"return f('section',{className:'hero'},[f('h1',{className:'title'},'Premium Shop'),f('p',{className:'subtitle'},'Discover exclusive products'),f('button',{className:'cta'},'Explore Now')])","css":".hero{min-height:90vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(ellipse at top,#1a1a3e 0%,#0a0a0f 100%);text-align:center;padding:4rem}.title{font-size:5rem;background:linear-gradient(135deg,#fff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:1.5rem;font-weight:800}.subtitle{font-size:1.5rem;color:rgba(255,255,255,0.7);margin-bottom:3rem}.cta{background:linear-gradient(135deg,#667eea,#764ba2);color:white;padding:1.2rem 3rem;border:none;border-radius:50px;font-size:1.2rem;cursor:pointer;box-shadow:0 20px 40px rgba(102,126,234,0.4);transition:all 0.3s ease}.cta:hover{transform:translateY(-3px);box-shadow:0 30px 60px rgba(102,126,234,0.5)}"}
]

Make it BEAUTIFUL. Think Apple, Stripe, Linear quality.`;

export async function POST(req: Request) {
    const { message, history } = await req.json();

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
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

                const units = JSON.parse(text) as Array<{ type: string; content: string; code?: string; css?: string }>;

                for (const u of units) {
                    if (u.type === 'chat') {
                        send({ type: 'chat', content: u.content });
                    } else if (u.type === 'component' && u.code) {
                        send({
                            type: 'component',
                            name: u.content,  // content -> name
                            code: u.code,
                            css: u.css || '',
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
