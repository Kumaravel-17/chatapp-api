
const Message = require("../models/Message");
const responseHandler = require("../utils/responseHandler");

exports.sendMessage = async (req, res) => {
  const { conversationId, content,messagest } = req.body;
  const senderId = req.user.userId;

  try {
    const newMessage = new Message({
      conversation: conversationId,
      sender: senderId,
      content,
    });

    await newMessage.save();

    return responseHandler(res, 200, true, "Message sent successfully", {
      message: newMessage,
    });
  } catch (error) {
    return responseHandler(res, 500, false, "Internal server error");   
  }
};

