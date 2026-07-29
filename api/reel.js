module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { postUrl } = req.query;
  if (!postUrl) {
    return res.status(400).json({ success: false, error: "الرجاء إدخال رابط الريلز" });
  }

  const key = process.env.SOCIALKIT_KEY;
  if (!key) {
    return res.status(500).json({ success: false, error: "SOCIALKIT_KEY غير مضبوط فـ Vercel" });
  }

  try {
    const r = await fetch("https://api.socialkit.dev/instagram/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: key,
        url: postUrl,
        format: "mp4",
        quality: "720p",
      }),
    });

    const json = await r.json();

    if (!json.success) {
      return res.status(502).json({
        success: false,
        error: json.error || "لم يتم العثور على فيديو على هذا الرابط",
      });
    }

    const titleMatch = (json.data.title || "").match(/Video by (.+)/);

    return res.status(200).json({
      success: true,
      data: {
        videoUrl: json.data.downloadUrl,
        thumbnail: json.data.thumbnail || "",
        username: titleMatch ? titleMatch[1] : null,
        caption: json.data.title || "",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "حدث خطأ أثناء المعالجة: " + error.message,
    });
  }
};
