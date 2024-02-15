const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

app.use(express.json());
app.use(cors());

// DATABASE CONNECTION WITH MONGODB

mongoose.connect(
  'mongodb+srv://pedrazzoliorlando:33167960Riviera@cluster0.dwynz4l.mongodb.net/my-store'
);

// API CREATION
app.get('/', (req, res) => {
  res.send('Express App is Running');
});

//IMAGE STORE ENGINE
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage: storage });

//CREATING UPLOAD ENDPOINT ROF IMAGES
app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

//SCHEMA FOR CREATING PRODUCTS
const Product = mongoose.model('Product', {
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

app.post('/addproduct', async (req, res) => {
  let products = await Product.find({});
  let id;
  if (products.length > 0) {
    let last_product_array = products.slice(-1);
    let last_product = last_product_array[0];
    id = last_product.id + 1;
  } else {
    id = 1;
  }

  const product = new Product({
    id: id,
    name: req.body.name,
    image: req.body.image,
    category: req.body.category,
    new_price: req.body.new_price,
    old_price: req.body.old_price,
  });
  console.log(product);
  await product.save();
  console.log('Saved');
  res.json({
    success: true,
    name: req.body.name,
  });
});

//CREATING ENDPOINT FOR DELETING PRODUCTS
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log('Removed');
  res.json({
    success: true,
    name: req.body.name,
  });
});

//CREATING API FOR GETTING ALL PRODUCTS
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log('All Products Fetched');
  res.send(products);
});

// SCHEMA CREATING FOR USERS MODEL
const Users = mongoose.model('Users', {
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  cartData: {
    type: Object,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// CREATING ENDPOINT FOR REGISTERING THE USER
app.post('/signup', async (req, res) => {
  console.log('Sign Up');
  let success = false;
  let check = await Users.findOne({ email: req.body.email });
  if (check) {
    return res.status(400).json({
      success: success,
      errors: 'existing user found with this email',
    });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  let cart = {};
  for (let i = 0; i < 300; i++) {
    cart[i] = 0;
  }
  const user = new Users({
    name: req.body.username,
    email: req.body.email,
    // Store the hashed password
    password: hashedPassword,
    cartData: cart,
  });
  await user.save();
  const data = {
    user: {
      id: user.id,
    },
  };

  const token = jwt.sign(data, 'secret_ecom');
  success = true;
  res.json({ success, token });
});

// CREATING ENDPOINT FOR USER LOGIN
app.post('/login', async (req, res) => {
  console.log('Login');
  let success = false;
  let user = await Users.findOne({ email: req.body.email });
  if (user) {
    // Compare hashed passwords
    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      const data = {
        user: {
          id: user.id,
        },
      };
      success = true;
      console.log(user.id);
      const token = jwt.sign(data, 'secret_ecom');
      res.json({ success, token });
    } else {
      return res.status(400).json({
        success: success,
        errors: 'Please try with correct email/password or create an account',
      });
    }
  } else {
    return res.status(400).json({
      success: success,
      errors: 'Please try with correct email/password or create an account',
    });
  }
});

//CREATING ENDPOINT FOR NEWCOLLECTION DATA
app.get('/newcollections', async (req, res) => {
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log('New Collections Fetched');
  res.send(newcollection);
});

//CREATING ENDPOINT FOR POPULAR IN WOMEN
app.get('/popularinwomen', async (req, res) => {
  let products = await Product.find({ category: 'women' });
  let popular_in_women = products.splice(0, 4);
  console.log('Popular In Women Fetched');
  res.send(popular_in_women);
});

//CREATING A MIDDLEWARE TO FETCH USER
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    res.status(401).send({ errors: 'Please authenticate using a valid token' });
  }
  try {
    const data = jwt.verify(token, 'secret_ecom');
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ errors: 'Please authenticate using a valid token' });
  }
};

//CREATING ENDPOINT FOR ADDING PRODUCTS IN CARTDATA
app.post('/addtocart', fetchUser, async (req, res) => {
  console.log('Add Cart');
  let userData = await Users.findOne({ _id: req.user.id });
  if (!userData) {
    return res.status(404).send('User not found');
  }
  userData.cartData[req.body.itemId] += 1;
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send('Added');
});

//CREATING ENDPOINT FOR REMOVE PRODUCT FROM CARTDATA
app.post('/removefromcart', fetchUser, async (req, res) => {
  console.log('Remove Cart');
  let userData = await Users.findOne({ _id: req.user.id });
  if (userData.cartData[req.body.itemId] != 0) {
    userData.cartData[req.body.itemId] -= 1;
  }
  await Users.findOneAndUpdate(
    { _id: req.user.id },
    { cartData: userData.cartData }
  );
  res.send('Removed');
});

//CREATING ENDPOINT TO GET CARTDATA
app.post('/getcart', fetchUser, async (req, res) => {
  console.log('Get Cart');
  let userData = await Users.findOne({ _id: req.user.id });
  res.json(userData.cartData);
});

app.listen(port, error => {
  if (!error) {
    console.log('Server Running on Port' + port);
  } else {
    console.log('Error :' + error);
  }
});
