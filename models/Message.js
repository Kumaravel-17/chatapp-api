const mongoose=require('mongoose');
const messageschema=new mongoose.Schema({

    conversation:{type:mongoose.Schema.Types.ObjectId,ref:'Conversation'},
    sender:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    receiver:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    content:{type:String},
    imageurlorvideourl:{type:String},
    contentType:{type:String,enum:['text','image','video'],default:'text'},
    reactions:[{
        user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
        emoji:{type:String}
    }],
    messageStatus:{type:String,enum:['sent','delivered','read'],default:'sent'},
},{ timestamps: true })




const Message=mongoose.model('Message',messageschema);

module.exports=Message;