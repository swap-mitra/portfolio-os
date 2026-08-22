/* The synthwave drive scene (architecture.md §7), ported from the approved
   standalone reference.

   Every frame is a pure function of elapsed seconds. The reference mutated
   pole positions by delta time, which meant the scene drifted with frame rate
   and had no defined state to draw when it was not running. Deriving position
   from `t` instead makes reduced motion trivial (draw t=0 and stop) and means
   two machines at different frame rates see the same road. */

/** Deterministic, so the mountains and stars are the same on every load. A
    scene that reshuffles on refresh reads as a bug, not as variety. */
function seededRandom(seed: number): () => number {
  let value = seed
  return () => {
    // Numerical Recipes LCG. The product stays under 2^53, so it is exact.
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

interface Star {
  x: number
  y: number
  size: number
  phase: number
}

interface Pole {
  /** Distance at t=0. Larger is further away. */
  z: number
  /** -1 for the left verge, 1 for the right. */
  side: number
}

export interface DriveScene {
  stars: Star[]
  farRidge: number[]
  nearRidge: number[]
  poles: Pole[]
}

const POLE_COUNT = 14
const POLE_SPACING = 1.6
/** Distance a pole travels before wrapping back to the horizon. */
const POLE_CYCLE = POLE_COUNT * POLE_SPACING
/** Nearest a pole gets before it wraps. Below this it is past the camera. */
const POLE_NEAR = 0.6

/** How fast the road moves. The reference exposed this as a slider; there is
    one caller and one right answer, so it is a constant here. */
const SPEED = 1

export function createDriveScene(): DriveScene {
  const random = seededRandom(20260809)

  const stars: Star[] = Array.from({ length: 90 }, () => ({
    x: random(),
    y: random(),
    size: random() * 1.4 + 0.4,
    phase: random() * 6.28,
  }))

  /** A rough horizon line: a random walk, clamped so it never flattens out
      or runs off the top. */
  const ridge = (segments: number): number[] => {
    const points: number[] = []
    let height = 0.5
    for (let i = 0; i <= segments; i++) {
      height += (random() - 0.5) * 0.5
      height = Math.max(0.12, Math.min(1, height))
      points.push(height)
    }
    return points
  }

  const farRidge = ridge(26)
  const nearRidge = ridge(18)

  const poles: Pole[] = Array.from({ length: POLE_COUNT }, (_, i) => ({
    z: 1 + i * POLE_SPACING,
    side: i % 2 === 0 ? -1 : 1,
  }))

  return { stars, farRidge, nearRidge, poles }
}

/** Positive modulo. `%` keeps the sign of the dividend in JS, which would put
    poles behind the camera and stop them being drawn. */
const wrap = (value: number, span: number): number => ((value % span) + span) % span

export function drawDriveFrame(
  ctx: CanvasRenderingContext2D,
  scene: DriveScene,
  width: number,
  height: number,
  t: number,
): void {
  const horizon = height * 0.54
  const centreX = width / 2

  drawSky(ctx, width, horizon)
  drawStars(ctx, scene, width, horizon, t)
  drawSun(ctx, centreX, horizon, width, height, t)
  drawMountains(ctx, scene, width, height, horizon)
  drawHorizonLine(ctx, width, horizon)
  drawGround(ctx, scene, width, height, horizon, centreX, t)
}

function drawSky(ctx: CanvasRenderingContext2D, width: number, horizon: number): void {
  const sky = ctx.createLinearGradient(0, 0, 0, horizon)
  sky.addColorStop(0, '#0b0b16')
  sky.addColorStop(0.42, '#241247')
  sky.addColorStop(0.72, '#7a1a63')
  sky.addColorStop(1, '#ff2e6b')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, width, horizon)
}

function drawStars(
  ctx: CanvasRenderingContext2D,
  scene: DriveScene,
  width: number,
  horizon: number,
  t: number,
): void {
  ctx.fillStyle = '#e8e6f0'
  for (const star of scene.stars) {
    const twinkle = 0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.6 + star.phase))
    // Stars low in the sky fade out, so they don't fight the sunset band.
    ctx.globalAlpha = twinkle * (1 - star.y * 1.7 > 0 ? 1 : 0.25)
    ctx.fillRect(star.x * width, star.y * horizon * 0.75, star.size, star.size)
  }
  ctx.globalAlpha = 1
}

function drawSun(
  ctx: CanvasRenderingContext2D,
  centreX: number,
  horizon: number,
  width: number,
  height: number,
  t: number,
): void {
  const radius = Math.min(width, height) * 0.19
  const centreY = horizon - radius * 0.42

  const gradient = ctx.createLinearGradient(0, centreY - radius, 0, centreY + radius)
  gradient.addColorStop(0, '#ffe14d')
  gradient.addColorStop(0.5, '#ff8a3d')
  gradient.addColorStop(1, '#ff2e6b')

  ctx.save()
  ctx.beginPath()
  ctx.arc(centreX, centreY, radius, 0, Math.PI * 2)
  ctx.clip()
  ctx.fillStyle = gradient
  ctx.fillRect(centreX - radius, centreY - radius, radius * 2, radius * 2)

  /* The bands that make it read as a sunset rather than a circle. They widen
     towards the bottom and drift a pixel, which is the whole animation. */
  ctx.fillStyle = '#241247'
  ctx.globalAlpha = 0.9
  for (let i = 0; i < 9; i++) {
    const y = centreY + radius * (0.06 + i * 0.115) + Math.sin(t * 0.6)
    ctx.fillRect(centreX - radius, y, radius * 2, 2 + i * 1.6)
  }
  ctx.globalAlpha = 1
  ctx.restore()

  ctx.save()
  ctx.globalAlpha = 0.35
  ctx.filter = 'blur(18px)'
  ctx.fillStyle = '#ff6a3d'
  ctx.beginPath()
  ctx.arc(centreX, centreY, radius * 1.15, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawMountains(
  ctx: CanvasRenderingContext2D,
  scene: DriveScene,
  width: number,
  height: number,
  horizon: number,
): void {
  const ridge = (points: number[], amplitude: number, fill: string, stroke: string) => {
    ctx.beginPath()
    ctx.moveTo(0, horizon + 1)
    points.forEach((h, i) => {
      ctx.lineTo((i / (points.length - 1)) * width, horizon + 1 - h * amplitude)
    })
    ctx.lineTo(width, horizon + 1)
    ctx.closePath()
    ctx.fillStyle = fill
    ctx.fill()
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  ridge(scene.farRidge, height * 0.14, '#1a0f33', 'rgba(255, 46, 107, 0.55)')
  ridge(scene.nearRidge, height * 0.09, '#12082a', 'rgba(35, 240, 255, 0.45)')
}

function drawHorizonLine(ctx: CanvasRenderingContext2D, width: number, horizon: number): void {
  ctx.save()
  ctx.globalAlpha = 0.85
  ctx.filter = 'blur(6px)'
  ctx.fillStyle = '#23f0ff'
  ctx.fillRect(0, horizon - 1.5, width, 3)
  ctx.restore()
  ctx.fillStyle = '#e8e6f0'
  ctx.fillRect(0, horizon - 0.5, width, 1)
}

function drawGround(
  ctx: CanvasRenderingContext2D,
  scene: DriveScene,
  width: number,
  height: number,
  horizon: number,
  centreX: number,
  t: number,
): void {
  const ground = ctx.createLinearGradient(0, horizon, 0, height)
  ground.addColorStop(0, '#180a2e')
  ground.addColorStop(1, '#0b0b16')
  ctx.fillStyle = ground
  ctx.fillRect(0, horizon, width, height - horizon)

  const depth = height - horizon

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, horizon, width, depth)
  ctx.clip()

  // Perspective lines, all converging on the vanishing point.
  ctx.strokeStyle = 'rgba(255, 46, 107, 0.5)'
  ctx.lineWidth = 1.2
  for (let i = -14; i <= 14; i++) {
    ctx.beginPath()
    ctx.moveTo(centreX, horizon)
    ctx.lineTo(centreX + i * width * 0.17, height + 60)
    ctx.stroke()
  }

  /* Horizontals scroll towards the camera. `depth / p` is the perspective
     divide: evenly spaced in depth, bunched up near the horizon on screen. */
  const phase = (t * 0.9) % 1
  for (let k = 1; k <= 26; k++) {
    const p = k - phase
    const y = horizon + depth / p
    if (y > height + 4) continue
    const nearness = Math.min(1, 1 / (p * 0.55))
    ctx.strokeStyle = `rgba(35, 240, 255, ${0.12 + nearness * 0.55})`
    ctx.lineWidth = Math.min(2.4, 0.5 + nearness * 1.6)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }

  const roadWidth = width * 0.16
  ctx.beginPath()
  ctx.moveTo(centreX - 6, horizon)
  ctx.lineTo(centreX + 6, horizon)
  ctx.lineTo(centreX + roadWidth * 3.2, height + 60)
  ctx.lineTo(centreX - roadWidth * 3.2, height + 60)
  ctx.closePath()
  ctx.fillStyle = 'rgba(11, 11, 22, 0.92)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255, 225, 77, 0.5)'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Centre line dashes, on the same perspective divide as the horizontals.
  ctx.fillStyle = 'rgba(255, 225, 77, 0.75)'
  for (let k = 1; k <= 22; k++) {
    const p = k - phase
    const near = horizon + depth / p
    const far = horizon + depth / (p + 0.45)
    if (near > height + 20) continue
    const dashWidth = Math.max(1, ((near - horizon) / depth) * 10)
    ctx.fillRect(centreX - dashWidth / 2, far, dashWidth, Math.max(1, near - far))
  }

  drawPoles(ctx, scene, height, horizon, centreX, roadWidth, depth, t)
  ctx.restore()
}

function drawPoles(
  ctx: CanvasRenderingContext2D,
  scene: DriveScene,
  height: number,
  horizon: number,
  centreX: number,
  roadWidth: number,
  depth: number,
  t: number,
): void {
  for (const pole of scene.poles) {
    const p = POLE_NEAR + wrap(pole.z - POLE_NEAR - t * SPEED * 2.2, POLE_CYCLE)
    const y = horizon + depth / p
    if (y > height + 40) continue

    const scale = depth / p / depth
    const x = centreX + pole.side * roadWidth * 3.6 * scale * 1.15
    const poleHeight = depth * scale * 0.55

    ctx.fillStyle = '#0b0b16'
    ctx.fillRect(x - Math.max(1, scale * 4), y - poleHeight, Math.max(1.5, scale * 8), poleHeight)

    ctx.save()
    ctx.globalAlpha = 0.9
    ctx.filter = 'blur(3px)'
    ctx.fillStyle = pole.side > 0 ? '#23f0ff' : '#ff2e6b'
    ctx.beginPath()
    ctx.arc(x, y - poleHeight, Math.max(2, scale * 12), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}
