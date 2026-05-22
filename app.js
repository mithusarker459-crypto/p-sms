// app.js
import { db } from "./firebase-config.js";
import { ref, set, push, onValue, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

// DOM Elements
const loginContainer = document.getElementById("login-container");
const chatContainer = document.getElementById("chat-container");
const usernameInput = document.getElementById("username-input");
const loginBtn = document.getElementById("login-btn");
const userProfileName = document.getElementById("user-profile-name");
const usersListBox = document.getElementById("users-list-box");
const activeChatPartnerName = document.getElementById("active-chat-partner");
const chatMessagesBox = document.getElementById("chat-messages-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");

let currentUser = null; 
let activeChatPartnerId = null; 
let currentChatId = null; 

// ১. লগইন লজিক (Realtime Database-এ ইউজার তৈরি)
loginBtn.addEventListener("click", async () => {
    const name = usernameInput.value.trim();
    if (!name) return alert("দয়া করে একটি নাম লিখুন!");

    const uid = "user_" + Date.now(); 
    currentUser = { uid, name };

    // 'users/uid' নোডে ডেটা সেভ করা
    await set(ref(db, 'users/' + uid), currentUser);

    userProfileName.textContent = `আমি: ${name}`;
    loginContainer.classList.add("hidden");
    chatContainer.classList.remove("hidden");

    // ইউজার লিস্ট রিয়েল-টাইমে লোড করা
    listenUserList();
});

// ২. একটিভ ইউজারদের তালিকা রিয়েল-টাইমে নিয়ে আসা
function listenUserList() {
    const usersRef = ref(db, 'users');
    onValue(usersRef, (snapshot) => {
        usersListBox.innerHTML = "";
        const users = snapshot.val();
        
        if (users) {
            Object.keys(users).forEach((key) => {
                const user = users[key];
                // নিজেকে বাদ দিয়ে বাকিদের দেখানো
                if (user.uid !== currentUser.uid) {
                    const userItem = document.createElement("div");
                    userItem.classList.add("user-item");
                    userItem.textContent = user.name;
                    
                    userItem.addEventListener("click", () => startChat(user));
                    usersListBox.appendChild(userItem);
                }
            });
        }
    });
}

// ৩. চ্যাট রুম সিলেক্ট করা
function startChat(partner) {
    activeChatPartnerId = partner.uid;
    activeChatPartnerName.textContent = partner.name;
    chatMessagesBox.innerHTML = "";

    // ইউনিক চ্যাট আইডি তৈরি
    currentChatId = currentUser.uid < partner.uid ? `${currentUser.uid}_${partner.uid}` : `${partner.uid}_${currentUser.uid}`;

    // রিয়েল-টাইম মেসেজ লিসেনার চালু করা
    listenMessages();
}

// ৪. রিয়েল-টাইমে মেসেজ রিসিভ করা
function listenMessages() {
    const messagesRef = ref(db, 'chats/' + currentChatId);
    
    onValue(messagesRef, (snapshot) => {
        chatMessagesBox.innerHTML = "";
        const messages = snapshot.val();
        
        if (messages) {
            Object.keys(messages).forEach((key) => {
                const msg = messages[key];
                const msgDiv = document.createElement("div");
                msgDiv.classList.add("message");
                
                if (msg.senderId === currentUser.uid) {
                    msgDiv.classList.add("sent");
                } else {
                    msgDiv.classList.add("received");
                }

                msgDiv.textContent = msg.text;
                chatMessagesBox.appendChild(msgDiv);
            });
            // স্ক্রল অটোমেটিক নিচে নামানোর জন্য
            chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
        }
    });
}

// ৫. মেসেজ পাঠানো
async function handleSendMessage() {
    const text = messageInput.value.trim();
    if (!text || !currentChatId) return;

    messageInput.value = ""; // ইনপুট ক্লিয়ার

    const messagesRef = ref(db, 'chats/' + currentChatId);
    const newDocRef = push(messagesRef); // অটোমেটিক নতুন ইউনিক কি (Key) তৈরি করবে

    await set(newDocRef, {
        senderId: currentUser.uid,
        text: text,
        timestamp: serverTimestamp() // রিয়েল-টাইম সার্ভার টাইমস্ট্যাম্প
    });
}

sendBtn.addEventListener("click", handleSendMessage);
messageInput.addEventListener("keypress", (e) => { if (e.key === 'Enter') handleSendMessage(); });


