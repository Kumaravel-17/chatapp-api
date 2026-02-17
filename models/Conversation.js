const mongoose=require('mongoose');

const conversationschema=new mongoose.Schema({


    participants:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    lastMeassage:{type:mongoose.Schema.Types.ObjectId,ref:'Message'},
    unreadCount:{type:Number,default:0},
    
},{ timestamps: true })

const Conversation=mongoose.model('Conversation',conversationschema);

module.exports=Conversation;