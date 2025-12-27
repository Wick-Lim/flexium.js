import { GoogleGenerativeAI, SchemaType, type Schema } from '@google/generative-ai';
import { SYSTEM_INSTRUCTION } from '@/lib/gemini';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
        css: {
            type: SchemaType.STRING,
            description: `Complete CSS styles for the website. Requirements:
- Root element must have width: 100%; height: 100%;
- Use glassmorphism (backdrop-filter, rgba backgrounds)
- Use gradients for backgrounds and text
- Include hover effects and transitions
- Use dark theme (#09090b, #18181b) with violet accents (#8b5cf6)
- Use flexbox/grid for layouts
- Include @keyframes for animations if needed`
        },
        componentBody: {
            type: SchemaType.STRING,
            description: `JavaScript code that creates and returns a DOM element. Requirements:
- Use 'use(initialValue)' for reactive state, returns [value, setter]
- Access state directly as value (NOT value())
- Use 'sync(() => { ... })' for effects that run on state change
- MUST return a DOM HTMLElement
- Use template literals for innerHTML
- Reattach event listeners inside sync() after innerHTML updates
- NO imports, NO export default`
        }
    },
    required: ["css", "componentBody"]
};

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const chat = model.startChat({
            history: history || []
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        return Response.json({ text: responseText });
    } catch (error) {
        console.error('Gemini API Error:', error);
        return Response.json({ error: 'Failed to process request' }, { status: 500 });
    }
}
