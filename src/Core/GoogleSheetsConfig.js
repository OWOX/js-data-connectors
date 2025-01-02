var GoogleSheetsConfig = class GoogleSheetsConfig extends AbstractConfig {

  constructor(configRange) {
  
    if(typeof configRange.getA1Notation !== "function") {
      throw new Error(`Unable to create an GoogleSheetsConfig object. The first constructor's parameter must be an SpreadsheetApp.Sheet object`)
    } 
  
    // create an object to fill it with parameters in a way required by super class
    let configObject = {};
    
    configRange.getValues().forEach( (row, index) => {
  
      var name = row[0].replaceAll(/[^a-zA-Z0-9]/gi, "");
  
      // if name of the parameter is not empty and not in exclusion list → add it to configuration
      if( !(["", "Parameters", "Status", "Name"].includes(name) ) ) {
        
        var value = row[1];
        configObject[ name ] = {};
  
        if( value || value === 0 )  {
          configObject[name].value = value;
        }
  
        // If original parameter name of the config ends with *, it must be required
        if( row[0].slice(-1) == "*" ) { 
          configObject[ name ].isRequired = true;
        }
    
        // if this parameter need a reference to the cell, we need to add it
        if( ["Log", "CurrentStatus", "LastImportDate", "LastRequestedDate", "DestinationSpreadsheet"].includes(name) ) {
          configObject[ name ].cell = configRange.offset( index, 1, 1, 1);
        }
  
      }
  
    })
  
    // define a config spreadsheet object
    configObject.configSpreadsheet = configRange.getSheet().getParent();
  
    // Assigning a time zone to the Log parameter in order to write time-stamped messages into it
    configObject.Log.timeZone = configRange.getSheet().getParent().getSpreadsheetTimeZone();
  
    super(configObject);
  
  }
  
  
  
  /*
  *
  * @param string current status value
  *
  */
  updateCurrentStatus(status) {
  
    this.CurrentStatus.cell.setValue(status);
  
    let backgroundColor = null;
  
    switch (status) {
      case "CleanUp in progress":
        backgroundColor = "#c9e3f9";
        break;
  
      case "Import in progress":
        backgroundColor = "#c9e3f9";
        break;
      case "Error":
        backgroundColor = "#fdd2cf";
        break;
      case "Done":
        backgroundColor = "#d4efd5";
        break;
    }
  
    this.CurrentStatus.cell.setBackground( backgroundColor );
  
  } 
  
  /*
  
  updating the last import attempt date in a config sheet
  
  */
  updateLastImportDate() {
    
    this.LastImportDate.cell.setValue( Utilities.formatDate(new Date(), this.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
  
  }
  
  /*
  
  Updating the last requested date in a config sheet
  
  @param date Date requested date
  
  */
  updateLastRequstedDate(date) {
  
    // checking is Last Request Date exists in a CONFIG and value was changed
    if( "LastRequestedDate" in this 
    && ( !this.LastRequestedDate.value || date.getTime() != this.LastRequestedDate.value.getTime() ) ) {
  
      this.LastRequestedDate.value = new Date(date.getTime() );
      this.LastRequestedDate.cell.setValue( Utilities.formatDate(date, this.Log.timeZone, "yyyy-MM-dd HH:mm:ss") );
  
    }
  
  }
  
  
  /*
  
  Updating the content of the fields list to simplify the selection of fields for import
  
  @param connector AbstractConnector
  @param sheetName string, Fields by default
  
  */
  udpateFieldsSheet(connector, sheetName = "Fields") {
  
    this.validate();
  
    var configSheetStorage = new GoogleSheetsStorage(
      this.mergeParameters({
        DestinationSheetName: { // @TODO: make sure it would affect destination sheet for import data. CONFIG is an object. Probably we might dublicate it
          value: sheetName
        }
      }), 
      ["id"] 
    )
  
    // getting schema fields from connector. Must be two level object 
    var groups = connector.getFieldsSchema();
  
    // updating content of the fields config sheet
    var data = [];
  
    // saving fields data to google sheets
    for(var groupName in groups) {
  
      data.push({"id": groupName,            "✔️": groupName,        "name": "", "description": ""});  // first row must contains all the columns
      data.push({"id": `${groupName} !desc`, "✔️": groups[ groupName ].description});
      data.push({"id": `${groupName} !doc`,  "✔️": groups[ groupName ].documentation});
      
      if( groups[ groupName ].fields ) {
        for(var fieldName in groups[ groupName ].fields ) {
          data.push({ 
            "id":  groupName + " " + fieldName,
            "name": fieldName,
            "description": groups[ groupName ].fields[ fieldName ].description,
          });
        }
  
        data.push({"id": `${groupName} zzz_separator`});
      }
  
    }
  
  
    // Get the total number of rows in the sheet
    //var numRows = configSheetStorage.SHEET.getMaxRows();
  
    // Loop through all rows and log their grouping depths
   // for (var row = 1; row <= numRows; row++) {
   //   var groupDepth = configSheetStorage.SHEET.getRowGroupDepth(row);
   //   Logger.log("Row " + row + " has a grouping depth of: " + groupDepth);
   // }
  
    // remove existing grouping
    console.log("removing existing groups");
    for(var groupName in groups) {
      var groupRow = configSheetStorage.getRecordByRecordFields( {"id": groupName} );
      let depth = configSheetStorage.SHEET.getRowGroupDepth(groupRow.rowIndex + 5);
      if( depth > 0) {
        configSheetStorage.SHEET.getRowGroup(groupRow.rowIndex + 5, depth).remove();
      }
    }
    
  
    console.log("start saving data");
    configSheetStorage.saveData(data);
  
    console.log("start sorting");
    // Sorting existind and added rows
    configSheetStorage.SHEET.sort( configSheetStorage.getColumnIndexByName("id") );
    configSheetStorage.loadDataFromSheet(); // required because rowIndex where changed after sorting
  
    // formatting id and ✔️ columns
    configSheetStorage.SHEET.hideColumns( configSheetStorage.getColumnIndexByName("id") );
    configSheetStorage.SHEET.setColumnWidth( configSheetStorage.getColumnIndexByName("✔️"), 25 );
  
    console.log("start appling validation");
    var checkboxRule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
  
    console.log("updating google sheets formatting ");
    // updating google sheets formatting 
    for(var groupName in groups) {
    
      // formatting group name row
      var groupRow = configSheetStorage.getRecordByRecordFields( {"id": groupName} );
      var range = configSheetStorage.SHEET.getRange( `${groupRow.rowIndex+2}:${groupRow.rowIndex+2}` );    
      range.setFontWeight("bold").setBackground("black").setFontColor("white");
  
      // formatting group description and docymention rows
      var groupRow = configSheetStorage.getRecordByRecordFields( {"id": `${groupName} !desc`} );
      var range = configSheetStorage.SHEET.getRange( `${groupRow.rowIndex+2}:${groupRow.rowIndex+3}` );    
      range.setBackground("#f3f3f3");
  
      // add checkboxes validation
      var checkboxesColumnIndex = configSheetStorage.getColumnIndexByName("✔️");
      var groupNameRow = configSheetStorage.getRecordByRecordFields( {"id": groupName} );
      var groupFieldsCount = this.getFieldsCountByGroupName(configSheetStorage, groupName);
  
      configSheetStorage.SHEET.getRange(groupNameRow.rowIndex + 5, checkboxesColumnIndex, groupFieldsCount).setDataValidation( checkboxRule );
      configSheetStorage.SHEET.getRange(`${groupNameRow.rowIndex + 5}:${groupNameRow.rowIndex + 4 + groupFieldsCount}`).shiftRowGroupDepth(1);
  
    }
  
    configSheetStorage.SHEET.collapseAllRowGroups();
  
  //  console.log(configSheetStorage.SHEET.getName() );
  
    //console.log(fields);
  
  
  }
  
  /*
  
  @param GoogleSheetsConfig object
  @param groupName string name of the group
  
  @return integer number of fields of requested group
  
  */
  getFieldsCountByGroupName(configSheetStorage, groupName) {
  
    return Object.values(configSheetStorage.values).filter(element => element.name && element.id.startsWith(`${groupName} `)).length;
  
  }
  
  
  /*
  
  Checking current status if it is in progress or not
  
  @return boolean true is process in progress
  
  */
  isInProgress() {
    // @TODO: Config might be not a Google Sheet
      return (this.CurrentStatus.cell.getValue().indexOf("progress") !== -1)
  
  }
  
  addWarningToCurrentStatus() {
    this.CurrentStatus.cell.setBackground( "#fff0c4" );
  }
  
  /*
  *
  * @param string message to Log
  *
  */
  logMessage(message, removeExistingMessage = false) {
  
    console.log(message);
    
    let formattedDate = Utilities.formatDate(new Date(), this.Log.timeZone, "yyyy-MM-dd HH:mm:ss"); // Format the date
  
    // Read the existing log message if it shouldn’t be removed
    let currentLog = removeExistingMessage ? "" : this.Log.cell.getValue();
  
    currentLog ? currentLog += "\n" : "";
  
    let emoji = "☑️ ";
    let match;
  
    // If a message starts with an emoji, we need to move it to the beginning to make the log look perfect and easy to read
    if( match = message.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Extended_Pictographic})\s+/u) ) {
      emoji = match[0];
      message = message.slice(2).trim();
    }
  
    this.Log.cell.setValue(
      `${currentLog}${emoji}${formattedDate}: ${message}`
    );
  
  }
      
  }