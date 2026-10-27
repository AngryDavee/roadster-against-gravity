"""Prepare the retained Atlas MP3 for local playback; no new audio is synthesized.
Run with Python 3 and FFMPEG pointing to an FFmpeg executable, or FFmpeg on PATH.
"""
import os, shutil, subprocess, json, hashlib
from pathlib import Path

root=Path(__file__).resolve().parent.parent
ff=os.environ.get('FFMPEG') or shutil.which('ffmpeg')
if not ff: raise SystemExit('Set FFMPEG to an FFmpeg executable.')
source=root/'references/racing/music/ignition-vector-atlas-original.mp3'
target=root/'racing/audio/ignition-vector.mp3';target.parent.mkdir(parents=True,exist_ok=True)
# Fold the final 400ms into the opening. Rotate the result so the loop boundary
# joins consecutive source samples rather than jumping from the end to the start.
# 96s source -> 95.6s loop. 150 BPM was a generation target, not a measured tempo.
graph='[0:a]atrim=end=96,asetpts=PTS-STARTPTS,asplit=3[head][body][tail];[head]atrim=end=0.4,asetpts=PTS-STARTPTS[h];[body]atrim=start=0.4:end=95.6,asetpts=PTS-STARTPTS[b];[tail]atrim=start=95.6,asetpts=PTS-STARTPTS[t];[t]afade=t=out:st=0:d=0.4[tf];[h]afade=t=in:st=0:d=0.4[hf];[tf][hf]amix=inputs=2:normalize=0:duration=shortest[j];[j][b]concat=n=2:v=0:a=1,volume=-4.86dB[out]'
subprocess.run([ff,'-y','-v','error','-i',str(source),'-filter_complex',graph,'-map','[out]','-ar','48000','-ac','2','-c:a','libmp3lame','-b:a','192k','-metadata','title=Ignition Vector','-metadata','comment=Original Atlas-generated Meridian racing score',str(target)],check=True)
r=subprocess.run([ff,'-hide_banner','-nostats','-i',str(target),'-af','loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
stats=json.loads(r.stderr[r.stderr.rfind('{'):r.stderr.rfind('}')+1])
pcm=subprocess.check_output([ff,'-v','error','-i',str(target),'-f','f32le','-ac','2','-ar','48000','-'])
duration=len(pcm)/(4*2*48000)
assert abs(duration-95.6)<.01, f'Unexpected mastered duration {duration}'
report={'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'runtime_sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'runtime_bytes':target.stat().st_size,'loop_seconds':duration,'processing':'400ms circular linear crossfade; -4.86dB fixed gain; stereo 48kHz 192kbps MP3','measured_loudness_lufs':float(stats['input_i']),'measured_true_peak_dbtp':float(stats['input_tp']),'measured_loudness_range_lu':float(stats['input_lra']),'tempo_bpm_requested':150,'tempo_bpm_measured':None}
(root/'references/racing/music/mastering.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
