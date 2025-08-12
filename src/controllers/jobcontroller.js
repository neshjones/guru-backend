const { db } = require('../config/firebase');

exports.listJobs = async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs').where('active', '==', true).get();
    const jobs = [];
    jobsSnapshot.forEach(doc => jobs.push({ id: doc.id, ...doc.data() }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

exports.myJobs = async (req, res) => {
  try {
    const userId = req.user.uid;
    const appsSnapshot = await db.collection('jobApplications').where('userId', '==', userId).get();
    const appliedJobs = [];
    for (const appDoc of appsSnapshot.docs) {
      const jobDoc = await db.collection('jobs').doc(appDoc.data().jobId).get();
      appliedJobs.push({ applicationId: appDoc.id, jobId: jobDoc.id, job: jobDoc.data() });
    }
    res.json(appliedJobs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your jobs' });
  }
};

exports.applyJob = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { jobId } = req.body;

    if (!jobId) return res.status(400).json({ message: 'Job ID required' });

    const existing = await db.collection('jobApplications')
      .where('userId', '==', userId)
      .where('jobId', '==', jobId)
      .get();

    if (!existing.empty) return res.status(400).json({ message: 'Already applied to this job' });

    await db.collection('jobApplications').add({
      userId,
      jobId,
      appliedAt: new Date()
    });

    res.json({ message: 'Job application successful' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to apply for job' });
  }
};

// Admin-only: create job
exports.createJob = async (req, res) => {
  try {
    const data = req.body;
    data.active = true;
    data.createdAt = new Date();

    const docRef = await db.collection('jobs').add(data);

    res.status(201).json({ message: 'Job created', jobId: docRef.id });
  } catch (error) {
    res.status(500).json({ message: 'Create job failed' });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    await db.collection('jobs').doc(jobId).update(updateData);

    res.json({ message: 'Job updated' });
  } catch (error) {
    res.status(500).json({ message: 'Update job failed' });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    await db.collection('jobs').doc(jobId).update({ active: false });

    res.json({ message: 'Job deleted (deactivated)' });
  } catch (error) {
    res.status(500).json({ message: 'Delete job failed' });
  }
};
