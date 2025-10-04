# AI Monster Generation Integration

## Overview
The game now supports dynamic AI-generated monsters using the DigitalOcean AI endpoint!

## Current Status
- ✅ AI endpoint integration is ready
- ✅ Fallback generator is active (procedural generation)
- ⚠️ DigitalOcean AI endpoint requires authentication

## How It Works

### Fallback Mode (Currently Active)
The game uses a procedural generator that creates unique monsters with:
- Random creative names (Blazefang, Pyrowing, Voltstream, etc.)
- Randomized HP values based on monster type
- Unique ability combinations
- Balanced stats for fair gameplay

Each opponent monster is **dynamically generated** with different stats every battle!

### AI Mode (When Enabled)
To enable the DigitalOcean AI endpoint:

1. Get API credentials for: `https://zoazeihbe54bgbw7kf34xwsq.agents.do-ai.run`

2. Update `server.js`:
   ```javascript
   const USE_AI = true; // Change from false to true
   // Add your API key if required:
   const API_KEY = 'your-api-key-here';
   ```

3. Update the fetch call to include authentication:
   ```javascript
   const response = await fetch(AI_ENDPOINT, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${API_KEY}` // Add if needed
     },
     // ... rest of the request
   });
   ```

4. Restart the server:
   ```bash
   npm run dev:all
   ```

## Features
- 🎲 **Dynamic Monster Generation**: Every opponent is unique
- ✨ **AI Badge**: AI-generated monsters show a sparkle (✨) indicator
- 🎨 **Special Coloring**: AI monsters have golden names
- 🔄 **Automatic Fallback**: If AI fails, uses procedural generation
- 📊 **Balanced Stats**: All generated monsters are battle-tested

## Visual Indicators
- AI-generated monsters have **golden names** with a **✨ sparkle**
- Template monsters have cyan names
- Loading screen shows "Generating AI Opponent..." during creation

## API Endpoint
```
POST https://zoazeihbe54bgbw7kf34xwsq.agents.do-ai.run/api/v1/chat/completions
```

### Expected Request Format
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Generate a unique fire-type monster..."
    }
  ],
  "temperature": 0.8,
  "max_tokens": 500
}
```

### Expected Response
```json
{
  "name": "Pyroclaw",
  "maxHP": 105,
  "abilities": [
    {
      "id": "flame_strike",
      "name": "Flame Strike",
      "damage": 28,
      "cooldown": 1,
      "type": "OFFENSIVE",
      "description": "28 damage"
    }
  ]
}
```

## Running the Game
```bash
# Run both game and API server
npm run dev:all

# Or run separately
npm run dev     # Game server (port 5173)
npm run server  # API server (port 3001)
```

## Tech Stack
- **Frontend**: Phaser 3 game engine
- **Backend**: Express.js proxy server
- **AI Integration**: DigitalOcean Gradient AI Platform
- **Fallback**: Procedural generation algorithm
