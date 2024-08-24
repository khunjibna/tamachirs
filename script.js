const relayUrls = [
    'wss://th2.nostr.earnkrub.xyz',
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://nostr.wine',
    'wss://relay.notoshi.win',
    'wss://relay.siamstr.com',
    'wss://relay.snort.social',
    'wss://th2.nostr.earnkrub.xyz',
];
const publicKey = '0f9da41389e1239d267c43105ecfc92273079e80c2d4b09e1d1e172701bd07d7'; // แทนที่ด้วย public key ของคุณ

const receivedProfiles = new Set(); // ใช้ Set เพื่อเก็บข้อมูลโปรไฟล์ที่ไม่ซ้ำกัน
const receivedNotes = new Map(); // ใช้ Map เพื่อเก็บข้อมูลโน้ตโดยใช้ event ID เป็น key

relayUrls.forEach(relayUrl => {
    const ws = new WebSocket(relayUrl);

    ws.onopen = () => {
        console.log(`Connected to relay: ${relayUrl}`);

        const profileRequest = ["REQ", "sub_id_1", {
            authors: [publicKey],
            kinds: [0] // kind 0 สำหรับโปรไฟล์
        }];

        const notesRequest = ["REQ", "sub_id_2", {
            authors: [publicKey],
            kinds: [1], // kind 1 สำหรับ notes (ข้อความสาธารณะ)
            limit: 2 // กำหนดจำนวน note ที่ต้องการดึง (เช่น 5 note ล่าสุด)
        }];

        ws.send(JSON.stringify(profileRequest));
        ws.send(JSON.stringify(notesRequest));

        // ดึงข้อมูลผู้ติดตามและผู้ที่คุณติดตามจาก JSON
        fetchFollowersAndFollowing();
    };

    ws.onmessage = (event) => {
        console.log(`Message from relay: ${relayUrl}`, event.data);
        try {
            const data = JSON.parse(event.data);
            console.log('Parsed data:', data);
            
            if (data[0] === "EVENT") {
                if (data[2].kind === 0) {
                    const profile = JSON.parse(data[2].content);
                    if (!receivedProfiles.has(profile.name)) {
                        receivedProfiles.add(profile.name);
                        displayProfile(profile);
                    }
                } else if (data[2].kind === 1) {
                    const eventId = data[2].id;
                    const noteContent = data[2].content;
                    if (!receivedNotes.has(eventId)) {
                        receivedNotes.set(eventId, noteContent);
                        displayNoteOrImage(noteContent);
                    }
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    ws.onerror = (error) => {
        console.error(`WebSocket error on relay ${relayUrl}:`, error);
    };

    ws.onclose = () => {
        console.log(`Disconnected from relay: ${relayUrl}`);
    };
});

function displayProfile(profile) {
    document.getElementById('profile-name').textContent = profile.name || 'N/A';
    document.getElementById('profile-about').textContent = profile.about || 'N/A';
    document.getElementById('profile-picture').src = profile.picture || 'default-avatar.png';
}

// ฟังก์ชันดึงข้อมูลผู้ติดตามและผู้ที่คุณติดตามจาก JSON
function fetchFollowersAndFollowing() {
    fetch('followers.json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('followers').textContent = `ผู้ติดตาม: ${data.followers}`;
            document.getElementById('following').textContent = `กำลังติดตาม: ${data.following}`;
        })
        .catch(error => {
            console.error('Error fetching followers and following data:', error);
        });
}

function displayNoteOrImage(note) {
    const notesDiv = document.getElementById('notes');
    
    // Regular expression to match image URLs
    const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i;
    const match = note.match(imageUrlRegex);

    if (match) {
        // If the note contains an image URL, create an <img> element
        const img = document.createElement('img');
        img.src = match[0];
        img.className = "bg-white p-3 rounded-lg shadow max-w-full h-auto";
        notesDiv.appendChild(img);
    } else {
        // If the note does not contain an image URL, display it as text
        const noteElement = document.createElement('p');
        noteElement.textContent = note;
        noteElement.className = "bg-white p-3 rounded-lg shadow text-gray-800";
        notesDiv.appendChild(noteElement);
    }
}

const articles = [
 
];

const articlesPerPage = 6;
let currentPage = 1;

function displayArticles(page) {
    const startIndex = (page - 1) * articlesPerPage;
    const endIndex = startIndex + articlesPerPage;
    const articlesToShow = articles.slice(startIndex, endIndex);

    const articlesDiv = document.getElementById('articles');
    articlesDiv.innerHTML = '';

    const rowDiv = document.createElement('div');
    rowDiv.className = "flex flex-wrap -mx-2";

    articlesToShow.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.className = "w-full sm:w-1/3 lg:w-1/3 px-2 mb-4";
        articleElement.innerHTML = `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <a href="${article.link}">
                    <img src="${article.image}" alt="${article.title}" class="w-full h-40 object-cover">
                </a>
                <div class="p-4">
                    <a href="${article.link}" class="block text-lg font-semibold text-blue-600 hover:underline">${article.title}</a>
                    <p class="text-sm text-gray-600">${article.subtitle}</p>
                </div>
            </div>
        `;
        rowDiv.appendChild(articleElement);
    });

    articlesDiv.appendChild(rowDiv);
}

function setupPagination() {
    const totalPages = Math.ceil(articles.length / articlesPerPage);
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayArticles(currentPage);
            setupPagination(); // เพื่อเปลี่ยนสีของปุ่มปัจจุบัน
        });
        paginationDiv.appendChild(pageButton);
    }
}

// เริ่มต้นการแสดงผลบทความ
displayArticles(currentPage);
setupPagination();
