const socket = io('/');

$(document).ready(()=>{
    const navbar = document.querySelectorAll(".navbar-button")
    navbar.forEach((link)=>{
        $(link).on('click', (ev) => {
            var l = link.innerHTML.trim().toLowerCase();
            
            if(l == 'home') l = '';

            location.replace(`/${l}`)
        })
    })

    $('#question-creation-form').on('submit', (ev)=>{
        ev.preventDefault();

        const inputs = document.querySelectorAll('#question-creation-form input');
        const question = document.querySelector('#question-creation-form textarea');
        var empty = false;

        inputs.forEach(x => {
            if(!x.value) return empty = true;
        })

        if(!question.value) empty = true;

        if(empty) return alert('All inputs must be filled in.');

        socket.emit('add-question', {
            user: inputs[0].value + " " + inputs[1].value,
            email: inputs[2].value,
            question: question.value
        });

        socket.on('added-question', ()=>{
            alert('Added Question!')
            location.replace('/')
        })
    })

    $('.login-form').on('submit', (ev) => {
        ev.preventDefault();

        const inputs = document.querySelectorAll('.login-form input');
        var empty = false;

        inputs.forEach(x => {
            if(!x.value) return empty = true;
        });

        if(empty) return alert('All inputs must be filled.');

        socket.emit('login-check', {
            user: inputs[0].value,
            pwd: inputs[1].value
        })

        socket.on('logged-in', correct => {
            if(!correct) return alert('Access Denied.');

            sessionStorage.setItem('logged-in', true);
            alert('You are good to go!');

            location.replace('/questions')
        });
    })

    if(location.href.endsWith("question")) {
        $('.controls').html(`
            <h3>
                <button class='btn-back' onclick='deleteQuestion(event)'><i class="fa fa-trash" aria-hidden="true"></i></button> <button class='btn-back' onclick='addAnswer(prompt(), event)'><i class="fa fa-plus-circle" aria-hidden="true"></i></button>
            </h3>
        `)
    }

    initiateAnimation();
})

async function initiateAnimation() {
    const title = document.querySelector('.animating-logo');
    const text = "Interest Academy".split('');

    var i = 0;
    
    setInterval(()=>{
        typeChar(text[i], title);

        i++;
        
        if(i == text.length) {
            if(title.textContent.split('')[title.textContent.length - 1] == '|') title.textContent = title.textContent.substring(0, title.textContent.length - 1);
            return
        };
    }, 200)
}

function typeChar(char, title) {
    if(char == undefined) return;

    title.textContent = title.textContent.substring(0, title.textContent.length - 1)
    title.textContent += char + '|';
}

async function addAnswer(text, ev) {
    const excuseMeForNamingVariablesReallyBad = ev.target.parentElement.parentElement.parentElement.parentElement;

    const user = excuseMeForNamingVariablesReallyBad.querySelector('h2').textContent;
    const question = excuseMeForNamingVariablesReallyBad.querySelector('.questionthing').innerHTML;

    socket.emit('answer-question', {user: user, question: question, answer: text});
    socket.on('answered-question', ()=>{
        alert('Added Answer.')
        location.reload();
    })
}

async function deleteQuestion(ev) {
    const excuseMeForNamingVariablesReallyBad = ev.target.parentElement.parentElement.parentElement.parentElement;

    const user = excuseMeForNamingVariablesReallyBad.querySelector('h2').textContent;
    const question = excuseMeForNamingVariablesReallyBad.querySelector('.questionthing').innerHTML;

    socket.emit('delete-question', {user: user, question: question});
    socket.on('deleted-question', ()=>{
        alert('Deleted Question.')
        location.reload();
    })
}