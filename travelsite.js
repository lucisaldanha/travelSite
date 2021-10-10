// After installing Express by npm,
// we load/import the Express module in main application file
const express = require('express');  
const bodyParser = require('body-parser'); // importing middleware for form handling
const app = express(); // create the app object, our Express application, by calling top-level express() function
const path = require('path');
const formidable = require('formidable'); // install formidable to parse form data(file uploads);
// import module, created and located in lib folder
const fortune = require('./lib/fortune.js');
// const darkTheme = require('./lib/darkTheme.js');
const credentials = require('./credentials.js'); //importing credentials to application
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan'); //colorful dev logging

// set up express-handlebars view engine (template framework)
// load the express-handlebars modules, create a default layout called main
const handlebars = require('express-handlebars')
                .create({defaultLayout: 'main'});
                
app.engine('handlebars', handlebars.engine); // register handlebars constant as the view template engine
app.set('view engine', 'handlebars');

// static middleware(express.static) designates one or more directions containing static resources
app.use(express.static(path.join(__dirname + '/public')));

// middleware to parse the incoming URL-encoded body from forms
app.use(bodyParser.urlencoded( { extended: true} )) // parse application/x-www-form-urlencoded

app.use(cookieParser(credentials.cookieSecret)); 
app.use(session({
    resave:false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
}));

//log requests made by user on browser on development environment 
// if (app.get('env') == 'development') app.use(morgan('combined'));

// to view workers being logged and which receives request and other info needed
app.use(function(req,res,next){
    const cluster = require('cluster');
    if (cluster.isWorker) console.log('Worker %d received request',
        cluster.worker.id, req.method);
    next();
});

// add home route or root path, for two cases, '/' and 'home' routes;
// use app.render to render view (home.handlebars)
app.get(['/','/home'],(req,res) => {
    // view engine will specify content type default text/html
    // res.render method renders a view, defaults to a response code of 200
    // sending rendered HTML string to the client 
    res.render('home');
});

// res.render defaults to a response code of 200;
app.get('/about',(req,res) => {
    res.render('about',{ cookie: fortune.getFortune() } );
});

app.get('/newsletter-signup',(req,res) => {
    res.render('newsletter-signup', { csrf: 'CSRF token goes here' });
});

app.get('/experiences', (req,res) => {
    res.render('experiences');
});

app.get('/signin',(req,res) => {
    // const now = new Date();
    res.render('signin');
    // console.log(now);
});

// take form from SIGN IN AND POST IT
app.post('/processSignIn', (req,res) => {
    console.log('Form (from querystring:) ' + req.query.form);
    console.log('CSRF token (from hidden field:) ' + req.body._csrf);
    console.log('Name (from visible field:) ' + req.body.name);
    console.log('Email (from visible field:) ' + req.body.email);
    console.log('Email (from visible field:) ' + req.body.country);
    console.log('Email (from visible field:) ' + req.body.city);
    res.redirect(303, 'sign-log'); // server redirects to path/url
});

app.get('/sign-log', (req,res, next) => {
    res.render('home');
   
});


app.get('/register',(req,res) => {
    // const now = new Date();
    res.render('register');
    // console.log(now);
});
// take form from REGISTER AND POST IT
app.post('/processRegister', (req,res) => {
    console.log('Form (from querystring:) ' + req.query.form);
    console.log('CSRF token (from hidden field:) ' + req.body._csrf);
    console.log('Name (from visible field:) ' + req.body.name);
    console.log('Email (from visible field:) ' + req.body.email);
    console.log('country (from visible field:) ' + req.body.country);
    console.log('city (from visible field:) ' + req.body.city);
    res.redirect(303, 'thank-you-register'); // server redirects to path/url
});

app.get('/thank-you-register', (req,res, next) => {
    res.render('thank-you-register');
   
});

app.get('/resetPassword',(req,res) => {
    // const now = new Date();
    res.render('resetPassword');
    // console.log(now);
});
// take form from RESET PASSWORD AND POST IT
app.post('/processResetPassword', (req,res) => {
    console.log('Form (from querystring:) ' + req.query.form);
    console.log('CSRF token (from hidden field:) ' + req.body._csrf);
    console.log('Email (from visible field:) ' + req.body.email);
    res.redirect(303, 'feedbackResetPass'); // server redirects to path/url
});

app.get('/feedbackResetPass', (req,res, next) => {
    res.render('feedbackResetPass');
   
});



app.get('/news-thank-you', (req,res, next) => {
    res.render('news-thank-you');
   
});


// handling POST request from FORM (action attribute path)(newsletter-signup view) to redirect to a 'thank-you' view
app.post('/process', (req,res) => {
    console.log('Form (from querystring:) ' + req.query.form);
    console.log('CSRF token (from hidden field:) ' + req.body._csrf);
    console.log('Name (from visible field:) ' + req.body.name);
    console.log('Email (from visible field:) ' + req.body.email);
    res.redirect(303, 'news-thank-you'); // server redirects to path/url
});

app.get('/contest/vacation-photo',(req,res) => {
    const now = new Date();
    res.render('contest/vacation-photo',{
        year: now.getFullYear(), 
        month: now.getMonth()
    });
    // console.log(now);
});

app.post('/contest/vacation-photo/:year/:month', (req,res) =>{
    // using formidable to parse form data, creating new form
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields,files) =>{
        if (err) {
            return res.redirect(303,'/error');
        }
        console.log('received fields:');
        console.log( fields);
        console.log('received files:');
        console.log(files);
        res.redirect(303,'/contest-thank-you');
        
    });
});

app.get('/contest-thank-you', (req,res) => {
    res.render('contest-thank-you');
});


 // custom 404 page
 // 404 catch-all handler(mounting the specified callback 
 // middleware function)(app.use adds that). Catchs all other path cases not
 // specified above in other routes
app.use((req,res,next) => {
    // setting path to 404 or response will have 200 status
    res.status(404).render('404');
});

 // custom 500 page
 // 500 error handler(middleware)
 app.use((err,req,res, next) => {
    console.error(err.stack);
    res.status(500).render('500');
});

// disabling Express's default X-Powered-By header(which is sent via response object's headers)
// x-powered-by is one of application settings that can be disable/enable
app.disable('x-powered-by');


// app.set(name, value) method in express
app.set('port', process.env.PORT || 3000);

// getting which execution environment we have our app running with app.get('env')

// changed to add node clusters 
const startServer = () => {
    app.listen(app.get('port'), () => {
        console.log('Express started in ' + app.get('env') + 
        ' mode on http://localhost:' + app.get('port') + 
        '; press Ctrl + C to terminate.');
    });
};

if (require.main === module) {
    //application runs directly; start app server
    // a script runs directly
    startServer();
} else {
    //application is imported via a module require:export function to create server
    // script has been loaded from another script using require
    module.exports = startServer;
}