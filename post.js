#!/usr/bin/env node
/**
 * Immanuel Men — Social Media Posting Tool
 * Usage:  node post.js "<post text>" [--x] [--instagram] [--facebook]
 *         node post.js --schedule   (posts today's scheduled content)
 *         node post.js --queue      (shows what's queued in Buffer)
 *
 * Requires BUFFER_TOKEN in .env
 */
import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN     = process.env.BUFFER_TOKEN;
const PROFILES  = {
  x:         process.env.BUFFER_PROFILE_X,
  instagram: process.env.BUFFER_PROFILE_INSTAGRAM,
  facebook:  process.env.BUFFER_PROFILE_FACEBOOK,
};

const QUEUE_FILE = join(__dirname, 'data', 'post-queue.json');

// ── BUFFER API ────────────────────────────────────────────────────────────────

async function bufferRequest(endpoint, method = 'GET', body = null) {
  if (!TOKEN) throw new Error('BUFFER_TOKEN not set in .env');
  const res = await fetch(`https://api.bufferapp.com/1/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Buffer API ${res.status}: ${txt}`);
  }
  return res.json();
}

async function postToBuffer(text, profileIds, scheduleAt = null) {
  const body = {
    text,
    profile_ids: profileIds,
    now: !scheduleAt,
  };
  if (scheduleAt) body.scheduled_at = scheduleAt;
  return bufferRequest('updates/create.json', 'POST', body);
}

// ── QUEUE MANAGEMENT ──────────────────────────────────────────────────────────

function loadQueue() {
  try {
    return JSON.parse(readFileSync(QUEUE_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function showQueue() {
  const queue = loadQueue();
  if (queue.length === 0) {
    console.log('\nQueue is empty.');
    return;
  }
  console.log(`\n── Post Queue (${queue.length} items) ─────────────────`);
  queue.forEach((p, i) => {
    const platforms = Object.entries(p.platforms || {})
      .filter(([, v]) => v).map(([k]) => k).join(', ');
    console.log(`\n[${i + 1}] ${p.scheduledDate || 'unscheduled'} · ${platforms}`);
    console.log(`    ${p.text.substring(0, 80)}${p.text.length > 80 ? '...' : ''}`);
  });
}

// ── DIRECT POST ───────────────────────────────────────────────────────────────

async function sendPost(text, platforms, scheduleAt = null) {
  const profileIds = Object.entries(platforms)
    .filter(([, enabled]) => enabled)
    .map(([platform]) => PROFILES[platform])
    .filter(Boolean);

  if (profileIds.length === 0) {
    console.error('No valid profile IDs configured. Check BUFFER_PROFILE_X etc. in .env');
    process.exit(1);
  }

  console.log(`\nPosting to: ${Object.keys(platforms).filter(k => platforms[k]).join(', ')}`);
  console.log(`Text: ${text.substring(0, 60)}${text.length > 60 ? '...' : ''}`);

  const result = await postToBuffer(text, profileIds, scheduleAt);
  console.log('\n✓ Posted successfully!');
  return result;
}

// ── SCHEDULED CONTENT (content calendar) ─────────────────────────────────────

// Edit this array to manage your ongoing content calendar.
// Run:  node post.js --schedule   to post today's entry automatically.
const CONTENT_CALENDAR = [
  {
    week: 1, day: 'tuesday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `They told you to sit down.

God says arise.

For the last several decades, a coordinated cultural assault has been waged against Christian men — telling you that your strength is dangerous, your leadership is outdated, your faith is a crutch.

The Immanuel Men Field Manual Series is for you.

Four books. One formation arc. Ancient theology. Applied to modern men. Written for the field.

📖 Start with Book 1: The Sin of Fear → https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #ChristianMen #MensMinistry #FieldManual #FormationNotInformation`
  },
  {
    week: 1, day: 'thursday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `The man who wakes up at 3:00 a.m. — rehearsing conversations that haven't happened yet, solving problems that haven't arrived —

That man is not broken. He is overloaded.

The Sin of Worry: A Field Manual for the Unclenched Hand.

Ancient patristic theology. Hebrew and Greek word studies. Written for the field.

📖 https://www.amazon.com/dp/B0GWV6NJLP

#ImmanuelMen #SinOfWorry #ChristianMen #AncientTheology #MensMinistry`
  },
  {
    week: 2, day: 'tuesday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `Fear doesn't just slow a man down. It stops him.

Too terrified to look for a new job. Too fearful to lead his family. Too clenched to defend his faith.

The Sin of Fear names the weapon — and breaks it.

12 battle chapters. Patristic anchors. Hebrew & Greek word studies. The Watchman's SOP.

📖 https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #SinOfFear #WarriorPriest #ChristianMen`
  },
  {
    week: 2, day: 'thursday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `"The mandate was never revoked. The light was never meant to be hidden. And you were never meant to sit down."

Shining the Light — Book 3 of the Immanuel Men Field Manual Series.

Seven chapters of theological weaponry. Six warrior profiles. An 8-week men's group curriculum. The 30-Day Shine Challenge.

📖 https://www.amazon.com/dp/B0GYL6FWM7

#ImmanuelMen #ShiningTheLight #WarriorPriest #ChristianMen`
  },
  {
    week: 3, day: 'tuesday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `Here's what the ancient Church Fathers understood that most modern Christianity has forgotten:

Worry is not a mental problem.

Chrysostom called it the fracturing of the inner man.
Maximus the Confessor wrote that no thread of the human person can be pulled without the others responding.

We are treating a Spirit wound with a Body prescription.

The Immanuel Men series addresses all three threads.

📖 immanuelmen.com

#ImmanuelMen #ChristianMen #AncientTheology #PatristicTheology #FormationNotInformation`
  },
  {
    week: 3, day: 'thursday',
    platforms: { x: true, instagram: true, facebook: true },
    text: `The Old Testament is not background.

It is preview.

Every shadow has a Substance — and His name is Jesus.

Shadow of Things to Come: Sacred Patterns, Priestly Types, and Prophetic Figures That Reveal the Substance of Christ.

📖 https://www.amazon.com/dp/B0H2Q1GGXM

#ImmanuelMen #BiblicalTypology #OldTestament #Christology #ChristianBooks`
  },
];

function getTodaysPost() {
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const now = new Date();
  const today = days[now.getDay()];
  const weekOfMonth = Math.floor((now.getDate() - 1) / 7) + 1;
  const week = ((weekOfMonth - 1) % 3) + 1; // cycles weeks 1-2-3 forever
  return CONTENT_CALENDAR.find(p => p.week === week && p.day === today) || null;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--setup')) {
  bufferRequest('profiles.json').then(profiles => {
    console.log('\n── Your Buffer Profiles ─────────────────────────────');
    profiles.forEach(p => {
      console.log(`  ${p.service.padEnd(12)} ${p.id}  @${p.service_username}`);
    });
    console.log('\nAdd these to your .env file:');
    profiles.forEach(p => {
      const key = p.service === 'twitter' ? 'BUFFER_PROFILE_X' :
                  p.service === 'instagram' ? 'BUFFER_PROFILE_INSTAGRAM' :
                  p.service === 'facebook' ? 'BUFFER_PROFILE_FACEBOOK' : null;
      if (key) console.log(`  ${key}=${p.id}`);
    });
  }).catch(err => console.error('\n✗ Error:', err.message));

} else if (args.includes('--queue')) {
  showQueue();

} else if (args.includes('--schedule')) {
  const post = getTodaysPost();
  if (!post) {
    console.log('\nNo post scheduled for today. Check content calendar in post.js.');
    process.exit(0);
  }
  sendPost(post.text, post.platforms)
    .then(() => console.log('\nScheduled post sent.'))
    .catch(err => console.error('\n✗ Error:', err.message));

} else if (args.length > 0 && !args[0].startsWith('--')) {
  const text = args[0];
  const platforms = {
    x:         args.includes('--x') || args.includes('--all'),
    instagram: args.includes('--instagram') || args.includes('--all'),
    facebook:  args.includes('--facebook') || args.includes('--all'),
  };
  if (!platforms.x && !platforms.instagram && !platforms.facebook) {
    console.error('\nSpecify at least one platform: --x --instagram --facebook --all');
    process.exit(1);
  }
  sendPost(text, platforms)
    .catch(err => console.error('\n✗ Error:', err.message));

} else {
  console.log(`
Immanuel Men — Social Media Posting Tool

COMMANDS:
  node post.js --setup                   List your Buffer profile IDs
  node post.js --schedule                Post today's scheduled content
  node post.js --queue                   Show the post queue

  node post.js "Post text" --all         Post to all platforms now
  node post.js "Post text" --x           Post to X only
  node post.js "Post text" --instagram   Post to Instagram only
  node post.js "Post text" --facebook    Post to Facebook only

SETUP:
  1. Go to buffer.com → sign in → Settings → Apps & Integrations → API
  2. Create an access token
  3. Add to .env:  BUFFER_TOKEN=your_token_here
  4. Run:  node post.js --setup   to get your profile IDs
  5. Add profile IDs to .env
  `);
}
