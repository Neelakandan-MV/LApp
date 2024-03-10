const express = require('express')
const adminRouter = express.Router()

//controllers
const adminController = require('../controller/adminController/adminController')
const userDetailsController = require('../controller/adminController/userDetailsController')
const {isLoggedAdmin} = require('../middleware/adminAuth')


//login
adminRouter.get("/adminLogin",adminController.adminLoginPage)

//login post
adminRouter.post('/adminLogin',adminController.adminLogin)

//admin Home
adminRouter.get('/adminHome',adminController.adminHome)

//admin Logout
adminRouter.get('/adminLogout',adminController.adminLogout)

//user Page
adminRouter.get('/adminUserPage',userDetailsController.adminUserPage)
adminRouter.put('/usertoggle',userDetailsController.toggle)             //isBlocked toggle

//categories
adminRouter.get('/adminCategories',adminController.adminCategories)
//variant
adminRouter.get('/variantPage',adminController.variantPage)
adminRouter.post('/createVariant',adminController.createVariant)
//create new catgories
adminRouter.get('/createCategory',adminController.createNewCatpage)
adminRouter.post('/createCategory',adminController.createNewCat)
//edit Categories
adminRouter.get('/catEdit',adminController.editCatPage)
adminRouter.post('/catEdit',adminController.editCat)
//list and unlist categories
adminRouter.put('/isList',adminController.isList)

//product page
adminRouter.get('/adminProductPage',adminController.productPage)
adminRouter.put('/isList_product',adminController.isList_product)
adminRouter.get('/createProduct',adminController.addProductPage)
adminRouter.post('/createProduct',adminController.addProduct)
adminRouter.get('/productEdit',adminController.productEditPage)
adminRouter.post('/productEdit',adminController.productEdit)

module.exports = adminRouter;
