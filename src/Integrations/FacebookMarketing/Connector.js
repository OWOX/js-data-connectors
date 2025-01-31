/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var FacebookMarketingConnector = class FacebookMarketingConnector extends AbstractConnector {

constructor( config ) {

  super( config.mergeParameters({
    AccessToken:{
      isRequired: true,
      requiredType: "string",
    },
    AccoundIDs: {
      isRequired: true,
    },
    Fields: {
      isRequired: true
    },      
    ReimportLookbackWindow: {
      requiredType: "number",
      isRequired: true,
      default: 2
    },
    CleanUpToKeepWindow: {
      requiredType: "number"
    },
    MaxFetchingDays: {
      requiredType: "number",
      isRequired: true,
      default: 31
    }
  }));
  
  this.fieldsSchema = FacebookMarketingFieldsSchema;

}
  
/*
@param nodeName string
@param accountId string
@param fields array
@param startDate date

@return data array

*/
fetchData(nodeName, accountId, fields, startDate = null)  {

  //console.log(`Fetching data from ${nodeName}/${accountId}/${fields} for ${startDate}`);

  let url = 'https://graph.facebook.com/v21.0/';

  let formattedDate = null;
  let timeRange = null;

  if( startDate ) {
    formattedDate = Utilities.formatDate(startDate, "UTC", "yyyy-MM-dd");
    timeRange = encodeURIComponent(JSON.stringify({since:formattedDate, until:formattedDate}));
  }

  switch (nodeName) {
    case 'ad-account':
      url += `act_${accountId}?fields=${fields.join(",")}`;
      break;

    case 'ad-account-user':
      url += `act_${accountId}/?fields=${fields.join(",")}`;
      break;

    case 'ad-account/ads':
      url += `act_${accountId}/ads?&time_range=${timeRange}`;
      break;

    case 'ad-account/adcreatives':
      url += `act_${accountId}/adcreatives?fields=${fields.join(",")}`;
      break;

    case 'ad-account/insights':
      url += `act_${accountId}/insights?level=ad&period=day&time_range=${timeRange}&fields=${fields.join(",")}`;
      break;
      // ad, adset, campaign, account

    case 'ad-group':
      url += `act_${accountId}/ads?&time_range=${timeRange}&fields=${fields.join(",")}`;
      break;

    default:
      throw new Error(`End point for ${nodeName} is not implemented yet. Feel free add idea here: https://github.com/OWOX/js-data-connectors/discussions/categories/ideas`);
  }

  url += `&access_token=${this.config.AccessToken.value}`;

  var allData = [];
  var nextPageURL = url;

  while (nextPageURL) {
    // Fetch data from the JSON URL
    //console.log(nextPageURL);
    
    var response = UrlFetchApp.fetch(nextPageURL);
    
    var jsonData = JSON.parse(response.getContentText());

    // This node point returns a result in the data property, which might be paginated 
    if("data" in jsonData) {

      nextPageURL = jsonData.paging ? jsonData.paging.next : null;

      // date fields must be converted to Date objects to meet unique key requirements 
      jsonData.data.forEach(record => {
        record = this.castRecordFields(nodeName, record);
      });

      allData = allData.concat(jsonData.data);

    // this is non-paginated result
    } else {
      nextPageURL = null;
      jsonData.data.forEach(record => {
        record = this.castRecordFields(nodeName, record);
      });
      allData = allData.concat(jsonData);
    }
    
  }
  //console.log(allData);
  return allData;

}

/**
 * Cast of record fields to the types defined in schema
 * 
 * @param nodeName string name of the facebook api node
 * @param record object with all the row fields
 * 
 * @return record
 * 
 */
castRecordFields(nodeName, record) {

  for (var field in record) { 
    if( field in this.fieldsSchema[ nodeName ]["fields"] 
    && "type" in this.fieldsSchema[ nodeName ]["fields"][field] ) {

      let type = this.fieldsSchema[ nodeName ]["fields"][field]["type"];
      
      switch ( true ) {

        case type == 'string' && field.slice(0, 5) == "date_":
          record[ field ] = new Date(record[ field ] + "T00:00:00Z");
          break;

        case type == 'numeric string' && ( field.slice(-3) == "_id" || field == "id" ):
          record[ field ] = String(record[ field ]);
          break;
        
        case type == 'numeric string' && ( field.slice(-5) == "spend"  ):
          record[ field ] = parseFloat(record[ field ]);
          break;

        case type == 'numeric string':
          record[ field ] = parseInt(record[ field ]);
          break;

        case type == 'unsigned int32':
          record[ field ] = parseInt(record[ field ]);
          break;

        case type == 'float':
          record[ field ] = parseFloat(record[ field ]);
          break;

        case type == 'bool':
          record[ field ] = Boolean(record[ field ]);
          break;

        case type == 'datetime':
          record[ field ] = new Date(record[ field ]);
          break;

        case type == 'int32':
          record[ field ] = parseInt(record[ field ]);
          break;
      }
    }
  }

  return record;
}
  
}