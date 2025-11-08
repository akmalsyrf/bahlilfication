# bahlilfication

Transform any image or drawing into **bahlilfied** - a fullstack Next.js app inspired by [this reel](https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw==).

Upload any image, and watch **every pixel get rearranged** to form your target face:
- 🧬 **Pixel Rearrangement Algorithm** - like the Obama reel!
- 🎨 Takes EVERY pixel from input & finds optimal position in target
- 🌈 Original colors preserved - each result is unique
- 🔬 Mathematically optimal mapping based on brightness
- ✨ True pixel-by-pixel transformation!

## Features

- 🖼️ **Drag & drop image upload**
- 🎨 **Draw your own image**
- ⚡ **Fast server-side processing** with Sharp
- ✨ **Particle convergence animation** - physics-based particles flow to form target face!
- 🎨 **Beautiful modern UI** with Tailwind CSS
- 📱 **Fully responsive** design
- ⬇️ **One-click download** of results
- 📊 **Progress indicator** during transformation
- 🔒 **Privacy-first**: Images are processed in memory and never saved to disk

## Quick Start

### 1. Add Your Target Face Image

**IMPORTANT**: Before running the app, add your target face image:

1. Save your target face image as `target-face.png`
2. Place it in the `/public` directory
3. Recommended: Square image (e.g., 1024x1024), PNG format


### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Upload and Transform

1. Drag & drop an image or click to upload
2. Wait for processing (~1-3 seconds) - "Rearranging pixels..."
3. **Watch particles converge with physics simulation** ✨
4. Download your bahlilfied image!

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Image Processing**: Sharp
- **File Upload**: react-dropzone
- **Deployment**: Vercel-optimized

## Project Structure

```
bahlilfication/
├── app/
│   ├── api/
│   │   └── bahlilfy/
│   │       └── route.ts       # API endpoint
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main UI
├── lib/
│   ├── bahlilfication.ts      # Image processing logic
│   ├── config.ts              # Configuration
│   ├── validation.ts          # Input validation
│   ├── errors.ts              # Error handling
│   ├── logger.ts              # Logging
│   └── constants.ts           # Constants
├── public/
│   └── target-face.png        # YOUR TARGET FACE (add this!)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## API Endpoint

### POST /api/bahlilfy

Upload an image for transformation.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` field with image

**Response:**
- Success: Binary image data (PNG)
- Headers: Processing time, dimensions

**Privacy Note:** 🔒 Images are processed entirely in memory and are never saved to disk or any storage system. Your privacy is protected.

**Example:**

```bash
curl -X POST \
  -F "file=@image.jpg" \
  http://localhost:3000/api/bahlilfy \
  --output result.png
```

## Configuration

Environment variables (optional):

```bash
# .env.local
MAX_FILE_SIZE=10485760           # 10MB default
OUTPUT_FORMAT=png                # Output format
OUTPUT_QUALITY=90                # Quality 1-100
DEBUG=false                      # Debug logging
```

**Important**: Make sure to add `target-face.png` to your repository or upload it to Vercel's file system.

## How It Works (Pixel Rearrangement Algorithm)

1. **Upload**: User uploads an image via drag-and-drop or file picker
2. **Process**: Image is sent to `/api/bahlilfy` endpoint
3. **Transform**: **Pixel Rearrangement Algorithm** (like the Obama reel!)
   - **Extract** every pixel from input image (position, color, brightness)
   - **Analyze** target face brightness map
   - **Sort** both input & target by brightness (dark → bright)
   - **Map** each input pixel to optimal target position
   - **Rearrange** all pixels to form target face
   - **Enhance** final result (brightness, contrast, sharpness)
4. **Return**: Processed image is sent back as binary data
5. **Download**: User can preview and download the result

**Result**: Target face formed from rearranged input pixels - preserves original colors, mathematically optimal, unique per input!

### The Algorithm (Simplified)

```
Input (100,000 pixels) → Sort by brightness → Map to target positions → Output!

Dark pixels from input → Dark areas in target face
Bright pixels from input → Bright areas in target face
```

See `PIXEL_ALGORITHM.md` for detailed explanation!

### Particle Convergence Animation

After processing, watch **physics-based particle animation** (3 seconds):
- Pixels scattered randomly across canvas
- Each pixel attracted to its target position
- Real physics simulation with velocity & damping
- Particles converge to form target face
- Glow effect on fast-moving particles

**Like the GIF** - particles flow like fluid to form the image!

Customize in `components/ParticleTransition.tsx`:
- Duration: 2-5 seconds
- Particle density: 2,500-100,000 particles
- Physics: Force strength, damping, initial distribution

See `PARTICLE_TRANSITION.md` for complete guide!

## Customization

### Adjust Effect Parameters

Edit `lib/bahlilfication.ts`:

```typescript
// Face size (default: 85% untuk meme-style)
const faceWidth = Math.floor(inputMetadata.width * 0.85);  // Line ~47
const faceHeight = Math.floor(inputMetadata.height * 0.85);

// Background blur (default: 0.8 untuk slight blur)
.blur(0.8) // Line ~69 - Increase untuk lebih blur

// Background fade (default: masih visible)
.modulate({
  saturation: 0.85, // Line ~63 - Keep 85% color
  brightness: 0.95, // Keep 95% brightness
})

// Colors boost (default: vibrant)
.modulate({
  brightness: 1.08,  // Line ~84 - Boost brightness
  saturation: 1.15,  // Boost saturation
})

// Position
.composite([{
  gravity: 'center', // Line ~75 - 'center', 'north', 'south', dll
}])
```

### Change UI Colors

Edit `app/page.tsx` or `tailwind.config.ts` to customize the color scheme.

## Advanced Features (V2 Roadmap)

- [ ] Face detection and precise alignment
- [ ] Multiple target face presets
- [ ] Intensity/blend slider
- [ ] Before/after comparison slider
- [ ] Batch processing
- [ ] Video support
- [ ] Social sharing

## Troubleshooting

### "Cannot find target-face.png"

Make sure you've added `target-face.png` to the `/public` directory.

### Processing takes too long

- Reduce input image size (max 10MB by default)
- Consider using smaller target face image
- Check server logs for errors

### TypeScript errors

Run `npm install` to install all dependencies.

## Support

- Issues: [GitHub Issues](https://github.com/akmalsyrf/bahlilfication/issues)
- Reference reel: [Instagram](https://www.instagram.com/reel/DQl5qErDaBc/?igsh=MW5iMGgwaW1sOG5rYw==)

---

**Made with** ❤️ **using Next.js and Sharp**
