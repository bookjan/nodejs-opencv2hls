const spawn = require('child_process').spawn;
const filter = require('stream-filter');
const MultiStream = require('multistream');

const { process } = require('./config');

const hlsArgs = [
  '-f', 'image2pipe',
  '-framerate', '25',
  '-i', '-',
  '-c:v', 'libx264',
  '-preset', 'faster',
  '-g', '30',
  '-r', '25',
  '-hls_time', '4',
  '-hls_list_size', '5',
  '-hls_flags', 'delete_segments',
  '-use_localtime', '1',
  '-hls_segment_filename', `${__basedir}/public/hls/%Y%m%d-%s.ts`,
  `${__basedir}/public/hls/playlist.m3u8`
];

const faceDetectStreams = [];

const ffmpegHLS = spawn('ffmpeg', hlsArgs);
ffmpegHLS.stdin.setEncoding('binary');

for (count = 1; count <= process.maxCount; count++) {
  const faceDetect = spawn('node', [`${__basedir}/utils/face-detection.js`]);
  faceDetect.stdout.setDefaultEncoding('binary');
  faceDetectStreams.push(faceDetect.stdout);
}

const hls = () => {
  MultiStream(faceDetectStreams).pipe(filter(function (data) {
    // filter opencv output, example: '[ INFO:0] Initialize OpenCL runtime...'
    const regex = /\[\sINFO\:\d\]\s/gm;
    const isImgData = !regex.test(data);
    return isImgData;
  })).pipe(ffmpegHLS.stdin);

  ffmpegHLS.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  ffmpegHLS.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  ffmpegHLS.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
  });
}

module.exports = hls;
