const Settings = require("../models/Settings.model");

const getSettingsDoc = async () =>
  (await Settings.findOne({ key: "platform" })) || (await Settings.create({ key: "platform" }));

// GET /api/settings/public  (no login: footer, register page, etc.)
const getPublicSettings = async (req, res) => {
  try {
    const s = await getSettingsDoc();
    res.json({
      success: true,
      settings: {
        siteName: s.siteName,
        supportEmail: s.supportEmail,
        supportPhone: s.supportPhone,
        allowVendorRegistration: s.allowVendorRegistration,
        allowCustomerRegistration: s.allowCustomerRegistration,
      },
    });
  } catch (error) {
    console.error("getPublicSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
};

// GET /api/settings  (admin)
const getSettings = async (req, res) => {
  try {
    res.json({ success: true, settings: await getSettingsDoc() });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to load settings" });
  }
};

// PUT /api/settings  (admin)
const updateSettings = async (req, res) => {
  try {
    const s = await getSettingsDoc();
    const { siteName, supportEmail, supportPhone, allowVendorRegistration, allowCustomerRegistration } = req.body;

    if (siteName !== undefined) {
      if (!siteName.trim()) {
        return res.status(400).json({ success: false, message: "Store name cannot be empty" });
      }
      s.siteName = siteName;
    }
    if (supportEmail !== undefined) {
      if (supportEmail && !/^\S+@\S+\.\S+$/.test(supportEmail)) {
        return res.status(400).json({ success: false, message: "Enter a valid support email" });
      }
      s.supportEmail = supportEmail;
    }
    if (supportPhone !== undefined) s.supportPhone = supportPhone;
    if (typeof allowVendorRegistration === "boolean") s.allowVendorRegistration = allowVendorRegistration;
    if (typeof allowCustomerRegistration === "boolean") s.allowCustomerRegistration = allowCustomerRegistration;

    await s.save();
    res.json({ success: true, settings: s });
  } catch (error) {
    console.error("updateSettings error:", error);
    res.status(500).json({ success: false, message: "Failed to save settings" });
  }
};

module.exports = { getSettingsDoc, getPublicSettings, getSettings, updateSettings };