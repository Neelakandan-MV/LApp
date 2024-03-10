const express = require('express')
const nocache = require('nocache')
const session = require('express-session')
const User = require('./model/user_model')
const adminRouter = require('./routes/adminRouter')
const userRouter = require('./routes/userRouter')
require('dotenv').config()
const app = express()
const PORT = 3000;

//connecting database
const mongoose = require("mongoose");
const connect = mongoose.connect(process.env.MONGODB)
connect
.then(()=>{
    console.log("MongoDB is connected successfully");
})
.catch(()=>{
    console.log("Error connecting to MongoDB");
})
// //connecting data base
// mongoose.connect(process.env.MONGODB)
// const db = mongoose.connection
// db
//    .on("error",(error)=>{
//        console.log(error);
//    })
//    .once('open',()=>{
//        console.log('Mongodb server is connected');
//    })


//setting ejs
app.set('view engine','ejs')


//url encoding
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//using nocache for session manegment
app.use(nocache());

//using session
app.use(
    session({
      secret: "secret key",
      resave: false,
      saveUninitialized: true,
    })
  ); 
//
app.use('/',adminRouter);
app.use('/',userRouter); 

//static
app.use("/static", express.static("public"));
app.use("/assets", express.static("public/assets"));
app.use("/asset", express.static("public/asset"));
app.use(express.static('uploads'))


// // rendering user login page
// app.get("/", (req, res) => {
//     if(!req.session.user){
//       res.render("userlogin")
//     }else{
//       res.redirect("/userhomepage");
//     }
//   });
// // user Homepage
// app.get("/userhomepage",(req,res)=>{
//     if(!req.session.user){
//         res.render("userlogin")
//     }else{
//         res.render("userhome")
//     }
// })

// // user loging post

// app.post('/login',async(req,res)=>{
// const data = await User.findOne({email:req.body.email})
// console.log(data);
// if(data){
//     if(req.body.email != data.email && req.body.password != data.password){
//         res.render('login',{alert:'Entered Email or Password is incorrect'})
//     } else if (req.body.email != data.email){
//         res.render('login',{alert:'Entered Email is incorrect'})
//     } else if (req.body.password != data.password){
//         res.render('login',{alert:'Entered Password is incorrect'})
//     } else{
//         req.session.user = req.body.email
//         res.redirect('/userhomepage')
//     }
// } else{
//     res.render('usersignup',{signup:"Account Doesn't Exist,Please Signup"})
// }
// })

// /////////    user signup     /////////

// app.get('/signup',(req,res)=>{
//     res.render('usersignup',{title: "Sign Up"})
// })

// app.post('/signup',async (req,res)=>{
//     try{
//         const data = await User.findOne({email:req.body.email});
//         const username = await User.findOne({username:req.body.username})
//         if(data){
//             res.render('usersignup',{signupAlert: "This Email already in use"})
//         }else if(username){
//             res.render('usersignup',{signupAlert: "This username already in use"})
//         }else{
//             const newUser = new User({
//                 username: req.body.username,
//                 email: req.body.email,
//                 password: req.body.password,
//                 phone: req.body.phone,
//             });
//             await newUser.save();
//             res.render('/',{});
//         }
//     }catch(error){
//         console.log(error);
//         res.status(500).send('internal server error');
//     }
// })

// ////////////////////        Admin        ///////////////////////////////

// //admin credentiol
// const adminCredential = {
//     email: "admin@gmail.com",
//     password: "123",
//   };



// //admin Login

// // app.get("/adminLogin",(req,res)=>{
// //     if(!req.session.admin){
// //         res.render('adminLogin')
// //     }else{
// //         res.redirect('/adminHome')
// //     }
// // })

// //admin home

// app.get("/adminHome",(req,res)=>{
//     if(!req.session.admin){
//         res.redirect("/adminLogin")
//     }else{
//         res.render("adminHome")
//     }
// })

// //admin Validation

// app.post('/adminLogin',(req,res)=>{
    // if (adminCredential.email != req.body.email &&
    //     adminCredential.password != req.body.password){
    //         res.render('adminLogin',{adminAlert:"invalid email and password" , title: 'Admin Loginpage' })
    //     }else if (adminCredential.email != req.body.email){
    //         res.render('adminLogin',{adminAlert:'Invalid Email', title:'Admin Loginpage'})
    //     }else if (adminCredential.password != req.body.password){
    //         res.render('adminLogin',{adminAlert:'Invalid password', title:'Admin Loginpage'})
    //     }else if(
    //         adminCredential.email == req.body.email &&
    //         adminCredential.password == req.body.password
    //         ){
    //             req.session.admin = req.body.email;
    //             res.redirect('/adminHome')
    //         }
// })

// //admin logout

// app.get('/adminLogout',(req,res)=>{
//     req.session.destroy((err)=>{
//         if(err){
//             console.log(err);
//         }else{
//             res.render('adminLogin',{adminLogout:'Logged out successfully', title:'Admin Login'})
//         }
//     })
// })







// //testing route

// app.get('/test',(req,res)=>{

//     res.render('page-products-list')
// })


app.listen(PORT,()=>{
    console.log(`server on http://localhost:${PORT}`);
})