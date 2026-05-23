#!/usr/bin/env node
/**
 * Immanuel Men — Social Media Posting Tool
 * Usage:  node post.js --schedule   (posts today's X content automatically)
 *         node post.js --preview    (shows today's post without sending)
 *         node post.js "Post text"  (posts custom text to X now)
 *
 * Requires X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET in .env
 */
import 'dotenv/config';
import { createHmac, randomBytes } from 'crypto';

// ── X API (OAuth 1.0a) ────────────────────────────────────────────────────────

function oauthHeader(method, url) {
  const p = {
    oauth_consumer_key:     process.env.X_API_KEY,
    oauth_nonce:            randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_token:            process.env.X_ACCESS_TOKEN,
    oauth_version:          '1.0',
  };
  const base = [
    method,
    encodeURIComponent(url),
    encodeURIComponent(
      Object.keys(p).sort()
        .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(p[k])}`)
        .join('&')
    ),
  ].join('&');
  const signingKey = `${encodeURIComponent(process.env.X_API_SECRET)}&${encodeURIComponent(process.env.X_ACCESS_TOKEN_SECRET)}`;
  p.oauth_signature = createHmac('sha1', signingKey).update(base).digest('base64');
  return 'OAuth ' + Object.keys(p).sort()
    .map(k => `${encodeURIComponent(k)}="${encodeURIComponent(p[k])}"`)
    .join(', ');
}

async function postTweet(text) {
  if (!process.env.X_API_KEY) throw new Error('X_API_KEY not set in .env');
  const url = 'https://api.twitter.com/2/tweets';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': oauthHeader('POST', url),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`X API ${res.status}: ${txt}`);
  }
  return res.json();
}

// ── CONTENT CALENDAR ──────────────────────────────────────────────────────────

// Edit this array to manage your content (Tue/Thu, cycling weeks 1-2-3).
// x_text  = posted to X automatically (≤280 chars)
// text    = full version for manual Facebook/Instagram posting
const CONTENT_CALENDAR = [
  {
    week: 1, day: 'tuesday',
    x_text: `They told you to sit down.

God says arise.

The Immanuel Men Field Manual Series — four books, one formation arc. Ancient theology for modern men.

📖 Book 1: The Sin of Fear
https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #ChristianMen #FieldManual`,
    text: `They told you to sit down.

God says arise.

For the last several decades, a coordinated cultural assault has been waged against Christian men — telling you that your strength is dangerous, your leadership is outdated, your faith is a crutch.

The Immanuel Men Field Manual Series is for you.

Four books. One formation arc. Ancient theology. Applied to modern men. Written for the field.

📖 Start with Book 1: The Sin of Fear → https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #ChristianMen #MensMinistry #FieldManual #FormationNotInformation`,
  },
  {
    week: 1, day: 'thursday',
    x_text: `The man awake at 3:00 a.m. — rehearsing conversations that haven't happened, solving problems that haven't arrived.

He's not broken. He's overloaded.

The Sin of Worry: A Field Manual for the Unclenched Hand.

📖 https://www.amazon.com/dp/B0GWV6NJLP

#ImmanuelMen #SinOfWorry`,
    text: `The man who wakes up at 3:00 a.m. — rehearsing conversations that haven't happened yet, solving problems that haven't arrived —

That man is not broken. He is overloaded.

The Sin of Worry: A Field Manual for the Unclenched Hand.

Ancient patristic theology. Hebrew and Greek word studies. Written for the field.

📖 https://www.amazon.com/dp/B0GWV6NJLP

#ImmanuelMen #SinOfWorry #ChristianMen #AncientTheology #MensMinistry`,
  },
  {
    week: 2, day: 'tuesday',
    x_text: `Fear doesn't just slow a man down. It stops him.

Too terrified to lead. Too clenched to defend his faith.

The Sin of Fear names the weapon — and breaks it.

📖 https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #SinOfFear #WarriorPriest`,
    text: `Fear doesn't just slow a man down. It stops him.

Too terrified to look for a new job. Too fearful to lead his family. Too clenched to defend his faith.

The Sin of Fear names the weapon — and breaks it.

12 battle chapters. Patristic anchors. Hebrew & Greek word studies. The Watchman's SOP.

📖 https://www.amazon.com/dp/B0GWV5HMYG

#ImmanuelMen #SinOfFear #WarriorPriest #ChristianMen`,
  },
  {
    week: 2, day: 'thursday',
    x_text: `"The mandate was never revoked. The light was never meant to be hidden. And you were never meant to sit down."

Shining the Light — Book 3 of the Field Manual Series.

📖 https://www.amazon.com/dp/B0GYL6FWM7

#ImmanuelMen #ShiningTheLight #WarriorPriest`,
    text: `"The mandate was never revoked. The light was never meant to be hidden. And you were never meant to sit down."

Shining the Light — Book 3 of the Immanuel Men Field Manual Series.

Seven chapters of theological weaponry. Six warrior profiles. An 8-week men's group curriculum. The 30-Day Shine Challenge.

📖 https://www.amazon.com/dp/B0GYL6FWM7

#ImmanuelMen #ShiningTheLight #WarriorPriest #ChristianMen`,
  },
  {
    week: 3, day: 'tuesday',
    x_text: `Chrysostom called worry "the fracturing of the inner man."

We are treating a Spirit wound with a Body prescription.

The Immanuel Men series addresses all three threads — spirit, soul, body.

📖 immanuelmen.com

#ImmanuelMen #PatristicTheology #ChristianMen`,
    text: `Here's what the ancient Church Fathers understood that most modern Christianity has forgotten:

Worry is not a mental problem.

Chrysostom called it the fracturing of the inner man.
Maximus the Confessor wrote that no thread of the human person can be pulled without the others responding.

We are treating a Spirit wound with a Body prescription.

The Immanuel Men series addresses all three threads.

📖 immanuelmen.com

#ImmanuelMen #ChristianMen #AncientTheology #PatristicTheology #FormationNotInformation`,
  },
  {
    week: 3, day: 'thursday',
    x_text: `The Old Testament is not background. It is preview.

Every shadow has a Substance — and His name is Jesus.

Shadow of Things to Come: Sacred Patterns and Prophetic Figures That Reveal Christ.

📖 https://www.amazon.com/dp/B0H2Q1GGXM

#ImmanuelMen #BiblicalTypology`,
    text: `The Old Testament is not background.

It is preview.

Every shadow has a Substance — and His name is Jesus.

Shadow of Things to Come: Sacred Patterns, Priestly Types, and Prophetic Figures That Reveal the Substance of Christ.

📖 https://www.amazon.com/dp/B0H2Q1GGXM

#ImmanuelMen #BiblicalTypology #OldTestament #Christology #ChristianBooks`,
  },
];

function getTodaysPost() {
  const now = new Date();
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const today = days[now.getDay()];
  const weekOfMonth = Math.floor((now.getDate() - 1) / 7) + 1;
  const week = ((weekOfMonth - 1) % 3) + 1; // cycles weeks 1-2-3 forever
  return CONTENT_CALENDAR.find(p => p.week === week && p.day === today) || null;
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--preview')) {
  const post = getTodaysPost();
  if (!post) {
    console.log('\nNothing scheduled for today. Posts run Tuesday and Thursday.');
  } else {
    console.log(`\n── Today's Post (Week ${post.week}, ${post.day}) ────────────────────────`);
    console.log('\n[X — posts automatically]\n');
    console.log(post.x_text);
    console.log('\n[Facebook / Instagram — paste manually]\n');
    console.log(post.text);
  }

} else if (args.includes('--schedule')) {
  const post = getTodaysPost();
  if (!post) {
    console.log('\nNothing scheduled for today. Posts run Tuesday and Thursday.');
    process.exit(0);
  }
  console.log('\nPosting to X...');
  postTweet(post.x_text)
    .then(data => {
      console.log(`\n✓ Posted to X! Tweet ID: ${data.data.id}`);
      console.log('\n── Facebook / Instagram (paste manually) ────────────────');
      console.log(post.text);
    })
    .catch(err => console.error('\n✗ Error:', err.message));

} else if (args.length > 0 && !args[0].startsWith('--')) {
  const text = args[0];
  if (text.length > 280) {
    console.error(`\n✗ Text is ${text.length} characters — X limit is 280. Shorten it and try again.`);
    process.exit(1);
  }
  console.log('\nPosting to X...');
  postTweet(text)
    .then(data => console.log(`\n✓ Posted! Tweet ID: ${data.data.id}`))
    .catch(err => console.error('\n✗ Error:', err.message));

} else {
  console.log(`
Immanuel Men — Social Media Posting Tool

COMMANDS:
  node post.js --schedule            Post today's content to X (Tue/Thu only)
  node post.js --preview             Preview today's post without sending
  node post.js "Post text"           Post custom text to X now (≤280 chars)

npm scripts:
  npm run post-today                 Same as --schedule
  npm run preview                    Same as --preview
  `);
}
