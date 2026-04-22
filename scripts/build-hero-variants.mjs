#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'public', 'video-ph-web.mp4');

const OUTPUTS = [
  {
    label: 'Mobile 480p (h264)',
    out: resolve(ROOT, 'public', 'video-ph-web-480.mp4'),
    args: [
      '-vf', 'scale=-2:480',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '28',
      '-profile:v', 'main', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
    ],
  },
  {
    label: 'Desktop 720p (h264)',
    out: resolve(ROOT, 'public', 'video-ph-web-720.mp4'),
    args: [
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '25',
      '-profile:v', 'main', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-an',
    ],
  },
];

function transcode({ label, out, args }) {
  console.log(`\n→ ${label}`);
  execFileSync(
    ffmpegPath,
    ['-y', '-i', SRC, ...args, out],
    { stdio: ['ignore', 'inherit', 'inherit'] },
  );
  const size = statSync(out).size;
  console.log(`   ${(size / 1024).toFixed(0)} KB · ${out.replace(ROOT, '')}`);
}

for (const job of OUTPUTS) transcode(job);
console.log('\nDone.');
