module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ success: false, error: "الرجاء إدخال اسم المستخدم" });
  }

  const key = process.env.SOCIALKIT_KEY;
  if (!key) {
    return res.status(500).json({ success: false, error: "SOCIALKIT_KEY غير مضبوط فـ Vercel" });
  }

  try {
    const cleanUsername = username.trim().replace(/^@/, "");
    const url = `https://api.socialkit.dev/instagram/channel-stats?access_key=${encodeURIComponent(
      key
    )}&url=${encodeURIComponent("https://instagram.com/" + cleanUsername)}`;

    const r = await fetch(url);
    const json = await r.json();

    if (!json.success) {
      return res.status(404).json({
        success: false,
        error: json.error || "الحساب غير موجود",
      });
    }

    const d = json.data;

    return res.status(200).json({
      success: true,
      data: {
        username: d.username,
        fullName: d.nickname || d.username,
        avatar: d.avatar || "",
        bio: d.bio || "",
        followers: d.followers ?? 0,
        following: d.following ?? 0,
        posts: d.totalPosts ?? 0,
        isPrivate: false,
        isVerified: !!d.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
