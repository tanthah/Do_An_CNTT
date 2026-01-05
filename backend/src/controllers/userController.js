
import User from "../models/User.js";
import ChatHistory from "../models/ChatHistory.js";
import ListeningHistory from "../models/ListeningHistory.js";
import VocabularyList from "../models/VocabularyList.js";
import VocabularyWord from "../models/VocabularyWord.js";


// @desc    Lấy danh sách tất cả người dùng (Dành cho Admin)
// @route   GET /api/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, sortBy, isActive } = req.query;

    let query = {};

    // Tìm kiếm theo tên hoặc email nếu có từ khóa search
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // Lọc theo trạng thái hoạt động (active/inactive)
    if (isActive !== undefined && isActive !== "") {
      query.isActive = isActive === "true";
    }

    // Xử lý sắp xếp
    let sort = { createdAt: -1 }; // Mặc định: mới nhất trước
    if (sortBy === "totalChats") sort = { totalChats: -1 };
    if (sortBy === "vocabLearned") sort = { vocabLearned: -1 };

    // Truy vấn database với phân trang
    const users = await User.find(query)
      .select("-password") // Không trả về mật khẩu
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
};

// @desc    Lấy thông tin chi tiết người dùng theo ID (Admin)
// @route   GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Lấy lịch sử Chat (10 phiên mới nhất)
    const chatHistory = await ChatHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Lấy lịch sử Luyện nghe (10 bài mới nhất)
    const listeningHistory = await ListeningHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Thống kê Từ vựng
    const totalVocabLists = await VocabularyList.countDocuments({ userId: user._id });
    const totalVocabWords = await VocabularyWord.countDocuments({ userId: user._id });

    res.json({
      success: true,
      user,
      chatHistory,
      listeningHistory,
      vocabStats: {
        totalLists: totalVocabLists,
        totalWords: totalVocabWords
      },
      files: [] // Trả về mảng rỗng vì đã xóa tính năng file
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết người dùng:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin người dùng",
      error: error.message,
    });
  }
};

// @desc    Cập nhật thông tin cá nhân (Profile)
// @route   PUT /api/users/profile
export const updateUser = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: "Cập nhật hồ sơ thành công",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Cập nhật thất bại",
      error: error.message,
    });
  }
};

// @desc    Xóa người dùng (Admin)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Xóa tất cả dữ liệu liên quan đến người dùng này
    await Promise.all([
      ChatHistory.deleteMany({ userId: user._id }),
      ListeningHistory.deleteMany({ userId: user._id }),
      VocabularyList.deleteMany({ userId: user._id }),
      VocabularyWord.deleteMany({ userId: user._id }),
      user.deleteOne()
    ]);

    res.json({
      success: true,
      message: "Đã xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
};

// @desc    Khóa/Mở khóa tài khoản người dùng
// @route   PUT /api/users/:id/toggle-active
export const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // Ngăn chặn việc tự khóa chính mình
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "Bạn không thể khóa chính tài khoản của mình",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi cập nhật trạng thái",
      error: error.message
    });
  }
};

// @desc    Lấy thống kê học tập của người dùng
// @route   GET /api/users/profile
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");

    // Lấy thống kê chi tiết
    const totalChats = await ChatHistory.countDocuments({ userId });

    // Lấy các phiên chat gần nhất (5 phiên)
    const recentChats = await ChatHistory.find({ userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("sessionName topic updatedAt");

    res.json({
      success: true,
      user,
      stats: {
        totalChats,
        vocabLearned: user.vocabLearned,
      },
      recentActivity: {
        chats: recentChats,
        voice: [],
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi lấy thống kê người dùng",
      error: error.message,
    });
  }
};

// @desc    Lấy danh sách từ vựng của người dùng (Admin view)
// @route   GET /api/users/:id/vocabulary-lists
export const getUserVocabularyLists = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra user có tồn tại không
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const lists = await VocabularyList.find({ userId })
      .sort({ createdAt: -1 });

    // Đếm số lượng từ trong mỗi danh sách
    const listsWithCount = await Promise.all(
      lists.map(async (list) => {
        const wordCount = await VocabularyWord.countDocuments({ listId: list._id });
        return {
          ...list.toObject(),
          wordCount,
        };
      })
    );

    res.json({
      success: true,
      lists: listsWithCount,
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách từ vựng:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách từ vựng",
      error: error.message,
    });
  }
};

// @desc    Lấy chi tiết danh sách từ vựng và các từ bên trong (Admin view)
// @route   GET /api/users/:id/vocabulary-lists/:listId
export const getUserVocabularyListDetail = async (req, res) => {
  try {
    const { id: userId, listId } = req.params;

    // Kiểm tra user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const list = await VocabularyList.findOne({
      _id: listId,
      userId,
    });

    if (!list) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh sách từ vựng",
      });
    }

    // Lấy tất cả từ vựng trong danh sách này
    const words = await VocabularyWord.find({ listId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      list: {
        ...list.toObject(),
        words,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết danh sách từ vựng:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết danh sách",
      error: error.message,
    });
  }
};
