const spawn = require('child_process').spawn;
const filter = require('stream-filter');
const MultiStream = require('multistream');

const { process } = require('./config');

const hlsArgs = [
	'-f',
	'image2pipe',
	'-framerate',
	'25',
	'-i',
	'-',
	'-c:v',
	'libx264',
	'-preset',
	'faster',
	'-g',
	'30',
	'-r',
	'25',
	// '-filter:v',
	// 'setpts=2.0*PTS',
	'-hls_time',
	'4',
	'-hls_list_size',
	'5',
	'-hls_delete_threshold',
	'20',
	'-hls_flags',
	'delete_segments',
	'-use_localtime',
	'1',
	'-hls_segment_filename',
	'public/hls/%Y%m%d-%s.ts',
	'public/hls/playlist.m3u8'
];

const faceDetectStreams = [];

const ffmpegHLS = spawn('ffmpeg', hlsArgs);
ffmpegHLS.stdin.setEncoding('binary');

for (let count = 1; count <= process.maxCount; count++) {
	const faceDetect = spawn('node', ['utils/face-detection.js']);
	faceDetect.stdout.setDefaultEncoding('binary');
	faceDetectStreams.push(faceDetect.stdout);
}

const hls = () => {
	MultiStream(faceDetectStreams)
		.pipe(
			filter((data) => {
				// filter opencv output, example: '[ INFO:0] Initialize OpenCL runtime...'
				const regex = /\[\sINFO:\d\]\s/gm;
				const isImgData = !regex.test(data);
				return isImgData;
			})
		)
		.pipe(ffmpegHLS.stdin);

	ffmpegHLS.stdout.on('data', (data) => {
		console.log('stdout: ' + data.toString());
	});

	ffmpegHLS.stderr.on('data', (data) => {
		console.log('stderr: ' + data.toString());
	});

	ffmpegHLS.on('exit', (code) => {
		console.log('child process exited with code ' + code.toString());
	});
};

module.exports = hls;
