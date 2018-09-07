const cv = require('opencv4nodejs');

exports.cv = cv;

exports.grabFrames = (videoSource, delay, camInterval, onFrame) => {
  const cap = new cv.VideoCapture(videoSource);
  let done = false;

  const intvl = setInterval(() => {
    let frame = cap.read();

    // loop back to start on end of stream reached
    if (frame.empty) {
      cap.reset();
      frame = cap.read();
    }

    onFrame(frame);

    const key = cv.waitKey(delay);

    done = key !== -1 && key !== 255;

    if (done) {
      clearInterval(intvl);
      console.log('Key pressed, exiting.');
    }
  }, camInterval);
};

const drawRect = (image, rect, color, opts = { thickness: 2 }) =>
  image.drawRectangle(
    rect,
    color,
    opts.thickness,
    cv.LINE_8
  );

exports.drawRect = drawRect;

exports.drawBlueRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(255, 0, 0), opts);

exports.drawGreenRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(0, 255, 0), opts);

exports.drawRedRect = (image, rect, opts = { thickness: 2 }) =>
  drawRect(image, rect, new cv.Vec(0, 0, 255), opts);
