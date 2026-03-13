const totalFrames = 35;
const preloadedImages = [];

// Preload all frames to memory
function preloadPlantSprites() {
  for (let i = 0; i <= totalFrames; i++) {
    const img = new Image();
    const frameStr = String(i).padStart(3, '0');
    img.src = `assets/sprites/frame_${frameStr}.png`;
    preloadedImages.push(img);
  }
}

function updatePlant(progress, isBreak) {
  const sprite = document.getElementById('plant-sprite');
  if (!sprite) return;

  let frameNumber = 0;
  if (isBreak) {
    frameNumber = totalFrames;
    sprite.classList.add('plant-break');
  } else {
    sprite.classList.remove('plant-break');
    // Map progress (0.0 - 1.0) to frame index (0 - 35)
    frameNumber = Math.min(totalFrames, Math.floor(progress * (totalFrames + 1)));
  }

  const frameStr = String(frameNumber).padStart(3, '0');
  const nextSrc = `assets/sprites/frame_${frameStr}.png`;
  
  // Instant swap for smoothness with many frames
  if (sprite.dataset.frame !== frameStr) {
    sprite.src = nextSrc;
    sprite.dataset.frame = frameStr;
  }
}

// Start preloading immediately
preloadPlantSprites();
