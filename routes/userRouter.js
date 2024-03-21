const express = require('express')
const userController = require('../controller/userController/userController')
const emailController = require('../controller/userController/emailController')
const otpController = require('../controller/userController/otpController')
const {isUser,isLoggedUser,isActive} = require('../middleware/userAuth')

const userRouter = express();

userRouter.set('views','views/user');

userRouter.get('/userLogin',isLoggedUser,userController.userLoginPage)

userRouter.post('/userLogin',userController.userLogin)

userRouter.get('/userSignup',userController.userSignupPage)

userRouter.post('/userSignup',userController.userSignup)

userRouter.get('/',userController.userHomepage)

userRouter.get('/userLogout',userController.userLogout)

userRouter.post('/send-email', emailController.mailSender);

userRouter.get('/otpSignup', otpController.otpSignupPage)

userRouter.post('/otpSignup',otpController.otpSignup)

userRouter.get('/resendOtp',otpController.resendOtp)

//shop
userRouter.get('/shop',userController.shop)

//productpage

userRouter.get('/productPage',userController.productPages)

//userAccount

userRouter.get('/userAccount',userController.userAccountPage)

userRouter.post('/addAddress',userController.addAddress)

userRouter.get('/editAddress',userController.editAddressPage)

userRouter.post('/editAddress',userController.editAddress)

userRouter.post('/editUser',userController.editUser)

//cart
userRouter.get('/cart',userController.cartPage)
userRouter.post('/addToCart',userController.addToCart)
userRouter.put('/quantityIncrease',userController.quantityIncrease)
userRouter.put('/quantityDecrease',userController.quantityDecrease)
userRouter.get('/deleteCart',userController.deleteProductFromCart)

//checkout Page
userRouter.get('/checkoutPage',userController.checkoutPage)
userRouter.patch('/checkoutPage',userController.checkoutPageRefreshedForAddress)
userRouter.post('/checkoutPage',userController.cashOnDelivery)
//razorPay
userRouter.post('/razorPay',userController.razorPay)
userRouter.post('/orderPlacing',userController.orderPlacing)

userRouter.get('/orders',userController.order)
userRouter.get('/orderDetails/:id',userController.orderDetailsPage)
userRouter.get('/orderCancel',userController.orderCancel)
userRouter.get('/orderReturn',userController.orderReturn)

//change password
userRouter.get('/changePassword',userController.changePasswordPage)
userRouter.post('/changePassword',userController.changePassword)


module.exports = userRouter;