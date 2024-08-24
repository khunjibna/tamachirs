const relayUrl = 'wss://relay.damus.io'; // แทนที่ด้วย URL ของ relay ที่คุณใช้
const publicKey = '0f9da41389e1239d267c43105ecfc92273079e80c2d4b09e1d1e172701bd07d7'; // แทนที่ด้วย public key ของคุณ


const ws = new WebSocket(relayUrl);

ws.onopen = () => {
    console.log('Connected to relay');

    const request = ["REQ", "sub_id_1", {
        authors: [publicKey],
        kinds: [0] // kind 0 สำหรับโปรไฟล์
    }];

    ws.send(JSON.stringify(request));
};

ws.onmessage = (event) => {
    console.log('Raw message:', event.data);
    try {
        const data = JSON.parse(event.data);
        console.log('Parsed data:', data);
        
        if (data[0] === "EVENT" && data[2].kind === 0) {
            const profile = JSON.parse(data[2].content);
            console.log('Profile data:', profile);
            displayProfile(profile);
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

ws.onerror = (error) => {
    console.error('WebSocket error: ', error);
};

ws.onclose = () => {
    console.log('Disconnected from relay');
};

function displayProfile(profile) {
    document.getElementById('profile-name').textContent = profile.name || 'N/A';
    document.getElementById('profile-about').textContent = profile.about || 'N/A';
    document.getElementById('profile-picture').src = profile.picture || 'default-avatar.png';
}
