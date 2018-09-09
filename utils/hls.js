const spawn = require('child_process').spawn;

const hlsArgs = [
  '-f', 'image2pipe',
  '-re',
  '-framerate', '15',
  '-i', '-',
  '-codec:v', 'libx264',
  '-g', '30',
  '-hls_time', '4',
  '-hls_list_size', '3',
  '-hls_flags', 'delete_segments',
  '-use_localtime', '1',
  '-hls_segment_filename', `${__basedir}/public/hls/%Y%m%d-%s.ts`,
  `${__basedir}/public/hls/playlist.m3u8`
];

const ffmpegHLS = spawn('ffmpeg', hlsArgs);
const faceDetect = spawn('node', [`${__basedir}/utils/face-detection.js`]);

faceDetect.stdout.setDefaultEncoding('binary');
ffmpegHLS.stdin.setEncoding('binary');

// filter opencv output, example: '[ INFO:0] Initialize OpenCL runtime...'
const regex = /\[\sINFO\:\d\]\s/gm;

const hls = () => {
  faceDetect.stdout.on('data', function (data) {
    const isImgData = !regex.test(data);
    if (isImgData) {
      ffmpegHLS.stdin.write(data);
    }
  });

  faceDetect.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  faceDetect.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
  });

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
