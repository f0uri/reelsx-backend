// api/reel.js
const { ultraigdl } = require('ultra-igdl');

module.exports = async (req, res) => {
  // تفعيل CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { postUrl } = req.query;
  
  if (!postUrl) {
    return res.status(400).json({ 
      success: false, 
      error: 'الرجاء إدخال رابط الريلز' 
    });
  }

  try {
    const ig = new ultraigdl();
    const result = await ig.download(postUrl);
    
    if (result.code === 200 && result.media) {
      const video = result.media.find(m => m.type === 'video');
      
      if (video) {
        return res.json({
          success: true,
          data: {
            videoUrl: video.url,
            thumbnail: result.thumbnail || '',
            username: result.username || 'unknown',
            caption: result.caption || ''
          }
        });
      } else {
        return res.json({
          success: false,
          error: 'لم يتم العثور على فيديو في هذا الرابط'
        });
      }
    } else {
      return res.json({
        success: false,
        error: result.message || 'فشل استخراج الفيديو'
      });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.json({
      success: false,
      error: 'حدث خطأ أثناء المعالجة: ' + error.message
    });
  }
};
