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

    // Even aggressive AI will defend when critically low (< 25%)
    if (hpPercent < 0.25) {
      const defensive = abilities.find(a => a.type === 'DEFENSIVE');
      if (defensive && Math.random() < 0.6) return defensive; // 60% chance to defend when critical
    }

    // Prioritize special/high damage abilities
    const specials = abilities.filter(a => a.type === 'SPECIAL' || (a.damage && a.damage >= 30));
    if (specials.length > 0) {
      return specials[Math.floor(Math.random() * specials.length)];
    }

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

    // Defend more frequently when at risk
    if (opponentHpPercent < 0.5) {
      const defensive = abilities.find(a => a.type === 'DEFENSIVE');
      if (defensive && Math.random() < 0.7) return defensive; // 70% chance to defend when < 50% HP
    }

    // If player is low and AI is healthy, go for high damage to finish
    if (playerHpPercent < 0.4 && opponentHpPercent > 0.5) {
      const highDamage = abilities.filter(a => a.damage && a.damage >= 30);
      if (highDamage.length > 0) {
        return highDamage[Math.floor(Math.random() * highDamage.length)];
      }
    }

    // Otherwise pick medium damage ability or mix it up
    const offensive = abilities.filter(a => a.type !== 'DEFENSIVE');
    if (offensive.length > 0) {
      return offensive[Math.floor(Math.random() * offensive.length)];
    }

    return abilities[0];
  }

  // Adaptive AI: Smart pattern recognition and countering
  chooseAdaptively(abilities, playerLastMove, opponentMonster, playerMonster) {
    const opponentHpPercent = opponentMonster.hp / opponentMonster.maxHP;
    const playerHpPercent = playerMonster.hp / playerMonster.maxHP;

    if (!playerLastMove) {
      // Start with moderate damage
      const moderate = abilities.filter(a => a.damage && a.damage >= 20 && a.damage <= 30);
      if (moderate.length > 0) {
        return moderate[Math.floor(Math.random() * moderate.length)];
      }
      return abilities[Math.floor(Math.random() * abilities.length)];
    }

    // Defend if player seems to be going aggressive
    if (playerLastMove.includes('Blast') || playerLastMove.includes('Rush') || playerLastMove.includes('Dash')) {
      if (opponentHpPercent < 0.6) {
        const defensive = abilities.find(a => a.type === 'DEFENSIVE');
        if (defensive && Math.random() < 0.6) return defensive;
      }
    }

    // Counter defensive play with high damage
    if (playerLastMove.includes('Shield') || playerLastMove.includes('Block')) {
      const highDamage = abilities.filter(a => a.type === 'SPECIAL' || (a.damage && a.damage >= 35));
      if (highDamage.length > 0) {
        return highDamage[Math.floor(Math.random() * highDamage.length)];
      }
    }

    // If player is low HP, finish them
    if (playerHpPercent < 0.35) {
      const finishing = abilities.filter(a => a.damage && a.damage >= 25);
      if (finishing.length > 0) {
        return finishing[Math.floor(Math.random() * finishing.length)];
      }
    }

    // Default: pick a good offensive ability
    const offensive = abilities.filter(a => a.damage && a.damage > 0);
    if (offensive.length > 0) {
      return offensive[Math.floor(Math.random() * offensive.length)];
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
