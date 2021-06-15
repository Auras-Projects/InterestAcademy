const express = require('express');
const app = express()
const config = require("./config")
const fs = require('fs');
const server = app.listen(config.PORT, () => {console.log(`Website running on http://localhost:${config.PORT}`)})
const io = require('socket.io')(server);
const QUESTIONS = 'questions.json';

app.set("view engine", 'ejs')
app.use(express.static("public"))

app.get("/", (req, res)=> res.render("index.ejs"))
app.get("/info", (req, res)=> res.render("info.ejs"))
app.get("/examples", (req, res) => res.render('examples.ejs'))
app.get("/form", (req, res) => res.render('form.ejs'))
app.get("/socials", (req, res) => res.render('socials.ejs'))
app.get("/createquestion", (req, res) => res.render('createquestion.ejs'))
app.get("/websites", (req, res) => res.render('websites.ejs'))
app.get("/playlists", (req, res) => res.render('playlists.ejs'))
app.get("/login", (req, res) => res.render('login.ejs'))
app.get("/questions", (req, res) => {
    const questions = JSON.parse(fs.readFileSync(QUESTIONS).toString());

    res.render('questions.ejs', {questions: questions})
})

io.on('connection', socket => {
    console.log(`New client: ${socket.id}`);

    socket.on('add-question', (data) => {
        var oldQuestions = JSON.parse(fs.readFileSync(QUESTIONS).toString());

        data.answer = '';

        oldQuestions.push(data);

        fs.writeFileSync(QUESTIONS, JSON.stringify(oldQuestions));

        socket.emit('added-question')
    })

    socket.on('login-check', (data)=>{
        if(data.user == config.userData.user) {
            if(data.pwd == config.userData.pwd) {
                return socket.emit('logged-in', true);
            }
        }

        console.log(data, config.userData);

        socket.emit('logged-in', false);
    })

    socket.on('answer-question', (data) => {
        var oldQuestions = JSON.parse(fs.readFileSync(QUESTIONS).toString());

        oldQuestions.forEach(element => {
            console.log(element);
            console.log(data);
            if(element.user == data.user && element.question == data.question) {
                element.answer = data.answer;
            }
        });

        fs.writeFileSync(QUESTIONS, JSON.stringify(oldQuestions));

        socket.emit('answered-question')
    })

    socket.on('delete-question', (data)=>{
        var oldQuestions = JSON.parse(fs.readFileSync(QUESTIONS).toString());
        var newQuestions = [];

        oldQuestions.forEach(element => {
            console.log(element);
            console.log(data);
            if(element.user != data.user && element.question != data.question) {
                newQuestions.push(element);
            }
        });

        fs.writeFileSync(QUESTIONS, JSON.stringify(newQuestions));

        socket.emit('deleted-question')
    })

    socket.on('test', (t) => console.log(t))
})