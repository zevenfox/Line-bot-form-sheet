// Initialize the BetterLog library with the specified spreadsheet ID
Logger = BetterLog.useSpreadsheet('your-spreadsheet-id-here');

// Open the Google Spreadsheet by URL and get the specific sheet by name
var ss = SpreadsheetApp.openByUrl("your-spreadsheet-url-here");
var sheet = ss.getSheetByName("your-sheet-name-here");

// Main function to handle incoming POST requests from the chatbot platform
function doPost(e) {
    // Parse the incoming JSON data from the chatbot platform
    var data = JSON.parse(e.postData.contents);
    var userMsg;
    
    // Extract user message from the parsed data
    if (data.originalDetectIntentRequest) {
        userMsg = data.originalDetectIntentRequest.payload.data.message.text;
    }
    
    // Get all values from the specified range in the spreadsheet
    // The range starts from row 2 to skip the header row.
    var values = sheet.getRange(2, 2, sheet.getLastRow(), sheet.getLastColumn()).getValues();
    var matches = [];
    
    // Loop through the values to find matches with the user's message
    for (var i = 0; i < values.length; i++) {
        if (values[i][1] == userMsg) {
            // Create a match object with relevant data for the current match
            var match = {
                borrowStatus: values[i][0],
                name: values[i][1],
                functionName: values[i][2],
                asset: values[i][3],
                years: values[i][4],
                barcode: values[i][5],
                serialNumber: values[i][6],
                computername: values[i][7],
                email: values[i][9],
                t_username: values[i][10]
            };
            // Add the match object to the matches array
            matches.push(match);
        }
    }
    
    // Prepare an array to store response messages
    var responseMessages = [];
    
    // If there are matches, construct responses for each match
    if (matches.length > 0) {
        for (var j = 0; j < matches.length; j++) {
            var match = matches[j];
            // Construct a response message for the current match
            var response = {
                platform: "line",
                type: 4,
                payload: {
                    line: {  
                        "altText": match.name + " status",
                        "type": "flex",
                        "contents": {
                            // ... (construct the response contents here using match data)
                        }
                    }
                }
            };
            // Add the response to the responseMessages array
            responseMessages.push(response);
        }
    } else {
        // If no matches were found, prepare a default response
        var response = {
            platform: "line",
            type: 4,
            payload: {
                line: {
                    type: "text",
                    text: "ไม่พบข้อมูลในฐานข้อมูล"
                }
            }
        };
        // Add the default response to the responseMessages array
        responseMessages.push(response);
    }
    
    // Prepare the final result object with the response messages
    var result = {
        fulfillmentMessages: responseMessages
    };
    
    // Create a JSON response and set the MIME type to JSON
    var replyJSON = ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    // Return the JSON response to the chatbot platform
    return replyJSON;
}
