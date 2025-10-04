export const MONSTERS = {
  STRIKER: {
    type: "STRIKER",
    name: "Blaze",
    maxHP: 100,
    color: 0xff4444,
    icon: "🔥",
    abilities: [
      {
        id: "flame_rush",
        name: "Flame Rush",
        damage: 25,
        cooldown: 1,
        type: "OFFENSIVE",
        description: "25 damage"
      },
      {
        id: "inferno_blast",
        name: "Inferno Blast",
        damage: 40,
        cooldown: 2,
        type: "SPECIAL",
        description: "40 damage"
      }
    ]
  },
  TANK: {
    type: "TANK",
    name: "Terra",
    maxHP: 120,
    color: 0x888888,
    icon: "🛡️",
    abilities: [
      {
        id: "stone_shield",
        name: "Stone Shield",
        damage: 0,
        block: 30,
        cooldown: 1,
        type: "DEFENSIVE",
        description: "Block 30 damage"
      },
      {
        id: "earthquake",
        name: "Earthquake",
        damage: 30,
        cooldown: 2,
        type: "OFFENSIVE",
        description: "30 damage"
      }
    ]
  },
  SPEEDSTER: {
    type: "SPEEDSTER",
    name: "Volt",
    maxHP: 80,
    color: 0xffff44,
    icon: "⚡",
    abilities: [
      {
        id: "thunder_dash",
        name: "Thunder Dash",
        damage: 20,
        cooldown: 0,
        type: "OFFENSIVE",
        description: "20 damage"
      },
      {
        id: "shock_wave",
        name: "Shock Wave",
        damage: 35,
        stun: 1,
        cooldown: 3,
        type: "SPECIAL",
        description: "35 damage + stun"
      }
    ]
  }
};

export const PERSONALITIES = {
  AGGRESSIVE: {
    name: "AGGRESSIVE",
    description: "Favors overwhelming offense and rarely defends",
    weight: 0.4
  },
  CAUTIOUS: {
    name: "CAUTIOUS",
    description: "Balances offense and defense carefully",
    weight: 0.3
  },
  ADAPTIVE: {
    name: "ADAPTIVE",
    description: "Mirrors and counters player strategy",
    weight: 0.3
  }
};

export function getRandomPersonality() {
  const rand = Math.random();
  let cumulative = 0;

  for (const personality of Object.values(PERSONALITIES)) {
    cumulative += personality.weight;
    if (rand <= cumulative) {
      return personality.name;
    }
  }

  return "AGGRESSIVE";
}

export async function generateAIMonster(monsterType) {
  try {
    const response = await fetch('http://localhost:3001/api/generate-monster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ monsterType })
    });

    if (!response.ok) {
      throw new Error('AI generation failed');
    }

    const aiMonster = await response.json();

    // Merge with template to ensure we have all required fields
    const template = MONSTERS[monsterType];
    return {
      type: monsterType,
      name: aiMonster.name || template.name,
      maxHP: aiMonster.maxHP || template.maxHP,
      color: template.color,
      icon: template.icon,
      abilities: aiMonster.abilities || template.abilities,
      aiGenerated: true
    };
  } catch (error) {
    console.error('AI monster generation failed, using template:', error);
    return MONSTERS[monsterType];
  }
}

export function createMonster(monsterType) {
  const template = MONSTERS[monsterType];
  return {
    ...template,
    hp: template.maxHP,
    activeBlock: 0,
    stunned: false
  };
}
