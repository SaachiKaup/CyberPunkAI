// AIOpponent.js - Handles AI opponent decision making and narration
// This uses Gradient AI to generate contextual battle narration and tactical decisions

export class AIOpponent {
  constructor() {
    this.apiEndpoint = '/api/opponent-move'; // For production with Gradient AI
    this.useFallback = true; // Set to false when API is ready
  }

  async getMove(context) {
    // Try AI API first
    if (!this.useFallback) {
      try {
        return await this.callGradientAI(context);
      } catch (error) {
        console.warn('AI API failed, using fallback:', error);
      }
    }

    // Fallback to rule-based AI with personality-driven decisions
    return this.getFallbackMove(context);
  }

  async callGradientAI(context) {
    const response = await fetch(this.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        opponentMonster: context.opponentMonster.type,
        opponentPersonality: context.personality,
        opponentHP: context.opponentMonster.hp,
        playerMonster: context.playerMonster.type,
        playerHP: context.playerMonster.hp,
        playerLastMove: context.playerLastMove,
        turnNumber: context.turnNumber,
        availableAbilities: context.availableAbilities.map(a => ({
          name: a.name,
          cooldown: context.cooldowns[a.id] || 0
        }))
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return {
      ability: data.ability,
      narration: data.narration,
      reasoning: data.reasoning
    };
  }

  getFallbackMove(context) {
    const { opponentMonster, personality, availableAbilities, cooldowns, playerMonster, playerLastMove, turnNumber } = context;

    // Filter abilities that are not on cooldown
    const readyAbilities = availableAbilities.filter(a => !cooldowns[a.id] || cooldowns[a.id] <= 0);

    if (readyAbilities.length === 0) {
      // Should not happen, but safety check
      return {
        ability: availableAbilities[0],
        narration: `${opponentMonster.name} is recovering...`,
        reasoning: "waiting for abilities to cool down"
      };
    }

    let chosenAbility;
    let narration;
    let reasoning;

    // Personality-based decision making
    switch (personality) {
      case 'AGGRESSIVE':
        chosenAbility = this.chooseAggressively(readyAbilities, opponentMonster);
        narration = this.getAggressiveNarration(opponentMonster, chosenAbility, playerLastMove);
        reasoning = "maintaining aggressive pressure";
        break;

      case 'CAUTIOUS':
        chosenAbility = this.chooseCautiously(readyAbilities, opponentMonster, playerMonster);
        narration = this.getCautiousNarration(opponentMonster, chosenAbility, opponentMonster.hp, opponentMonster.maxHP);
        reasoning = "balancing offense and defense";
        break;

      case 'ADAPTIVE':
        chosenAbility = this.chooseAdaptively(readyAbilities, playerLastMove, opponentMonster, playerMonster);
        narration = this.getAdaptiveNarration(opponentMonster, chosenAbility, playerLastMove);
        reasoning = "adapting to your strategy";
        break;

      default:
        chosenAbility = readyAbilities[Math.floor(Math.random() * readyAbilities.length)];
        narration = `${opponentMonster.name} uses ${chosenAbility.name}!`;
        reasoning = "tactical decision";
    }

    return { ability: chosenAbility, narration, reasoning };
  }

  // Aggressive AI: Prioritize high damage, but use defense strategically when very low
  chooseAggressively(abilities, monster) {
    const hpPercent = monster.hp / monster.maxHP;

    // Only defend when critically low (< 20%) and rarely
    if (hpPercent < 0.2) {
      const defensive = abilities.find(a => a.type === 'DEFENSIVE');
      if (defensive && Math.random() < 0.4) return defensive; // 40% chance to defend when critical
    }

    // Prioritize special/high damage abilities more aggressively
    const specials = abilities.filter(a => a.type === 'SPECIAL' || (a.damage && a.damage >= 25));
    if (specials.length > 0) {
      return specials[Math.floor(Math.random() * specials.length)];
    }

    // Always pick highest damage available
    return abilities.reduce((highest, current) => {
      const currentDmg = current.damage || 0;
      const highestDmg = highest.damage || 0;
      return currentDmg > highestDmg ? current : highest;
    }, abilities[0]);
  }

  // Cautious AI: Smart HP-based decision making
  chooseCautiously(abilities, opponentMonster, playerMonster) {
    const opponentHpPercent = opponentMonster.hp / opponentMonster.maxHP;
    const playerHpPercent = playerMonster.hp / playerMonster.maxHP;

    // If player is low, finish them off!
    if (playerHpPercent < 0.5) {
      const highDamage = abilities.filter(a => a.damage && a.damage >= 25);
      if (highDamage.length > 0) {
        return highDamage[Math.floor(Math.random() * highDamage.length)];
      }
    }

    // Defend when at risk but less often
    if (opponentHpPercent < 0.3) {
      const defensive = abilities.find(a => a.type === 'DEFENSIVE');
      if (defensive && Math.random() < 0.5) return defensive; // 50% chance to defend when < 30% HP
    }

    // Otherwise pick good damage ability
    const offensive = abilities.filter(a => a.damage && a.damage >= 20);
    if (offensive.length > 0) {
      return offensive[Math.floor(Math.random() * offensive.length)];
    }

    return abilities[0];
  }

  // Adaptive AI: Smart pattern recognition and countering
  chooseAdaptively(abilities, playerLastMove, opponentMonster, playerMonster) {
    const opponentHpPercent = opponentMonster.hp / opponentMonster.maxHP;
    const playerHpPercent = playerMonster.hp / playerMonster.maxHP;

    // If player is low HP, finish them aggressively!
    if (playerHpPercent < 0.5) {
      const finishing = abilities.filter(a => a.damage && a.damage >= 25);
      if (finishing.length > 0) {
        return finishing[Math.floor(Math.random() * finishing.length)];
      }
    }

    if (!playerLastMove) {
      // Start with high damage
      const highDamage = abilities.filter(a => a.damage && a.damage >= 25);
      if (highDamage.length > 0) {
        return highDamage[Math.floor(Math.random() * highDamage.length)];
      }
      return abilities[Math.floor(Math.random() * abilities.length)];
    }

    // Counter defensive play with maximum damage
    if (playerLastMove.includes('Shield') || playerLastMove.includes('Block')) {
      const highDamage = abilities.filter(a => a.type === 'SPECIAL' || (a.damage && a.damage >= 30));
      if (highDamage.length > 0) {
        return highDamage[Math.floor(Math.random() * highDamage.length)];
      }
    }

    // Only defend when critically low
    if (playerLastMove.includes('Blast') || playerLastMove.includes('Rush') || playerLastMove.includes('Dash')) {
      if (opponentHpPercent < 0.25) {
        const defensive = abilities.find(a => a.type === 'DEFENSIVE');
        if (defensive && Math.random() < 0.4) return defensive;
      }
    }

    // Default: pick highest damage offensive ability
    const offensive = abilities.filter(a => a.damage && a.damage > 0);
    if (offensive.length > 0) {
      return offensive.reduce((highest, current) => {
        return (current.damage || 0) > (highest.damage || 0) ? current : highest;
      }, offensive[0]);
    }

    return abilities[0];
  }

  // Narration generators
  getAggressiveNarration(monster, ability, playerLastMove) {
    const phrases = [
      `${monster.name} charges forward recklessly with ${ability.name}!`,
      `${monster.name} attacks without hesitation using ${ability.name}!`,
      `${monster.name} launches an aggressive ${ability.name}!`,
      `${monster.name} refuses to back down and unleashes ${ability.name}!`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  getCautiousNarration(monster, ability, hp, maxHP) {
    if (ability.type === 'DEFENSIVE') {
      return `${monster.name} carefully raises a ${ability.name}, preparing to defend!`;
    }

    const phrases = [
      `${monster.name} cautiously executes ${ability.name}.`,
      `${monster.name} carefully positions for ${ability.name}.`,
      `${monster.name} strategically uses ${ability.name}.`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  getAdaptiveNarration(monster, ability, playerLastMove) {
    const phrases = [
      `${monster.name} recognizes your pattern and adapts with ${ability.name}!`,
      `${monster.name} counters your strategy using ${ability.name}!`,
      `${monster.name} adjusts their approach with ${ability.name}!`,
      `${monster.name} responds intelligently with ${ability.name}!`
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  generateBattleIntro(monster, personality) {
    const personalityDesc = {
      'AGGRESSIVE': 'They favor overwhelming offense and rarely defend.',
      'CAUTIOUS': 'They carefully balance attack and defense.',
      'ADAPTIVE': 'They study your moves and adapt their strategy.'
    };

    return `You face ${personality} ${monster.name}. ${personalityDesc[personality] || ''}`;
  }

  generateBattleSummary(winner, personality, playerMonster, opponentMonster) {
    if (winner === 'player') {
      const summaries = {
        'AGGRESSIVE': `You exploited ${opponentMonster.name}'s aggressive nature by timing your defenses carefully.`,
        'CAUTIOUS': `You overcame ${opponentMonster.name}'s defensive strategy with persistent pressure.`,
        'ADAPTIVE': `You stayed unpredictable and outmaneuvered ${opponentMonster.name}'s adaptations.`
      };
      return summaries[personality] || 'Victory!';
    } else {
      return `${opponentMonster.name}'s ${personality.toLowerCase()} strategy proved too strong this time.`;
    }
  }
}
