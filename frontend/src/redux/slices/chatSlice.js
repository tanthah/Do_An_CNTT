// frontend/src/redux/slices/chatSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as chatService from "../../services/chatService";

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ message, sessionId }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(message, sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const uploadChatFile = createAsyncThunk(
  "chat/uploadFile",
  async ({ file, sessionId, task }, { rejectWithValue }) => {
    try {
      const response = await chatService.uploadChatFile(file, sessionId, task);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);



export const getChatHistory = createAsyncThunk(
  "chat/getHistory",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await chatService.getChatHistory(page, limit);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getSession = createAsyncThunk(
  "chat/getSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await chatService.getSession(sessionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteSession = createAsyncThunk(
  "chat/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await chatService.deleteSession(sessionId);
      return sessionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  messages: [],
  currentSessionId: null,
  sessions: [],
  loading: false,
  sending: false,
  uploading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.currentSessionId = null;
    },
    addUserMessage: (state, action) => {
      state.messages.push({
        role: "user",
        content: action.payload,
        timestamp: new Date().toISOString(),
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Gửi tin nhắn
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.messages.push({
          role: "assistant",
          content: action.payload.message,
          timestamp: new Date().toISOString(),
        });
        if (action.payload.sessionId) {
          state.currentSessionId = action.payload.sessionId;
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload?.message || "Failed to send message";
      })
      // Tải lên file
      .addCase(uploadChatFile.pending, (state, action) => {
        state.uploading = true;
        state.error = null;
        // Thêm tin nhắn đang xử lý
        state.messages.push({
          role: "assistant",
          content: "⏳ Đang xử lý file... Vui lòng đợi.",
          timestamp: new Date().toISOString(),
          isProcessing: true,
        });
      })
      .addCase(uploadChatFile.fulfilled, (state, action) => {
        state.uploading = false;

        // Xóa tin nhắn đang xử lý
        state.messages = state.messages.filter(msg => !msg.isProcessing);

        // Thêm tin nhắn người dùng về việc upload
        state.messages.push({
          role: "user",
          content: `📎 [File Upload] ${action.payload.data?.fileName || "Document"}\n🔧 Task: ${action.meta.arg.task === 'translate' ? 'Dịch Anh → Việt' : action.meta.arg.task === 'translate_vi_to_en' ? 'Dịch Việt → Anh' : 'Sửa ngữ pháp'}`,
          timestamp: new Date().toISOString(),
        });

        // Thêm phản hồi của trợ lý
        if (action.payload.data?.result) {
          state.messages.push({
            role: "assistant",
            content: action.payload.data.result,
            timestamp: new Date().toISOString(),
          });
        }

        if (action.payload.sessionId) {
          state.currentSessionId = action.payload.sessionId;
        }
      })
      .addCase(uploadChatFile.rejected, (state, action) => {
        state.uploading = false;
        // Xóa tin nhắn đang xử lý
        state.messages = state.messages.filter(msg => !msg.isProcessing);
        state.error = action.payload?.message || "Failed to upload file";
      })
      // Lấy lịch sử chat
      .addCase(getChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(getChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions;
      })
      .addCase(getChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load history";
      })
      // Lấy phiên chat
      .addCase(getSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.session.messages;
        state.currentSessionId = action.payload.session._id;
      })
      .addCase(getSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load session";
      })
      // Xóa phiên chat
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(s => s._id !== action.payload);
        if (state.currentSessionId === action.payload) {
          state.messages = [];
          state.currentSessionId = null;
        }
      });
  },
});

export const { clearMessages, addUserMessage } = chatSlice.actions;
export default chatSlice.reducer;
