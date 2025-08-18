const { admin, db } = require("../config/firebase");


const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  return regex.test(password);
};

exports.register = async (req, res) => {
  try {
    const { email, password, accountType, referralCode } = req.body;

    if (!email || !password || !accountType) {
      return res.status(400).json({ message: "Email, password and account type are required" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 6 characters, include a number and a special character",
      });
    }

    // 🔹 Check if email already exists
    try {
      await admin.auth().getUserByEmail(email);
      return res.status(400).json({ message: "Email already registered. Please log in or reset your password." });
    } catch (err) {
      if (err.code !== "auth/user-not-found") throw err;
    }

    let registrationFee, referralReward;
    if (accountType === "3_jobs") {
      registrationFee = parseInt(process.env.REGISTRATION_FEE_3_JOBS);
      referralReward = parseInt(process.env.REFERRAL_REWARD_1500);
    } else if (accountType === "7_jobs") {
      registrationFee = parseInt(process.env.REGISTRATION_FEE_7_JOBS);
      referralReward = parseInt(process.env.REFERRAL_REWARD_5000);
    } else {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // 🔹 Create new user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });

    // 🔹 Save user in Firestore
    await db.collection("users").doc(userRecord.uid).set({
      email,
      accountType,
      registrationFee,
      referralReward,
      referralCodeUsed: referralCode || null,
      referralsEarned: 0,
      jobsAllowed: accountType === "3_jobs" ? 3 : 7,
      paymentVerified: false,
      role: "user",
      createdAt: new Date(),
      balance: 0,
      accountActive: false,
    });

    // 🔹 If referral code provided
    if (referralCode) {
      const referrerDoc = await db.collection("users").doc(referralCode).get();
      if (referrerDoc.exists) {
        await db.collection("referrals").add({
          referrerId: referralCode,
          referredId: userRecord.uid,
          accountType,
          reward: referralReward,
          createdAt: new Date(),
        });

        await db.collection("users").doc(referralCode).update({
          referralsEarned: admin.firestore.FieldValue.increment(1),
          balance: admin.firestore.FieldValue.increment(referralReward),
        });
      }
    }

    return res.status(201).json({
      message: "User registered. Please verify your email and pay registration fee.",
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: error.message || "Registration failed" });
  }
};

exports.login = async (req, res) => {
  res.status(501).json({ message: "Login is handled on frontend via Firebase Authentication SDK" });
};
