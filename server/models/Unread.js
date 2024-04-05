const mongoose=require('mongoose');

const UnreadSchema=new mongoose.Schema({
    currentuser:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    contactId: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
},{timestamps:true})

const UnreadModel=mongoose.model('Unread',UnreadSchema);
module.exports=UnreadModel;