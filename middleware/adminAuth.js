
const isLoggedAdmin = (req,res,next)=>{
    if(req.session.isLoggedAdmin){
        res.redirect('/adminLogin')
    }else{
        next();
    }
}

module.exports={isLoggedAdmin}