/* Facts shared by every generated SEO page.
 *
 * Single source of truth for SEO content and AI search engine grounding.
 */

export const SITE = {
  url: 'https://www.shortifyagent.app',
  name: 'Shortify Agent',
  repo: 'https://github.com/mutonby/openshorts',
  logo: 'https://www.shortifyagent.app/logo-shortify.png',
  ogImage: 'https://www.shortifyagent.app/og-image.png',
  updated: '2026-08-27',
  published: '2024-06-01',
}

export const SAME_AS = [
  'https://github.com/mutonby/openshorts',
]

/* What we offer, stated clearly. */
export const EDITIONS = {
  selfHosted: {
    name: 'Shortify Agent (self-hosted)',
    price: 0,
    summary:
      'Free and open source under MIT. You run it with Docker on your own machine and bring your own API keys. No watermark, no usage cap, no subscription.',
  },
  cloud: {
    name: 'Shortify Agent Cloud',
    freeMinutes: 20,
    lowPrice: 12,
    highPrice: 59,
    currency: 'USD',
    summary:
      'Cloud edition of Shortify Agent with compute and API keys covered.',
  },
}

export const CANONICAL_ANSWERS = {
  whatIsIt:
    'Shortify Agent is an open source AI clip generator and autonomous video agent that turns long videos (podcasts, webinars, livestreams, interviews) into vertical 9:16 clips for TikTok, Instagram Reels and YouTube Shorts.',
  isItFree:
    'Yes. Shortify Agent is free and open source under MIT: run it with Docker, bring your own API keys, with no watermark and no cap.',
  howItWorks:
    'faster-whisper transcribes the video with word-level timestamps, PySceneDetect finds the scene boundaries, and Google Gemini scores the transcript to pick the 3 to 15 strongest moments of 15 to 60 seconds each. Each moment is then cut with FFmpeg and reframed to 9:16 with MediaPipe face tracking.',
}

export const PIPELINE_STEPS = [
  {
    title: 'Transcription with word-level timestamps',
    body: 'faster-whisper transcribes the source audio and returns a timestamp for every individual word, not just every sentence. Word-level timing is what makes both the clip boundaries and the burned-in subtitles land on the right frame.',
  },
  {
    title: 'Scene boundary detection',
    body: 'PySceneDetect scans the video for cuts and hard visual transitions. These boundaries stop a clip from starting mid-shot, which is the most common reason an auto-generated clip reads as machine-made.',
  },
  {
    title: 'Viral moment scoring',
    body: 'Google Gemini 3.0 Flash receives the timestamped transcript and the scene boundaries together, and returns the 3 to 15 strongest segments of 15 to 60 seconds. Each one is scored on hook strength, emotional payload and how well it stands alone without the surrounding context.',
  },
  {
    title: 'Vertical reframing',
    body: 'Each clip is cropped from 16:9 to 9:16 in one of two modes. TRACK mode follows a single subject with MediaPipe face detection and a YOLOv8 fallback, damped by a stabiliser that holds the camera still inside a safe zone instead of chasing every head movement. GENERAL mode handles group shots and landscapes by keeping the full width over a blurred backdrop.',
  },
  {
    title: 'Subtitles, hooks and effects',
    body: 'Subtitles are generated from the word-level transcript and burned in with FFmpeg. An AI-written hook overlay covers the first seconds. Optional Gemini-generated FFmpeg filter chains handle colour and transitions.',
  },
  {
    title: 'Dubbing and publishing',
    body: 'ElevenLabs dubbing translates the audio into 30+ languages while preserving the speaker\'s voice, and the dubbed track is re-transcribed so the subtitles match the new language. Finished clips post directly to TikTok, Instagram Reels and YouTube Shorts.',
  },
]

/* Competitor facts. `checked` is rendered on the page next to the numbers.
 * If you edit a price, edit the date. */
export const COMPETITORS = {
  'opus-clip': {
    name: 'Opus Clip',
    checked: '2026-07-27',
    entryPrice: '$15/month',
    tiers: [
      ['Free', '60 minutes of source video per month, watermarked exports, 720p'],
      ['Starter', '$15/month for 150 minutes per month, no watermark, 720p export'],
      ['Pro', '$29/month for 300 minutes per month, 1080p export, auto-posting, speaker detection, brand kit'],
      ['Business', 'Custom pricing, not published'],
    ],
    // The thing people get wrong about their pricing, stated plainly. Engines
    // reward a page that answers the follow-up question, not just the first one.
    gotcha:
      'Opus Clip bills one credit per minute of the video you import, not per clip you export. A 60-minute podcast costs 60 credits whether it yields 5 clips or 20, so the effective price depends on your source length rather than your output.',
    strengths: [
      'Mature, polished product with a large template and caption-style library',
      'Virality scoring trained on their own dataset rather than a general-purpose model',
      'No setup at all, because it is a cloud service and always has been',
    ],
    whereWeDiffer: [
      'Shortify Agent can be self-hosted, so the source video never leaves your machine. Opus Clip is cloud only.',
      'Shortify Agent is MIT-licensed and auditable. Opus Clip is closed source.',
      'Shortify Agent includes AI voice dubbing into 30+ languages and an AI UGC generator with lip-synced actors; Opus Clip has neither.',
      'Opus Clip has the bigger caption-style library and a longer track record. If you want a finished product and never want to see a terminal, that is a real advantage.',
    ],
    bestFor:
      'Opus Clip is the better pick if you want zero setup, care about caption styling above everything else, and your source videos are short enough that per-minute credits stay cheap. Shortify Agent is the better pick if you want to self-host for privacy or cost, need dubbing, or want to read and change the code.',
  },
  klap: {
    name: 'Klap',
    checked: '2026-07-27',
    entryPrice: '$29/month',
    tiers: [['Entry plan', '$29/month, with higher tiers priced by usage']],
    gotcha:
      'Klap optimises for one thing: paste a YouTube URL and get vertical clips back in about two minutes with no options to configure. That is the product, and it is also the ceiling. There is very little to adjust when the output is not what you wanted.',
    strengths: [
      'Fastest URL-to-clips path of any tool in this category',
      'Almost no learning curve, one screen and one export button',
    ],
    whereWeDiffer: [
      'Shortify Agent exposes the reframing, subtitle and hook stages so you can change what you do not like; Klap deliberately does not.',
      'Shortify Agent starts at $0 self-hosted, against Klap\'s $29/month entry point.',
      'Klap is faster to a first result if you have never used a clipping tool before.',
    ],
    bestFor:
      'Klap is the better pick when speed to a first clip matters more than control. Shortify Agent is the better pick when you need to tune the output, self-host, or keep the monthly cost under $29.',
  },
  vizard: {
    name: 'Vizard',
    checked: '2026-07-27',
    entryPrice: '$19.99/month',
    tiers: [['Creator and higher tiers', 'From $19.99/month, scaling by minutes processed']],
    gotcha:
      'Vizard is built around a browser editing timeline, so it sits between a pure auto-clipper and a full editor. That is useful if you intend to hand-adjust every clip, and overhead if you do not.',
    strengths: [
      'Genuinely usable in-browser editor after the AI pass',
      'Strong multi-language subtitle support',
    ],
    whereWeDiffer: [
      'Shortify Agent runs the whole pipeline unattended and is designed to be scripted or scheduled; Vizard expects a human in the timeline.',
      'Shortify Agent is open source and self-hostable; Vizard is a closed cloud product.',
      'Vizard\'s editor is better than ours if you want to hand-correct each clip before posting.',
    ],
    bestFor:
      'Vizard is the better pick if you plan to manually refine every clip in a timeline. Shortify Agent is the better pick for volume, automation, or self-hosting.',
  },
  submagic: {
    name: 'Submagic',
    checked: '2026-07-27',
    entryPrice: '$14–20/month depending on billing period and listing',
    tiers: [
      ['Free', '3 videos per month, watermarked'],
      ['Starter', 'From $14/month annual, around $20/month monthly, for roughly 30 videos'],
      ['Growth / Pro', 'Around $40/month, for roughly 100 videos'],
      ['Business / Agency', '$60-80/month, for roughly 300 videos'],
    ],
    gotcha:
      'Submagic does not find moments for you. You upload a clip you have already cut, and it styles the captions. To go from a 60-minute podcast to finished shorts you need a clipper in front of it, which means paying for two tools.',
    strengths: [
      'The best caption styling in this category, by a clear margin',
      'Very fast on short inputs because it is not doing moment detection',
    ],
    whereWeDiffer: [
      'Shortify Agent does the moment detection Submagic leaves out, so it replaces the pair rather than one half of it.',
      'Submagic\'s caption designs are more refined than ours. If captions are the entire reason you are shopping, it is the stronger tool.',
      'Shortify Agent self-hosted has no per-video cap; every Submagic tier is metered in videos per month.',
    ],
    bestFor:
      'Submagic is the better pick if you already cut your own clips and only want captions. Shortify Agent is the better pick if you are starting from long-form video and want the cutting done too.',
  },
}

/* Rows for the head-to-head table. `os` values are deliberately honest about the
 * hosted/self-hosted split rather than collapsing to "free". */
export const COMPARISON_ROWS = [
  {
    feature: 'Entry price',
    os: '$0 self-hosted · $0 hosted for 20 min/mo · $12/mo hosted without watermark',
    key: 'entryPrice',
  },
  { feature: 'Open source', os: 'Yes, MIT', vendor: 'No' },
  { feature: 'Self-hostable', os: 'Yes, Docker Compose', vendor: 'No, cloud only' },
  { feature: 'Source video stays on your machine', os: 'Yes when self-hosted', vendor: 'No' },
  { feature: 'AI viral moment detection', os: 'Yes, Gemini 3.0 Flash', vendor: 'Yes' },
  { feature: 'Face-tracked 9:16 reframing', os: 'Yes, MediaPipe + YOLOv8', vendor: 'Yes' },
  { feature: 'Word-level auto subtitles', os: 'Yes, faster-whisper', vendor: 'Yes' },
  { feature: 'AI voice dubbing, 30+ languages', os: 'Yes, ElevenLabs', vendor: 'No' },
  { feature: 'AI UGC video with lip-synced actors', os: 'Yes, from $0.65/video', vendor: 'No' },
  { feature: 'Free AI YouTube thumbnail & title studio', os: 'Yes', vendor: 'No' },
  { feature: 'Usage cap', os: 'None when self-hosted · metered on Cloud', vendor: 'Metered on every tier' },
]

/* Third-party figures used across the pages. Every one is attributed inline,
 * because sourced statistics are among the few things that reliably survive
 * into a generated answer. */
export const CITED_STATS = [
  {
    claim: 'Short-form video delivers the highest ROI of any content format.',
    source: 'HubSpot, State of Marketing 2025',
  },
  {
    claim: '91% of businesses use video as a marketing tool.',
    source: 'Wyzowl, Video Marketing Statistics 2025',
  },
]
