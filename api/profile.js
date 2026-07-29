const { ultraigdl } = require('ultra-igdl');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { username } = req.query;
  
  if (!username) {
    return res.status(400).json({ 
      success: false, 
      error: 'الرجاء إدخال اسم المستخدم' 
    });
  }

  try {
    const ig = new ultraigdl();
    const result = await ig.profile(username);
    
    if (result && result.username) {
      return res.json({
        success: true,
        data: {
          username: result.username,
          fullName: result.fullName || result.username,
          avatar: result.profilePic || '',
          bio: result.biography || '',
          posts: result.mediaCount || 0,
          followers: result.followerCount || 0,
          following: result.followingCount || 0,
          isPrivate: result.isPrivate || false,
          isVerified: result.isVerified || false
        }
      });
    } else {
      return res.json({
        success: false,
        error: 'الحساب غير موجود'
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      error: error.message
    });
  }
};
