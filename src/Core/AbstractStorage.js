/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

class AbstractStorage {
  //---- constructor -------------------------------------------------
    /**
     * Asbstract class making Google Sheets data active in Apps Script to simplity read/write operations
     * @param config (object) instance of Sheet
     * @param uniqueKeyColumns (mixed) a name of column with unique key or array with columns names
     * @param schema (object) object with structure like {fieldName: {type: "number", description: "smth" } }
     */
    constructor(config, uniqueKeyColumns, schema = null) {
    
      if(typeof config.setParametersValues !== "function") {
        throw new Error(`Unable to create an AbstractStorage object. First parameter must be an instance of AbstractConfig class`);
      }
    
      config.validate();
      this.config = config;
      this.schema = schema;
      this.columnNames = [];
    
      if( typeof uniqueKeyColumns == "string" ) {
        this.uniqueKeyColumns = [uniqueKeyColumns];
      } else if (typeof uniqueKeyColumns == "object" ) {
        this.uniqueKeyColumns = uniqueKeyColumns;
      }
    
    }
    //----------------------------------------------------------------
    
  //---- getUniqueKeyByRecordFields ----------------------------------
    /**
     * Calculcating unique key based on this.uniqueKeyColumns
     * @param {*} record 
     * @param object
     */
    getUniqueKeyByRecordFields(record) {
    
      return this.uniqueKeyColumns.reduce((accumulator, columnName) => {
        
        if( !(columnName in record) ) {
          throw Error(`'${columnName}' value is required for Unique Key, but it is missing in a record`);
        }
    
        accumulator += `|${record[columnName]}`;      // Append the corresponding value from the row
        return accumulator;
      }, []);
    
    }
    //----------------------------------------------------------------
    
  //---- getRecordByUniqueKey ----------------------------------------
    /**
     * Returning specific row data by unique id 
     * @param string {key} unique id of the record
     * @return object with row data
     */
    getRecordByUniqueKey(key) {
      return typeof this.values[key] == "object" ? this.values[key] : null;
    }
    //----------------------------------------------------------------

  //---- getRecordByRecordFields -------------------------------------
    /**
     * @param object with record values 
     * @return object that might have additional information
     */
    getRecordByRecordFields(fields) {
    
      var record = null;
      var uniqueKey = null;
    
      if( uniqueKey = this.getUniqueKeyByRecordFields(fields) ) {
        record  = this.getRecordByUniqueKey(uniqueKey);
      }
    
      return record;
    
    }
    //----------------------------------------------------------------
    
  //---- isRecordExists ----------------------------------------------
    /**
     * Checking if record exists by id
     * @param object {record}  record
     * @return TRUE if record exists, overwise FALSE
     */
    isRecordExists( record )  {
    
      return this.getUniqueKeyByRecordFields(record) in this.values;
    
    }
    //----------------------------------------------------------------  
    
  //---- saveData ----------------------------------------------------
    /**
     * Saving data to a storage. Has to be implemented in 
     * @param {data} array of assoc objects with records to save
     */
    saveData(data) {
    
      throw new Error("Method saveDate() has to implemented in child class of AbstractStorage");
    }
    //----------------------------------------------------------------
  
  //---- saveRecordsAddedToBuffer ------------------------------------
    /**
     * Add records from buffer to a sheet
     * @param (integer) {maxBufferSize} record will be added only if buffer size if larger than this parameter
     */
    saveRecordsAddedToBuffer(maxBufferSize = 0) {
    
      throw new Error("saveRecordsAddedToBuffer() must be implemented in AbsctractStorage subclasse");
    
    }
    //----------------------------------------------------------------
  
  //---- cleanUpExpiredData ------------------------------------------
    /**
     * Delete all rows from Sheets which have a this.dateColumn before today() - this.CONGIF.CleanUpToKeepWindow
     * @param string date field
     */
    cleanUpExpiredData(dateColumn) {
      try {
    
        // if import is already in progress skip this run in order to avoid dublication 
        if( this.config.isInProgress() ) {
        // add retry
          this.config.logMessage("⚠️ Unable to start cleanup because import is in progress");
          this.config.addWarningToCurrentStatus();
    
    
        // cheking if data column is exists in this.columnNames
        } else if ( this.uniqueKeyColumns.some(column => !this.columnNames.includes( dateColumn )) )  {
      
          throw new Error(`Cannot clean up expired data because the column ‘${dateColumn}’ is missing in the data storage`);
    
        // stat cleaning process
        } else {
    
          this.config.updateCurrentStatus(`CleanUp in progress`);
          this.config.logMessage(`🧹 Start cleaning expired rows`, true);
    
          let deletedRows = 0;
          let maxDate = new Date();
    
          maxDate.setDate( maxDate.getDate() - this.config.CleanUpToKeepWindow.value );
    
          for(var uniqueKey in this.values ) {
    
            let record = this.values[uniqueKey];
    
            // record date is expired
            if( record[ dateColumn ] < maxDate ) {
              this.deleteRecord( uniqueKey );
              deletedRows++;
            }
    
          }
    
          switch (deletedRows) {
            case 0:
              this.config.logMessage(`No rows were deleted`);
              break;
    
            case 1:
              this.config.logMessage(`1 row was deleted`);
              break;
    
            default:
              this.config.logMessage(`${deletedRows} row were deleted`);
              break;
          }
          
        }
    
        this.config.logMessage("✅ Cleanup is finished");
        this.config.updateCurrentStatus(`Done`);
    
    
      } catch( error ) {
    
        this.config.logMessage(`❌ ${error.message}`);
        throw error;
    
      }
    }
    //----------------------------------------------------------------
}