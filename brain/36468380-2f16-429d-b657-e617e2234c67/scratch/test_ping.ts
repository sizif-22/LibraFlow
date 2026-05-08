
const baseUrl = 'http://localhost:3001';

async function testPing() {
    try {
        const res = await fetch(`${baseUrl}/ping`);
        const data = await res.json();
        console.log('Ping Response:', data);
    } catch (err) {
        console.error('Ping Failed:', err);
    }
}

testPing();
