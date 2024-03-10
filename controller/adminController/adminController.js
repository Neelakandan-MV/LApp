require('dotenv').config()
const User = require('../../model/user_model')
const Categories = require('../../model/categoriesModel')
const Products = require('../../model/productModel')
const Variant = require('../../model/variantModel')
const multer = require('multer')

//multer
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix);
    }
});

var upload = multer({
    storage: storage,
}).array("images", 5);
//

const adminLoginPage = (req, res) => {
    try {
        res.render('admin/adminLogin')
    } catch (error) {
        console.error(error);
    }
}
//Admin credentials
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const adminLogin = (req, res) => {
    try {
        if (email != req.body.email &&
            password != req.body.password) {
            res.render('admin/adminLogin', { adminAlert: "invalid email and password", title: 'Admin Loginpage' })
        } else if (email != req.body.email) {
            res.render('admin/adminLogin', { adminAlert: 'Invalid Email or password', title: 'Admin Loginpage' })
        } else if (password != req.body.password) {
            res.render('admin/adminLogin', { adminAlert: 'Invalid password', title: 'Admin Loginpage' })
        } else if (
            email == req.body.email &&
            password == req.body.password
        ) {
            req.session.admin = req.body.email;
            res.redirect('/adminHome')
        }
    } catch (error) {
        console.error(error)
    }
}

const adminHome = (req, res) => {
    try {
        res.render('admin/adminHome', { title: 'LApp Dashboard' })
    } catch (error) {
        console.error(error)
    }
}

const adminLogout = (req, res) => {
    try {
        req.session.admin = null;
        res.render('admin/adminLogin', { adminAlert: 'Logged Out Successfully', title: 'Admin Login' })
        // res.redirect('adminLogin')
    } catch (error) {
        console.error(error)
    }
}

const adminCategories = async (req, res) => {
    try {
        const categoryDetails = await Categories.find({})
        res.render('admin/categoriesPage', { title: 'Caterogies', cat: categoryDetails })
    } catch (error) {
        console.error(error)
    }
}

//variants
const variantPage = (req, res) => {
    try {
        res.render('admin/addvariantPage')
    } catch (error) {
        console.error(error);
    }
}

const createVariant = async (req, res) => {
    try {
        const variants = req.body.variant
        const variantsDB = await Variant.find({ variant: variants })
        if (variantsDB[0]?.variant) {
            res.render('admin/addvariantPage', { alert: 'Variant already exists' })
        } else {
            const variantDetails = new Variant({
                variant: variants
            })
            await variantDetails.save()
            res.redirect('/adminProductPage')
        }
    } catch (error) {
        console.error(error);
    }
}


//create new categories

const createNewCatpage = (req, res) => {
    try {
        res.render('admin/createCat')

    } catch (error) {
        console.error(error);
    }
}

//post method for new categories

const createNewCat = async (req, res) => {
    try {
        
        const categoryName = req.body.category
        const categories = await Categories.find({},{category:true,_id:false})
        const categoryDescription = req.body.description
        categoryExists = categories.some(item=>item.category == categoryName)
        console.log(categoryExists);
        if(categoryExists){
            res.render('admin/createCat',{catAlert:'The category is already exists'})
        }else{
        const categoryDetails = new Categories({
            category: categoryName,
            description: categoryDescription
        })
        const categorySaveDetails = await categoryDetails.save();
        console.log(categorySaveDetails);
        res.redirect('/adminCategories')
    }
    } catch (error) {
        console.error();
    }
}

//edit Categories

const editCatPage = async (req, res) => {
    try {
        const _id = req.query.id;
        const categoryDetails = await Categories.findById({ _id: _id })
        res.render('admin/editCat', { catDetails: categoryDetails })
    } catch (error) {
        console.error();
    }
}

const editCat = async (req, res) => {
    try {
        const { category, description, id } = req.body;
        const allCategories = await Categories.find({},{category:true,_id:false})
        const categoryExists = allCategories.some(item=>item.category == category)
        const categoryDetails =await Categories.findById({_id:id})
        if(categoryExists){
            res.render('admin/editCat',{catAlert:'The category is already exists',catDetails: categoryDetails})
        }else{
        await Categories.findOneAndUpdate({ _id: id }, { category, description })
        res.redirect('/adminCategories')
    }
    } catch (error) {
        console.error(error);
    }
}

const isList = async (req, res) => {
    try {
        const categoryId = req.query.catId
        const cats = await Categories.findOne({ _id: categoryId })
        if (cats.isList == true) {
            await Categories.findOneAndUpdate({ _id: categoryId }, { isList: false })
        } else {
            await Categories.findOneAndUpdate({ _id: categoryId }, { isList: true })
        }
    } catch (error) {
        console.error(error);
    }
}


//product page
const productPage = async (req, res) => {
    try {
        const page = req.query.page;
        const products = await Products.find({})
        res.render('admin/ProductPage', { products })
    } catch (error) {
        console.error(error);
    }
}


const isList_product = async (req, res) => {
    try {
        const productId = req.query.productId
        const products = await Products.findById({ _id: productId })
        const updatedIsBlocked = !products.isBlocked;
        await Products.updateOne({_id:productId},{ $set: { isBlocked: updatedIsBlocked } }, { new: true })
      

    } catch (error) {
        console.error(error);
    }
}


const addProductPage = async (req, res) => {
    try {

        const variants = await Variant.find({})
        const category = await Categories.find({isList:true})
        res.render('admin/addProductPage', { category, variant: variants, title: 'Add Products' })
    } catch (error) {
        console.error(error);
    }
}
const addProduct = async (req, res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        }
        const { productTitle, description, price, stock, category, productVariant } = req.body;

        const images = req.files.map(file => file.filename);

        const product = new Products({
            productTitle: productTitle,
            description: description,
            price: price,
            stock: stock,
            category: category,
            productVariant: productVariant,
            image: images
        });

        product.save()
            .then(() => {
                console.log('New product:', product);
                res.redirect('/adminProductPage');
            })
            .catch(error => {
                console.error('Error saving product:', error);
                res.status(500).send('Internal Server Error');
            });
    });
}

const productEditPage = async(req,res)=>{
    try {
        let category = await Categories.find({})
        let variant = await Variant.find({})
        let productId = req.query.productId
        let product = await Products.findById({_id:productId})
        // let image = product.image
        //this is for the retrieve the category and variant of the selected product
        let categorySelected = await Categories.findById({_id:product.category})
        let variantSelected = await Variant.findById({_id:product.productVariant})

        res.render('admin/productEdit',{category,categorySelected,variant,variantSelected,product})
    } catch (error) {
        console.error(error);
    }
}

const productEdit = async (req,res)=>{
    try {
        upload (req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json(err);
            } else if (err) {
                return res.status(500).json(err);
            }
            const { productTitle, description, price, stock, category, productVariant, productId } = req.body;
            const images = req.files.map(file => file.filename);
            await Products.findOneAndUpdate({_id:productId},{
                productTitle: productTitle,
                description: description,
                price: price,
                stock: stock,
                category: category,
                productVariant: productVariant,
                image: images
            })
            .then(()=>{
                res.redirect('/adminProductPage')
            })
            
        });
    } catch (error) {
        console.error(error);
    }
}


module.exports = {
    adminLoginPage,
    adminLogin,
    adminHome,
    adminLogout,
    adminCategories,
    createNewCatpage,
    createNewCat,
    editCatPage,
    editCat,
    isList,
    productPage,
    addProductPage,
    addProduct,
    isList_product,
    variantPage,
    createVariant,
    productEditPage,
    productEdit,

}