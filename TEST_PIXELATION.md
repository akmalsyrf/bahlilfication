# Testing Background Pixelation

## Quick Test Setup

### 1. Create `.env.local` file
```bash
cd /Users/mac/Documents/coding/opensource/bahlilfication
cp env.local.example .env.local
```

### 2. Edit `.env.local` with strong pixelation
```bash
# For VERY OBVIOUS pixelation, use large block sizes:
MOSAIC_BLOCK_SIZE=8
MOSAIC_BACKGROUND_BLOCK_SIZE=20
MOSAIC_JITTER=3
DEBUG=true
```

### 3. Run dev server
```bash
npm run dev
```

### 4. Check console logs
When you upload an image, you should see:
```
[Bahlilfication Config] {
  foregroundBlockSize: 8,
  backgroundBlockSize: 20,
  jitter: 3,
  dimensions: '500x500'
}

[Pixelation] Original: 500×500, Downsample to: 25×25, BlockSize: 20
```

**Key check**: `Downsample to: 25×25` means background will be 20×20 pixel blocks!

## Visual Test

Upload a photo with detailed background (e.g., sunset, forest).

### Expected Result:
```
Background (20×20 blocks):
🟧🟧🟧🟧🟧🟨🟨🟨🟨🟨  ← Very chunky!
🟧🟧🟧🟧🟧🟨🟨🟨🟨🟨
🟧🟧🟧🟧🟧🟨🟨🟨🟨🟨
🟧🟧🟧🟧🟧🟨🟨🟨🟨🟨

Face (8×8 blocks):
▪️▫️▪️▫️▪️▫️▪️▫️  ← Smaller blocks, more detail
▫️▪️▫️▪️▫️▪️▫️▪️
▪️▫️▪️▫️▪️▫️▪️▫️
```

## Troubleshooting

### If background is NOT pixelated:

#### Check 1: Environment variable loaded?
```bash
# In terminal before npm run dev:
export DEBUG=true
export MOSAIC_BACKGROUND_BLOCK_SIZE=20
npm run dev
```

#### Check 2: Restart dev server
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

#### Check 3: Hard-code for testing
Edit `lib/config.ts`:
```typescript
mosaic: {
  blockSize: 8,
  backgroundBlockSize: 20,  // Force to 20!
  jitter: 3,
},
```

#### Check 4: Verify Sharp version
```bash
npm list sharp
# Should be >= 0.32.0
```

If Sharp is old:
```bash
npm install sharp@latest
```

## Extreme Test

For MAXIMUM pixelation to confirm it's working:
```bash
MOSAIC_BACKGROUND_BLOCK_SIZE=50 npm run dev
```

This will create **50×50 pixel mega-blocks** in background.  
If you can see this, pixelation is working!

## Compare Settings

### Subtle (background almost smooth)
```
MOSAIC_BACKGROUND_BLOCK_SIZE=4
```

### Moderate (default)
```
MOSAIC_BACKGROUND_BLOCK_SIZE=12
```

### Strong (very obvious)
```
MOSAIC_BACKGROUND_BLOCK_SIZE=20
```

### Extreme (artistic/meme)
```
MOSAIC_BACKGROUND_BLOCK_SIZE=40
```

## Expected Console Output

```bash
[Bahlilfication Config] {
  foregroundBlockSize: 8,
  backgroundBlockSize: 20,
  jitter: 3,
  dimensions: '1080x1080'
}

[Pixelation] Original: 1080×1080, Downsample to: 54×54, BlockSize: 20
```

**Math check:**
- Original: 1080×1080
- Block size: 20
- Downsample: 1080 ÷ 20 = 54×54 ✅
- Upscale: 54×54 → 1080×1080 with nearest = 20×20 blocks ✅

## Debug Script

Create `test-pixelation.sh`:
```bash
#!/bin/bash

echo "Testing pixelation with different block sizes..."

echo ""
echo "=== Test 1: Small blocks (10) ==="
MOSAIC_BACKGROUND_BLOCK_SIZE=10 npm run dev &
PID1=$!
sleep 5
kill $PID1

echo ""
echo "=== Test 2: Medium blocks (20) ==="
MOSAIC_BACKGROUND_BLOCK_SIZE=20 npm run dev &
PID2=$!
sleep 5
kill $PID2

echo ""
echo "=== Test 3: Large blocks (40) ==="
MOSAIC_BACKGROUND_BLOCK_SIZE=40 npm run dev &
PID3=$!
sleep 5
kill $PID3

echo ""
echo "Tests complete. Check http://localhost:3000 for each test."
```

Run:
```bash
chmod +x test-pixelation.sh
./test-pixelation.sh
```

---

## Success Indicators

✅ Console shows `[Pixelation] ... BlockSize: X`  
✅ Background looks chunky/blocky (not smooth)  
✅ Background blocks are larger than face tiles  
✅ Face clearly stands out from background  

❌ Background smooth → Check env vars + restart  
❌ No console logs → Set `DEBUG=true`  
❌ Same block size everywhere → backgroundBlockSize not passed  

---

If pixelation still doesn't work after all these checks, the issue might be:
1. Sharp library not using nearest kernel correctly
2. Browser caching old processed images
3. CDN/proxy serving cached version

**Solution:** Clear browser cache + hard reload (Cmd+Shift+R / Ctrl+Shift+F5)

