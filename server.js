import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const AI_ENDPOINT = 'https://zoazeihbe54bgbw7kf34xwsq.agents.do-ai.run/api/v1/chat/completions';
const USE_AI = false; // Set to true when you have API credentials

// Fallback monster generator using local logic
function generateFallbackMonster(monsterType) {
  const names = {
    STRIKER: ['Blazefang', 'Pyrowing', 'Infernox', 'Flameclaw', 'Emberax'],
    TANK: ['Stoneguard', 'Terravolt', 'Rockshield', 'Granithor', 'Boulderax'],
    SPEEDSTER: ['Voltstream', 'Sparkdash', 'Thunderpaw', 'Zapster', 'Electrixx']
  };

  const abilityNames = {
    STRIKER: [
      ['Flame Rush', 'Fire Blast', 'Ember Strike', 'Blaze Kick'],
      ['Inferno Burst', 'Magma Cannon', 'Heat Wave', 'Dragon Rage']
    ],
    TANK: [
      ['Rock Shield', 'Stone Wall', 'Iron Defense', 'Barrier'],
      ['Earthquake', 'Boulder Smash', 'Tremor Strike', 'Ground Pound']
    ],
    SPEEDSTER: [
      ['Thunder Dash', 'Quick Attack', 'Volt Rush', 'Speed Burst'],
      ['Shock Wave', 'Lightning Bolt', 'Thunder Strike', 'Zap Cannon']
    ]
  };

  const randomName = names[monsterType][Math.floor(Math.random() * names[monsterType].length)];
  const hpRange = monsterType === 'TANK' ? [110, 130] : monsterType === 'SPEEDSTER' ? [70, 90] : [90, 110];
  const maxHP = Math.floor(Math.random() * (hpRange[1] - hpRange[0] + 1)) + hpRange[0];

  const ability1Name = abilityNames[monsterType][0][Math.floor(Math.random() * abilityNames[monsterType][0].length)];
  const ability2Name = abilityNames[monsterType][1][Math.floor(Math.random() * abilityNames[monsterType][1].length)];

  return {
    name: randomName,
    maxHP: maxHP,
    abilities: [
      {
        id: ability1Name.toLowerCase().replace(/\s+/g, '_'),
        name: ability1Name,
        damage: monsterType === 'TANK' && Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 11) + 20,
        cooldown: Math.floor(Math.random() * 2),
        type: monsterType === 'TANK' && Math.random() < 0.5 ? 'DEFENSIVE' : 'OFFENSIVE',
        block: monsterType === 'TANK' && Math.random() < 0.5 ? 30 : undefined,
        description: monsterType === 'TANK' && Math.random() < 0.5 ? 'Block 30 damage' : `${Math.floor(Math.random() * 11) + 20} damage`
      },
      {
        id: ability2Name.toLowerCase().replace(/\s+/g, '_'),
        name: ability2Name,
        damage: Math.floor(Math.random() * 16) + 30,
        cooldown: Math.floor(Math.random() * 3) + 1,
        type: 'SPECIAL',
        description: `${Math.floor(Math.random() * 16) + 30} damage`
      }
    ]
  };
}

// Proxy endpoint for monster generation
app.post('/api/generate-monster', async (req, res) => {
  try {
    const { monsterType } = req.body;

    // If AI is not enabled, use fallback
    if (!USE_AI) {
      const fallbackMonster = generateFallbackMonster(monsterType);
      return res.json(fallbackMonster);
    }

    const typeDescriptions = {
      STRIKER: 'fire-type offensive monster with high damage abilities',
      TANK: 'rock/ground-type defensive monster with high HP and blocking abilities',
      SPEEDSTER: 'electric-type fast monster with quick attacks'
    };

    const prompt = `Generate a unique ${typeDescriptions[monsterType] || 'monster'} for a Pokemon-style battle game.

Requirements:
- Unique creative name (not from existing Pokemon)
- maxHP: ${monsterType === 'TANK' ? '110-130' : monsterType === 'SPEEDSTER' ? '70-90' : '90-110'}
- 2 abilities with:
  - Unique creative ability names
  - damage: ${monsterType === 'TANK' ? '15-35' : '20-40'} (can be 0 for defensive abilities)
  - cooldown: 0-3 turns
  - type: OFFENSIVE, DEFENSIVE, or SPECIAL
  - description: brief effect description

Return ONLY valid JSON in this exact format:
{
  "name": "MonsterName",
  "maxHP": 100,
  "abilities": [
    {
      "id": "ability_1",
      "name": "Ability Name",
      "damage": 25,
      "cooldown": 1,
      "type": "OFFENSIVE",
      "description": "25 damage"
    },
    {
      "id": "ability_2",
      "name": "Special Ability",
      "damage": 40,
      "cooldown": 2,
      "type": "SPECIAL",
      "description": "40 damage"
    }
  ]
}`;

    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse JSON from the response
    let monsterData;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, aiResponse];
      monsterData = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      // Fallback if JSON parsing fails
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid AI response format');
    }

    res.json(monsterData);
  } catch (error) {
    console.error('Monster generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Monster AI server running on http://localhost:${PORT}`);
});
