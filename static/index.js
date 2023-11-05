loading_svg = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="#white" d="M304 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zm0 416a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM48 304a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm464-48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM142.9 437A48 48 0 1 0 75 369.1 48 48 0 1 0 142.9 437zm0-294.2A48 48 0 1 0 75 75a48 48 0 1 0 67.9 67.9zM369.1 437A48 48 0 1 0 437 369.1 48 48 0 1 0 369.1 437z"/></svg>`;
send_svg = `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="white" d="M16.1 260.2c-22.6 12.9-20.5 47.3 3.6 57.3L160 376V479.3c0 18.1 14.6 32.7 32.7 32.7c9.7 0 18.9-4.3 25.1-11.8l62-74.3 123.9 51.6c18.9 7.9 40.8-4.5 43.9-24.7l64-416c1.9-12.1-3.4-24.3-13.5-31.2s-23.3-7.5-34-1.4l-448 256zm52.1 25.5L409.7 90.6 190.1 336l1.2 1L68.2 285.7zM403.3 425.4L236.7 355.9 450.8 116.6 403.3 425.4z" /></svg>`;

function checkUsername(e) {
    e.preventDefault();
    let username = document.getElementById("input-username").value;
    document.getElementById("input-username").disabled = true;
    document.getElementById("index-submit").innerText = "Loading...";
    document.getElementById("index-submit").disabled = true;
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username: username }),
        headers: { 'content-type': 'application/json' },
    }).then((response) => {
        if (response.ok) {
            localStorage.setItem("username", username);
            window.location.replace("/topic.html");
        } else {
            return response.text();
        }
    }).then(err => {
        console.error(err);
        document.getElementById("input-username").disabled = false;
        document.getElementById("index-submit").innerText = "Sign in / sign up";
        document.getElementById("index-submit").disabled = false;
    });
}

function submitTopic(e) {
    e.preventDefault();
    let use_new_topic = document.getElementById("tab-new-tab").classList.contains("active");

    let topic_field = document.getElementById(use_new_topic ? "input-topic" : "topic-select");
    let topic = use_new_topic ? topic_field.value : topic_field.options[topic_field.selectedIndex].text;
    let username = localStorage.getItem("username");
    document.getElementById("input-topic").disabled = true;
    document.getElementById("topic-select").disabled = true;
    document.getElementById("submit-with-input").disabled = true;
    document.getElementById("submit-with-select").disabled = true;
    document.getElementById("submit-with-input").innerHTML = loading_svg;
    document.getElementById("submit-with-select").innerHTML = loading_svg;
    fetch('/topic', {
        method: 'POST',
        body: JSON.stringify({ username: username, topic: topic }),
        headers: { 'content-type': 'application/json' },
    }).then((res) => {
        if (res.ok) {
            localStorage.setItem("topic", topic);
            window.location.replace("/chatter.html");
        } else {
            return res.text();
        }
    }).then(err => {
        console.log(err);
        document.getElementById("input-topic").disabled = false;
        document.getElementById("topic-select").disabled = false;
        document.getElementById("submit-with-input").disabled = false;
        document.getElementById("submit-with-select").disabled = false;
        document.getElementById("submit-with-input").innerHTML = send_svg;
        document.getElementById("submit-with-select").innerHTML = send_svg;
    });
}

function getHistoryTopic() {
    let username = localStorage.getItem("username");
    fetch('/topics', {
        method: 'POST',
        body: JSON.stringify({ username: username }),
        headers: { 'content-type': 'application/json' },
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            return res.text().then(err => { console.error(err); return false; });
        }
    }).then(data => {
        if (!data) return;
        if (data.length > 0) {
            document.getElementById('topic-select').innerHTML = '';
            data.forEach((element, i) => {
                let newoption = `<option value="${i}">${element}</option>`;
                document.getElementById('topic-select').innerHTML += newoption;
            });
        }
    });
}

function setupClassroom() {
    let username = localStorage.getItem("username");
    let topic = localStorage.getItem("topic");
    document.getElementById("topic").innerText = topic;
    fetch("/subtopics", {
        method: 'POST',
        body: JSON.stringify({ username: username, topic: topic }),
        headers: { 'content-type': 'application/json' },
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            return res.text().then(err => {
                console.error(err); return false;
            });
        }
    }).then(data => {
        if (!data) return;
        let subtopics = data;
        document.getElementById("subtopic-display").innerHTML = '';
        subtopics.forEach((subtopic, i) => {
            let button = document.createElement("button");
            button.setAttribute("type", "button");
            button.classList.add("subtopic-button");
            button.innerText = `${i + 1}. ${subtopic}`;
            let br = document.createElement("br");
            document.getElementById("subtopic-display").append(button, br);
            button.addEventListener("click", () => sendChosenSubtopic(subtopic, button));
        });
    });
}

function messageToHTML(role, content) {
    let newRole = document.createElement("div");
    newRole.innerText = role == "assistant" ? "Chatbot" : "You";
    newRole.classList.add("role");
    newRole.classList.add(role == "assistant" ? "assistant" : "human");
    let newContent = document.createElement("div");
    newContent.innerText = content;
    newContent.classList.add("content");
    newContent.classList.add(role == "assistant" ? "assistant" : "human");
    return [newRole, newContent];
}

function sendChosenSubtopic(subtopic, button) {
    if (button.classList.contains("active")) {
        button.classList.remove("active");
        document.getElementById("subtitle").classList.add("col-12");
        document.getElementById("subtitle").classList.remove("col-4");
        document.getElementById("chatting-box").classList.add("hidden");
        document.getElementById("right-header").innerText = "blank";
        document.getElementById("left-header").innerHTML = "Topic: <span id='topic'></span>";
        document.getElementById("topic").innerText = localStorage.getItem("topic");
        localStorage.removeItem("subtopic");
        return;
    }
    let username = localStorage.getItem("username");
    let topic = localStorage.getItem("topic");
    document.getElementById("conversation").innerHTML = "<div class='loading'>Loading...</div>"
    document.getElementById("input-message").disabled = true;
    document.getElementById("send-button").disabled = true;
    document.getElementById("subtitle").classList.remove("col-12");
    document.getElementById("subtitle").classList.add("col-4");
    document.getElementById("chatting-box").classList.remove("hidden");
    document.getElementById("left-header").innerText = "Subtopics";
    document.getElementById("right-header").innerHTML = "Topic: <span id='topic'></span>";
    document.getElementById("topic").innerText = topic;
    Array.from(document.getElementsByClassName("subtopic-button")).forEach(element => {
        element.classList.remove("active");
    });
    fetch("/subtopic", {
        method: 'POST',
        body: JSON.stringify({ username: username, topic: topic, subtopic: subtopic }),
        headers: { 'content-type': 'application/json' },
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            return res.text().then(err => {
                console.error(err); return false;
            });
        }
    }).then(data => {
        if (!data) return;
        document.getElementById("conversation").innerHTML = "";
        data.forEach((turn) => {
            let role = turn.role;
            if (role == "system") return;
            let content = turn.content;
            let newElems = messageToHTML(role, content);
            document.getElementById("conversation").append(...newElems);
        });
        document.getElementById("input-message").disabled = false;
        document.getElementById("send-button").disabled = false;
        button.classList.add("active");
        localStorage.setItem("subtopic", subtopic);
    });
}

function sendMessage(e) {
    e.preventDefault();
    let username = localStorage.getItem("username");
    let topic = localStorage.getItem("topic");
    let subtopic = localStorage.getItem("subtopic");
    let message = document.getElementById("input-message").value;
    document.getElementById("conversation").innerHTML += "<div class='loading'>Loading...</div>";
    document.getElementById("input-message").disabled = true;
    document.getElementById("send-button").disabled = true;
    fetch("/message", {
        method: 'POST',
        body: JSON.stringify({ username: username, topic: topic, subtopic: subtopic, message: message }),
        headers: { 'content-type': 'application/json' },
    }).then((res) => {
        if (res.ok) {
            return res.json();
        } else {
            return res.text().then(err => {
                console.error(err); return false;
            });
        }
    }).then(data => {
        if (!data) return;
        let conversationDiv = document.getElementById("conversation");
        conversationDiv.removeChild(conversationDiv.lastChild); // remove "loading..."
        let newElemsUser = messageToHTML("user", message);
        let newElemsAsst = messageToHTML(data.role, data.content);
        conversationDiv.append(...newElemsUser, ...newElemsAsst);
        document.getElementById("input-message").disabled = false;
        document.getElementById("send-button").disabled = false;
    });
}
