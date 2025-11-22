const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Product } = require('./models/productModel');

async function checkImages() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const products = await Product.find({ 'images.1': { $exists: true } }).limit(5).select('title images');
    console.log('Products with multiple images:', products.length);
    if (products.length > 0) {
        console.log('First product images count:', products[0].images.length);
        console.log('First product images:', products[0].images);
    } else {
        const sample = await Product.findOne().select('title images');
        console.log('Sample product images count:', sample?.images?.length);
    }

    process.exit(0);
}

checkImages();
