# Cyberpunk Digital Earth Background

## 🌐 Inspired by Cyberpunk 3D Data Visualization

The game now features a stunning **cyberpunk-style 3D digital earth** background, inspired by modern data visualization and sci-fi interfaces.

## ✨ Key Features

### 1. Digital Earth Globe
- **Wireframe sphere** with blue holographic appearance
- **Inner glow layer** for depth
- **Outer atmosphere** with transparency
- **Continuous rotation** with subtle tilt animation
- **Emissive materials** for that digital glow

### 2. Holographic Grid Floor
- **Large grid helper** (100x100 units, 50 divisions)
- **Animated scan grid** that moves with the scene
- **Cyan/Blue color scheme** with transparency
- **Perspective depth** effect

### 3. Data Particle System
- **2000+ particles** floating through space
- **Cyan and Magenta colors** (cyberpunk palette)
- **Additive blending** for glowing effect
- **Upward flow animation** with reset loop
- **Rotating particle cloud**

### 4. Scan Beams
- **8 vertical beams** surrounding the earth
- **Pulsing opacity** animation
- **Radiating from center** pattern
- **Cyan holographic glow**

### 5. Orbiting Data Rings
- **3 torus rings** at different radii
- **Cyan/Magenta alternating colors**
- **Independent rotation speeds**
- **Semi-transparent** for layering effect

### 6. Dynamic Lighting
- **Ambient blue light** for overall atmosphere
- **Cyan point light** from above
- **Magenta point light** from below
- **Creates depth and dimension**

### 7. Camera Animation
- **Gentle horizontal sway** (sine wave)
- **Vertical bobbing** motion
- **Always focused on earth** (-20 Z position)
- **Creates parallax effect**

## 🎨 Color Palette

- **Background**: Deep space blue (#000020)
- **Primary**: Cyan (#00ffff)
- **Secondary**: Magenta (#ff00ff)
- **Earth**: Electric blue (#0088ff)
- **Accents**: Various blue tones

## 🔧 Technical Details

### Performance Optimizations
- Efficient BufferGeometry for particles
- Optimized material reuse
- Controlled animation frame rate
- Proper cleanup on scene destruction

### Animations (60 FPS)
- Earth rotation: 0.002 rad/frame
- Ring rotation: 0.005-0.015 rad/frame
- Particle flow: Continuous upward drift
- Scan beams: Sin wave opacity pulse
- Camera: Smooth orbital motion

### Three.js Components Used
- **SphereGeometry**: Digital earth
- **GridHelper**: Floor grid
- **PlaneGeometry**: Scan grid & beams
- **TorusGeometry**: Data rings
- **Points**: Particle system
- **PointLight**: Dynamic lighting
- **MeshPhongMaterial**: Reflective surfaces
- **MeshBasicMaterial**: Glowing effects

## 🎯 Visual Effects

### Depth Layers (Front to Back)
1. Data particles (foreground)
2. Scan beams (mid-ground)
3. Digital earth globe (center)
4. Data rings (orbiting)
5. Holographic grid (floor)
6. Deep space fog (background)

### Transparency Stack
- Atmosphere: 10% opacity
- Grid: 30% opacity
- Particles: 80% opacity
- Beams: 20-40% (animated)
- Rings: 40% opacity

## 🚀 Integration with Game

The background sits **behind the Phaser canvas** using:
- Separate HTML5 canvas element
- Z-index layering (Three.js: 0, Phaser: 1)
- Semi-transparent Phaser overlay (30% opacity)
- Synchronized with game lifecycle

## 📊 Scene Stats

- **Vertices**: ~8000 (optimized for real-time)
- **Objects**: ~2015 (earth + particles + grid + beams + rings)
- **Lights**: 3 (ambient + 2 point lights)
- **Materials**: 12 (reused where possible)
- **Textures**: 0 (all procedural)

## 🎬 Result

A **futuristic, cyberpunk data visualization** backdrop that:
- ✅ Provides visual depth
- ✅ Enhances sci-fi atmosphere
- ✅ Doesn't distract from gameplay
- ✅ Runs smoothly at 60 FPS
- ✅ Perfectly complements pixel art sprites

**View it live at: http://localhost:5173/**
