const User = require('../model/user_model')

const isUser = (req,res,next)=>{
if(req.session.user){
    next()
}else{
    res.redirect('/userLogin')
}
}

const isLoggedUser = (req,res,next)=>{
    if(req.session.isLoggedUser){
        res.redirect('/')
    }else{
        next();
    }
}

const isActive = async(req,res,next)=>{
    try {
        const user = await User.findOne({email:req.session.user,isBlocked:false})
        if(user){
            next()
        }else{
            res.redirect('/userLogin')
        }
        
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    isUser,
    isLoggedUser,
    isActive
}