// scripts/linkOrphanProducts.js
//
// One-time migration script:
// Saare products jinka "vendor" field missing hai, ya jo
// kisi valid User se link nahi hai, unhe di gayi vendor email
// ke account se link kar deta hai.
//
// Chalane ka tareeka (terminal se, backend root folder mein):
//   node scripts/linkOrphanProducts.js your-vendor-email@example.com
//
// ⚠️ Ek baar chalane ke baad dobara chalane ki zaroorat nahi.

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User.model");
const Product = require("../src/models/Product.model");

const vendorEmail = process.argv[2];

if (!vendorEmail) {
  console.error("❌ Vendor email dena zaroori hai. Example:");
  console.error("node scripts/linkOrphanProducts.js ritu@gmail.com");
  process.exit(1);
}

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const user = await User.findOne({ email: vendorEmail });

    if (!user) {
      console.error(`❌ "${vendorEmail}" wala user nahi mila. Email check kar.`);
      process.exit(1);
    }

    console.log(`👤 Found user: ${user.name} (${user._id}), role: ${user.role}`);

    if (user.role !== "vendor") {
      console.warn("⚠️ Warning: ye user 'vendor' role mein nahi hai. Phir bhi aage badh rahe hain.");
    }

    // Saare valid vendor (User) IDs nikaal lo, taaki pata chale
    // konse products ka vendor field kisi bhi real user se match nahi karta
    const allUserIds = (await User.find({}, "_id")).map((u) => u._id.toString());

    const allProducts = await Product.find({});
    let orphanCount = 0;
    let alreadyLinkedCount = 0;

    for (const product of allProducts) {
      const currentVendorId = product.vendor ? product.vendor.toString() : null;

      const isOrphan = !currentVendorId || !allUserIds.includes(currentVendorId);

      if (isOrphan) {
        product.vendor = user._id;
        await product.save();
        orphanCount++;
        console.log(`   🔗 Linked: "${product.name}" → ${user.name}`);
      } else {
        alreadyLinkedCount++;
      }
    }

    console.log("\n✅ Migration complete!");
    console.log(`   Total products: ${allProducts.length}`);
    console.log(`   Newly linked to ${vendorEmail}: ${orphanCount}`);
    console.log(`   Already linked to some valid user (untouched): ${alreadyLinkedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

run();