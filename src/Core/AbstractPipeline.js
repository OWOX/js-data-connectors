class AbstractPipeline {

  constructor(config, connector, storage) {
  
    if( typeof config.setParametersValues !== "function" ) { 
      throw new Error(`Unable to create a Pipeline. The first parameter must inherit from the AbstractConfig class`);
      
    } else if( typeof connector.fetchData !== "function" ) {
      throw new Error(`Unable to create a Pipeline. The second parameter must inherit from the AbstractConnector class`);
  
    } else if ( !(storage instanceof AbstractStorage) ) {
      throw new Error(`Unable to create a Pipeline. The third parameter must inherit from the AbstractStorage class`);
    }

    try {
  
      config.validate();
  
    } catch(error) {
  
      config.logMessage(`Error:  ${error.message}`);
  
      // in case current status is not In progress, we need to update it to "Error". We cannot overwrite "In progress" status with "Error" to avoid import dublication
      if( !config.isInProgress() ) {
        config.updateCurrentStatus(`Error`);
      }
  
      throw error;
  
    }
   
    this.config = config;
    this.connector = connector;
    this.storage = storage;
  
  }
  
  
  
  /*
  
  Initiates imports new data from a data source
  
  */
  run() {
  
    try {
  
      // if import is already in progress skip this run in order to avoid dublication 
      if( this.config.isInProgress() ) {
  
        this.config.logMessage("⚠️ Import is already in progress");
        this.config.addWarningToCurrentStatus();
  
      // stat a new import
      } else {
  
        this.config.logMessage("⚫️ Configuration was loaded successfully", true);
        this.config.updateCurrentStatus(`Import in progress`);
        this.config.updateLastImportDate();
        this.config.logMessage("🟢 Start importing new data");
  
        // if destination sheet is empty than header should be created based on unique key columns list
        if( this.storage.isEmpty() ) {        
          this.storage.addHeader(this.uniqueKeyColumns);  // @TODO: this is needed for Google Sheets Storage only
          this.config.logMessage(`Column(s) for unique key was added: ${this.uniqueKeyColumns}`);
        }  
  
        this.startImportProcess();
  
        this.config.logMessage("✅ Import is finished");
        this.config.updateCurrentStatus(`Done`);      
      }
  
      this.config.updateLastImportDate();
  
    } catch( error ) {
  
      this.config.updateCurrentStatus(`Error`);
      this.config.logMessage(`❌ ${error.message}`);
      throw error;
  
    }
  
  }
  
  
  /*
  
  A method for calling from Root script for determining parameters needed to fetch new data.
  
  */
  startImportProcess() {
  
    var startDate = this.config.StartDate.value;
  
    // data wasn't fetched earlier
    if ( !this.config.LastRequestedDate.value ) {
      var lastRequestedDate = new Date(this.config.StartDate.value.getTime() );
  
    } else {
      var lastRequestedDate = new Date(this.config.LastRequestedDate.value.getTime() );
      lastRequestedDate.setDate( this.config.LastRequestedDate.value.getDate() - this.config.ReimportLookbackWindow.value );
    }
  
    // The earliest date that can be requested is the start date
    if( startDate.getTime() < lastRequestedDate.getTime() ) {
      var startDate = lastRequestedDate;
    }
  
    var endDate = new Date(startDate);
    endDate.setDate( startDate.getDate() + this.config.MaxFetchingDays.value );
  
    // End Date is defined in config and it is ealier than it was calculated below
    if( this.config.EndDate.value && endDate.getTime() > this.config.EndDate.value.getTime() ) {
      endDate = this.config.EndDate.value;
    }
  
    // endDate cannot be latter than now
    if( (new Date).getTime() <  endDate.getTime() ) {
        endDate = new Date();
    }
  
    // fetching new data from a data source
    let data = this.connector.fetchData(startDate, endDate);
  
    // there are fetched records to update
    if( !data.length ) {      
      
      this.config.logMessage("ℹ️ No records have been fetched");
      this.config.updateLastRequstedDate(endDate);
  
    } else {
  
      this.config.logMessage(`${data.length} rows were fetched`);
      this.storage.saveData(data);
  
    }
  
    this.config.updateLastRequstedDate(endDate);
  
  }
  
  
  }