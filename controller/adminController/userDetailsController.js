const User = require('../../model/user_model')

const adminUserPage =async (req,res)=>{
    try {
        let users = await User.find({})
        res.render('admin/adminUserPage',{title:'UserPage',users:users})
    } catch (error) {
        console.error(error)
    }
}

const toggle = async (req,res)=>{
    try {
        let userId = req.query.userId;
        const userData = await User.findOne({_id:userId})
        if(userData.isBlocked == false){
        await User.updateOne({_id:userId},{$set:{isBlocked:true}})
        console.log(`${userData.username} is now Blocked`);
        }else if(userData.isBlocked == true){
            await User.updateOne({_id:userId},{$set:{isBlocked:false}})
            console.log(`${userData.username} is now Unblocked`);
        }
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    adminUserPage,
    toggle,
}