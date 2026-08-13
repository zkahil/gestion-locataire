const BASE_URL = 'http://localhost:3000';

let token = null;

async function request(method, url, body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (token) {
        options.headers.Authorization = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${url}`, options);

        const text = await response.text();

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        console.log(`\n${method} ${url}`);
        console.log(`HTTP ${response.status}`);
        console.log(data);

        return {
            status: response.status,
            data
        };
    } catch (error) {
        console.error(`❌ ${method} ${url}`);
        console.error(error.message);
        return null;
    }
}

async function test() {

    console.log('========================================');
    console.log('   TEST API GESTION LOCATIVE');
    console.log('========================================');

    // 1. Health
    await request('GET', '/health');

    // 2. Login
    console.log('\n========== LOGIN ==========');

    const login = await request(
        'POST',
        '/api/auth/login',
        {
            email: 'admin@loc.fr',
            password: 'admin123'
        }
    );

    if (!login || !login.data.token) {
        console.error('\n❌ LOGIN IMPOSSIBLE');
        process.exit(1);
    }

    token = login.data.token;

    console.log('\n✅ Login réussi');
    console.log('Utilisateur:', login.data.user);

    // 3. Espaces
    await request('GET', '/api/espaces');

    // 4. Locataires
    await request('GET', '/api/locataires');

    // 5. Contrats
    await request('GET', '/api/contrats');

    // 6. Factures
    await request('GET', '/api/factures');

    // 7. Paiements
    await request('GET', '/api/paiements');

    // 8. Cautions
    await request('GET', '/api/cautions');

    // 9. Alertes
    await request('GET', '/api/alertes');

    // 10. Sites
    await request('GET', '/api/sites');

    // 11. Étages
    await request('GET', '/api/etages');

    // 12. Users
    await request('GET', '/api/auth/users');

    console.log('\n========================================');
    console.log('          TEST TERMINÉ');
    console.log('========================================');
}

test();
