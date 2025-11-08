#!/usr/bin/env python3
"""Generate cover.png for the arcade games"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("PIL not available, using alternative method...")
    import subprocess
    # Try using ImageMagick convert
    subprocess.run(['convert', '-version'], check=True, capture_output=True)
    print("Using ImageMagick...")
    exit(1)

# Create 800x600 image
img = Image.new('RGB', (800, 600), color='#0a0a0a')
draw = ImageDraw.Draw(img)

# Grid pattern
for i in range(0, 800, 40):
    draw.line([(i, 0), (i, 600)], fill='#1a3322', width=1)
for j in range(0, 600, 40):
    draw.line([(0, j), (800, j)], fill='#1a3322', width=1)

# Try to load a font, fall back to default
try:
    title_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 56)
    subtitle_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 32)
    game_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 28)
    text_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    small_font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 14)
except:
    title_font = ImageFont.load_default()
    subtitle_font = ImageFont.load_default()
    game_font = ImageFont.load_default()
    text_font = ImageFont.load_default()
    small_font = ImageFont.load_default()

# Title
draw.text((400, 80), 'HACKATHON ARCADE', fill='#00ff88', font=title_font, anchor='mm', stroke_width=3, stroke_fill='#000000')
draw.text((400, 120), 'AI DEVELOPER EDITION', fill='#ff0066', font=subtitle_font, anchor='mm')

# LEFT GAME - Prompt Injection Panic
draw.text((200, 180), 'PROMPT INJECTION', fill='#00ff88', font=game_font, anchor='mm')
draw.text((200, 210), 'PANIC', fill='#00ff88', font=game_font, anchor='mm')

# Defender ship (triangle)
draw.polygon([(200, 250), (170, 280), (230, 280)], fill='#00ff88')

# Attack enemies (simple squares with faces)
attack_colors = ['#ff3333', '#ff6600', '#ff00ff']
for i in range(3):
    x = 150 + i * 50
    y = 300 + i * 30
    draw.rectangle([x, y, x + 30, y + 30], fill=attack_colors[i])
    # Eyes
    draw.rectangle([x + 5, y + 8, x + 9, y + 12], fill='#000000')
    draw.rectangle([x + 21, y + 8, x + 25, y + 12], fill='#000000')

# Safety filters (bullets)
for i in range(5):
    x = 180 + i * 10
    y = 360 - i * 20
    draw.rectangle([x, y, x + 3, y + 10], fill='#00ff88')

# RIGHT GAME - Merge Conflict Mayhem
draw.text((600, 180), 'MERGE CONFLICT', fill='#ff6600', font=game_font, anchor='mm')
draw.text((600, 210), 'MAYHEM', fill='#ff6600', font=game_font, anchor='mm')

# Tetris-style blocks
block_colors = ['#00ff00', '#ff0000', '#ff00ff', '#0088ff']
block_size = 20
y_pos = 250

for row in range(8):
    for col in range(5):
        color_idx = (row + col) % 4
        x = 530 + col * (block_size + 2)
        y = y_pos + row * (block_size + 2)
        draw.rectangle([x, y, x + block_size, y + block_size],
                      fill=block_colors[color_idx], outline='#000000', width=1)

# Git branch visualization
draw.line([(550, 450), (550, 500)], fill='#ff6600', width=2)
draw.line([(600, 450), (600, 500)], fill='#ff6600', width=2)
draw.ellipse([(570, 470), (580, 480)], fill='#ff6600')

# Bottom text
draw.text((400, 520), 'Two Games. Infinite Developer Pain.', fill='#ffffff', font=subtitle_font, anchor='mm')
draw.text((400, 555), 'Navigate the lobby with Arrow Keys or WASD | Press SPACE to play',
         fill='#888888', font=text_font, anchor='mm')

# Feature list
features = ['✓ Wave-based progression', '✓ Combo multipliers', '✓ Boss battles', '✓ High score tracking']
for i, feature in enumerate(features):
    draw.text((50, 470 + i * 25), feature, fill='#00ff88', font=small_font)

# Save
img.save('cover.png')
print('✅ Generated cover.png (800x600)')
