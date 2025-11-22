const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const { Product } = require('./models/productModel');

async function checkBadData() {
    if (!process.env.MONGODB_URI) {
        console.error('No MONGODB_URI');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URI);

    const errorPages = await Product.countDocuments({
        $or: [
            { title: { $regex: '429', $options: 'i' } },
            { title: { $regex: 'Too Many Requests', $options: 'i' } },
            { title: { $regex: 'Access Denied', $options: 'i' } },
            { title: { $regex: 'Just a moment', $options: 'i' } }
        ]
    });

    const badTitles = await Product.countDocuments({
        $or: [
            { title: { $regex: '{' } },
            { title: { $regex: 'var\\(' } },
            { title: { $regex: 'window\\.' } }
        ]
    });

    const total = await Product.countDocuments();

    console.log(`Total Products: ${total}`);
    console.log(`Error Pages: ${errorPages}`);
    console.log(`Bad Titles: ${badTitles}`);

    if (badTitles > 0) {
        const sample = await Product.findOne({ title: { $regex: '{' } }).select('title');
        console.log('Sample bad title:', sample?.title);
    }

    process.exit(0);
}

checkBadData();
