
document.addEventListener("DOMContentLoaded", () => {
    const isLoggedIn = localStorage.getItem("loggedIn") === "true";
    const username = localStorage.getItem("username");
    const currentGroup = localStorage.getItem("currentGroup");
    const joinedGroups = JSON.parse(localStorage.getItem("joinedGroups")) || [];

    // Check if user is logged in and has a valid username
    if (!isLoggedIn || !username) {
        alert("Please log in or register to access the chat.");
        window.location.href = "homepage.html"; 
        return;
    }

    // Check if the user has joined the group
    if (!currentGroup || !joinedGroups.includes(currentGroup)) {
        alert("Please join the group to access the chat.");
        window.location.href = "groups.html"; 
        return;
    }

    // Initialize chat functionality for the specific group
    initializeChat(currentGroup);
    initializeAnnouncements(currentGroup);
});

// for file upload
document.addEventListener("DOMContentLoaded", () => {
    // Ensure the elements are correctly selected
    const fileInput = document.getElementById("file-input");
    const uploadBtn = document.getElementById("upload-btn");
    const fileListElement = document.getElementById("file-list");

    // Handle file upload
    uploadBtn.addEventListener("click", () => {
        const file = fileInput.files[0];  // Get the first file selected
        if (file) {
            // Create a file display element
            const fileItem = document.createElement("div");
            fileItem.textContent = file.name; // Display the file name
            fileListElement.appendChild(fileItem);  // Add the file to the list
            fileInput.value = ""; // Clear the file input field after uploading
        } else {
            alert("Please select a file to upload.");
        }
    });
});


function initializeChat(groupName) {
    const messagesArea = document.getElementById("messages-area");
    const messageInput = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    // Ensure that elements exist before proceeding
    if (!messagesArea || !messageInput || !sendBtn) {
        console.error("Required DOM elements are missing!");
        return;
    }

    const username = localStorage.getItem("username") || "Anonymous";
    const groupChatKey = `groupChatMessages_${groupName}`;

    // Display the current group name in the chat header
    const groupHeader = document.getElementById("chat-group-name");
    if (groupHeader) {
        groupHeader.textContent = groupName || "Unknown Group";
    } else {
        console.error("Group header element not found!");
    }

    // Load chat history from localStorage
    const loadMessages = () => {
        const chatMessages = JSON.parse(localStorage.getItem(groupChatKey)) || [];
        messagesArea.innerHTML = ""; // Clear existing messages

        // Display all messages in the chat window
        chatMessages.forEach(message => {
            displayMessage(message);
        });

        // Scroll to the latest message
        messagesArea.scrollTop = messagesArea.scrollHeight;
    };

    // Display a single message
    const displayMessage = (message) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");

        // If the message is from the current user, add special styling
        if (message.username === username) {
            messageElement.classList.add("current-user");
        }

        const userElement = document.createElement("span");
        userElement.classList.add("username");
        userElement.textContent = message.username;

        const timestampElement = document.createElement("span");
        timestampElement.classList.add("timestamp");
        timestampElement.textContent = ` - ${message.timestamp}`;

        const textElement = document.createElement("p");
        textElement.textContent = message.text;

        messageElement.appendChild(userElement);
        messageElement.appendChild(timestampElement);
        messageElement.appendChild(textElement);

        messagesArea.appendChild(messageElement);
    };

    // Save the message to localStorage
    const saveMessage = (message) => {
        const chatMessages = JSON.parse(localStorage.getItem(groupChatKey)) || [];
        chatMessages.push(message);
        localStorage.setItem(groupChatKey, JSON.stringify(chatMessages));
    };

    // Handle the send button click event
    const sendMessage = () => {
        const text = messageInput.value.trim();
        if (text === "") {
            console.log("Empty message. Ignoring send.");
            return;
        }

        const message = {
            username: username,
            text: text,
            timestamp: new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit' })
        };

        console.log("Sending message:", message);
        displayMessage(message);
        saveMessage(message);

        // Clear input and scroll to the latest message
        messageInput.value = "";
        messagesArea.scrollTop = messagesArea.scrollHeight;
    };

    // Event listener for send button click
    sendBtn.addEventListener("click", () => {
        console.log("Send button clicked");
        sendMessage();
    });

    // Event listener for pressing the "Enter" key
    messageInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            console.log("Enter key pressed");
            sendMessage();
        }
    });

    // Load the initial messages when the page loads
    loadMessages();
}

// Initialize the announcements section
// Modify the announcement functionality
document.addEventListener("DOMContentLoaded", () => {
    const announcementInput = document.getElementById("announcement-input");
    const postAnnouncementBtn = document.getElementById("post-announcement-btn");
    const announcementList = document.getElementById("announcement-list");

    // Function to post a new announcement
    const postAnnouncement = () => {
        const announcementText = announcementInput.value.trim();
        if (!announcementText) {
            alert("Please enter an announcement.");
            return;
        }

        const username = localStorage.getItem("username") || "Anonymous";
        const timestamp = new Date().getTime();  // Store the current timestamp in milliseconds

        const announcement = {
            username: username,
            text: announcementText,
            timestamp: timestamp,
        };

        // Get existing announcements from localStorage or initialize an empty array
        const existingAnnouncements = JSON.parse(localStorage.getItem("groupAnnouncements")) || [];
        existingAnnouncements.push(announcement);

        // Save updated announcements to localStorage
        localStorage.setItem("groupAnnouncements", JSON.stringify(existingAnnouncements));

        // Clear the input field and reload announcements
        announcementInput.value = "";
        loadAnnouncements();
    };

    // Function to load announcements and remove old ones
    const loadAnnouncements = () => {
        const now = new Date().getTime();
        const groupAnnouncements = JSON.parse(localStorage.getItem("groupAnnouncements")) || [];

        // Filter out announcements that are older than 3 days (3 * 24 * 60 * 60 * 1000 ms = 259200000 ms)
        const validAnnouncements = groupAnnouncements.filter(announcement => now - announcement.timestamp <= 259200000);

        // Save filtered announcements back to localStorage
        localStorage.setItem("groupAnnouncements", JSON.stringify(validAnnouncements));

        // Clear the existing list before reloading
        announcementList.innerHTML = "";

        // Render the announcements
        validAnnouncements.forEach(announcement => {
            const announcementElement = document.createElement("div");
            announcementElement.classList.add("announcement");

            const usernameElement = document.createElement("span");
            usernameElement.classList.add("announcement-username");
            usernameElement.textContent = announcement.username;

            const timestampElement = document.createElement("span");
            timestampElement.classList.add("announcement-timestamp");
            timestampElement.textContent = new Date(announcement.timestamp).toLocaleString();

            const announcementTextElement = document.createElement("p");
            announcementTextElement.textContent = announcement.text;

            // Append to the announcement element
            announcementElement.appendChild(usernameElement);
            announcementElement.appendChild(timestampElement);
            announcementElement.appendChild(announcementTextElement);

            // Append to the list
            announcementList.appendChild(announcementElement);
        });
    };

    // Event listener for posting a new announcement
    postAnnouncementBtn.addEventListener("click", postAnnouncement);

    // Load announcements on page load
    loadAnnouncements();
});
