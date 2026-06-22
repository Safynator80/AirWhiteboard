const $ = (id) => document.getElementById(id);
const MEDIAPIPE_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22';
const MEDIAPIPE_WASM_URL = `${MEDIAPIPE_URL}/wasm`;
const HAND_MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
const board = $('board'), boardWrap = $('boardWrap'), ctx = board.getContext('2d');
const video = $('video'), overlay = $('overlay'), overlayCtx = overlay.getContext('2d');
const state = { tool:'pen', size:5, strokes:[], active:null, handLandmarker:null, stream:null, running:false, lastVideoTime:-1, frames:[], lastPoint:null, lastFrame:0 };

function resizeCanvas() { const r=boardWrap.getBoundingClientRect(), scale=devicePixelRatio; board.width=r.width*scale; board.height=r.height*scale; ctx.setTransform(scale,0,0,scale,0,0); redraw(); }
function pointFromEvent(e) { const r=board.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top, t:performance.now() }; }
function clearCanvas() { ctx.clearRect(0,0,board.width,board.height); }
function drawStroke(stroke) { if (!stroke?.points?.length) return; ctx.save(); if(stroke.tool==='eraser') ctx.globalCompositeOperation='destination-out'; ctx.strokeStyle='#14213a'; ctx.lineWidth=stroke.size; ctx.lineCap='round'; ctx.lineJoin='round'; ctx.beginPath(); stroke.points.forEach((p,i)=> i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.stroke(); ctx.restore(); }
function redraw() { clearCanvas(); state.strokes.forEach(drawStroke); if(state.active) drawStroke(state.active); }
function updateEmpty() { $('emptyState').hidden=state.strokes.length>0 || Boolean(state.active); }
function beginStroke(p) { state.active={ points:[p], size:state.size, tool:state.tool }; updateEmpty(); }
function extendStroke(p) { if(!state.active) return; const last=state.active.points.at(-1); if(Math.hypot(p.x-last.x,p.y-last.y)<2) return; state.active.points.push(p); redraw(); }
function endStroke() { if(state.active?.points.length>1) state.strokes.push(state.active); state.active=null; redraw(); updateEmpty(); }
function setMode(text,hint) { $('modeText').textContent=text; $('modeHint').textContent=hint; }
function setTool(tool) { state.tool=tool; $('penTool').classList.toggle('active',tool==='pen'); $('eraserTool').classList.toggle('active',tool==='eraser'); setMode(tool==='pen'?'READY TO DRAW':'ERASER',tool==='pen'?'Pinch your fingers to write.':'Pinch over a mark to erase.'); }

board.addEventListener('pointerdown',e=>{ board.setPointerCapture(e.pointerId); beginStroke(pointFromEvent(e)); });
board.addEventListener('pointermove',e=>{ if(e.buttons) extendStroke(pointFromEvent(e)); });
board.addEventListener('pointerup',endStroke);
$('undo').onclick=()=>{ state.strokes.pop(); redraw(); updateEmpty(); };
$('clear').onclick=()=>{ state.strokes=[]; state.active=null; redraw(); updateEmpty(); $('recognizedText').textContent='—'; $('confidenceText').textContent='Board cleared.'; };
$('penTool').onclick=()=>setTool('pen'); $('eraserTool').onclick=()=>setTool('eraser');
$('strokeSize').oninput=e=>{ state.size=Number(e.target.value); $('strokeSizeValue').textContent=state.size; };
$('save').onclick=()=>{ const link=document.createElement('a'); link.download=`airwhiteboard-${new Date().toISOString().slice(0,10)}.png`; link.href=board.toDataURL('image/png'); link.click(); };
window.addEventListener('resize',resizeCanvas); window.addEventListener('keydown',e=>{ if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$('undo').click();} if(e.key.toLowerCase()==='p')setTool('pen'); if(e.key.toLowerCase()==='e')setTool('eraser'); });

// A deliberately small, explainable recognizer. It classifies the last air mark using
// aspect ratio, straightness, crossings and stroke count. It is best for operators;
// digit guesses are shown as suggestions and never replace a user's raw stroke.
function recognizeLast() { const strokes=state.strokes.filter(s=>s.tool==='pen'); const s=strokes.at(-1); if(!s){ $('confidenceText').textContent='Nothing to recognize yet.'; return; } const p=s.points; const xs=p.map(q=>q.x), ys=p.map(q=>q.y), w=Math.max(...xs)-Math.min(...xs), h=Math.max(...ys)-Math.min(...ys); const dist=Math.hypot(p[0].x-p.at(-1).x,p[0].y-p.at(-1).y), path=p.slice(1).reduce((n,q,i)=>n+Math.hypot(q.x-p[i].x,q.y-p[i].y),0); let symbol='?', confidence=42;
  if(w>h*3.2){ symbol='−'; confidence=92; } else if(h>w*3.2){ symbol='1'; confidence=71; } else if(dist<Math.max(w,h)*.35 && path>Math.max(w,h)*2.2){ symbol='0'; confidence=65; } else { const recent=strokes.slice(-2); if(recent.length===2){const a=recent[0].points,b=recent[1].points; const aw=Math.max(...a.map(q=>q.x))-Math.min(...a.map(q=>q.x)), ah=Math.max(...a.map(q=>q.y))-Math.min(...a.map(q=>q.y)); if(aw>ah*3 && w>h*3){symbol='=';confidence=88;} else {symbol='+';confidence=60;} } else if(w>h*.65&&h>w*.65){symbol='×';confidence=57;} else {symbol=h>w?'2':'7';confidence=45;} }
  $('recognizedText').textContent=symbol; $('confidenceText').textContent=`${confidence}% confidence · raw stroke kept`; $('recognitionPill').textContent=`Recognized ${symbol}`;
}
$('recognize').onclick=recognizeLast;

function drawHand(landmarks) { overlayCtx.clearRect(0,0,overlay.width,overlay.height); const w=overlay.width,h=overlay.height; overlayCtx.fillStyle='#38f3df'; overlayCtx.strokeStyle='rgba(56,243,223,.55)'; overlayCtx.lineWidth=2; for(const p of landmarks){overlayCtx.beginPath();overlayCtx.arc(p.x*w,p.y*h,3,0,Math.PI*2);overlayCtx.fill();} const tip=landmarks[8]; overlayCtx.beginPath(); overlayCtx.arc(tip.x*w,tip.y*h,9,0,Math.PI*2); overlayCtx.stroke(); }
function handPoint(landmarks) { const p=landmarks[8], thumb=landmarks[4]; const r=boardWrap.getBoundingClientRect(); return { x:(1-p.x)*r.width, y:p.y*r.height, t:performance.now(), pinch:Math.hypot(p.x-thumb.x,p.y-thumb.y)<.055 }; }
function cameraErrorMessage(error) {
  if (!window.isSecureContext) return 'Open the app at localhost or HTTPS; browsers block cameras on insecure pages.';
  if (error?.name === 'NotAllowedError') return 'Camera permission was blocked. Use the lock icon in your browser address bar to allow Camera, then try again.';
  if (error?.name === 'NotFoundError') return 'No camera was found. Connect a webcam, then try again.';
  if (error?.name === 'NotReadableError') return 'Your camera is busy in another app. Close Zoom, Teams, or another camera app and retry.';
  return 'Could not start camera tracking. Check your connection, then try again.';
}
function trackerErrorMessage(error) {
  const detail = error?.message?.toLowerCase() || '';
  if (detail.includes('fetch') || detail.includes('network') || detail.includes('load')) return 'Camera is live, but hand tracking could not download. Check your internet connection and reload.';
  return 'Camera is live, but hand tracking could not start. Reload the page to retry with CPU tracking.';
}
async function createHandTracker() {
  const { FilesetResolver, HandLandmarker } = await import(MEDIAPIPE_URL);
  const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  const options = { baseOptions:{ modelAssetPath:HAND_MODEL_URL }, runningMode:'VIDEO', numHands:1 };
  try { return await HandLandmarker.createFromOptions(vision, { ...options, baseOptions:{ ...options.baseOptions, delegate:'GPU' } }); }
  catch (gpuError) { console.warn('GPU hand tracking unavailable; falling back to CPU.', gpuError); return HandLandmarker.createFromOptions(vision, { ...options, baseOptions:{ ...options.baseOptions, delegate:'CPU' } }); }
}
async function startCamera() {
  if(state.running) return;
  $('startCamera').disabled=true;
  try {
    // Ask for the user's camera first. A tracking-model download must never prevent the permission prompt.
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable');
    setMode('CONNECTING','Allow camera access in your browser prompt…');
    state.stream=await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user', width:{ideal:1280}, height:{ideal:720} }, audio:false });
    video.srcObject=state.stream;
    await video.play();
    overlay.width=video.videoWidth; overlay.height=video.videoHeight;
    $('videoPlaceholder').hidden=true; $('cameraDot').classList.add('on'); $('cameraStatus').textContent='Camera live';
  } catch(err) {
    console.error('Camera startup failed:',err); state.stream?.getTracks().forEach(track=>track.stop()); state.stream=null;
    $('startCamera').disabled=false; $('cameraDot').classList.remove('on'); $('cameraStatus').textContent='Camera unavailable';
    setMode('CAMERA ERROR',cameraErrorMessage(err));
    return;
  }
  try {
    setMode('LOADING TRACKER','Camera connected — loading hand tracking…');
    state.handLandmarker=await createHandTracker();
    state.running=true; $('startCamera').textContent='Camera connected'; setMode('READY TO DRAW','Pinch thumb and index finger to write.'); requestAnimationFrame(processVideo);
  } catch(err) {
    // Keep the camera preview running. Tracking errors must not look like revoked camera permission.
    console.error('Hand tracker startup failed:',err); $('startCamera').disabled=false; $('startCamera').textContent='Retry hand tracking';
    setMode('TRACKER ERROR',trackerErrorMessage(err));
  }
}
function processVideo(now) { if(!state.running) return; if(video.currentTime!==state.lastVideoTime){state.lastVideoTime=video.currentTime; const result=state.handLandmarker.detectForVideo(video,now); const landmarks=result.landmarks?.[0]; if(landmarks){ drawHand(landmarks); const p=handPoint(landmarks); if(p.pinch){ if(!state.active) {beginStroke(p);setMode(state.tool==='pen'?'DRAWING':'ERASING','Release your pinch to finish the mark.');} else extendStroke(p); } else if(state.active){ endStroke(); setMode('READY TO DRAW','Pinch thumb and index finger to write.'); } } else { overlayCtx.clearRect(0,0,overlay.width,overlay.height); if(state.active)endStroke(); setMode('HAND NOT FOUND','Move your hand back into camera view.'); } }
  state.frames.push(now); while(state.frames.length&&state.frames[0]<now-1000)state.frames.shift(); $('fps').textContent=`${state.frames.length} FPS`; requestAnimationFrame(processVideo); }
$('startCamera').onclick=startCamera; resizeCanvas(); setTool('pen');
