const User = require('../../model/user_model');
const otpGenerator = require('otp-generator')
const OTP = require('../../model/otpModel')
const Product = require('../../model/productModel')
const Category = require('../../model/categoriesModel')
const Variant = require('../../model/variantModel')
const Address = require('../../model/addressModel')
const District = require('../../model/districtModel')
const Cart = require('../../model/cartModel')
const emailController = require('../userController/emailController')

const { default: mongoose } = require("mongoose")




const userLoginPage = async (req, res) => {
    try {
        res.render('userLogin')
    } catch (error) {
        console.error(error)
    }
}

const userSignupPage = async (req, res) => {
    try {
        res.render('userSignup')
    } catch (error) {
        console.error(error)
    }
}


const userLogin = async (req, res) => {
    try {
        const data = await User.findOne({ email: req.body.email })
        if(data){
        if (data.isBlocked == false) {
            if (req.body.email != data.email && req.body.password != data.password) {
                res.render('userLogin', { alert: 'Entered Email or Password is incorrect' })
            } else if (req.body.email != data.email) {
                res.render('userLogin', { alert: 'Entered Email is incorrect' })
            } else if (req.body.password != data.password) {
                res.render('userLogin', { alert: 'Entered Password is incorrect' })
            } else {
                req.session.user = req.body.email
                req.session.userId = data._id
                req.session.isLoggedUser = true;
                res.redirect('/')
            }
        } else {
            res.render('userLogin', { alert: "User is Blocked Temporarly" })
        }
    }else{
        res.render('userLogin',{ alert:'Signup and Try again'})
    }
    }
    catch (error) {
        console.error(error)
    }
}

const userHomepage = (req,res)=>{
    try {
        let userData = req.session.user
        res.render('userHome',{ userData,page:'home' })
    } catch (error) {
        console.error
    }
}

const userLogout = (req,res)=>{
    try {
        req.session.user = null;
        req.session.isLoggedUser = false;
        res.redirect('/');
    } catch (error) {
        console.error(error)
    }
}

const userSignup =async (req,res)=>{
        try {
             req.session.userDetails = req.body;
             const email = req.session.userDetails.email
            // Check if user is already present
            const checkUserPresent = await User.findOne({ email: email});
            // If user found with provided email
            if (checkUserPresent) {
                return res.render('userSignup',{signupAlert:'Email already exist'});
            }else{
              // Generate OTP
              let otp = otpGenerator.generate(6, {
                  upperCaseAlphabets: false,
                  lowerCaseAlphabets: false,
                  specialChars: false,
              });
      
              // Ensure OTP is unique
              let result = await OTP.findOne({ otp });
              while (result) {
                  otp = otpGenerator.generate(6, {
                      upperCaseAlphabets: false,
                      lowerCaseAlphabets: false,
                      specialChars: false,
                  });
                  result = await OTP.findOne({ otp });
              }
              //saving OTP to session

              req.session.otp = otp;

              // Save OTP to the database
              const otpPayload = { email, otp };
              const otpBody = await OTP.create(otpPayload);
              console.log('mail and otp',otpBody);
              let mailSender= emailController.mailSender;
              // Send OTP via email
              await mailSender(email, 'Verification Email', `<h3>Confirm your OTP</h3><h5>Here is your OTP: <b>${otp}</b></h5>`);
              // Rendering otp page
              return res.render('otp',{emailAlert:email })
            }      
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({ success: false, error: error.message });
        }
    };

// const shop = async(req,res)=>{
//     try {
//         let product = await Product.find({isBlocked:false})
//         let activeCategories = await Category.find({isList:true})
//         // activeCategoriesId = activeCategories
//         // console.log(activeCategories);
//         let userData = req.session.user
//         res.render('shop',{userData,page:'shop',product,activeCategoriesId})
//     } catch (error) {
//         console.error(error);
//     }
// }
const shop = async (req, res) => {
    try {
        let userData = req.session.user;

        // Perform aggregation
        const product = await Product.aggregate([
            {
                $match: { isBlocked: false } // Match active products
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $match: { "category.isList": true } // Match products with category.isList = true
            },
            
        ]);
        res.render('shop', { product, userData, page: 'shop' });

    } catch (error) {
        console.log(error.message);
    }
};


const productPages = async(req,res)=>{
    try {
        let userData = req.session.user
        const userArray = await User.find({email:userData},{_id:true})
        const [user] = userArray;
        const productId = req.query.productId
        const product = await Product.findById({_id:productId})
        const categoryId = product.category
        const category = await Category.findById({_id:categoryId})
        const variantId = product.productVariant
        const productVariant = await Variant.findById({_id:variantId})
        const variant = await Variant.find({})
        const allProducts = await Product.find({})
        
        res.render('productPage',{product,page:'shop',userData,category,productVariant,variant,allProducts,user})
    } catch (error) {
        console.error(error);
    }
}

//userAccount Details
const userAccountPage = async(req,res)=>{
    try {
        
        userData = req.session.user
        if(userData){
        const userDetails = await User.findOne({email:userData})
        const address = await Address.find({userEmail:userData})
        const districts = await District.find({},{name:true,_id:false})
        res.render('userAccountPage',{page:'accountpage',userData,user:userDetails,address,districts})
        }else{
            res.redirect('/')
        }
    } catch (error) {
        console.error(error);
    }
}

const addAddress = async (req,res)=>{
    try {
        userData = req.session.user
        const {houseName,place,districts,pinCode,email} = req.body    
        console.log(houseName,place,districts,pinCode,email);
        const address = await Address.find()
        if(address.length<1){
            const newAddress = new Address({
                houseName:houseName,
                place:place,
                district:districts,
                pinCode:pinCode,
                userEmail:email,
                selected:true
            })
            await newAddress.save()
        }else{
            const newAddress = new Address({
                houseName:houseName,
                place:place,
                district:districts,
                pinCode:pinCode,
                userEmail:email,
                selected:false
            })
            await newAddress.save()
        }
        res.redirect('/userAccount')
    } catch (error) {
        console.error(error);
    }
}

const editUser = async(req,res)=>{
    try {
        const userData = req.session.user;
        const {username,email,phone} = req.body
        const existUsers = await User.find({email:email})
            await User.updateOne({email:userData},{$set:{username:username,email:email,phone:phone}})
            res.redirect('/userAccount')
        
    } catch (error) {
        console.error(error);
    }
}

const editAddressPage = async(req,res)=>{
    try {
        const userData = req.session.user
        const addressId = req.query.addressId
        const address = await Address.findById({_id:addressId})
        const districts = await District.find()
        res.render('addressEdit',{userData,page:'hello',districts,address})

    } catch (error) {
        console.error(error);
    }
}

const editAddress = async(req,res)=>{
    try {
        userData = req.session.user
        const {houseName,place,districts,pinCode,email,addressId} = req.body    
        await Address.updateOne({_id:addressId},{$set:{houseName,place,district:districts,pinCode,userEmail:email}})
        res.redirect('/userAccount')

    } catch (error) {
        console.error(error);
    }
}


// cart

const cartPage = async (req,res)=>{
    try {
        const userData = req.session.user
        const userId = req.session.userId
        const cart = await Cart.findOne({userId:userId}).populate('items.product')
        
        
        res.render('cartPage',{page:"cart",userData,cart})
    } catch (error) {
        console.error(error);
    }
}

const addToCart = async (req, res) => {
    try {
        const productId = req.body.productId;
        const userId = req.body.userId;
        const cartDetails = await Cart.find({ userId: userId });
        const product = await Product.findById(productId);

        let cart;
        if (cartDetails.length === 0) {
            cart = new Cart({
                userId,
                items: [],
                totalPrice:0
            });
        } else {
            cart = cartDetails[0];
        }

        

        const productIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (productIndex === -1) {          //findIndex will return -1 if the condition not get satified
            cart.items.push({ product: productId, quantity:1, price: product.price , image: product.image[0]});
            await Product.updateOne({_id:productId},{$inc:{stock:-1}})
        } else {
            cart.items[productIndex].quantity += 1;
            cart.items[productIndex].price = product.price
            await Product.updateOne({_id:productId},{$inc:{stock:-1}})        //to increase the quantity of the product in the cart
        }
        let totalPrice = 0;
        for(i=0;i<cart.items.length;i++){
            totalPrice += cart.items[i].price*cart.items[i].quantity
        }
        cart.totalPrice = totalPrice

        await cart.save();
        res.redirect('/shop')

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const quantityIncrease = async(req,res)=>{
    try {
        const userData = req.session.user
        const indexOfItems = req.query.index
        const user = await User.findOne({email:userData})
        const cart = await Cart.findOne({userId:user._id})
        const product = await Product.findOne({_id:cart.items[indexOfItems].product})
        cart.items[indexOfItems].quantity++

        let totalPrice = 0
        for(i=0;i<cart.items.length;i++){
            totalPrice += cart.items[i].price*cart.items[i].quantity
        }
        cart.totalPrice = totalPrice
        await cart.save()

        product.stock--
        await product.save()
    } catch (error) {
        console.error(error);
    }
}

const quantityDecrease = async(req,res)=>{
    try {
        const userData = req.session.user
        const indexOfItems = req.query.index
        const user = await User.findOne({email:userData})
        const cart = await Cart.findOne({userId:user._id})
        const product = await Product.findOne({_id:cart.items[indexOfItems].product})
        cart.items[indexOfItems].quantity--

        let totalPrice = 0
        for(i=0;i<cart.items.length;i++){
            totalPrice += cart.items[i].price*cart.items[i].quantity
        }
        cart.totalPrice = totalPrice
        await cart.save()

        product.stock++
        await product.save()
    } catch (error) {
        console.error(error);
    }
}


const deleteProductFromCart = async(req,res)=>{
    try {
        const productId = req.query.productId
        const userData = req.session.user
        const user = await User.findOne({email:userData})
        const cart = await Cart.findOne({userId:user._id})
        const product = await Product.findOne({_id:productId})
        await Cart.updateOne({userId:user._id},{$pull:{items:{product:productId}}})
        const newCart = await Cart.findOne({userId:user._id})

        let totalPrice = 0
        for(i=0;i<newCart.items.length;i++){
            totalPrice += newCart.items[i].price * newCart.items[i].quantity
        }
        newCart.totalPrice = totalPrice
        newCart.save()

        product.stock++
        await product.save()

        res.redirect('/cart')
        // cart.totalPrice = 0
        
    } catch (error) {
        console.error(error);
    }
}


const checkoutPage = async(req,res)=>{
    try { 
        const userData = req.session.user
        const user = await User.findOne({email:userData})
        const cartDetails = await Cart.findOne({userId:user._id}).populate('items.product')
        const address = await Address.findOne({userEmail:userData,selected:true})
        const addresses = await Address.find({userEmail:userData})
        console.log('checkoutpage');
        res.render('checkoutPage',{userData,page:'checkoutPage',cart:cartDetails,address,addresses})
        }
     catch (error) {
        console.error(error);
    }
}

const checkoutPageRefreshed = async(req,res)=>{
    try {
            const selectedAddressId = req.query.selectedAddressId
            const userData = req.session.user
            const user = await User.findOne({email:userData})
            const cartDetails = await Cart.findOne({userId:user._id}).populate('items.product')
            const address = await Address.findOne({_id:selectedAddressId})
            const addresses = await Address.find({userEmail:userData})
           
            const data = address
            res.json(data)
    } catch (error) {
        console.error(error);
    }
}


const checkout = async(req,res)=>{
    try {
        const userData = req.session.user
        const {houseName,place,district,pinCode,email,addressId} = req.body
        console.log(addressId);
        await Address.updateOne({_id:addressId},{$set:{houseName,place,district,pinCode,userEmail:email}})
        res.render('thankyou',{userData,page:'thankyou'})
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    userLoginPage,
    userSignupPage,
    userLogin,
    userHomepage,
    userLogout,
    userSignup,
    shop,
    productPages,
    userAccountPage,
    addAddress,
    editUser,
    editAddressPage,
    editAddress,
    cartPage,
    addToCart,
    quantityIncrease,
    quantityDecrease,
    deleteProductFromCart,
    checkoutPage,
    checkoutPageRefreshed,
    checkout,

}