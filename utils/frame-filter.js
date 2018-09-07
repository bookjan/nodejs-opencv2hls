const spawn = require('child_process').spawn;
const faceDetect = spawn('node', ['face-detection.js']);

process.stdout.setDefaultEncoding('binary');

// filter opencv output, example: '[ INFO:0] Initialize OpenCL runtime...'
const regex = /\[\sINFO\:\d\]\s/gm;

faceDetect.stdout.on('data', function (data) {
  const isNotMatch = !regex.test(data);
  if (isNotMatch) {
    process.stdout.write(data);
  }
});

faceDetect.stderr.on('data', function (data) {
  console.log('stderr: ' + data.toString());
});

faceDetect.on('exit', function (code) {
  console.log('child process exited with code ' + code.toString());
});