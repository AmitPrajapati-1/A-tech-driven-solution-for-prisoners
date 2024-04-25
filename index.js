//https://techprisonerjustice.azurewebsites.net/submit
var bodyParser = require("body-parser"); 
const fs=require('fs');
const nodemailer = require('nodemailer');
const express=require('express');
const mongoose=require('mongoose');
const app=express();
require('dotenv').config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const http = require('http').createServer(app)
const PORT = process.env.PORT || 3050
http.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)
})
const mongoURI=process.env.MONGO_URI;
app.set("view engine", "ejs"); 
app.set("views", __dirname + "/views"); 
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
const port=4400;
app.use(express.json());
mongoose.connect(mongoURI)
.then(()=>console.log('connected to mongodb'))
.catch(err=>console.error("Error connecting to MongoDB: ",err));
const userSchema=new mongoose.Schema({
    userid:Number,
    petitionerName:String,
    responderName:String,
    advocateName:String,
    status:String,
    nextDate:Date
})
const userSchema1=new mongoose.Schema({
    userid:Number,
    PrisonerName:String,
    FamilyMember:Number,
    DurationforImprisonment:Number
})
const user1=mongoose.model('images',userSchema1);
const user=mongoose.model('users',userSchema);
app.use(express.static(__dirname));
app.use(express.urlencoded({extended:true}));
app.use("/submit", (req, res, next) => {
    const { username,usertype, password } = req.body;

    fs.readFile('JSON.json', (err,data) => {
        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.usertype===usertype && u.password===password);
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).send('Access Denied');
            }
        
    });
});
app.use("/submit1", (req, res, next) => {
    const { username,usertype, password } = req.body;
    fs.readFile('JSON.json', (err,data) => {
        const users = JSON.parse(data);
        const user = users.find(u => u.username === username && u.usertype===usertype && u.password===password);
            if (user) {
                req.user = user;
                next();
            } else {
                res.status(401).send('Access Denied');
            }
        
    });
});


app.get("/",(req,res)=>{
    res.sendFile(__dirname);
})
app.get("/login",(req,res)=>{
    res.sendFile(__dirname + "/login.html");
});
// app.get("/login1",(req,res)=>{
//     res.sendFile(__dirname + "/login1.html");
// });
var userId="";
app.post('/submit',(req,res,next)=>{
    userId=req.user.userid;
    res.sendFile(__dirname + "/submit.html");
})
// app.post('/submit1',(req,res,next)=>{
//     userid1=req.user.userid;
//     res.redirect('/user/' + userid1);
// })
app.get('/user', async(req, res) => {
    try {
        console.log(userId);
        const data = await user.find({userid:userId});
        console.log(data);
        res.render('index', { data });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
});
app.get('/char',(req,res)=>{
    res.sendFile(__dirname+"/char.html");
})
app.get('/profile',async(req,res)=>{
    try {
        const data = await user1.find({userid:userId});
        console.log(data);
        res.render('index1', { data });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
})
app.get('/support', (req, res) => {
    res.sendFile(__dirname + '/support.html')
})
const io = require('socket.io')(http)

io.on('connection', (socket) => {
    console.log('Connected...')
    socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg)
    })

})
let mailTransporter =
    nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'amit.prajapati2334@gmail.com',
                pass: password
            }
        }
    );

app.post('/contactus', (req, res) => {
    const { name, email, message } = req.body;
    let mailDetails = {
        from: 'Admin',
        to: 'amit.prajapati2334@gmail.com',
        subject: 'Prisoner want to contact us',
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };
     
    mailTransporter
        .sendMail(mailDetails,
            function (err, data) {
                if (err) {
                    res.json(err);
                } 
                res.json("your message successfully submitted");
            });
});

