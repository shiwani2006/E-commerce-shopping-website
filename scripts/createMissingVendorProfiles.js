require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User.model");
const Vendor = require("../src/models/Vendor.model");

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const vendorUsers = await User.find({ role: "vendor" });
  let created = 0;

  for (const user of vendorUsers) {
    const existing = await Vendor.findOne({ user: user._id });
    if (!existing) {
      await Vendor.create({ user: user._id });
      console.log(`✅ Vendor profile created for: ${user.email}`);
      created++;
    }
  }

  console.log(`\nDone. ${created} missing vendor profile(s) created.`);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});