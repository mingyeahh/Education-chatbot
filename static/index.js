function checkUsername(e) {
    e.preventDefault();
    let username = document.getElementById("input-username").value;
    fetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username: username }),
        headers: { 'content-type': 'application/json' },
    }).then((response) => {
        if (response.ok) {
            localStorage.setItem("username", username)
            window.location.replace("/topic.html")
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
            localStorage.setItem("topic", topic)
            window.location.replace("/chatter.html")
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
        console.log(data)
        if (data.length > 0) {
            document.getElementById('topic-select').innerHTML = '';
            data.forEach((element, i) => {
                let newoption = `<option value="${i}">${element}</option>`
                document.getElementById('topic-select').innerHTML += newoption
            });
        }
    })
}