
const baseUrl = 'http://localhost:3001/api';

async function testBorrow() {
    try {
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student@example.com',
                password: 'password123'
            })
        });

        const text = await loginRes.text();
        console.log('Login Status:', loginRes.status);
        console.log('Login Raw Body:', text);

        const loginData = JSON.parse(text);
        if (!loginData.token) {
            console.error('No token in response');
            return;
        }

        const token = loginData.token;

        const borrowRes = await fetch(`${baseUrl}/borrows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bookId: 1 })
        });

        const borrowText = await borrowRes.text();
        console.log('Borrow Status:', borrowRes.status);
        console.log('Borrow Body:', borrowText);
    } catch (err) {
        console.error('Test failed:', err);
    }
}

testBorrow();
