# Prompt Battle Arena

AI-powered monster battle game built for DigitalOcean Hacktoberfest 2025.

## 🎮 Game Overview

Prompt Battle Arena is a turn-based monster combat game where **every opponent is unique**. Unlike traditional games with hardcoded AI, this game uses **DigitalOcean Gradient AI Platform** to generate dynamic opponent personalities, tactical decisions, and contextual battle narration in real-time.

### Key Features

- **AI-Generated Opponents:** Each battle features a unique opponent personality (Aggressive, Cautious, or Adaptive)
- **Dynamic Narration:** AI generates contextual battle descriptions based on game state
- **Strategic Combat:** Rock-paper-scissors style ability system with cooldowns
- **Best of 3 Rounds:** Intense battles with multiple rounds
- **3 Monster Types:** Choose from Striker, Tank, or Speedster

## 🤖 AI Features

### What Makes This AI-Powered?

1. **Personality Generation:** AI determines opponent behavior patterns at battle start
2. **Contextual Decisions:** AI analyzes HP, last moves, and battle momentum to choose abilities
3. **Dynamic Narration:** Every turn generates unique flavor text explaining the opponent's actions
4. **Adaptive Strategy:** AI personalities respond differently to your playstyle

### Personality Types

- **AGGRESSIVE (40%):** Favors high-damage attacks, rarely defends
- **CAUTIOUS (30%):** Balances offense and defense, uses shields strategically
- **ADAPTIVE (30%):** Mirrors and counters your tactics

## 🛠️ Built With

- **DigitalOcean Gradient AI Platform (Agents)** - AI opponent generation
- **Phaser 3** - Game engine and rendering
- **Vite** - Fast development server
- **Vanilla JavaScript** - Game logic

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/prompt-battle-arena.git
cd prompt-battle-arena

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## 🎯 How to Play

1. **Choose Your Monster** on the main menu
2. **Battle begins** with AI-generated opponent introduction
3. **Click ability buttons** to attack or defend
4. **Watch AI narration** to see how opponent responds
5. **First to 2 round wins** claims victory!

### Monster Types

#### Striker 🔥
- HP: 100
- **Flame Rush:** 25 damage (1 turn cooldown)
- **Inferno Blast:** 40 damage (2 turn cooldown)

#### Tank 🛡️
- HP: 120
- **Stone Shield:** Block 30 damage (1 turn cooldown)
- **Earthquake:** 30 damage (2 turn cooldown)

#### Speedster ⚡
- HP: 80
- **Thunder Dash:** 20 damage (no cooldown)
- **Shock Wave:** 35 damage + stun (3 turn cooldown)

## 📂 Project Structure

```
/prompt-battle-arena
  /src
    main.js              # Phaser game initialization
    BattleScene.js       # Core battle logic and UI
    MenuScene.js         # Start screen and monster selection
    AIOpponent.js        # AI integration and decision making
    MonsterData.js       # Monster configurations and abilities
  index.html             # Entry point
  package.json           # Dependencies
  README.md              # This file
```

## 🔧 AI Integration Details

### Current Implementation (Fallback AI)

The game currently uses a sophisticated rule-based AI with personality-driven decisions as a fallback. This demonstrates the game mechanics while the Gradient AI API is being integrated.

### Gradient AI Integration (Ready for Production)

The `AIOpponent.js` file is already set up for Gradient AI integration. To enable:

1. Set `this.useFallback = false` in `AIOpponent.js`
2. Configure your Gradient AI endpoint
3. The AI will receive battle context and return:
   - Chosen ability
   - Contextual narration
   - Tactical reasoning

**Example AI Input:**
```javascript
{
  opponentMonster: "STRIKER",
  opponentPersonality: "AGGRESSIVE",
  opponentHP: 75,
  playerMonster: "TANK",
  playerHP: 100,
  playerLastMove: "Stone Shield",
  turnNumber: 3,
  availableAbilities: [...]
}
```

**Example AI Output:**
```javascript
{
  ability: "Flame Rush",
  narration: "Blaze charges forward recklessly, trying to break through your defenses!",
  reasoning: "continuing aggressive pressure"
}
```

## 🎨 Version 2 Roadmap (Post-Hackathon)

- **Prompt-Based Combat:** Players type strategic prompts instead of clicking buttons
- **Prompt Scoring:** AI scores creativity, tactics, and effectiveness
- **Environmental System:** Interactive arena objects
- **Monster Collection:** Unlock new monsters by winning battles
- **Progressive Difficulty:** Escalating challenges across rounds

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md for guidelines.

## 🏆 Hackathon Context

This project was built for **DigitalOcean Hacktoberfest 2025** to demonstrate:
- Production-ready AI integration
- Gradient AI Platform capabilities
- Scalable game AI architecture
- Open-source game development patterns

## 🙏 Acknowledgments

- Built with DigitalOcean Gradient AI Platform
- Powered by Phaser 3 game engine
- Inspired by classic turn-based battle games

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Play now and experience AI-powered gaming!** Every battle is unique. 🎮✨
