const express=require('express')
const dotenv=require('dotenv');
const mongoose=require('mongoose');
const cookieParser=require('cookie-parser');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const cors=require('cors')
const ws=require('ws')
const User=require('../server/models/User');
const Message=require('../server/models/Message');
const Unread=require('../server/models/Unread');
const bodyParser = require("body-parser");
const { connect } = require('http2');

const corsConf = {
   
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
     origin: [process.env.CLIENT_URL1,process.env.CLIENT_URL2,process.env.CLIENT_URL3,process.env.CLIENT_URL4],
  }
  
  
dotenv.config();
try{
    mongoose.connect(process.env.MONGO_URL);
}catch(err){
    console.log(err);
}
let obj ={isLogOut:false};

const app=express();

app.use(cookieParser());
// app.use(cors({
//     credentials: true,
//     origin: [process.env.CLIENT_URL1,process.env.CLIENT_URL2],
//   }));
app.use(cors(corsConf));
app.use(bodyParser.urlencoded({ extended: false }))
.use(bodyParser.json());


const jwtSECRET=process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(15);


app.get('/test', (req,res)=>{
    res.json('ok')
});
app.get('/profile',(req,res)=>{
    
    const token=req.cookies?.token;
    if(token){
      jwt.verify(token,jwtSECRET,{},(err,data)=>{
        if (err) throw err;
        res.json({data})
    });  
    }else{
        res.status(401).json('no token');
    }
    
})
app.post('/login',async(req,res)=>{
  
    const {username,password}=req.body;

    const founduser = await User.findOne({username});
    if(founduser){
        
        const passMatch = bcrypt.compareSync(password, founduser.password);
        if(passMatch){   
            jwt.sign({userId:founduser._id,username},jwtSECRET,{},(err,token)=>{
                if(err) throw err;

             
                 res.cookie('token',token,{sameSite:'none',secure:true,maxAge: 60 * 60 * 1000}).status(201).json({
                     id:founduser._id,
                    username,
                });
            })
            obj.isLogOut=false;
            
          
        }
    }
})

app.post('/logout',(req,res)=>{
    res.cookie('token', '', {sameSite:'none', secure:true}).json('ok');
    obj.isLogOut=true;
    console.log(obj.isLogOut);
})

const getUserDataFromRequest=async(req)=>{
    const token=req.cookies.token;
    if(token){

        //Promise for returning the data to 'getUserDataFromRequest' instead of 'jwt.verify'
        return new Promise((resolve,reject)=>{
            jwt.verify(token,jwtSECRET,(err,userData)=>{
                if(err){
                    reject (err);
                }else{
                    resolve(userData.userId);
                }
                
            });
        })
         
    }
}
app.get('/message/:userId',async(req,res)=>{
    const { userId } = req.params;
    const requestID= await getUserDataFromRequest(req);
    const historyMessages=await Message.find({
        sender:{$in:[userId,requestID] },
        contact:{$in:[userId,requestID] },
    }).sort({ createdAt: 1 });
    
    res.json(historyMessages);
})

app.get('/people',async(req,res)=>{
    const users = await User.find({}, {'_id':1,username:1});
    res.json(users);
    
})

app.post('/unread',async(req,res)=>{
    try{
        console.log("1 ",req.body.id.id);
        const currentid = req.body.id.id;
        //console.log('11 ',currentid);
        const unread=await Unread.find({
            currentuser:{$in:currentid },
        }).sort({ createdAt: 1 });
        const unreadId=unread.map((user)=>{
            return user.contactId;
        })
        //console.log(currentid,'!result! ',unreadId);
        res.json(unreadId);
    }catch(err){

    }
    
})

app.delete('/read',async(req,res)=>{
    try{
   
    const currentid = req.query.id;
    const deleteId = req.query.deleteId;
   
     const result1 = await Unread.deleteOne({currentuser: currentid,contactId:deleteId });
   
    }catch(err){
        console.log(err);
    }finally{
        res.json('read');
    }
    

})

app.post('/register', async (req,res)=>{

    const {username,password}=req.body;
    const founduser = await User.findOne({username});
    if(!founduser){
         try{

        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const createdUser=await User.create({
            username,
            password:hashedPassword});
        
        //create a jwt then return the jwt(token)
        jwt.sign({userId:createdUser._id,username},jwtSECRET,{},(err,token)=>{
        if(err) throw err;

        //send jwt as cookie to client
        res.cookie('token',token,{sameSite:'none',secure:true,maxAge: 60 * 60 * 1000}).status(201).json({
            id:createdUser._id,
            username,
        });
        obj.isLogOut=false;
    
    })
    }catch(err) {
        if (err) throw err;
        res.status(500).json('error');
      }
    
    }else{
        res.json('alreadyregistered');
    }
   
});
const server= app.listen(4040||process.env.PORT)

const webSockectServer=new ws.WebSocketServer({server});

webSockectServer.on('connection',(connection,req)=>{

    console.log("connect!");
    function sendOnlineUsers(){
        [...webSockectServer.clients].forEach(client=>{
            client.send(JSON.stringify({
                online:[...webSockectServer.clients].map((client=>({username:client.username,userId:client.userId})))
            }))
        })
    }

    connection.isAlive=true;
    connection.timer=setInterval(()=>{
        connection.ping();

        //If the pong event (response to the ping) is not received
        connection.deathTimer=setTimeout(()=>{
            connection.isAlive=false;
            clearInterval(connection.timer);
            connection.terminate();
            sendOnlineUsers();
        },1000)
    },3000)

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
      });

    const cookie=req.headers.cookie;
    if(cookie){
        const tokenCookie= cookie.split(';').find(str=>str.startsWith('token='));
        if(tokenCookie){
            const token=tokenCookie.split('=')[1];
            if(token){
                
                jwt.verify(token,jwtSECRET,{},(err,data)=>{
                    if (err) throw err;
                    
                    const{userId,username}=data;
                    connection.userId=userId;
                    connection.username=username;
                });  
                }else{
                    console.log('no token');
                }
        }
    }
    
    //online user
    sendOnlineUsers();

    connection.logoutTimer=setInterval(()=>{
         if(obj.isLogOut){ 
             console.log('closing');
             //connection.close();
             webSockectServer.clients.delete(webSockectServer);
             sendOnlineUsers();
             clearInterval(connection.logoutTimer);

            }
    },5000)
   
    //message from the client
    connection.on('message',async(data)=>{
        const message=JSON.parse(data.toString());
        const {contact,text}=message;
      
        if(contact&&text){
            //add the message 
           
                const createdMessage=await Message.create({
                    text,
                    sender:connection.userId,
                    contact});

                   
                //check if have the new message all ready
                const unread=await Unread.find({
                    contactId:{$in:connection.userId },
                    currentuser:{$in:contact },
                }).sort({ createdAt: 1 });

                //createdUnread
                if(unread.length==0){
                    await Unread.create({
                        contactId:connection.userId,
                        currentuser:contact});
                }
                
                
               
                
                
                
            
            //send the message as an object to all client's devices
            [...webSockectServer.clients].filter(client=>client.userId===contact).forEach(client=>{
                client.send(JSON.stringify({text,sender:connection.userId,contact,_id:createdMessage._id}))
            })
        }
        
    })
});
//eyLiq6och2Er6cIU