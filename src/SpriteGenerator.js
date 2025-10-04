export class SpriteGenerator {
  static generateMonsterSprite(scene, type, size = 128) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    const colors = {
      STRIKER: {
        primary: '#ff0066',      // Hot pink/magenta
        secondary: '#ff00ff',    // Neon magenta
        accent: '#00ffff',       // Cyan highlights
        glow: '#ff0088',         // Pink glow
        outline: '#1a003a'       // Dark purple
      },
      TANK: {
        primary: '#00ccff',      // Cyan
        secondary: '#0088ff',    // Blue
        accent: '#00ffff',       // Bright cyan
        glow: '#0066ff',         // Blue glow
        outline: '#001a33'       // Dark blue
      },
      SPEEDSTER: {
        primary: '#ffff00',      // Yellow
        secondary: '#ffcc00',    // Orange-yellow
        accent: '#ff00ff',       // Magenta highlights
        glow: '#ffff44',         // Yellow glow
        outline: '#331a00'       // Dark brown
      }
    };

    const palette = colors[type] || colors.STRIKER;
    const pixelSize = size / 16; // 16x16 grid

    // Helper function to draw pixel
    const drawPixel = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    };

    // Draw sprite based on type
    if (type === 'STRIKER') {
      this.drawStrikerSprite(drawPixel, palette);
    } else if (type === 'TANK') {
      this.drawTankSprite(drawPixel, palette);
    } else if (type === 'SPEEDSTER') {
      this.drawSpeedsterSprite(drawPixel, palette);
    }

    // Create texture from canvas
    const texture = scene.textures.addCanvas(`monster_${type}_${Date.now()}`, canvas);
    return texture.key;
  }

  static drawStrikerSprite(drawPixel, palette) {
    // Cyberpunk battle mech - aggressive design with neon accents
    const sprite = [
      '0000003333000000',
      '0000033333300000',
      '0000333333330000',
      '0003331221330000',
      '0033212221223300',
      '0332122222212330',
      '3321222112221233',
      '3212221221222123',
      '3212221221222123',
      '3321221111221233',
      '0332211111212330',
      '0033221111223300',
      '0003322112233000',
      '0000332222330000',
      '0000333003330000',
      '0000033000330000'
    ];

    sprite.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const pixel = row[x];
        if (pixel === '1') drawPixel(x, y, palette.primary);    // Hot pink body
        else if (pixel === '2') drawPixel(x, y, palette.secondary); // Neon magenta
        else if (pixel === '3') drawPixel(x, y, palette.accent);    // Cyan highlights
      }
    });

    // Add glowing visor/eyes with accent color
    drawPixel(5, 4, palette.accent);
    drawPixel(10, 4, palette.accent);

    // Tech lines
    drawPixel(7, 6, palette.accent);
    drawPixel(8, 6, palette.accent);

    this.addOutline(drawPixel, sprite, palette.outline);
  }

  static drawTankSprite(drawPixel, palette) {
    // Cyberpunk defense unit - heavy armor with tech panels
    const sprite = [
      '0000003333000000',
      '0000033333300000',
      '0000333333330000',
      '0003332112333000',
      '0033221221223300',
      '0332212222122330',
      '3321222222222133',
      '3212222112222213',
      '3212221331222213',
      '3321222332222133',
      '0332221221222330',
      '0033221111223300',
      '0003322112233000',
      '0000332222330000',
      '0000333003330000',
      '0000033000330000'
    ];

    sprite.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const pixel = row[x];
        if (pixel === '1') drawPixel(x, y, palette.primary);    // Cyan panels
        else if (pixel === '2') drawPixel(x, y, palette.secondary); // Blue armor
        else if (pixel === '3') drawPixel(x, y, palette.accent);    // Bright cyan
      }
    });

    // Holographic shield indicators
    drawPixel(5, 5, palette.accent);
    drawPixel(10, 5, palette.accent);
    drawPixel(7, 7, palette.accent);
    drawPixel(8, 7, palette.accent);

    this.addOutline(drawPixel, sprite, palette.outline);
  }

  static drawSpeedsterSprite(drawPixel, palette) {
    // Cyberpunk speed unit - sleek with energy trails
    const sprite = [
      '0000003311000000',
      '0000033333110000',
      '0000333333330000',
      '0003332112333000',
      '0033221221223300',
      '0332212221122330',
      '3321222112222133',
      '3212221331222213',
      '3212221221222213',
      '3321222112222133',
      '0332211111222330',
      '0033221111223300',
      '0003322112233000',
      '0000332222330000',
      '0000333113330000',
      '0000033333300000'
    ];

    sprite.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        const pixel = row[x];
        if (pixel === '1') drawPixel(x, y, palette.primary);    // Yellow energy
        else if (pixel === '2') drawPixel(x, y, palette.secondary); // Orange core
        else if (pixel === '3') drawPixel(x, y, palette.accent);    // Magenta trails
      }
    });

    // Energy core indicators
    drawPixel(5, 4, palette.accent);
    drawPixel(10, 4, palette.accent);

    // Speed trails
    drawPixel(3, 6, palette.accent);
    drawPixel(2, 7, palette.accent);
    drawPixel(12, 6, palette.accent);
    drawPixel(13, 7, palette.accent);

    this.addOutline(drawPixel, sprite, palette.outline);
  }

  static addOutline(drawPixel, sprite, color) {
    // Add black outline around the sprite
    const height = sprite.length;
    const width = sprite[0].length;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (sprite[y][x] !== '0') {
          // Check all 8 directions for transparent pixels
          const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
          ];

          directions.forEach(([dx, dy]) => {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              if (sprite[ny][nx] === '0') {
                // Draw outline pixel with slight offset
                drawPixel(nx - 0.1, ny - 0.1, color);
              }
            }
          });
        }
      }
    }
  }
}
