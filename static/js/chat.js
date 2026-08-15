/* =========================================================
   AI CHATBOT PRO
   chat.js
   Text + Files + Images + Voice + Theme
   ========================================================= */

"use strict";

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const chatForm = document.getElementById("chatForm");

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const voiceBtn =
    document.getElementById("voiceBtn");

const chatMessages =
    document.getElementById("chatMessages");

const conversationContainer =
    document.getElementById("conversationContainer");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const typingIndicator =
    document.getElementById("typingIndicator");

const charCounter =
    document.getElementById("charCounter");

const newChatBtn =
    document.getElementById("newChatBtn");

const themeToggle =
    document.getElementById("themeToggle");

const fileBtn =
    document.getElementById("fileBtn");

const fileInput =
    document.getElementById("fileInput");

const filePreview =
    document.getElementById("filePreview");
const aiVoiceAudio =
    document.getElementById("aiVoiceAudio");

/* =========================================================
   API CONFIGURATION
   ========================================================= */

const API_URL = "/api/chat";

const FILE_API_URL =
    "/api/analyze-file";

const IMAGE_API_URL =
    "/api/analyze-image";


/* =========================================================
   CONSTANTS
   ========================================================= */

const THEME_KEY = "AI_CHATBOT_THEME";

const MAX_MESSAGE_LENGTH = 4000;

const MAX_INPUT_HEIGHT = 160;


/* =========================================================
   APPLICATION STATE
   ========================================================= */

let selectedFiles = [];

let isSending = false;


/* =========================================================
   VOICE STATE
   ========================================================= */

let recognition = null;

let isRecording = false;

let voiceText = "";

let voiceRetryCount = 0;

const MAX_VOICE_RETRIES = 1;

let voiceStopRequested = false;


/* =========================================================
   DEBUG
   ========================================================= */

console.log("==========================================");
console.log("AI CHATBOT JS STARTED");
console.log("Message input:", messageInput);
console.log("Voice button:", voiceBtn);
console.log("Chat form:", chatForm);
console.log("==========================================");


/* =========================================================
   SCROLL TO BOTTOM
   ========================================================= */

function scrollToBottom() {

    if (!conversationContainer) {
        return;
    }

    requestAnimationFrame(() => {

        conversationContainer.scrollTop =
            conversationContainer.scrollHeight;

    });
}


/* =========================================================
   CURRENT TIME
   ========================================================= */

function currentTime() {

    return new Date().toLocaleTimeString(
        [], {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent =
        String(text || "");

    return div.innerHTML;
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(role, text) {

    if (!chatMessages) {
        return;
    }

    const wrapper =
        document.createElement("div");

    wrapper.className =
        `message ${role}`;

    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        role === "user" ?
        "🧑" :
        "🤖";

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    const textNode =
        document.createElement("div");

    textNode.className =
        "message-text";

    textNode.style.whiteSpace =
        "pre-wrap";

    textNode.textContent =
        String(text || "");

    const time =
        document.createElement("span");

    time.className =
        "message-time";

    time.textContent =
        currentTime();

    content.appendChild(textNode);

    content.appendChild(time);

    wrapper.appendChild(avatar);

    wrapper.appendChild(content);

    chatMessages.appendChild(wrapper);

    if (welcomeScreen) {

        welcomeScreen.style.display =
            "none";

    }

    scrollToBottom();
}


/* =========================================================
   ADD FILE MESSAGE
   ========================================================= */

function addFileMessage(files) {

    if (!files || files.length === 0) {
        return;
    }

    const title =
        files.length === 1 ?
        "📎 Attached file" :
        "📎 Attached files";

    const names =
        files.map(file => file.name);

    addMessage(
        "user",
        `${title}\n${names.join("\n")}`
    );
}


/* =========================================================
   LOADING
   ========================================================= */

function setLoading(loading) {

    isSending = loading;

    if (sendBtn) {
        sendBtn.disabled = loading;
    }

    if (fileBtn) {
        fileBtn.disabled = loading;
    }

    /*
       Do not disable voice while recording.
    */

    if (voiceBtn && !isRecording) {
        voiceBtn.disabled = loading;
    }

    if (typingIndicator) {

        if (loading) {

            typingIndicator.classList.remove(
                "hidden"
            );

        } else {

            typingIndicator.classList.add(
                "hidden"
            );

        }

    }

    scrollToBottom();
}


/* =========================================================
   RESIZE MESSAGE INPUT
   ========================================================= */

function resizeMessageInput() {

    if (!messageInput) {
        return;
    }

    messageInput.style.height =
        "auto";

    const height =
        Math.min(
            messageInput.scrollHeight,
            MAX_INPUT_HEIGHT
        );

    messageInput.style.height =
        `${height}px`;

    if (
        messageInput.scrollHeight >
        MAX_INPUT_HEIGHT
    ) {

        messageInput.style.overflowY =
            "auto";

    } else {

        messageInput.style.overflowY =
            "hidden";

    }

}


/* =========================================================
   CHARACTER COUNTER
   ========================================================= */

function updateCharacterCounter() {

    if (!messageInput ||
        !charCounter
    ) {
        return;
    }

    charCounter.textContent =
        `${messageInput.value.length} / ${MAX_MESSAGE_LENGTH}`;

}


/* =========================================================
   INPUT EVENT
   ========================================================= */

if (messageInput) {

    messageInput.addEventListener(
        "input",
        function() {

            resizeMessageInput();

            updateCharacterCounter();

        }
    );

}


/* =========================================================
   ENTER TO SEND
   ========================================================= */

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                if (
                    chatForm &&
                    !isSending
                ) {

                    chatForm.requestSubmit();

                }

            }

        }
    );

}


/* =========================================================
   FILE BUTTON
   ========================================================= */

if (
    fileBtn &&
    fileInput
) {

    fileBtn.addEventListener(
        "click",
        function() {

            if (isSending) {
                return;
            }

            fileInput.click();

        }
    );

}


/* =========================================================
   FILE INPUT
   ========================================================= */

if (fileInput) {

    fileInput.addEventListener(
        "change",
        function() {

            const files =
                Array.from(
                    fileInput.files || []
                );

            if (files.length === 0) {
                return;
            }

            files.forEach(
                function(file) {

                    const exists =
                        selectedFiles.some(
                            function(existingFile) {

                                return (
                                    existingFile.name === file.name &&
                                    existingFile.size === file.size &&
                                    existingFile.lastModified === file.lastModified
                                );

                            }
                        );

                    if (!exists) {

                        selectedFiles.push(
                            file
                        );

                    }

                }
            );

            showFilePreview();

        }
    );

}


/* =========================================================
   FILE PREVIEW
   ========================================================= */

function showFilePreview() {

    if (!filePreview) {
        return;
    }

    filePreview.innerHTML = "";

    if (
        selectedFiles.length === 0
    ) {

        filePreview.classList.add(
            "hidden"
        );

        return;

    }

    filePreview.classList.remove(
        "hidden"
    );

    selectedFiles.forEach(
        function(file, index) {

            const item =
                document.createElement("div");

            item.className =
                "file-item";

            let icon = "📄";

            const fileName =
                file.name.toLowerCase();

            if (
                file.type &&
                file.type.startsWith("image/")
            ) {

                icon = "🖼️";

            } else if (
                file.type ===
                "application/pdf"
            ) {

                icon = "📕";

            } else if (
                fileName.endsWith(".doc") ||
                fileName.endsWith(".docx")
            ) {

                icon = "📘";

            } else if (
                fileName.endsWith(".xls") ||
                fileName.endsWith(".xlsx")
            ) {

                icon = "📊";

            } else if (
                fileName.endsWith(".py")
            ) {

                icon = "🐍";

            } else if (
                fileName.endsWith(".js")
            ) {

                icon = "🟨";

            } else if (
                fileName.endsWith(".html")
            ) {

                icon = "🌐";

            } else if (
                fileName.endsWith(".css")
            ) {

                icon = "🎨";

            } else if (
                fileName.endsWith(".txt")
            ) {

                icon = "📝";

            }

            const name =
                document.createElement("span");

            name.className =
                "file-item-name";

            name.textContent =
                `${icon} ${file.name}`;

            const remove =
                document.createElement("button");

            remove.type =
                "button";

            remove.className =
                "file-remove";

            remove.textContent =
                "✕";

            remove.title =
                "Remove file";

            remove.addEventListener(
                "click",
                function() {

                    selectedFiles.splice(
                        index,
                        1
                    );

                    showFilePreview();

                }
            );

            item.appendChild(name);

            item.appendChild(remove);

            filePreview.appendChild(item);

        }
    );

}


/* =========================================================
   CLEAR SELECTED FILES
   ========================================================= */

function clearSelectedFiles() {

    selectedFiles = [];

    if (fileInput) {

        fileInput.value =
            "";

    }

    showFilePreview();

}


/* =========================================================
   🎤 VOICE INPUT
   IMPROVED VERSION
   ========================================================= */

console.log(
    "🎤 VOICE SYSTEM INITIALIZING..."
);


/* ---------------------------------------------------------
   CHECK BROWSER SUPPORT
   --------------------------------------------------------- */

const SpeechRecognitionAPI =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


console.log(
    "SpeechRecognition:",
    SpeechRecognitionAPI
);


/* ---------------------------------------------------------
   UPDATE VOICE BUTTON
   --------------------------------------------------------- */

function updateVoiceButton(
    recording
) {

    if (!voiceBtn) {
        return;
    }

    if (recording) {

        voiceBtn.classList.add(
            "recording"
        );

        voiceBtn.innerHTML =
            "🔴";

        voiceBtn.title =
            "Listening... Click to stop";

    } else {

        voiceBtn.classList.remove(
            "recording"
        );

        voiceBtn.innerHTML =
            "🎤";

        voiceBtn.title =
            "Voice Input";

    }

}


/* ---------------------------------------------------------
   VOICE STATUS
   --------------------------------------------------------- */

function setVoiceStatus(
    text
) {

    if (!messageInput) {
        return;
    }

    messageInput.placeholder =
        text;

}


/* ---------------------------------------------------------
   STOP VOICE UI
   --------------------------------------------------------- */

function resetVoiceUI() {

    isRecording =
        false;

    updateVoiceButton(
        false
    );

    setVoiceStatus(
        "Type your message..."
    );

    if (
        voiceBtn &&
        !isSending
    ) {

        voiceBtn.disabled =
            false;

    }

}


/* ---------------------------------------------------------
   BROWSER SUPPORT
   --------------------------------------------------------- */

if (!SpeechRecognitionAPI) {

    console.error(
        "❌ SpeechRecognition is not supported."
    );

    if (voiceBtn) {

        voiceBtn.disabled =
            true;

        voiceBtn.title =
            "Voice recognition is not supported by this browser";

    }

} else {

    console.log(
        "✅ SpeechRecognition supported"
    );


    /* -----------------------------------------------------
       CREATE RECOGNITION
       ----------------------------------------------------- */

    recognition =
        new SpeechRecognitionAPI();


    recognition.lang =
        "en-IN";

    recognition.continuous =
        false;

    recognition.interimResults =
        false;

    recognition.maxAlternatives =
        1;


    /* -----------------------------------------------------
       START
       ----------------------------------------------------- */

    recognition.onstart =
        function() {

            isRecording =
                true;

            voiceStopRequested =
                false;

            voiceText =
                "";

            console.log(
                "🎤 MICROPHONE STARTED"
            );

            updateVoiceButton(
                true
            );

            setVoiceStatus(
                "🎤 Listening... Speak now"
            );

        };


    /* -----------------------------------------------------
       RESULT
       ----------------------------------------------------- */

    recognition.onresult =
        function(event) {

            console.log(
                "🎤 RESULT RECEIVED",
                event
            );

            let text =
                "";

            for (
                let i = event.resultIndex; i < event.results.length; i++
            ) {

                if (
                    event.results[i] &&
                    event.results[i][0]
                ) {

                    text +=
                        event.results[i][0].transcript;

                }

            }

            text =
                text.trim();

            console.log(
                "🎤 CONVERTED TEXT:",
                text
            );

            if (
                messageInput &&
                text
            ) {

                voiceText =
                    text;

                messageInput.value =
                    text;

                messageInput.dispatchEvent(
                    new Event(
                        "input", {
                            bubbles: true
                        }
                    )
                );

                resizeMessageInput();

                updateCharacterCounter();

                messageInput.focus();

                messageInput.selectionStart =
                    messageInput.value.length;

                messageInput.selectionEnd =
                    messageInput.value.length;

                console.log(
                    "✅ VOICE → TEXT SUCCESS"
                );

            }

        };


    /* -----------------------------------------------------
       ERROR
       ----------------------------------------------------- */

    recognition.onerror =
        function(event) {

            const errorType =
                event.error || "unknown";

            console.error(
                "❌ VOICE ERROR:",
                errorType
            );


            /*
               IMPORTANT:

               Do NOT show an alert for network errors.

               Browser SpeechRecognition uses a browser/
               external speech service. A temporary network
               failure can happen even when your Flask app
               and internet are working.
            */

            if (
                errorType ===
                "network"
            ) {

                console.warn(
                    "⚠️ Speech recognition network error."
                );

                /*
                   Retry only once.
                */

                if (
                    voiceRetryCount <
                    MAX_VOICE_RETRIES &&
                    !voiceStopRequested
                ) {

                    voiceRetryCount++;

                    setVoiceStatus(
                        "🌐 Connection issue. Retrying voice recognition..."
                    );

                    console.log(
                        "🔄 Retrying voice recognition..."
                    );

                    setTimeout(
                        function() {

                            if (
                                recognition &&
                                !isRecording &&
                                !voiceStopRequested
                            ) {

                                try {

                                    recognition.start();

                                } catch (error) {

                                    console.error(
                                        "Retry start error:",
                                        error
                                    );

                                    resetVoiceUI();

                                    setVoiceStatus(
                                        "Voice unavailable. Please try again."
                                    );

                                }

                            }

                        },
                        800
                    );

                } else {

                    console.warn(
                        "Voice retry limit reached."
                    );

                    resetVoiceUI();

                    /*
                       Do not show a blocking popup.
                    */

                    if (messageInput) {

                        messageInput.placeholder =
                            "Voice unavailable. Try again or type your message...";

                    }

                }

                return;
            }


            /* -------------------------------------------------
               MICROPHONE PERMISSION
               ------------------------------------------------- */

            if (
                errorType ===
                "not-allowed" ||
                errorType ===
                "service-not-allowed"
            ) {

                resetVoiceUI();

                alert(
                    "Microphone permission is blocked.\n\n" +
                    "Click the microphone/site settings icon in the browser address bar and select Allow."
                );

                return;
            }


            /* -------------------------------------------------
               NO SPEECH
               ------------------------------------------------- */

            if (
                errorType ===
                "no-speech"
            ) {

                resetVoiceUI();

                if (messageInput) {

                    messageInput.placeholder =
                        "No speech detected. Click 🎤 and try again.";

                }

                return;
            }


            /* -------------------------------------------------
               AUDIO CAPTURE
               ------------------------------------------------- */

            if (
                errorType ===
                "audio-capture"
            ) {

                resetVoiceUI();

                alert(
                    "Microphone could not be accessed.\n\n" +
                    "Please check that your microphone is connected and not being used by another application."
                );

                return;
            }


            /* -------------------------------------------------
               ABORT
               ------------------------------------------------- */

            if (
                errorType ===
                "aborted"
            ) {

                console.log(
                    "Voice recognition aborted."
                );

                resetVoiceUI();

                return;
            }


            /* -------------------------------------------------
               OTHER ERROR
               ------------------------------------------------- */

            resetVoiceUI();

            console.warn(
                "Voice recognition error:",
                errorType
            );

            if (messageInput) {

                messageInput.placeholder =
                    "Voice error. Please try again.";

            }

        };


    /* -----------------------------------------------------
       END
       ----------------------------------------------------- */

    recognition.onend =
        function() {

            console.log(
                "🎤 MICROPHONE ENDED"
            );

            const finalVoiceText =
                voiceText.trim();

            isRecording =
                false;

            updateVoiceButton(
                false
            );

            setVoiceStatus(
                "Type your message..."
            );


            /*
               Automatically send only if:

               1. Voice produced text
               2. User did not manually stop before
               3. AI is not already responding
            */

            if (
                finalVoiceText &&
                !voiceStopRequested &&
                chatForm &&
                !isSending
            ) {

                console.log(
                    "🤖 Sending voice text to AI:",
                    finalVoiceText
                );

                setTimeout(
                    function() {

                        if (
                            messageInput &&
                            messageInput.value.trim() &&
                            !isSending
                        ) {

                            chatForm.requestSubmit();

                        }

                    },
                    300
                );

            }

            voiceText =
                "";

            voiceStopRequested =
                false;

        };


    /* -----------------------------------------------------
       VOICE BUTTON CLICK
       ----------------------------------------------------- */

    if (voiceBtn) {

        voiceBtn.addEventListener(
            "click",
            async function() {

                console.log(
                    "🎤 VOICE BUTTON CLICKED"
                );


                /* -----------------------------------------
                   STOP RECORDING
                   ----------------------------------------- */

                if (isRecording) {

                    console.log(
                        "🛑 Stopping recognition..."
                    );

                    voiceStopRequested =
                        true;

                    try {

                        recognition.stop();

                    } catch (error) {

                        console.error(
                            "Stop error:",
                            error
                        );

                        resetVoiceUI();

                    }

                    return;
                }


                /* -----------------------------------------
                   DON'T START WHILE AI IS RESPONDING
                   ----------------------------------------- */

                if (isSending) {

                    console.log(
                        "AI is currently responding."
                    );

                    return;

                }


                /* -----------------------------------------
                   CHECK MEDIA DEVICES
                   ----------------------------------------- */

                if (!navigator.mediaDevices ||
                    !navigator.mediaDevices.getUserMedia
                ) {

                    alert(
                        "Microphone access is not available in this browser."
                    );

                    return;

                }


                /* -----------------------------------------
                   RESET VOICE STATE
                   ----------------------------------------- */

                voiceRetryCount =
                    0;

                voiceText =
                    "";

                voiceStopRequested =
                    false;


                /* -----------------------------------------
                   REQUEST MICROPHONE PERMISSION
                   ----------------------------------------- */

                try {

                    console.log(
                        "🎙️ Requesting microphone permission..."
                    );

                    const stream =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true
                        });

                    console.log(
                        "✅ MICROPHONE PERMISSION GRANTED"
                    );


                    /*
                       We only needed this stream to check
                       permission. SpeechRecognition handles
                       the microphone itself.
                    */

                    stream
                        .getTracks()
                        .forEach(
                            function(track) {

                                track.stop();

                            }
                        );

                } catch (error) {

                    console.error(
                        "❌ MICROPHONE PERMISSION ERROR:",
                        error
                    );

                    resetVoiceUI();

                    alert(
                        "Microphone permission is required.\n\n" +
                        "Please allow Microphone access for this website and try again."
                    );

                    return;

                }


                /* -----------------------------------------
                   CLEAR OLD TEXT
                   ----------------------------------------- */

                if (messageInput) {

                    messageInput.value =
                        "";

                    messageInput.dispatchEvent(
                        new Event(
                            "input", {
                                bubbles: true
                            }
                        )
                    );

                    resizeMessageInput();

                    updateCharacterCounter();

                }


                /* -----------------------------------------
                   START SPEECH RECOGNITION
                   ----------------------------------------- */

                try {

                    console.log(
                        "🎤 Starting SpeechRecognition..."
                    );

                    recognition.start();

                } catch (error) {

                    console.error(
                        "❌ RECOGNITION START ERROR:",
                        error
                    );

                    resetVoiceUI();

                    /*
                       InvalidStateError can happen if
                       recognition is already running.
                    */

                    if (
                        error.name ===
                        "InvalidStateError"
                    ) {

                        console.warn(
                            "Recognition was already running."
                        );

                    } else {

                        if (messageInput) {

                            messageInput.placeholder =
                                "Could not start voice input. Try again.";

                        }

                    }

                }

            }
        );

    }

}


/* =========================================================
   💬 SEND NORMAL TEXT MESSAGE
   ========================================================= */

async function sendMessage(message) {

    console.log(
        "Sending message:",
        message
    );

    const response =
        await fetch(
            API_URL, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "Accept": "application/json"
                },

                body: JSON.stringify({
                    message: message
                })
            }
        );

    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            `Server returned invalid response (${response.status}).`
        );

    }

    if (!response.ok) {

        throw new Error(
            data.reply ||
            data.error ||
            `Request failed (${response.status})`
        );

    }

    const reply =
        data.reply ||
        data.response ||
        data.message ||
        data.answer;

    if (!reply) {

        throw new Error(
            "No response received from AI."
        );

    }

    return reply;

}

/* =========================================================
   🔊 GROQ TEXT TO SPEECH
   AI REPLY -> VOICE
   ========================================================= */

async function speakAIReply(text) {

    if (!text || !text.trim()) {
        return;
    }

    try {

        console.log("🔊 Generating AI voice...");

        const response = await fetch("/api/tts", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },

            body: JSON.stringify({
                text: text
            })

        });

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.error ||
                "Text-to-speech failed."
            );

        }

        console.log(
            "✅ AI voice generated:",
            data.audio_url
        );

        if (!aiVoiceAudio) {
            console.warn(
                "Audio element not found."
            );
            return;
        }

        /*
         * Add timestamp so browser doesn't
         * play old cached audio.
         */

        aiVoiceAudio.src =
            data.audio_url +
            "?t=" +
            Date.now();

        aiVoiceAudio.hidden = false;

        aiVoiceAudio.load();

        await aiVoiceAudio.play();

        console.log("🔊 AI VOICE PLAYING");

    } catch (error) {

        console.error(
            "❌ TTS ERROR:",
            error
        );

    }
}

/* =========================================================
   📄 UPLOAD FILE
   ========================================================= */

async function uploadFile(
    file,
    message = ""
) {

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "message",
        message
    );

    const response =
        await fetch(
            FILE_API_URL, {
                method: "POST",

                headers: {
                    "Accept": "application/json"
                },

                body: formData
            }
        );

    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            `File analysis returned invalid response (${response.status}).`
        );

    }

    if (!response.ok) {

        throw new Error(
            data.error ||
            data.reply ||
            `File analysis failed (${response.status}).`
        );

    }

    return data;

}


/* =========================================================
   🖼️ UPLOAD IMAGE
   ========================================================= */

async function uploadImage(
    file,
    message = ""
) {

    const formData =
        new FormData();

    formData.append(
        "image",
        file
    );

    formData.append(
        "message",
        message
    );

    const response =
        await fetch(
            IMAGE_API_URL, {
                method: "POST",

                headers: {
                    "Accept": "application/json"
                },

                body: formData
            }
        );

    let data = {};

    try {

        data =
            await response.json();

    } catch (error) {

        throw new Error(
            `Image analysis returned invalid response (${response.status}).`
        );

    }

    if (!response.ok) {

        throw new Error(
            data.error ||
            data.reply ||
            `Image analysis failed (${response.status}).`
        );

    }

    return data;

}


/* =========================================================
   EXTRACT REPLY
   ========================================================= */

function extractReply(data) {

    if (!data) {
        return "";
    }

    return (
        data.reply ||
        data.response ||
        data.message ||
        data.answer ||
        data.result ||
        ""
    );

}


/* =========================================================
   CHECK IMAGE
   ========================================================= */

function isImageFile(file) {

    if (!file) {
        return false;
    }

    if (
        file.type &&
        file.type.startsWith("image/")
    ) {

        return true;

    }

    const name =
        file.name.toLowerCase();

    return (
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png") ||
        name.endsWith(".webp") ||
        name.endsWith(".gif") ||
        name.endsWith(".bmp")
    );

}


/* =========================================================
   ANALYZE SELECTED FILES
   ========================================================= */

async function analyzeSelectedFiles(
    files,
    message
) {

    const replies = [];

    for (
        const file of files
    ) {

        let data;

        if (
            isImageFile(file)
        ) {

            console.log(
                "Analyzing image:",
                file.name
            );

            data =
                await uploadImage(
                    file,
                    message
                );

        } else {

            console.log(
                "Analyzing file:",
                file.name
            );

            data =
                await uploadFile(
                    file,
                    message
                );

        }

        const reply =
            extractReply(data);

        if (reply) {

            replies.push(
                `📄 ${file.name}\n\n${reply}`
            );

        } else {

            replies.push(
                `📄 ${file.name}\n\nFile analyzed successfully, but no response was returned.`
            );

        }

    }

    return replies.join(
        "\n\n────────────────────\n\n"
    );

}


/* =========================================================
   🚀 CHAT FORM SUBMIT
   ========================================================= */

if (chatForm) {

    chatForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            console.log(
                "CHAT FORM SUBMITTED"
            );

            if (isSending) {
                return;
            }

            const message =
                messageInput ?
                messageInput.value.trim() :
                "";

            const files = [...selectedFiles];


            /* -----------------------------------------
               EMPTY CHECK
               ----------------------------------------- */

            if (!message &&
                files.length === 0
            ) {

                if (messageInput) {
                    messageInput.focus();
                }

                return;

            }


            /* -----------------------------------------
               CHARACTER LIMIT
               ----------------------------------------- */

            if (
                message.length >
                MAX_MESSAGE_LENGTH
            ) {

                addMessage(
                    "bot",
                    "⚠️ Message is too long. Please keep it under 4000 characters."
                );

                return;

            }


            /* -----------------------------------------
               SHOW USER MESSAGE
               ----------------------------------------- */

            if (message) {

                addMessage(
                    "user",
                    message
                );

            }


            /* -----------------------------------------
               SHOW FILE MESSAGE
               ----------------------------------------- */

            if (
                files.length > 0
            ) {

                addFileMessage(
                    files
                );

            }


            /* -----------------------------------------
               CLEAR TEXTAREA
               ----------------------------------------- */

            if (messageInput) {

                messageInput.value =
                    "";

                messageInput.style.height =
                    "50px";

                messageInput.style.overflowY =
                    "hidden";

            }

            updateCharacterCounter();


            /* -----------------------------------------
               START LOADING
               ----------------------------------------- */

            setLoading(true);

            try {

                let finalReply =
                    "";


                /* =====================================
                   TEXT ONLY
                   ===================================== */

                if (
                    message &&
                    files.length === 0
                ) {

                    console.log(
                        "💬 Sending normal text..."
                    );

                    finalReply =
                        await sendMessage(
                            message
                        );

                }


                /* =====================================
                   FILE / IMAGE
                   ===================================== */
                else if (
                    files.length > 0
                ) {

                    console.log(
                        "📎 Analyzing files..."
                    );

                    finalReply =
                        await analyzeSelectedFiles(
                            files,
                            message
                        );

                }




                /* -------------------------------------
   SHOW AI RESPONSE + 🔊 VOICE
   ------------------------------------- */

                if (finalReply) {

                    // Show AI text
                    addMessage(
                        "bot",
                        finalReply
                    );

                    // 🔊 Convert AI reply to voice
                    await speakAIReply(finalReply);

                } else {

                    addMessage(
                        "bot",
                        "⚠️ No response received from AI."
                    );

                }

                clearSelectedFiles();

            } catch (error) {

                console.error(
                    "❌ Chat API Error:",
                    error
                );

                addMessage(
                    "bot",
                    `⚠️ ${
                        error.message ||
                        "AI service unavailable."
                    }`
                );

            } finally {

                setLoading(false);

                if (messageInput) {
                    messageInput.focus();
                }

            }

        }
    );

}


/* =========================================================
   🆕 NEW CHAT
   ========================================================= */

if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function() {

            if (isSending) {
                return;
            }

            if (chatMessages) {

                chatMessages.innerHTML =
                    "";

            }

            if (welcomeScreen) {

                welcomeScreen.style.display =
                    "flex";

            }

            if (messageInput) {

                messageInput.value =
                    "";

                messageInput.style.height =
                    "50px";

                messageInput.style.overflowY =
                    "hidden";

                messageInput.focus();

            }

            clearSelectedFiles();

            updateCharacterCounter();

            scrollToBottom();

        }
    );

}


/* =========================================================
   🌙 THEME
   ========================================================= */

function applyTheme(theme) {

    if (!document.body) {
        return;
    }

    if (theme === "light") {

        document.body.classList.add(
            "light"
        );

        if (themeToggle) {

            themeToggle.textContent =
                "☀️";

            themeToggle.title =
                "Switch to dark mode";

        }

    } else {

        document.body.classList.remove(
            "light"
        );

        if (themeToggle) {

            themeToggle.textContent =
                "🌙";

            themeToggle.title =
                "Switch to light mode";

        }

    }

    localStorage.setItem(
        THEME_KEY,
        theme
    );

}


/* =========================================================
   THEME TOGGLE
   ========================================================= */

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        function() {

            const nextTheme =
                document.body.classList.contains(
                    "light"
                ) ?
                "dark" :
                "light";

            applyTheme(
                nextTheme
            );

        }
    );

}


/* =========================================================
   LOAD SAVED THEME
   ========================================================= */

const savedTheme =
    localStorage.getItem(
        THEME_KEY
    ) || "dark";

applyTheme(
    savedTheme
);


/* =========================================================
   INITIALIZE
   ========================================================= */

if (messageInput) {

    messageInput.style.height =
        "50px";

    messageInput.style.overflowY =
        "hidden";

    updateCharacterCounter();

}

showFilePreview();

scrollToBottom();


/* =========================================================
   FINAL DEBUG
   ========================================================= */

console.log("==========================================");

console.log(
    "✅ AI Chatbot Pro chat.js loaded"
);

console.log(
    "Text API:",
    API_URL
);

console.log(
    "File API:",
    FILE_API_URL
);

console.log(
    "Image API:",
    IMAGE_API_URL
);

console.log(
    "🎤 Voice Input: ENABLED"
);

console.log("==========================================");