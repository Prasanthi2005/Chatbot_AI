"use strict";

/*
=========================================================
 AI CHATBOT PRO
 VOICE INPUT

 Flow:

 Microphone
     ↓
 MediaRecorder
     ↓
 Flask /api/transcribe
     ↓
 Groq Whisper
     ↓
 Text
     ↓
 messageInput
     ↓
 User clicks Send
     ↓
 Existing /api/chat
     ↓
 AI Reply
=========================================================
*/


console.log("=========================================");
console.log("🎤 VOICE.JS STARTED");
console.log("=========================================");


/* =========================================================
   DOM ELEMENTS
========================================================= */

const voiceBtn =
    document.getElementById("voiceBtn");

const stopBtn =
    document.getElementById("stopBtn");

const sendBtn =
    document.getElementById("sendBtn");

const messageInput =
    document.getElementById("messageInput");

const chatForm =
    document.getElementById("chatForm");


console.log("voiceBtn:", voiceBtn);
console.log("stopBtn:", stopBtn);
console.log("messageInput:", messageInput);
console.log("sendBtn:", sendBtn);
console.log("chatForm:", chatForm);


/* =========================================================
   RECORDER VARIABLES
========================================================= */

let mediaRecorder = null;

let audioStream = null;

let audioChunks = [];

let isRecording = false;

let isTranscribing = false;


/* =========================================================
   STATUS
========================================================= */

function setVoiceStatus(text) {

    if (!messageInput) {
        return;
    }

    messageInput.placeholder = text;

}


/* =========================================================
   RESET BUTTONS
========================================================= */

function resetVoiceButtons() {

    isRecording = false;

    if (voiceBtn) {

        voiceBtn.style.display = "";

        voiceBtn.disabled = false;

        voiceBtn.classList.remove("recording");

        voiceBtn.innerHTML =
            '<i class="fas fa-microphone"></i>';

        voiceBtn.title =
            "Voice Input";

    }


    if (stopBtn) {

        stopBtn.style.display = "none";

        stopBtn.disabled = false;

    }

}


/* =========================================================
   STOP MICROPHONE TRACKS
========================================================= */

function closeMicrophone() {

    if (!audioStream) {
        return;
    }


    audioStream
        .getTracks()
        .forEach(function(track) {

            track.stop();

        });


    audioStream = null;

}


/* =========================================================
   START RECORDING
========================================================= */

async function startVoiceRecording() {

    if (isRecording) {
        return;
    }


    if (isTranscribing) {

        console.log(
            "⏳ Already transcribing..."
        );

        return;

    }


    console.log(
        "🎤 START VOICE"
    );


    /* -----------------------------------------
       Check browser
    ----------------------------------------- */

    if (!navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(
            "Your browser does not support microphone recording."
        );

        return;

    }


    if (
        typeof MediaRecorder ===
        "undefined"
    ) {

        alert(
            "MediaRecorder is not supported by this browser."
        );

        return;

    }


    try {

        /* -----------------------------------------
           Request microphone
        ----------------------------------------- */

        audioStream =
            await navigator.mediaDevices.getUserMedia({

                audio: {

                    echoCancellation: true,

                    noiseSuppression: true,

                    autoGainControl: true

                }

            });


        console.log(
            "✅ MICROPHONE PERMISSION GRANTED"
        );


        /* -----------------------------------------
           Recorder format
        ----------------------------------------- */

        let recorderOptions = {};


        if (
            MediaRecorder.isTypeSupported(
                "audio/webm;codecs=opus"
            )
        ) {

            recorderOptions.mimeType =
                "audio/webm;codecs=opus";

        }


        /* -----------------------------------------
           Create recorder
        ----------------------------------------- */

        mediaRecorder =
            new MediaRecorder(
                audioStream,
                recorderOptions
            );


        audioChunks = [];


        /* -----------------------------------------
           Audio data
        ----------------------------------------- */

        mediaRecorder.ondataavailable =
            function(event) {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    audioChunks.push(
                        event.data
                    );

                }

            };


        /* -----------------------------------------
           Recorder started
        ----------------------------------------- */

        mediaRecorder.onstart =
            function() {

                console.log(
                    "🔴 RECORDING STARTED"
                );

            };


        /* -----------------------------------------
           Recorder stopped
        ----------------------------------------- */

        mediaRecorder.onstop =
            async function() {

                console.log(
                    "🛑 RECORDING STOPPED"
                );


                closeMicrophone();


                await transcribeRecording();

            };


        /* -----------------------------------------
           Recorder error
        ----------------------------------------- */

        mediaRecorder.onerror =
            function(event) {

                console.error(
                    "❌ MEDIA RECORDER ERROR:",
                    event
                );


                closeMicrophone();

                resetVoiceButtons();

                setVoiceStatus(
                    "Type your message here..."
                );

            };


        /* -----------------------------------------
           START
        ----------------------------------------- */

        mediaRecorder.start(250);


        isRecording = true;


        /* -----------------------------------------
           UI
        ----------------------------------------- */

        if (voiceBtn) {

            voiceBtn.classList.add(
                "recording"
            );

            voiceBtn.innerHTML =
                '<i class="fas fa-microphone-slash"></i>';

            voiceBtn.title =
                "Recording... Click Stop";

        }


        if (stopBtn) {

            stopBtn.style.display =
                "inline-flex";

            stopBtn.disabled =
                false;

        }


        setVoiceStatus(
            "🎤 Listening... Speak now"
        );


        if (messageInput) {

            messageInput.value = "";

            messageInput.dispatchEvent(
                new Event(
                    "input", {
                        bubbles: true
                    }
                )
            );

        }


    } catch (error) {

        console.error(
            "❌ MICROPHONE ERROR:",
            error
        );


        closeMicrophone();

        resetVoiceButtons();


        if (
            error.name ===
            "NotAllowedError"
        ) {

            alert(
                "Microphone permission was denied.\n\n" +
                "Click the microphone/lock icon near the browser address bar and select Allow."
            );

        } else if (
            error.name ===
            "NotFoundError"
        ) {

            alert(
                "No microphone was found.\n\n" +
                "Please connect/check your microphone."
            );

        } else {

            alert(
                "Unable to start microphone:\n\n" +
                error.message
            );

        }

    }

}


/* =========================================================
   STOP RECORDING
========================================================= */

function stopVoiceRecording() {

    if (!mediaRecorder) {

        return;

    }


    if (
        mediaRecorder.state ===
        "inactive"
    ) {

        return;

    }


    console.log(
        "🛑 STOP BUTTON CLICKED"
    );


    setVoiceStatus(
        "⏳ Processing your voice..."
    );


    if (stopBtn) {

        stopBtn.disabled =
            true;

    }


    mediaRecorder.stop();

}


/* =========================================================
   TRANSCRIBE AUDIO
========================================================= */

async function transcribeRecording() {

    isTranscribing = true;


    try {

        console.log(
            "🧠 Preparing audio..."
        );


        if (!audioChunks ||
            audioChunks.length === 0
        ) {

            throw new Error(
                "No voice recording was captured."
            );

        }


        /* -----------------------------------------
           Create audio blob
        ----------------------------------------- */

        const audioBlob =
            new Blob(
                audioChunks, {
                    type: mediaRecorder &&
                        mediaRecorder.mimeType ?
                        mediaRecorder.mimeType :
                        "audio/webm"
                }
            );


        console.log(
            "🎧 AUDIO SIZE:",
            audioBlob.size
        );


        if (
            audioBlob.size < 1000
        ) {

            throw new Error(
                "Recording is too short. Please speak for at least one second."
            );

        }


        setVoiceStatus(
            "🧠 Converting voice to text..."
        );


        /* -----------------------------------------
           FormData
        ----------------------------------------- */

        const formData =
            new FormData();


        formData.append(
            "audio",
            audioBlob,
            "voice.webm"
        );


        /* -----------------------------------------
           Send to Flask
        ----------------------------------------- */

        console.log(
            "📤 Sending audio to /api/transcribe..."
        );


        const response =
            await fetch(
                "/api/transcribe", {
                    method: "POST",

                    body: formData,

                    credentials: "same-origin"
                }
            );


        console.log(
            "📥 TRANSCRIBE STATUS:",
            response.status
        );


        let data;


        try {

            data =
                await response.json();

        } catch (error) {

            throw new Error(
                "Server returned an invalid response."
            );

        }


        console.log(
            "📝 TRANSCRIPTION DATA:",
            data
        );


        /* -----------------------------------------
           Server error
        ----------------------------------------- */

        if (!response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                "Voice transcription failed."
            );

        }


        /* -----------------------------------------
           Get text
        ----------------------------------------- */

        const text =
            String(
                data.text || ""
            ).trim();


        if (!text) {

            throw new Error(
                "No speech was detected. Please try again."
            );

        }


        console.log(
            "✅ VOICE → TEXT:",
            text
        );


        /* -----------------------------------------
           Put text into chatbot input
        ----------------------------------------- */

        if (!messageInput) {

            throw new Error(
                "Chat input field was not found."
            );

        }


        messageInput.value =
            text;


        /* -----------------------------------------
           Trigger normal input events
        ----------------------------------------- */

        messageInput.dispatchEvent(
            new Event(
                "input", {
                    bubbles: true
                }
            )
        );


        messageInput.dispatchEvent(
            new Event(
                "change", {
                    bubbles: true
                }
            )
        );


        /* -----------------------------------------
           Focus input
        ----------------------------------------- */

        messageInput.focus();


        messageInput.selectionStart =
            messageInput.value.length;

        messageInput.selectionEnd =
            messageInput.value.length;


        /* -----------------------------------------
           Enable Send
        ----------------------------------------- */

        if (sendBtn) {

            sendBtn.disabled =
                false;

        }


        setVoiceStatus(
            "✅ Voice converted. Click Send to get AI reply."
        );


        console.log(
            "✅ READY TO SEND TO AI"
        );

    } catch (error) {

        console.error(
            "❌ TRANSCRIPTION ERROR:",
            error
        );


        setVoiceStatus(
            "❌ " +
            error.message
        );


    } finally {

        audioChunks = [];

        mediaRecorder = null;

        isTranscribing = false;

        resetVoiceButtons();

    }

}


/* =========================================================
   MIC BUTTON
========================================================= */

if (voiceBtn) {

    voiceBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            if (isRecording) {

                stopVoiceRecording();

            } else {

                startVoiceRecording();

            }

        }
    );

}


/* =========================================================
   STOP BUTTON
========================================================= */

if (stopBtn) {

    stopBtn.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            stopVoiceRecording();

        }
    );

}


/* =========================================================
   INITIAL STATE
========================================================= */

if (stopBtn) {

    stopBtn.style.display =
        "none";

}


console.log(
    "✅ MEDIARECORDER VOICE SYSTEM READY"
);

console.log(
    "========================================="
);