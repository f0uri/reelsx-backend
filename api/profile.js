const IG_APP_ID = "936619743392459";

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, error: "missing username" });
  }

  try {
    const r = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(
        username.trim().replace(/^@/, "")
      )}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
          "X-IG-App-ID": IG_APP_ID,
          Accept: "*/*",
        },
      }
    );

    if (!r.ok) {
      return res.status(r.status === 404 ? 404 : 502).json({
        success: false,
        error: `instagram responded with ${r.status}`,
      });
    }

    const json = await r.json();
    const u = json?.data?.user;

    if (!u) {
      return res.status(404).json({ success: false, error: "user not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        username: u.username,
        fullName: u.full_name,
        avatar: u.profile_pic_url_hd || u.profile_pic_url,
        bio: u.biography,
        followers: u.edge_followed_by?.count ?? null,
        following: u.edge_follow?.count ?? null,
        posts: u.edge_owner_to_timeline_media?.count ?? null,
        isPrivate: !!u.is_private,
        isVerified: !!u.is_verified,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};
