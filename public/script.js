$(document).ready(function() {
    // Fetch data from the server initially
    $.ajax({
        url: '/snowReports', // Endpoint to fetch JSON data from the server
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            // Initial data received successfully, update the UI
            updateUI(data);
        },
        error: function(error) {
            // Handle error if data fetching fails
            console.error('Error fetching data:', error);
        }
    });

    // Connect to the Socket.IO server
    const socket = io.connect('http://http://172.173.176.202/:3000');


    //having socket issues. trying to debug. this does print that i have a transport error
    //I have no idea how to fix this, I've been trying, and I think it's too late to get help
    //but I'd appreciate some input post grading
    
    socket.on('connect_error', (error) => {
        console.error('Connection Error:', error);
    });

    // Listen for 'snowReports' events from the server
    socket.on('snowReports', function(data) {
        // Real-time update received, update the UI
        updateUI(data);
    });

    // Function to update the UI with new data
    function updateUI(data) {
        const cardContainer = $('#card-container');
        cardContainer.empty(); // Clear existing cards

        data.forEach(report => {
            // Add more data under the h5 if desired for actual functionality
            const cardElement = `
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${report.title}</h5>
                            <p class="card-text">Temp: ${report.temp}</p>
                            <!-- Add more data if functionality to scrape more -->
                        </div>
                    </div>
                </div>
            `;
            cardContainer.append(cardElement);
        });
    }

    // Function to handle alert dismiss button click
    $('.alert .close').on('click', function() {
        // Close the alert when the close button is clicked
        $(this).closest('.alert').alert('close');
    });
});

