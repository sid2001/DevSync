const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
function getVideoFile(req, res, next) {
  // const filePath = '../video.mp4';
  // console.log('streaming');
  // fs.stat(filePath, (err, stats) => {
  //   if (err) {
  //     console.error(err);
  //     res.writeHead(404, {'Content-Type': 'text/plain'});
  //     res.json({
  //       "type":"error",
  //       "message":"File not found"
  //     });
  //     return;
  //   }

  //   const range = req.headers.range;
  //   const fileSize = stats.size;
  //   const chunkSize = 1024 * 1024;
  //   const start = Number(range.replace(/\D/g, ""));
  //   const end = Math.min(start + chunkSize, fileSize - 1);

  //   const headers = {
  //     "Content-Type": "video/mp4",
  //     "Content-Length": end - start,
  //     "Content-Range": "bytes " + start + "-" + end + "/" + fileSize,
  //     "Accept-Ranges": "bytes",
  //   };

  //   res.writeHead(206, headers);

  //   const fileStream = fs.createReadStream(filePath, { start, end });

  //   const ffmpegStream = ffmpeg(fileStream)
  //     .videoCodec('libx264')
  //     .format('mp4')
  //     .outputOptions('-movflags frag_keyframe+empty_moov')
  //     .on('end', () => {
  //       console.log('Streaming finished');
  //     })
  //     .on('error', (err) => {
  //       console.error(err);
  //     });

  //   ffmpegStream.pipe(res);
  // });
  const baseDirectory = "C:\\Users\\Shubhranshu Sanjeev";
  const param = req.url.split('@')[1];
  const par = param.split(';');
  console.log(req.url);
  let path = '';
  par.forEach(d => {
    path = path + "\\" + d;
  });
  console.log(baseDirectory + path);
  const videoPath = baseDirectory + path;
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  console.log('video required');
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, {
      start,
      end
    });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4'
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}
function getVideo(req, res, next) {
  res.render('video');
}
module.exports.getVideo = getVideo;
module.exports.getVideoFile = getVideoFile;
//# sourceMappingURL=fileStream.js.map