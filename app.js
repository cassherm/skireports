//this handles all the server side logic and express.js things

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
//unsure if this is the correct way to handle other machines accessing the ip based website. this might
//be where my deployment was going wrong?
const server = http.createServer(app).listen(PORT, '0.0.0.0');
const io = socketIo(server);

// ... other server setup code

io.on('connection', (socket) => {
    // handle socket events
});

// ... rest of your server code


const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const puppeteer = require('puppeteer');

// Serve static files from the 'public' directory. other setup
app.use(express.static('public'));
app.set('views', './views');
app.set('view engine', 'ejs');

//need this for messages I think
app.use(bodyParser.urlencoded({ extended: true }));

//this nabs the index and renders
app.get('/', (req, res) => {
    res.render('index', 
   
    );
});

async function scrapeSnowReports() {
    // Launch Puppeteer and navigate to the snow report page
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://snocountry.com/snow-report/colorado/');

    // Console log for debugging before starting the scraping process
    // console.log("BEFORE SCRAPE");

    //kept this in case I needed it after debugging 
    await page.waitForTimeout(200);

    // Evaluate the page to extract snow report elements
    const snowReports = await page.evaluate(() => {
        // grabbing all of the "resort" selectors 
        const snowReportElements = Array.from(document.querySelectorAll('.resort.open, .resort.pto'));

        // Map through each snow report element and extract relevant data
        return snowReportElements.map(element => {
            // Query for the title element within the current snow report element
            const titleElement = element.querySelector("#container-snow-reports .resort__header h2");

            // Check if the selector exists before extracting the title
            // If titleElement exists, assign its text content to the variable title; otherwise, assign null to title.
            const title = titleElement ? titleElement.innerText : null;

            // Only proceed if the title exists. otherwise everything crashes
            if (title !== null) {
                // Query for the temperature element within the current snow report element
                //this is how I would handle pulling in any other conditions information for a further developed version
                const tempElement = element.querySelector('.resort__header-weather-detail-temp');

                // Check if the selector exists before extracting the temperature
                // If tempElement exists, assign its text content to the variable temp; otherwise, assign null to temp.
                const temp = tempElement ? tempElement.innerText : null;

                // Add more elements to scrape and add to the card object if needed
                return {
                    title,
                    temp,
                    //TODO add more properties
                };
            }

            // Skip creating the card for this element if title doesn't exist so I don't get a card w an ugly undefined msg
            return null;
        }).filter(card => card !== null); // Filter out null entries (elements without the title selector)
    });

    // Close the Puppeteer browser instance
    await browser.close();

    // Return the scraped snow reports to the route (to scrapeddata)
    return snowReports;
}




// Socket.IO logic. Sends new data to the page every minute regardless of refreshes
// This is more useful if I were scraping alerts, which I will if/when I expand this 
//site's functionality for my portfolio and enjoyment
io.on('connection', (socket) => {
    console.log('A user connected');

    
    setInterval(() => {
        scrapeSnowReports().then((data) => {
            // Emit the data to all connected clients
            io.emit('snowReports', data);
        });
    }, 60000);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});


// Route to handle scraping and sending data to the front end
//don't need an ejs since don't need to visualize anything!
//this is not strictly necessary since the socket also emits data to the front end,
//but since I don't have that refreshing constantly this seems smart to have. That and I don't think the socket is working
//properly at this point due to GET errors in my web console
app.get('/snowReports', async (req, res) => {
    try {
        //receives the scraped data from the asynch function
        const scrapedData = await scrapeSnowReports();
        //get it to the front end
        res.send(scrapedData); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//start express.js server
const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
