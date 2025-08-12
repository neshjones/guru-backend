const { admin, db } = require('../config/firebase');

const validatePassword = (password) => {
  const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
  return regex.test(password);
};

exports.register = async (req, res) => {
  try {
    const { email, password, accountType, referralCode } = req.body;

    if (!email || !password || !accountType) {
      return res.status(400).json({ message: 'Email, password and account type are required' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters, include a number and a special character'
      });
    }

    let registrationFee, referralReward;
    if (accountType === '3_jobs') {
      registrationFee = parseInt(process.env.REGISTRATION_FEE_3_JOBS);
      referralReward = parseInt(process.env.REFERRAL_REWARD_1500);
    } else if (accountType === '7_jobs') {
      registrationFee = parseInt(process.env.REGISTRATION_FEE_7_JOBS);
      referralReward = parseInt(process.env.REFERRAL_REWARD_5000);
    } else {
      return res.status(400).json({ message: 'Invalid account type' });
    }

    // Create user with Firebase Admin
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
      disabled: false,
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      accountType,
      registrationFee,
      referralReward,
      referralCodeUsed: referralCode || null,
      referralsEarned: 0,
      jobsAllowed: accountType === '3_jobs' ? 3 : 7,
      paymentVerified: false,
      role: 'user',
      createdAt: new Date(),
      balance: 0,
      accountActive: false,
    });

    // If referral code present, record referral (simplified: assume referralCode is referrer's userId)
    if (referralCode) {
      const referrerDoc = await db.collection('users').doc(referralCode).get();
      if (referrerDoc.exists) {
        await db.collection('referrals').add({
          referrerId: referralCode,
          referredId: userRecord.uid,
          accountType,
          reward: referralReward,
          createdAt: new Date()
        });
        await db.collection('users').doc(referralCode).update({
          referralsEarned: admin.firestore.FieldValue.increment(1),
          balance: admin.firestore.FieldValue.increment(referralReward),
        });
      }
    }

    res.status(201).json({
      message: 'User registered. Please verify your email and pay registration fee.',
      uid: userRecord.uid,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  // Firebase client SDK handles login; backend can verify tokens.
  res.status(501).json({ message: 'Login handled by Firebase client SDK' });
};
