const {
  cv,
  grabFrames,
  drawBlueRect
} = require('./opencv-helpers');

const { opencv } = require('./config');

const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);

// set stdout encoding to 'binary'
process.stdout.setDefaultEncoding('binary');

function detectFaces(img) {
  // restrict minSize and scaleFactor for faster processing
  const options = {
    minSize: new cv.Size(100, 100),
    scaleFactor: 1.2,
    minNeighbors: 10
  };

  /**
   * Note:
   * Method detectMultiScale is running by CPU
   * Method detectMultiScaleGpu is running by GPU
   */
  return classifier.detectMultiScaleGpu(img.bgrToGray(), options).objects;
}

const runWebcamFaceDetection = (src, detectFaces) => grabFrames(src, 1, opencv.camInterval, (frame) => {
  const frameResized = frame.resizeToMax(opencv.frameSize);

  // detect faces
  const faceRects = detectFaces(frameResized);
  if (faceRects.length) {
    // draw detection
    faceRects.forEach(faceRect => drawBlueRect(frameResized, faceRect));
  }

  // write the jpg binary data to stdout
  process.stdout.write(cv.imencode('.jpg', frameResized).toString('binary'));
})

runWebcamFaceDetection(opencv.camPort, detectFaces);
