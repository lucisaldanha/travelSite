// After installing Express by npm,
// we load/import the Express module in main application file
const express = require('express');  
const bodyParser = require('body-parser'); // importing middleware for form handling
const app = express(); // create the app object, our Express application, by calling top-level express() function
const path = require('path');

// import module, created and located in lib folder
const fortune = require('./lib/fortune.js');


// set up express-handlebars view engine (template framework)
// load the express-handlebars modules, create a default layout called main
const handlebars = require('express-handlebars')
                .create({defaultLayout: 'main'});
                
app.engine('handlebars', handlebars.engine); // register handlebars constant as the view template engine
app.set('view engine', 'handlebars');

// static middleware(express.static) designates one or more directions containing static resources
app.use(express.static(path.join(__dirname + '/public')));

// middleware to parse the incoming URL-encoded body 
app.use(bodyParser.urlencoded( { extended: true} )) // parse application/x-www-form-urlencoded

// add home route or root path, for two cases, '/' and 'home' routes
// use app.render to render view (home.handlebar) and send 
// rendered HTML strings to the client
app.get(['/','/home'],(req,res) => {
    // view engine will specify content type default text/html
    // res.render method renders a view, defaults to a response code of 200
    // and sends the rendered HTML string to the client 
    res.render('home');
});

// res.render defaults to a response code of 200;
app.get(('/about'),(req,res) => {
    res.render('about',{ cookie: fortune.getFortune() } );
});

app.get(('/newsletter-signup'),(req,res) => {
    res.render('newsletter-signup', { csrf: 'CSRF token goes here' });
});
// handling POST request from FORM   (newsletter-signup view) to redirect to a 'thank-you' view
app.post('/process', (req,res) => {
    console.log('Form (from querystring:) ' + req.query.form);
    console.log('CSRF token (from hidden field:) ' + req.body._csrf);
    console.log('Name (from visible field:) ' + req.body.name);
    console.log('Email (from visible field:) ' + req.body.email);
    res.redirect(303, '/thank-you'); // server redirects to path/url
});

 // custom 404 page
 // 404 catch-all handler(mounting the speciefied callback 
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

app.listen(app.get('port'), () =>{
    console.log('Express started on http:localhost:' +
    app.get('port') + ' ; press Ctrl + C to terminate,');

});

