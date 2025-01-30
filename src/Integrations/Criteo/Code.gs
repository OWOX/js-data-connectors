// Google Sheets Range with config data. Must me referes to a table with three columns: name, value and comment

//document to copy: https://docs.google.com/spreadsheets/d/1NociaDEWZsSEw7l8ODfrc9oJpy5THrrITRrCba7v240/edit?gid=1242480076#gid=1242480076
var CONFIG_RANGE = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config').getRange("A:C");

function onOpen() {
  SpreadsheetApp.getUi().createMenu('OWOX')
    .addItem('▶ Import New Data', 'importNewData')
    .addItem('🧹 CleanUp Expired Data', 'cleanUpExpiredData')
    .addItem('🔑 Manage Credentials', 'manageCredentials')
    .addItem('⏰ Schedule', 'scheduleRuns')
    .addToUi();
}
function importNewData() {

  const config = new GoogleSheetsConfig(CONFIG_RANGE);            // Taking data from GSheet. 

  const pipeline = new CriteoPipeline(
    config,                                                           // pipeline configuration
    new CriteoConnector(config.setParametersValues(                   // connector with parameter's values added from properties 
      PropertiesService.getDocumentProperties().getProperties())),
    new GoogleSheetsStorage(config, ["Date", "source", "medium", "campaign", "campaignId", //that what we need to get in the final object. 
      "keyword", "adCost", "adClicks", "impressions",
      "currency",
      "account"])   // storage 
  );

  pipeline.run();

}

function cleanUpExpiredData() {

  const storage = new GoogleSheetsStorage(
    new GoogleSheetsConfig(CONFIG_RANGE),
    ["Date", "source", "medium", "campaign", "campaignId", //This fields would be cleaned during erasing. Hm. @TODO: Better cleansing?  
      "keyword", "adCost", "adClicks", "impressions", "currency", "account"]
  );
  storage.cleanUpExpiredData("Date");

}

function manageCredentials() {
  var html = HtmlService.createHtmlOutput( //HTML code for form, coz we need double credentials - client id and secret string
    `
    <p>To import data from Criteo, you need to add credentials, 
        Client Id and Client's Secret. Here’s 
        how you can get it: <a href="https://developers.criteo.com/marketing-solutions/docs/get-your-credentials-and-make-your-first-api-call" target="_blank" >https://developers.criteo.com/marketing-solutions/docs/get-your-credentials-and-make-your-first-api-call</a> </p>
    <label for="client_id">Client Id</label><br>    
    <input id="client_id" type="text" /><br/>
    <label for="secret">Secret</label><br>  
    <input id="secret" type="text" /><br/>
    <input type="button" value="Cancel" onclick="google.script.host.close()" />
    <input type="button" value="Add credentials" onclick="submitData()" />
    
    <script>
      function submitData() {
        // Get data from fields
        const clientId = document.getElementById('client_id').value;
        const secret = document.getElementById('secret').value;
        
        // Setting data: https://developers.google.com/apps-script/guides/html/reference/run#withsuccesshandlerfunction
        google.script.run.withSuccessHandler(onSuccess).processCredentials(clientId, secret);
      }
      
      function onSuccess(response) {
        alert(response);
        google.script.host.close();
      }
    </script>
    `
  )
    .setWidth(400)
    .setHeight(300);

  SpreadsheetApp.getUi().showModalDialog(html, 'Add Credentials');
}

// Function to call from credentials
function processCredentials(clientId, secret) {
  var Properties = PropertiesService.getDocumentProperties();
  const currentClientId = Properties.getProperty('Client Id');
  if (currentClientId == "") {                                        //@TODO: Better logic? If we haven't this stuff saved... We have previous stuff // not cache, lives forever; (c) Andrew
    Properties.setProperty("Client Id", clientId);
    Properties.setProperty("Secret", secret);
    Properties.setProperty('Access Token', takeToken());
    return 'Credentials were set successfully!'
  }
  else {
    Properties.setProperty("Client Id", clientId);
    Properties.setProperty("Secret", secret);
    return 'Credentials were updated successfully!'
  }
}


