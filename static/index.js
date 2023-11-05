function checkUsername(e) {
    e.preventDefault();
    let username = document.getElementById("input-username").value;
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
    });
}

function submitTopic(e) {
    e.preventDefault();
    let use_new_topic = document.getElementById("tab-new-tab").classList.contains("active");

    let topic_field = document.getElementById(use_new_topic ? "input-topic" : "topic-select");
    let topic = use_new_topic ? topic_field.value : topic_field.options[topic_field.selectedIndex].text;
    let username = localStorage.getItem("username");
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
    })

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
    })
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
            button.innerText = `${i + 1}. ${subtopic}`;
            let br = document.createElement("br");
            document.getElementById("subtopic-display").append(button, br);
            button.addEventListener("click", () => sendChosenSubtopic(subtopic));
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

function sendChosenSubtopic(subtopic) {
    let username = localStorage.getItem("username");
    let topic = localStorage.getItem("topic");
    document.getElementById("conversation").innerHTML = "<div class='loading'>Loading...</div>"
    document.getElementById("input-message").disabled = true;
    document.getElementById("send-button").disabled = true;
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
