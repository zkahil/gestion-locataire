// frontend-web/src/services/apiConfig.js

const API_BASE_URL = process.env.NODE_ENV === 'production'
    ? 'https://gestion-locataire-jack.vercel.app/'
    : 'http://localhost:3000/api';

export default API_BASE_URL;