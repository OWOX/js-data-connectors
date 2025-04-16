/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


var TiktokMarketingApiProvider = class TiktokMarketingApiProvider  {

  constructor(appId, accessToken, appSecret, isSandbox = false) {
    // Constants
    this.BASE_URL = "https://business-api.tiktok.com/open_api/";
    this.SANDBOX_BASE_URL = "https://sandbox-ads.tiktok.com/open_api/";
    this.API_VERSION = "v1.3";
    this.MAX_STRING_LENGTH = 50000;
    this.MAX_RETRIES = 3;
    this.INITIAL_BACKOFF = 1000;
    this.SUCCESS_CODE = 0;
    this.RATE_LIMIT_CODE = 40100;
    this.SUCCESS_RESPONSE_CODE = 200;

    // Instance properties
    this.appId = appId;
    this.accessToken = accessToken;
    this.appSecret = appSecret;
    this.isSandbox = isSandbox;
    this.currentAdvertiserId = null;
  }

  getBaseUrl() {
    return this.isSandbox ? this.SANDBOX_BASE_URL : this.BASE_URL;
  }

  getApiVersion() {
    return this.API_VERSION;
  }

  // Constants for API request handling

  
  makeRequest(url, method, data) {
    const headers = {
      'Access-Token': this.accessToken,
      'Content-Type': 'application/json'
    };
    
    let retries = 0;
    let backoff = this.INITIAL_BACKOFF;

    while (retries < this.MAX_RETRIES) {
      try {
        const response = UrlFetchApp.fetch(url, {
          method: method,
          headers: headers,
          body: data ? JSON.stringify(data) : null,
          muteHttpExceptions: true
        });

        const responseCode = response.getResponseCode();
        if (responseCode !== this.SUCCESS_RESPONSE_CODE) {
          throw new Error(`TikTok API error: ${response.getContentText()}`);
        }

        const jsonData = JSON.parse(response.getContentText());

        if (jsonData.code !== this.SUCCESS_CODE) {
          if (jsonData.code === this.RATE_LIMIT_CODE) {
            console.error("TikTok Marketing API rate limit exceeded. Retrying...");
            Utilities.sleep(backoff);
            retries++;
            backoff *= 2;
            continue;
          }
          throw new Error(`TikTok API error: ${jsonData.message}`);
        }

        return jsonData;
      } catch (error) {
        if (retries < this.MAX_RETRIES - 1 && error.message.includes('rate limit')) {
          Utilities.sleep(backoff);
          retries++;
          backoff *= 2;
        } else {
          throw error;
        }
      }
    }
  }

  handlePagination(endpoint, params = {}) {
    let allData = [];
    let page = 1;
    let hasMorePages = true;
    const pageSize = 100;

    while (hasMorePages) {
      const paginatedParams = { ...params, page, page_size: pageSize };
      const url = this.buildUrl(endpoint, paginatedParams);
      const response = this.makeRequest(url, 'GET');

      const pageData = response.data.list || [];
      allData = allData.concat(pageData);

      const total = response.data.page_info ? response.data.page_info.total_number : 0;
      const currentCount = page * pageSize;
      hasMorePages = (currentCount < total && pageData.length > 0);
      page++;

      if (hasMorePages) {
        Utilities.sleep(100);
      }
    }

    return allData;
  }

  buildUrl(endpoint, params = {}) {
    let url = `${this.getBaseUrl()}${this.getApiVersion()}/${endpoint}`;
    const queryParams = [];

    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        if (typeof value === 'object') {
          queryParams.push(`${key}=${encodeURIComponent(JSON.stringify(value))}`);
        } else {
          queryParams.push(`${key}=${encodeURIComponent(value)}`);
        }
      }
    }

    if (queryParams.length > 0) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  getValidAdInsightsMetrics() {
    return [
      // Cost metrics
      "spend", "cpc", "cpm", "cpr", "cpa", "cost_per_conversion", "cost_per_1000_reached",
      
      // Performance metrics
      "impressions", "clicks", "ctr", "reach", "frequency", "viewable_impression", 
      "viewable_rate", "video_play_actions", "video_watched_2s", "video_watched_6s",
      "average_video_play", "average_video_play_per_user", "video_views_p25", 
      "video_views_p50", "video_views_p75", "video_views_p100", "profile_visits",
      "profile_visits_rate", "likes", "comments", "shares", "follows", "landing_page_views",
      
      // Conversion metrics
      "conversion", "cost_per_conversion", "conversion_rate", "conversion_1d_click", 
      "conversion_7d_click", "conversion_28d_click"
    ];
  }

  getAdvertisers(advertiserIds) {
    if (!this.appId || !this.appSecret) {
      throw new Error("To fetch advertiser data, both AppId and AppSecret must be provided.");
    }

    const params = {
      advertiser_ids: advertiserIds,
      app_id: this.appId,
      secret: this.appSecret
    };

    const url = this.buildUrl('oauth2/advertiser/get/', params);
    const response = this.makeRequest(url, 'GET');
    return response.data.list;
  }

  getCampaigns(advertiserId, fields = [], filtering = null) {
    this.currentAdvertiserId = advertiserId;
    const params = {
      advertiser_id: advertiserId,
      fields: fields,
      filtering: filtering
    };

    return this.handlePagination('campaign/get/', params);
  }
  
  getAdGroups(advertiserId, fields = [], filtering = null) {
    this.currentAdvertiserId = advertiserId;
    const params = {
      advertiser_id: advertiserId,
      fields: fields,
      filtering: filtering
    };

    return this.handlePagination('adgroup/get/', params);
  }
  
  getAds(advertiserId, fields = [], filtering = null) {
    this.currentAdvertiserId = advertiserId;
    const params = {
      advertiser_id: advertiserId,
      fields: fields,
      filtering: filtering
    };

    return this.handlePagination('ad/get/', params);
  }
  
  getAdInsights(advertiserId, dataLevel, dimensions, metrics, startDate, endDate) {
    this.currentAdvertiserId = advertiserId;
    const params = {
      advertiser_id: advertiserId,
      report_type: 'BASIC',
      dimensions: dimensions,
      metrics: metrics,
      data_level: dataLevel,
      start_date: startDate,
      end_date: endDate
    };

    const url = this.buildUrl('report/integrated/get/', params);
    const response = this.makeRequest(url, 'GET');
    return response.data.list;
  }
  
  getAudiences(advertiserId) {
    this.currentAdvertiserId = advertiserId;
    const params = {
      advertiser_id: advertiserId
    };

    const url = this.buildUrl('dmp/custom_audience/list/', params);
    const response = this.makeRequest(url, 'GET');
    return response.data.list;
  }
}


var TikTokAdsConnector = class TikTokAdsConnector extends AbstractConnector {

  constructor(config) {
    super(config.mergeParameters({
      AccessToken: {
        isRequired: true,
        requiredType: "string",
      },
      AppId: {
        isRequired: true,
        requiredType: "string",
      },
      AppSecret: {
        isRequired: true,
        requiredType: "string",
      },
      AdvertiserIDs: {
        isRequired: true,
      },
      Objects: {
        isRequired: true,
        type: "string",
        description: "Comma-separated list of objects to fetch from TikTok Ads API (e.g., 'advertisers, campaigns, ad_groups, ads, ad_insights')",
      },
      DataLevel: {
        requiredType: "string", 
        default: "AUCTION_AD",
        description: "Data level for ad_insights reports (AUCTION_ADVERTISER, AUCTION_CAMPAIGN, AUCTION_ADGROUP, AUCTION_AD)"
      },
      StartDate: {
        requiredType: "string",
        description: "Start date for data import in YYYY-MM-DD format"
      },
      EndDate: {
        requiredType: "string",
        description: "End date for data import in YYYY-MM-DD format"
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
      },
      IncludeDeleted: {
        requiredType: "bool",
        default: false,
        description: "Include deleted entities in results"
      },
      SandboxMode: {
        requiredType: "bool",
        default: false,
        description: "Use sandbox environment for testing"
      }
    }));

    this.fieldsSchema = TikTokAdsFieldsSchema;
    this.apiVersion = "v1.3"; // TikTok Ads API version
    
    // Initialize app_id and app_secret from the configuration
    this.appId = config.AppId && config.AppId.value ? config.AppId.value : null;
    this.appSecret = config.AppSecret && config.AppSecret.value ? config.AppSecret.value : null;
  }

  /**
   * Returns connector parameters schema
   * @return {object} Schema of the connector parameters in format {"paramName": "param description", ...}
   */
  get parameters() {
    return {
      "AccessToken": {
        isRequired: true,
        type: "string",
        description: "TikTok Ads API access token",
      },
      "AppId": {
        isRequired: true,
        type: "string",
        description: "TikTok Ads API app ID",
      },
      "AppSecret": {
        isRequired: true,
        type: "string",
        description: "TikTok Ads API app secret",
      },
      "AdvertiserIDs": {
        isRequired: true,
        type: "string",
        description: "Comma or semicolon-separated list of advertiser IDs",
      },
      "Objects": {
        isRequired: true,
        type: "string",
        description: "Comma-separated list of objects to fetch from TikTok Ads API (e.g., 'advertisers, campaigns, ad_groups, ads, ad_insights')",
      },
      "DataLevel": {
        isRequired: false,
        type: "string",
        description: "Data level for ad_insights reports (AUCTION_ADVERTISER, AUCTION_CAMPAIGN, AUCTION_ADGROUP, AUCTION_AD). Default is AUCTION_AD.",
      },
      "MaxFetchingDays": {
        isRequired: false,
        type: "string",
        description: "Maximum number of days to fetch. Default value is 31 days.",
      },
      "ReimportLookbackWindow": {
        isRequired: false,
        type: "string",
        description: "How many days back to reimport data for each run. Default value is 7 days.",
      },
      "CleanUpToKeepWindow": {
        isRequired: false,
        type: "string",
        description: "How many days of historical data to keep. Older data will be deleted. Leave empty to keep all data.",
      },
      "IncludeDeleted": {
        isRequired: false,
        type: "string", 
        description: "Whether to include deleted objects (true/false). Default is false.",
      },
      "SandboxMode": {
        isRequired: false,
        type: "string", 
        description: "Whether to use sandbox data (true/false). Default is false.",
      },
      "StartDate": {
        isRequired: false,
        type: "string",
        description: "Start date of data import in YYYY-MM-DD format. If not specified, the lookback window will be used.",
      },
      "EndDate": {
        isRequired: false,
        type: "string",
        description: "End date of data import in YYYY-MM-DD format. If not specified, the current date will be used.",
      }
    };
  }

  /**
   * Fetches data from TikTok Ads API
   * 
   * @param {string} nodeName - The node to fetch data from (advertiser, campaigns, ad_groups, ads, ad_insights, audiences)
   * @param {string} advertiserId - The advertiser ID to fetch data for
   * @param {array} fields - Array of field names to fetch
   * @param {Date} startDate - Start date for time-series data (optional)
   * @param {Date} endDate - End date for time-series data (optional)
   * @return {array} - Array of data objects
   */
  fetchData(nodeName, advertiserId, fields, startDate = null, endDate = null) {
    // Initialize the API provider
    const provider = new TiktokMarketingApiProvider(
      this.appId,
      this.config.AccessToken.value,
      this.appSecret,
      this.config.SandboxMode && this.config.SandboxMode.value === true
    );
    
    // Store the current advertiser ID so it can be used if missing in records
    this.currentAdvertiserId = advertiserId;
    
    let formattedStartDate = null;
    let formattedEndDate = null;
    
    if (startDate) {
      formattedStartDate = Utilities.formatDate(startDate, "UTC", "yyyy-MM-dd");
      // If no end date is provided, use start date as end date (single day)
      formattedEndDate = endDate 
        ? Utilities.formatDate(endDate, "UTC", "yyyy-MM-dd") 
        : formattedStartDate;
    }

    // Filter parameter for including deleted entities
    let filtering = null;
    if (this.config.IncludeDeleted && this.config.IncludeDeleted.value === true) {
      if (nodeName === 'campaigns') {
        filtering = {"secondary_status": "CAMPAIGN_STATUS_ALL"};
      } else if (nodeName === 'ad_groups') {
        filtering = {"secondary_status": "ADGROUP_STATUS_ALL"};
      } else if (nodeName === 'ads') {
        filtering = {"secondary_status": "AD_STATUS_ALL"};
      }
    }
    
    // Use schema-defined fields
    let filteredFields = fields;
    
    // If no fields specified or empty array, use all fields from schema
    if (!fields || fields.length === 0) {
      if (this.fieldsSchema[nodeName] && this.fieldsSchema[nodeName].fields) {
        filteredFields = Object.keys(this.fieldsSchema[nodeName].fields);
      }
    }

    let allData = [];

    try {
      switch (nodeName) {
        case 'advertiser':
          allData = provider.getAdvertisers(advertiserId);
          break;

        case 'campaigns':
          allData = provider.getCampaigns(advertiserId, filteredFields, filtering);
          break;

        case 'ad_groups':
          allData = provider.getAdGroups(advertiserId, filteredFields, filtering);
          break;

        case 'ads':
          allData = provider.getAds(advertiserId, filteredFields, filtering);
          break;

        case 'ad_insights':
          // Format for ad reporting endpoint
          let dataLevel = this.config.DataLevel && this.config.DataLevel.value ? 
                        this.config.DataLevel.value : "AUCTION_AD";
          
          // Validate the data level
          const validDataLevels = ["AUCTION_ADVERTISER", "AUCTION_CAMPAIGN", "AUCTION_ADGROUP", "AUCTION_AD"];
          if (!validDataLevels.includes(dataLevel)) {
            this.config.logMessage(`⚠️ Invalid data_level: ${dataLevel}. Using default AUCTION_AD.`);
            dataLevel = "AUCTION_AD";
          }
          
          // Set dimensions based on data level
          let dimensions = [];
          switch (dataLevel) {
            case "AUCTION_ADVERTISER":
              dimensions = ["stat_time_day"];
              break;
            case "AUCTION_CAMPAIGN":
              dimensions = ["campaign_id", "stat_time_day"];
              break;
            case "AUCTION_ADGROUP":
              dimensions = ["adgroup_id", "stat_time_day"];
              break;
            case "AUCTION_AD":
            default:
              dimensions = ["ad_id", "stat_time_day"];
              break;
          }
      
          // Filter out dimension fields from metrics
          const nonMetricFields = [...dimensions, "advertiser_id", "stat_time_day", "date_start", "date_end"];
          
          // Use only metrics that are in our known valid list
          const validMetricsList = provider.getValidAdInsightsMetrics();
          let metricFields = filteredFields
            .filter(field => !nonMetricFields.includes(field))
            .filter(field => validMetricsList.includes(field));

          allData = provider.getAdInsights(
            advertiserId,
            dataLevel,
            dimensions,
            metricFields,
            formattedStartDate,
            formattedEndDate
          );
          break;
          
        case 'audiences':
          allData = provider.getAudiences(advertiserId);
          break;

        default:
          throw new Error(`Endpoint for ${nodeName} is not implemented yet. Feel free to add idea here: https://github.com/OWOX/js-data-connectors/discussions/categories/ideas`);
      }

      // Cast fields to the correct data types using the provider's castFields method
      allData = allData.map(record => this.castFields(nodeName, record, this.fieldsSchema));


      // add missing fields to the record
      for (let field in this.fieldsSchema[nodeName].fields) {
        if (!(field in allData)) {
          allData[field] = null;
        }
      }

      return allData;

    } catch (error) {
      if (error.message.includes('one or more value of the param is not acceptable, correct is')) {
        // Extract the valid fields from the error message
        try {
          const fieldErrorMatch = error.message.match(/correct is \[(.*?)\]/);
          if (fieldErrorMatch && fieldErrorMatch[1]) {
            const validFieldsFromError = fieldErrorMatch[1].split("', '").map(f => f.replace(/'/g, "").trim());
            
            console.log("API returned valid fields list: " + validFieldsFromError.join(", "));
            
            // Retry with valid fields from the API
            if (validFieldsFromError.length > 0) {
              console.log("Retrying with valid fields from API");
              return this.fetchData(nodeName, advertiserId, validFieldsFromError, startDate, endDate);
            }
          }
        } catch (parseError) {
          console.error("Error parsing valid fields from error message: " + parseError);
        }
      }
      
      console.error(`Error fetching data from TikTok Ads API: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cast record fields to the types defined in schema
   * 
   * @param {string} nodeName - Name of the TikTok API node
   * @param {object} record - Object with all the row fields
   * @return {object} - Record with properly cast field values
   */
  castFields(nodeName, record, schema) {
    // Maximum string length to prevent exceeding column limits
    const MAX_STRING_LENGTH = 50000;
    
    // Special handling for metrics field in ad_insights
    if (nodeName === 'ad_insights') {
      if (record.metrics) {
        // Flatten metrics object into the main record
        for (const metricKey in record.metrics) {
          record[metricKey] = record.metrics[metricKey];
        }
        delete record.metrics;
      }

      if (record.dimensions) {
        // Flatten dimensions object into the main record
        for (const dimensionKey in record.dimensions) {
          record[dimensionKey] = record.dimensions[dimensionKey];
        }
        delete record.dimensions;
      }
      
      // Ensure advertiser_id is present
      if (!record.advertiser_id && this.currentAdvertiserId) {
        record.advertiser_id = this.currentAdvertiserId;
      }
      
      // Handle date fields
      if (record.stat_time_day && !record.date_start) {
        record.date_start = record.stat_time_day;
      }
      if (record.date_start && !record.stat_time_day) {
        record.stat_time_day = record.date_start;
      }
    }

    if (nodeName === 'audiences' && !record.advertiser_id && this.currentAdvertiserId) {
      record.advertiser_id = this.currentAdvertiserId;
    }

    // Verify we have a schema for this node
    if (!schema[nodeName] || !schema[nodeName].fields) {
      console.warn(`No schema defined for node ${nodeName}`);
      return record;
    }

    // Filter out any extremely large fields or fields not in schema
    const processedRecord = {};
    
    // First ensure uniqueKey fields are always included
    if (schema[nodeName].uniqueKeys) {
      for (const keyField of schema[nodeName].uniqueKeys) {
        if (keyField in record) {
          processedRecord[keyField] = record[keyField];
        } 
        else if (keyField === 'advertiser_id' && nodeName === 'ad_insights') {
          processedRecord['advertiser_id'] = this.currentAdvertiserId || '';
        }
      }
    }
    
    // Next add all other fields defined in the schema
    for (let field in schema[nodeName].fields) {
      if (field in record && !processedRecord[field]) {
        processedRecord[field] = record[field];
      }
    }
    
    // Then add other fields from the record that might be needed
    for (let field in record) {
      if (field === 'rowIndex' && !processedRecord[field]) {
        processedRecord[field] = record[field];
      }
    }

    // Now process field types
    for (let field in processedRecord) {
      if (field in schema[nodeName].fields && 
          "type" in schema[nodeName].fields[field]) {
        
        let type = schema[nodeName].fields[field].type;
        let value = processedRecord[field];
        
        if (value === null || value === undefined) {
          continue;
        }
        
        try {
          switch (type) {
            case 'string':
              processedRecord[field] = String(value).substring(0, MAX_STRING_LENGTH);
              break;
              
            case 'int32':
            case 'int64':
            case 'integer':
            case 'numeric string':
              processedRecord[field] = parseInt(value);
              break;
              
            case 'float':
              processedRecord[field] = parseFloat(value);
              break;
              
            case 'bool':
              processedRecord[field] = Boolean(value);
              break;
              
            case 'datetime':
              if (field === 'create_time' || field === 'modify_time') {
                if (typeof value === 'number') {
                  processedRecord[field] = new Date(parseInt(value) * 1000);
                } else if (typeof value === 'string') {
                  processedRecord[field] = new Date(value);
                }
              } else {
                processedRecord[field] = new Date(value);
              }
              break;
 
            case 'object':
            case 'array':
              try {
                const jsonStr = JSON.stringify(value);
                processedRecord[field] = jsonStr.substring(0, MAX_STRING_LENGTH);
              } catch (error) {
                processedRecord[field] = String(value).substring(0, MAX_STRING_LENGTH);
              }
              break;
              
            default:
              console.warn(`Unknown type ${type} for field ${field}`);
              processedRecord[field] = String(value).substring(0, MAX_STRING_LENGTH);
              break;
          }
        } catch (error) {
          console.error(`Error processing field ${field} with value ${value}: ${error.message}`);
          processedRecord[field] = "[Error processing value]";
        }
      } else if (field !== 'rowIndex') {
        console.debug(`Field ${field} in ${nodeName} is not defined in schema`);
        if (processedRecord[field] !== null && processedRecord[field] !== undefined) {
          try {
            processedRecord[field] = String(processedRecord[field]).substring(0, MAX_STRING_LENGTH);
          } catch (error) {
            processedRecord[field] = "[Error processing value]";
          }
        }
      }
    }
    
    return processedRecord;
  }

}; 