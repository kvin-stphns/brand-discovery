const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Product } = require('./models/productModel');

async function check() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const total = await Product.countDocuments();
    const withGender = await Product.countDocuments({ gender: { $exists: true } });
    const distinctGenders = await Product.distinct('gender');
    console.log('Distinct Genders:', distinctGenders);

    const sample = await Product.findOne({ gender: { $exists: true } }).select('gender title sourceUrl');
    console.log('Sample with gender:', sample);

    process.exit(0);
}

check();
