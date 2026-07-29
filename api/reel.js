const VIDEO_RE = /"video_url":"([^"]+)"/;
const THUMB_RE = /"display_url":"([^"]+)"/;
const USERNAME_RE = /"owner":\s*\{\s*"id":"[^"]+","username":"([^"]+)"/;
const CAPTION_RE = /"edge_media_to_caption":\{"edges":\[\{"node":\{"text":"([^"]*)"/;

function extractShortcode(rawUrl) {
  try {
    const u = new URL(rawUrl.trim());
    const m = u.pathname.match(/\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!m) return null;
    return m[1];
  } catch {
    return null;
  }
}

function unescapeIg(str) {
  if (!str) return str;
  return str
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\n/g, " ")
    .replace(/\\"/g, '"');
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { postUrl } = req.query;
  if (!postUrl) {
    return res.status(400).json({ success: false, error: "missing postUrl" });
  }

  const shortcode = extractShortcode(postUrl);
  if (!shortcode) {
    return res.status(400).json({ success: false, error: "invalid instagram url" });
  }

  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;

  try {
    const r = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
        "Accept-Language": "ar,en-US;q=0.9",
      },
    });

    if (!r.ok) {
      return res.status(502).json({
        success: false,
        error: `instagram responded with ${r.status}`,
      });
    }

    const html = await r.text();

    const videoMatch = html.match(VIDEO_RE);
    if (!videoMatch) {
      return res.status(404).json({
        success: false,
        error: "video not found — the post may be private, deleted, or Instagram changed its page structure",
      });
    }

    const thumbMatch = html.match(THUMB_RE);
    const usernameMatch = html.match(USERNAME_RE);
    const captionMatch = html.match(CAPTION_RE);

    return res.status(200).json({
      success: true,
      data: {
        videoUrl: unescapeIg(videoMatch[1]),
        thumbnail: thumbMatch ? unescapeIg(thumbMatch[1]) : null,
        username: usernameMatch ? usernameMatch[1] : null,
        caption: captionMatch ? unescapeIg(captionMatch[1]) : "",
        shortcode,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};
