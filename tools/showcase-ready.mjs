// Portable signal for a staged fullscreen demonstration; no shell-specific touch command.
import {writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
await writeFile(path.join(tmpdir(),'meridian-recording-go'),new Date().toISOString());
console.log('Recording-ready signal sent. Return focus to the staged game window.');
