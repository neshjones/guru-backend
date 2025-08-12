require('dotenv').config();
const app = require('./app'); // Corrected path

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
