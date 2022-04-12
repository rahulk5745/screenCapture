var express = require('express');
var router = express.Router();
const path = require('path');
const common = require('../common');

const UPLOAD_TMP_DIR = 'uploads/tmp';
const FINAL_PATH = 'uploads/final';
const AUDIO_CODEC = 'm4a';
const VIDEO_CODEC = 'mjpeg';
const TAR_FORMAT = 'tgz';
const TAR_CMD = 'tar -zcvf'
const CLEAN_UPLOADS = true;

const multer = require('multer');
const { xml } = require('jade/lib/doctypes');

const upload = multer({
  dest:UPLOAD_TMP_DIR
})
/* GET users listing. */
router.post('/', upload.single('file'), async function(req, res, next) {
  console.log(req.file)
  console.log(`CROP: ${req.body.crop}`);
  
  const {xStart, xEnd, yStart, yEnd} = JSON.parse(req.body.crop);
  const width = xEnd - xStart;
  const height = yEnd - yStart;


  const tmpPath = path.join(UPLOAD_TMP_DIR, req.file.filename);
  const finalPathAudio = path.join(FINAL_PATH, req.file.filename) + "." + AUDIO_CODEC;
  const finalPathVideo = path.join(FINAL_PATH, req.file.filename) + "." + VIDEO_CODEC;
  const tempPathVideo = path.join(FINAL_PATH, req.file.filename) + "_t." + VIDEO_CODEC;
  const finalPathArchive = path.join(FINAL_PATH, req.file.filename) + "." + TAR_FORMAT;
  const ffmpegCmd = `ffmpeg -i ${tmpPath} -map 0:a ${finalPathAudio} -filter:v "crop=${width}:${height}:${xStart}:${yStart},fps=15,scale=240:240:flags=lanczos,crop=240:in_h:(in_w-240)/2:0"  -q:v 9 -map 0:v ${tempPathVideo}`
  const ffmpegCropCmd = `ffmpeg -i ${tempPathVideo} -vf "fps=15,scale=240:240:flags=lanczos,crop=240:in_h:(in_w-240)/2:0" -q:v 9 ${finalPathVideo}`

  console.log(`Executing ffmpeg command: ${ffmpegCmd}`);
  try{
    let execResp = await common.exec(ffmpegCmd);
    let execRespCrop = await common.exec(ffmpegCropCmd);
    const tarCmd = `${TAR_CMD} ${finalPathArchive} ${finalPathAudio} ${finalPathVideo}`;
    execResp = await common.exec(tarCmd);
    if (CLEAN_UPLOADS){
          const cleanCmd = `rm -f ${finalPathAudio} ${finalPathVideo} ${tempPathVideo} ${tmpPath}`
          execResp = await common.exec(cleanCmd);
    } 
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({"status":"success","path":`rec/final/${req.file.filename}.${TAR_FORMAT}`}));
  } catch (e) {
    console.error(`Exception in ffmpeg: ${e}`);
    res.status(500).json({"status":"failed"});
    return;
  }

     

});


module.exports = router;
