// Mock navigator.mediaDevices with a fake camera that produces a
// frame-by-frame animation. Each captured frame in the app will land on a
// different drawing, so the resulting stop-motion has real motion.

(function () {
  const W = 640
  const H = 480
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Scene state — advances on every animation frame and changes on every
  // "capture" so each saved frame is visibly different.
  let t = 0

  function drawScene() {
    // Sky gradient background.
    const sky = ctx.createLinearGradient(0, 0, 0, H)
    sky.addColorStop(0, '#1e3a8a')
    sky.addColorStop(0.7, '#7c3aed')
    sky.addColorStop(1, '#f59e0b')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, W, H)

    // Ground.
    ctx.fillStyle = '#065f46'
    ctx.fillRect(0, H - 60, W, 60)

    // A bouncing ball that traverses left-to-right and bounces vertically.
    const phase = (t % 60) / 60
    const x = 60 + phase * (W - 120)
    const bounceHeight = Math.abs(Math.sin(phase * Math.PI * 2)) * 200
    const y = H - 60 - 30 - bounceHeight
    const hue = (t * 6) % 360
    ctx.fillStyle = `hsl(${hue}, 90%, 60%)`
    ctx.beginPath()
    ctx.arc(x, y, 28, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 3
    ctx.stroke()

    // Title banner.
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 48px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Hello StopClip!', W / 2, 30)

    // Frame counter so it is obvious that each captured frame differs.
    ctx.font = 'bold 24px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(`frame ${t}`, 20, H - 95)

    t += 1
  }

  // Drive the canvas at ~30fps so captureStream sees motion. The stop-motion
  // app reads whatever is currently on the canvas at capture time.
  drawScene()
  setInterval(drawScene, 1000 / 30)

  // captureStream gives us a MediaStream that mirrors the canvas.
  const stream = canvas.captureStream(30)

  const fakeDevices = [
    {
      deviceId: 'fake-front',
      kind: 'videoinput',
      label: 'Fake Front Camera',
      groupId: 'fake',
      toJSON() {
        return this
      },
    },
    {
      deviceId: 'fake-rear',
      kind: 'videoinput',
      label: 'Fake Rear Camera',
      groupId: 'fake',
      toJSON() {
        return this
      },
    },
  ]

  // Patch navigator.mediaDevices. Some browsers expose it as a non-writable
  // getter, so we redefine the property.
  const mediaDevices = navigator.mediaDevices || {}
  const patched = {
    getUserMedia: async (constraints) => {
      const wantsAudio = !!(constraints && constraints.audio)
      if (wantsAudio && !constraints?.video) {
        // Audio-only request — return an empty audio stream from an
        // AudioContext silent oscillator so the app's MediaRecorder still
        // has something to record.
        const ac = new (window.AudioContext || window.webkitAudioContext)()
        const dst = ac.createMediaStreamDestination()
        const osc = ac.createOscillator()
        const gain = ac.createGain()
        gain.gain.value = 0.0001
        osc.connect(gain).connect(dst)
        osc.start()
        return dst.stream
      }
      return stream
    },
    enumerateDevices: async () => fakeDevices,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    getSupportedConstraints: () =>
      (mediaDevices.getSupportedConstraints &&
        mediaDevices.getSupportedConstraints()) || {},
  }

  try {
    Object.defineProperty(navigator, 'mediaDevices', {
      value: patched,
      configurable: true,
    })
  } catch (e) {
    // Best-effort fallback.
    Object.assign(navigator.mediaDevices || {}, patched)
  }

  // Tag a global so we can confirm the script ran.
  window.__fakeCameraInstalled = true
})()
