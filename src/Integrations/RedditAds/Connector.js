/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var RedditConnector = class RedditConnector extends AbstractConnector {

    constructor( config ) {
    
      super( config.mergeParameters({
        AppName:{
          // isRequired: true,
          requiredType: "string",
        },
        AppCode:{
          isRequired: true,
          requiredType: "string",
        },
        ClientId:{
          isRequired: true,
          requiredType: "string",
        },
        ClientSecret:{
          isRequired: true,
          requiredType: "string",
        },
        RedirectUri:{
          isRequired: true,
          requiredType: "string",
        },
        RefreshToken:{
          isRequired: true,
          requiredType: "string",
        },
        AccessToken:{
          // isRequired: true,
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
      
      this.fieldsSchema = RedditFieldsSchema;
    
    }
    
    saveAccessToken(accessToken) {
      PropertiesService.getDocumentProperties().setProperty("AccessToken", accessToken);
    }
    saveProperty(key, value) {
      var properties = PropertiesService.getDocumentProperties();
      properties.deleteProperty(key);  // Удаляем старое значение, чтобы обновление точно применилось
      properties.setProperty(key, value);
      this.config[key].value = value;  // Обновляем значение в конфиге
    }
    
    getRedditAccessToken(clientId, clientSecret, redirectUri, refreshToken) {
      var url = "https://www.reddit.com/api/v1/access_token";
      var headers = {
        // "User-Agent": "owoxapp",
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Utilities.base64Encode(clientId + ":" + clientSecret)
      };
      var payload = {
        "grant_type": "refresh_token",
        "redirect_uri": redirectUri,
        "refresh_token": refreshToken
      };
      var options = {
        "method": "post",
        "headers": headers,
        "payload": payload,
        "muteHttpExceptions": true
      };
    
      try {
        var response = UrlFetchApp.fetch(url, options);
        var result = response.getContentText();
        var json = JSON.parse(result);
    
        if (json.error) {
          return { success: false, message: json.error };
        }
    
        return { success: true, accessToken: json.access_token };
      } catch (e) {
        return { success: false, message: "Request failed: " + e.toString() };
      }
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
    
      let url = 'https://ads-api.reddit.com/api/v3/';
    
      let formattedDate = null;
      let timeRange = null;
    
      if( startDate ) {
        formattedDate = Utilities.formatDate(startDate, "UTC", "yyyy-MM-dd");
        timeRange = encodeURIComponent(JSON.stringify({since:formattedDate, until:formattedDate}));
      }
    
      var headers = {
        "Accept": "application/json",
        "Authorization": "Bearer " + this.config.AccessToken.value
      };
      var options = {
        "method": "get",
        "headers": headers,
        "muteHttpExceptions": true // Prevents script from crashing on error
      };
    
    
      // this.config.logMessage('Fetch data nodeName : ' + nodeName)
      // Logger.log('Fetch data nodeName : ')
      // Logger.log(nodeName)
      switch (nodeName) {
        case 'ad-account':
          url += `/ad_accounts/${accountId}`;
          break;
    
        case 'ad-account-user':
          url += `me`;
          break;
    
        case 'ad-group':
          url += `ad_accounts/${accountId}/ad_groups?page.size=10`;
          break;
    
        case 'ads':
          url += `ad_accounts/${accountId}/ads`;
          break;
    
        case 'campaigns': 
        url += `ad_accounts/${accountId}/campaigns`;
        break;
    
        case 'user-custom-audience': 
        url += `ad_accounts/${accountId}/custom_audiences`;
        break;
    
        case 'funding-instruments':
        url += `ad_accounts/${accountId}/funding_instruments`;
        break;
    
        case 'lead-gen-form':
        url += `ad_accounts/${accountId}/lead_gen_forms`;
        break;
    
        case 'report':
        case 'report-by-COUNTRY':
        case 'report-by-AD_GROUP_ID':
        case 'report-by-CAMPAIGN_ID': 
        case 'report-by-DMA':
        case 'report-by-INTEREST':
        case 'report-by-KEYWORD':
        case 'report-by-PLACEMENT':
        case 'report-by-AD_ACCOUNT_ID':
        case 'report-by-COMMUNITY':
        
    
          url += `ad_accounts/${accountId}/reports`;
    
          headers = {
              "Accept": "application/json",
              "Authorization": "Bearer " + this.config.AccessToken.value,
              "Content-Type": "application/json"
          };
    
          var breakdownsMap = {
              "report": ["date", "ad_id"],
              "report-by-COUNTRY": ["date", "ad_id", "country"],
              "report-by-AD_GROUP_ID": ["date", "ad_id", "ad_group_id"],
              "report-by-CAMPAIGN_ID": ["date", "ad_id", "campaign_id"],
              "report-by-DMA": ["date", "ad_id", "dma"],
              "report-by-INTEREST": ["date", "ad_id","interest"],
              "report-by-KEYWORD": ["date", "ad_id", "keyword"],
              "report-by-PLACEMENT": ["date", "ad_id", "placement"],
              "report-by-AD_ACCOUNT_ID": ["date", "ad_id", "AD_ACCOUNT_ID"],
              "report-by-COMMUNITY": ["date", "ad_id", "community"]
          };
    
          var breakdowns = breakdownsMap[nodeName] || ["date", "ad_id"]; 
          var payload = {
              "data": {
                  "breakdowns": breakdowns,
                  "fields": fields,
                  "starts_at": `${formattedDate}T00:00:00Z`,
                  "ends_at": `${formattedDate}T00:00:00Z`,
                  "time_zone_id": "GMT"
              }
          };
    
          options = {
              "method": "post",
              "headers": headers,
              "payload": JSON.stringify(payload),
              "muteHttpExceptions": true
          };
    
        break;
    
        default:
          throw new Error(`End point for ${nodeName} is not implemented yet. Feel free add idea here: https://github.com/OWOX/js-data-connectors/discussions/categories/ideas`);
      }
    
      // url += `&access_token=${this.config.AccessToken.value}`;
    
    
      var allData = [];
      var nextPageURL = url;
    
      while (nextPageURL) {
        // Fetch data from the JSON URL
        // console.log(nextPageURL);
        
        var response = UrlFetchApp.fetch(nextPageURL, options);
        var jsonData = JSON.parse(response.getContentText());
        
    
    
                // Handle expired token (401 Unauthorized)
        if (response.getResponseCode() === 401) {
          this.config.logMessage("Access Token expired. Refreshing token...");
          let newTokenResponse = this.getRedditAccessToken(
            this.config.ClientId.value,
            this.config.ClientSecret.value,
            this.config.RedirectUri.value,
            this.config.RefreshToken.value
          );
    
          if (newTokenResponse.success) {
            this.config.AccessToken.value = newTokenResponse.accessToken;
    
            // Retry the request with new token
            headers["Authorization"] = "Bearer " + this.config.AccessToken.value;
            options.headers = headers;
    
            response = UrlFetchApp.fetch(nextPageURL, options);
            jsonData = JSON.parse(response.getContentText());
          } else {
            this.config.logMessage("Failed to refresh token: " + newTokenResponse.message);
            throw new Error("Could not refresh Reddit Access Token.");
          }
        }
    
    
    
    
    
    
    
    
    
    
        // This node point returns a result in the data property, which might be paginated 
        if("data" in jsonData) {
          nextPageURL = jsonData.pagination ? jsonData.pagination.next_url : null;
    
          // date fields must be converted to Date objects to meet unique key requirements 
    
          if(jsonData && jsonData.data && jsonData.data.metrics){
            for(var key in jsonData.data.metrics) {
              jsonData.data.metrics[ key ] = this.castRecordFields(nodeName, jsonData.data.metrics[key]);
            }
            allData = allData.concat(jsonData.data.metrics);
          }else{
    
            for(var key in jsonData.data) {
              jsonData.data[ key ] = this.castRecordFields(nodeName, jsonData.data[key]);
            }
            allData = allData.concat(jsonData.data);
          }
          
        // this is non-paginated result
        } else {
          nextPageURL = null;
          for(var key in jsonData) {
            jsonData[ key ] = this.castRecordFields(nodeName, jsonData[key]);
          }
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