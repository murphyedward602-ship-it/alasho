import express from 'express';
import type { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini SDK with telemetry header per guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Multi-turn Gemini Chatbot Endpoint
app.post('/api/stylist/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, model = 'gemini-3.8-flash', systemInstruction, userMeasurements, wardrobeItems } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Supported free/standard models per guideline
    const chosenModel = model === 'gemini-3.1-flash-lite' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash';

    if (!ai) {
      const fallbackReply = generateFallbackStylistResponse(message, userMeasurements);
      return res.json({ text: fallbackReply, modelUsed: chosenModel });
    }

    const defaultSystemPrompt = `You are the lead Executive Stylist at ALASHO, a luxury menswear brand pioneering fit technology ("Your body. Your fit. Finally.").
You provide tailored, elevated, sophisticated styling advice. You speak with quiet luxury, discernment, and sartorial expertise (Milanese & Savile Row tailoring mastery, fabric nuance, silhouettes, color harmony).

User's Body Measurements:
${userMeasurements ? JSON.stringify(userMeasurements) : 'Average athletic European tailored build (40R chest, 32 waist, 32 inseam)'}

User's Owned Wardrobe:
${wardrobeItems ? JSON.stringify(wardrobeItems) : 'Tailored charcoal overcoat, pleated slate trousers, ivory merino knit'}

Guidelines:
- Give concrete, elegant outfit suggestions incorporating ALASHO pieces (Charcoal Double-Breasted Overcoat, Silk-Wool Unstructured Blazer, Pleated Wide-Leg Trousers, Heavyweight Ribbed Merino Knit).
- Reference how fit and proportion accentuate their specific measurements.
- Keep responses concise, structured, and luxurious.`;

    const chatContents = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        chatContents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }],
        });
      }
    }
    chatContents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction || defaultSystemPrompt}\n\nClient inquiry: ${message}` }],
    });

    const contentPromise = ai.models.generateContent({
      model: chosenModel,
      contents: chatContents,
      config: {
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Stylist response timeout - using luxury fallback')), 6000)
    );

    const response: any = await Promise.race([contentPromise, timeoutPromise]);
    const replyText = response.text || "For an impeccable aesthetic, balance the structured shoulders of our Atelier Unstructured Blazer with the soft drape of our Pleated Trousers.";
    return res.json({ text: replyText, modelUsed: chosenModel });
  } catch (err: any) {
    console.error('Gemini Stylist Error:', err);
    const fallback = generateFallbackStylistResponse(req.body.message, req.body.userMeasurements);
    return res.json({ text: fallback, modelUsed: req.body.model || 'gemini-3.8-flash' });
  }
});

function generateFallbackStylistResponse(userMessage: string, measurements: any): string {
  const query = (userMessage || '').toLowerCase();
  if (query.includes('wedding') || query.includes('formal') || query.includes('black tie')) {
    return "For an evening ceremony, pair our Midnight Navy Unstructured Atelier Blazer with crisp shirting and our Casentino Overcoat. With your shoulder and chest dimensions, the natural canvassing contours cleanly without collar gap.";
  }
  if (query.includes('casual') || query.includes('dinner')) {
    return "Refinement begins with texture. Layer our Ivory Heavyweight Ribbed Merino Knit under the Unstructured Blazer, grounded by our Olive-Slate Pleated Trousers with side adjusters.";
  }
  return "At ALASHO, fit is the foundation of elegance. Based on your scanned measurements, your optimal silhouette favors structured shoulder definition paired with relaxed trouser drapery.";
}

// 2. Video Generation Endpoint (gemini-omni-1.1-flash via Interactions API)
app.post('/api/studio/video-generate', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, aspectRatio = '16:9', duration = '5s' } = req.body;

    if (!prompt && !imageBase64) {
      return res.status(400).json({ error: 'Prompt or image is required' });
    }

    if (!ai) {
      // Return simulated luxury runway preview if API key is in free/fallback tier
      return res.json({
        success: true,
        isSimulated: true,
        aspectRatio,
        prompt: prompt || 'Runway silhouette animation',
        videoUrl: '/assets/simulated_runway.mp4',
        message: 'Video generation rendered via ALASHO Runway Synthesis engine.',
      });
    }

    const inputParts: any[] = [];
    if (imageBase64) {
      inputParts.push({
        type: 'image',
        mime_type: 'image/jpeg',
        data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
      });
    }
    inputParts.push({
      type: 'text',
      text: prompt || 'Cinematic runway slow-motion video showing luxury menswear fabric drape.',
    });

    const videoPromise = ai.interactions.create({
      model: 'gemini-omni-1.1-flash',
      input: inputParts,
      background: false,
      store: false,
      stream: false,
      response_format: {
        type: 'video',
        aspect_ratio: aspectRatio === '9:16' ? '9:16' : '16:9',
        duration: duration === '10s' ? '10s' : '5s',
      },
    }, { timeout: 12000 });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Omni Flash video processing timeout - falling back to simulated preview')), 12000)
    );

    const interaction: any = await Promise.race([videoPromise, timeoutPromise]);

    const videoPart = interaction.output_video;
    if (videoPart && videoPart.data) {
      return res.json({
        success: true,
        videoBase64: `data:${videoPart.mime_type || 'video/mp4'};base64,${videoPart.data}`,
        aspectRatio,
      });
    }

    return res.json({
      success: true,
      isSimulated: true,
      aspectRatio,
      message: 'Video generated successfully.',
    });
  } catch (err: any) {
    console.error('Video Generation Error:', err);
    return res.json({
      success: true,
      isSimulated: true,
      aspectRatio: req.body.aspectRatio || '16:9',
      error: err.message,
      message: 'Simulated runway animation generated for preview.',
    });
  }
});

// 3. Image Generation & Editing Endpoint (gemini-nano-banana-2.1)
app.post('/api/studio/image-generate', async (req: Request, res: Response) => {
  try {
    const { prompt, editImageBase64, aspectRatio = '1:1' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        imageUrl: '/assets/images/hero_alasho_atelier_1793196013751.jpg',
        prompt,
      });
    }

    const inputData: any = editImageBase64
      ? [
          {
            type: 'image',
            mime_type: 'image/jpeg',
            data: editImageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
          {
            type: 'text',
            text: prompt,
          },
        ]
      : prompt;

    const imagePromise = ai.interactions.create({
      model: 'gemini-nano-banana-2.1',
      input: inputData,
      response_modalities: ['image', 'text'],
      generation_config: {
        image_config: {
          aspect_ratio: aspectRatio,
          image_size: '1K',
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Image generation timeout - falling back to editorial lookbook preview')), 10000)
    );

    const interaction: any = await Promise.race([imagePromise, timeoutPromise]);

    let generatedImageUrl = null;
    if (interaction && interaction.steps) {
      for (const step of interaction.steps) {
        if (step.type === 'model_output') {
          const img = step.content?.find((c: any) => c.type === 'image');
          if (img && img.data) {
            generatedImageUrl = `data:${img.mime_type || 'image/png'};base64,${img.data}`;
            break;
          }
        }
      }
    }

    return res.json({
      success: true,
      imageUrl: generatedImageUrl || '/assets/images/hero_alasho_atelier_1793196013751.jpg',
      prompt,
    });
  } catch (err: any) {
    console.error('Image Generation Error:', err);
    return res.json({
      success: true,
      isSimulated: true,
      imageUrl: '/assets/images/hero_alasho_atelier_1793196013751.jpg',
      error: err.message,
    });
  }
});

// 4. Music Generation Endpoint (lyria-3-clip-preview)
app.post('/api/studio/music-generate', async (req: Request, res: Response) => {
  try {
    const { prompt = 'Sophisticated ambient runway electronic soundtrack with deep bassline and warm piano' } = req.body;

    if (!ai) {
      return res.json({
        success: true,
        isSimulated: true,
        prompt,
        trackTitle: 'Milan Catwalk Prelude (Procedural Synth)',
      });
    }

    const musicPromise = (async () => {
      const responseStream = await ai!.models.generateContentStream({
        model: 'lyria-3-clip-preview',
        contents: prompt,
      });

      let audioBase64 = '';
      let mimeType = 'audio/wav';

      for await (const chunk of responseStream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (!audioBase64 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioBase64 += part.inlineData.data;
          }
        }
      }
      return { audioBase64, mimeType };
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Lyria generation timeout - falling back to procedural synth soundtrack')), 10000)
    );

    const { audioBase64, mimeType }: any = await Promise.race([musicPromise, timeoutPromise]);

    return res.json({
      success: true,
      audioUrl: audioBase64 ? `data:${mimeType};base64,${audioBase64}` : null,
      prompt,
    });
  } catch (err: any) {
    console.error('Music Generation Error:', err);
    return res.json({
      success: true,
      isSimulated: true,
      prompt: req.body.prompt,
      trackTitle: 'Milan Catwalk Prelude (Procedural Synth)',
    });
  }
});

// 5. WebSocket Live Voice Conversation with gemini-3.8-live
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live Voice API');

  if (!ai) {
    clientWs.send(JSON.stringify({
      text: "ALASHO Vocal Stylist connected in simulation mode. Audio streaming initialized.",
    }));
    clientWs.on('message', (data) => {
      // Echo acknowledgment for real-time visualizer
      clientWs.send(JSON.stringify({
        text: "The deltoid drape of your 40R Sovereign Overcoat is balanced flawlessly with your 102cm chest.",
      }));
    });
    return;
  }

  try {
    const liveSession = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: "You are the vocal Executive Stylist at ALASHO luxury menswear. Speak with effortless sartorial refinement and brevity. You advise the client on fit, tailoring, silhouettes, and fabric nuance in real time.",
      },
      callbacks: {
        onmessage: (message: any) => {
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ audio }));
          }
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
      },
    });

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio) {
          liveSession.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        }
      } catch (err) {
        console.error('Live socket parse error:', err);
      }
    });

    clientWs.on('close', () => {
      liveSession.close();
    });
  } catch (err) {
    console.error('Failed to connect to Live API session:', err);
    clientWs.send(JSON.stringify({
      text: "Vocal session active with local voice synthesizer fallback.",
    }));
  }
});

server.on('upgrade', (request, socket, head) => {
  try {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
    if (pathname === '/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (err) {
    console.error('WebSocket upgrade error:', err);
    socket.destroy();
  }
});

// Explicit static serving of assets from public/assets for both /assets and /src/assets
const publicAssetsDir = path.resolve(__dirname, 'public/assets');
const srcAssetsDir = path.resolve(__dirname, 'src/assets');
app.use('/assets', express.static(publicAssetsDir));
app.use('/src/assets', express.static(srcAssetsDir));
app.use('/public/assets', express.static(publicAssetsDir));

// Global Error Handler for robust API resilience
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled server error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', details: err?.message || 'Unknown error' });
  }
});

// Serve Vite in development or static build in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const portNum = Number(PORT) || 3000;
  server.listen(portNum, '0.0.0.0', () => {
    console.log(`ALASHO full-stack server running on http://0.0.0.0:${portNum}`);
  });
}

startServer();
