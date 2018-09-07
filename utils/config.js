/**
 * Here to set opencv configs
 */
exports.opencv = {
  // set webcam port 
  camPort: 0,
  // set webcam FPS
  camFps: 100,
  // set webcam interval
  camInterval: Math.ceil(1000 / camFps),
  // set frame size
  frameSize: 800
}