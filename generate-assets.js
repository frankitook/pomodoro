const fs = require('fs');
const path = require('path');

const stages = [
  // Stage 0: Tiny sprout
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <circle cx="70" cy="110" r="5" fill="#7BAE7F" />
  </svg>`,
  // Stage 1: Small shoot
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 95" stroke="#7BAE7F" stroke-width="4" />
    <ellipse cx="75" cy="98" rx="5" ry="3" fill="#7BAE7F" transform="rotate(-30 75 98)" />
  </svg>`,
  // Stage 2: Taller stem
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 80" stroke="#7BAE7F" stroke-width="4" />
    <ellipse cx="65" cy="95" rx="6" ry="3" fill="#7BAE7F" transform="rotate(30 65 95)" />
    <ellipse cx="75" cy="85" rx="6" ry="3" fill="#7BAE7F" transform="rotate(-30 75 85)" />
  </svg>`,
  // Stage 3: Branching
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 70 M70 85 L85 75 M70 90 L55 80" stroke="#7BAE7F" stroke-width="4" fill="none" />
    <ellipse cx="85" cy="75" rx="7" ry="4" fill="#7BAE7F" transform="rotate(-30 85 75)" />
    <ellipse cx="55" cy="80" rx="7" ry="4" fill="#7BAE7F" transform="rotate(30 55 80)" />
    <ellipse cx="70" cy="70" rx="7" ry="4" fill="#7BAE7F" />
  </svg>`,
  // Stage 4: Fuller plant, bud
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 60 M70 80 L90 70 M70 85 L50 75" stroke="#7BAE7F" stroke-width="5" fill="none" />
    <ellipse cx="90" cy="70" rx="8" ry="4" fill="#7BAE7F" transform="rotate(-30 90 70)" />
    <ellipse cx="50" cy="75" rx="8" ry="4" fill="#7BAE7F" transform="rotate(30 50 75)" />
    <circle cx="70" cy="55" r="6" fill="#C8956C" />
  </svg>`,
  // Stage 5: Opening
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 60 M70 80 L95 65 M70 85 L45 70" stroke="#7BAE7F" stroke-width="5" fill="none" />
    <circle cx="70" cy="50" r="12" fill="#C8956C" opacity="0.6" />
    <circle cx="70" cy="50" r="6" fill="#F5ECD7" />
  </svg>`,
  // Stage 6: Fully open
  `<svg width="140" height="140" viewBox="0 0 140 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="40" y="110" width="60" height="20" fill="#8B6F5E" />
    <path d="M70 110 L70 60 M70 80 L95 65 M70 85 L45 70" stroke="#7BAE7F" stroke-width="5" fill="none" />
    <path d="M70 50 Q85 35 100 50 Q85 65 70 50 Q55 65 40 50 Q55 35 70 50 Q70 30 85 15 Q100 30 85 45 Z" fill="#C8956C" />
    <circle cx="70" cy="50" r="6" fill="#F5ECD7" />
  </svg>`
];

const dir = path.join(__dirname, 'src/assets/sprites');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

stages.forEach((svg, i) => {
  fs.writeFileSync(path.join(dir, `plant-${i}.svg`), svg);
});

console.log('SVG plant stages generated.');
