/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var BankOfCanadaSource = class BankOfCanadaSource extends AbstractSource {

constructor( configRange ) {

  super( configRange.mergeParameters({
    StartDate: {
      requiredType: "date",
      label: "Start Date",
      description: "Start date for data import",
      attributes: ['manualBackfill']
    },
    EndDate: {
      requiredType: "date",
      label: "End Date",
      description: "End date for data import",
      attributes: ["manualBackfill"]
    },
    ReimportLookbackWindow: {
      requiredType: "number",
      isRequired: true,
      value: 2,
      label: "Reimport Lookback Window",
      description: "Number of days to look back when reimporting data"
    },
    CleanUpToKeepWindow: {
      requiredType: "number",
      label: "Clean Up To Keep Window",
      description: "Number of days to keep data before cleaning up"
    },
    DestinationSheetName: {
      isRequired: true,
      value: "Data",
      label: "Destination Sheet Name",
      description: "Name of the sheet where data will be stored"
    },
    MaxFetchingDays: {
      requiredType: "number",
      isRequired: true,
      value: 30,
      label: "Max Fetching Days",
      description: "Maximum number of days to fetch data for"
    }
  }));

  
}
  
/*
@param startDate start date
@param endDate end date

@return data array

*/
fetchData(startDate, endDate)  {

  let data = [];
  
  const start_date = EnvironmentAdapter.formatDate(startDate, "UTC", "yyyy-MM-dd");
  const end_date = EnvironmentAdapter.formatDate(endDate, "UTC", "yyyy-MM-dd");

  const url = `https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json?start_date=${start_date}&end_date=${end_date}`;
    
  this.config.logMessage(`🔄 Fetching data from ${start_date} to ${end_date}`);

  var response = EnvironmentAdapter.fetch(url, {'method': 'get', 'muteHttpExceptions': true} );
  var rates = JSON.parse( response.getContentText() );

  rates["observations"].forEach((observation) => {
      let date = new Date(observation["d"]);
      //date = date.setDate( date.getTime() - 5 * 60 * 60 * 1000 ); // Bank of Canada provides rates in Toronto time zone @TODO: for some dates it is 4 (!) hours, not 5
      delete observation["d"];

      for(var currency in observation) {
        data.push({
          date: date,
          label: currency.substring(2),
          rate: parseFloat(observation[ currency ]["v"])
        });
      }

  });

  //console.log(data);
  return data;

}
    
}