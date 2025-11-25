require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { Product } = require('./models/productModel');

async function checkCount() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Product.countDocuments();
        console.log(`Total Products: ${count}`);
        const ffSample = await Product.findOne({ source: 'farfetch' }).sort({ createdAt: -1 }).select('title brand source');
        console.log('Latest Farfetch Sample:', ffSample);
        const ssSample = await Product.findOne({ source: 'ssense' }).sort({ createdAt: -1 }).select('title brand source');
        console.log('Latest SSENSE Sample:', ssSample);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCount();
