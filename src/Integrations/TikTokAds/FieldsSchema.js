/**
 * Copyright (c) OWOX, Inc.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

var TikTokAdsFieldsSchema = {

  "advertiser": {
    "title": "Advertiser Account",
    "description": "TikTok Advertiser Account information",
    "uniqueKeys": ["advertiser_id"],
    "fields": {
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID",
        'GoogleSheetsFormat': '@'
      },
      "advertiser_name": {
        "type": "string",
        "description": "Advertiser Name"
      },
      "company_name": {
        "type": "string",
        "description": "Company Name"
      },
      "currency": {
        "type": "string",
        "description": "Account Currency"
      },
    }
  },

  "campaigns": {
    "title": "Campaigns",
    "description": "TikTok Ad Campaigns",
    "uniqueKeys": ["campaign_id"],
    "fields": {
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID",
        'GoogleSheetsFormat': '@'
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID",
        'GoogleSheetsFormat': '@'
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "app_promotion_type": {
        "type": "string",
        "description": "Type of app promotion being used in the campaign"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "bid_type": {
        "type": "string",
        "description": "Type of bid strategy being used in the campaign"
      },
      "roas_bid": {
        "type": "float",
        "description": "Return on ad spend bid target"
      },
      "is_advanced_dedicated_campaign": {
        "type": "bool",
        "description": "Flag indicating if this is an advanced dedicated campaign"
      },
      "is_search_campaign": {
        "type": "bool",
        "description": "Flag indicating if the campaign is for search ads"
      },
      "rf_campaign_type": {
        "type": "string",
        "description": "Reach and frequency campaign type"
      },
      "rta_bid_enabled": {
        "type": "bool",
        "description": "Flag indicating if RTA bidding is enabled"
      },
      "secondary_status": {
        "type": "string",
        "description": "Additional status information of the campaign"
      },
      "postback_window_mode": {
        "type": "string",
        "description": "Mode for the postback window"
      },
      "disable_skan_campaign": {
        "type": "bool",
        "description": "Flag indicating if SKAdNetwork is disabled for the campaign"
      },
      "budget_optimize_on": {
        "type": "bool",
        "description": "The metric or event that the budget optimization is based on"
      },
      "budget_mode": {
        "type": "string",
        "description": "Budget Mode (BUDGET_MODE_DAY or BUDGET_MODE_TOTAL)"
      },
      "objective": {
        "type": "string",
        "description": "Campaign Objective"
      },
      "campaign_product_source": {
        "type": "string",
        "description": "Source of products for the campaign"
      },
      "optimization_goal": {
        "type": "string",
        "description": "Specific goal to be optimized for in the campaign"
      },
      "special_industries": {
        "type": "string",
        "description": "Special industries classification for the campaign"
      },
      "deep_bid_type": {
        "type": "string",
        "description": "Type of deep bidding strategy"
      },
      "rta_id": {
        "type": "string",
        "description": "Real-time advertising ID"
      },
      "rta_product_selection_enabled": {
        "type": "bool",
        "description": "Flag indicating if RTA product selection is enabled"
      },
      "budget": {
        "type": "float",
        "description": "Campaign Budget"
      },
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the campaign utilizes a new campaign structure"
      },
      "is_smart_performance_campaign": {
        "type": "bool",
        "description": "Flag indicating if the campaign uses smart performance optimization"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      },
      "app_id": {
        "type": "string",
        "description": "ID of the app being promoted"
      },
      "objective_type": {
        "type": "string",
        "description": "Type of objective selected for the campaign (e.g., brand awareness, app installs)"
      },
      "campaign_type": {
        "type": "string",
        "description": "Type of campaign (e.g., awareness, conversion)"
      },
      "campaign_app_profile_page_state": {
        "type": "string",
        "description": "App profile page state for app campaigns"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "catalog_enabled": {
        "type": "bool",
        "description": "Flag indicating if product catalog is enabled"
      },
      "bid_align_type": {
        "type": "string",
        "description": "Type of bid alignment"
      }
    }
  },

  "ad_groups": {
    "title": "Ad Groups",
    "description": "TikTok Ad Groups",
    "uniqueKeys": ["adgroup_id"],
    "fields": {
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID",
        'GoogleSheetsFormat': '@'
      },
      "adgroup_name": {
        "type": "string",
        "description": "Ad Group Name"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID",
        'GoogleSheetsFormat': '@'
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "budget": {
        "type": "float",
        "description": "Ad Group Budget"
      },
      "budget_mode": {
        "type": "string",
        "description": "Budget Mode (BUDGET_MODE_DAY or BUDGET_MODE_TOTAL)"
      },
      "bid_type": {
        "type": "string",
        "description": "Bidding Type"
      },
      "bid_price": {
        "type": "float",
        "description": "Bid Price"
      },
      "optimization_goal": {
        "type": "string",
        "description": "Optimization Goal"
      },
      "optimization_event": {
        "type": "string",
        "description": "Optimization Event"
      },
      "app_id": {
        "type": "string",
        "description": "ID of the app being promoted",
        'GoogleSheetsFormat': '@'
      },
      "app_type": {
        "type": "string",
        "description": "Type of app"
      },
      "audience_type": {
        "type": "string",
        "description": "Type of audience"
      },
      "audience_ids": {
        "type": "array",
        "description": "List of audience IDs"
      },
      "excluded_audience_ids": {
        "type": "array",
        "description": "List of excluded audience IDs"
      },
      "gender": {
        "type": "string",
        "description": "Target gender"
      },
      "age_groups": {
        "type": "array",
        "description": "Target age groups"
      },
      "languages": {
        "type": "array",
        "description": "Target languages"
      },
      "location_ids": {
        "type": "array",
        "description": "Target location IDs"
      },
      "interest_category_ids": {
        "type": "array",
        "description": "Interest category IDs"
      },
      "placements": {
        "type": "array",
        "description": "Ad placements"
      },
      "placement_type": {
        "type": "string",
        "description": "Type of placement"
      },
      "schedule_start_time": {
        "type": "datetime",
        "description": "Schedule Start Time"
      },
      "schedule_end_time": {
        "type": "datetime",
        "description": "Schedule End Time"
      },
      "schedule_type": {
        "type": "string",
        "description": "Type of schedule"
      },
      "frequency": {
        "type": "integer",
        "description": "Frequency cap"
      },
      "billing_event": {
        "type": "string",
        "description": "Billing Event Type"
      },
      "conversion_id": {
        "type": "string",
        "description": "Conversion ID"
      },
      "conversion_bid_price": {
        "type": "float",
        "description": "Conversion Bid Price"
      },
      "conversion_window": {
        "type": "integer",
        "description": "Conversion Window"
      },
      "click_attribution_window": {
        "type": "integer",
        "description": "Click Attribution Window"
      },
      "view_attribution_window": {
        "type": "integer",
        "description": "View Attribution Window"
      },
      "is_smart_performance_campaign": {
        "type": "bool",
        "description": "Flag indicating if the ad group uses smart performance optimization"
      },
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the ad group utilizes a new structure"
      },
      "auto_targeting_enabled": {
        "type": "bool",
        "description": "Flag indicating if auto targeting is enabled"
      },
      "targeting_expansion": {
        "type": "object",
        "description": "Targeting expansion settings"
      },
      "device_price_ranges": {
        "type": "array",
        "description": "Target device price ranges"
      },
      "device_model_ids": {
        "type": "array",
        "description": "Target device model IDs"
      },
      "operating_systems": {
        "type": "array",
        "description": "Target operating systems"
      },
      "network_types": {
        "type": "array",
        "description": "Target network types"
      },
      "carrier_ids": {
        "type": "array",
        "description": "Target carrier IDs"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      }
    }
  },

  
  "ads": {
    "title": "Ads",
    "description": "TikTok Ads",
    "uniqueKeys": ["ad_id"],
    "fields": {
      "ad_id": {
        "type": "string",
        "description": "Ad ID",
        'GoogleSheetsFormat': '@'
      },
      "ad_name": {
        "type": "string",
        "description": "Ad Name"
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID"
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID",
        'GoogleSheetsFormat': '@'
      },
      "campaign_name": {
        "type": "string",
        "description": "Campaign Name"
      },
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID",
        'GoogleSheetsFormat': '@'
      },
      "adgroup_name": {
        "type": "string",
        "description": "Ad Group Name"
      },
      "operation_status": {
        "type": "string",
        "description": "Operation Status"
      },
      "secondary_status": {
        "type": "string",
        "description": "Secondary Status"
      },
      "create_time": {
        "type": "datetime",
        "description": "Creation Time"
      },
      "modify_time": {
        "type": "datetime",
        "description": "Last Modified Time"
      },
      "ad_text": {
        "type": "string",
        "description": "Ad Text/Caption"
      },
      "ad_texts": {
        "type": "array",
        "description": "Multiple Ad Text Variations"
      },
      "call_to_action": {
        "type": "string",
        "description": "Call To Action Text"
      },
      "call_to_action_id": {
        "type": "string",
        "description": "Call To Action ID"
      },
      "image_ids": {
        "type": "array",
        "description": "Image IDs Used in the Ad"
      },
      "video_id": {
        "type": "string",
        "description": "Video ID Used in the Ad"
      },
      "image_mode": {
        "type": "string",
        "description": "Image Display Mode"
      },
      "creative_type": {
        "type": "string",
        "description": "Type of Creative (video, image, carousel, etc.)"
      },
      "ad_format": {
        "type": "string",
        "description": "Format of the Ad"
      },
      "landing_page_url": {
        "type": "string",
        "description": "Landing Page URL"
      },
      "landing_page_urls": {
        "type": "array",
        "description": "Multiple Landing Page URLs"
      },
      "deeplink": {
        "type": "string",
        "description": "Deep Link URL"
      },
      "deeplink_type": {
        "type": "string",
        "description": "Type of Deep Link"
      },
      "tracking_pixel_id": {
        "type": "string",
        "GoogleSheetsFormat": "@",
        "description": "Pixel ID for Tracking"
      },
      "impression_tracking_url": {
        "type": "string",
        "description": "URL for Impression Tracking"
      },
      "click_tracking_url": {
        "type": "string",
        "description": "URL for Click Tracking"
      },
      "video_view_tracking_url": {
        "type": "string",
        "description": "URL for Video View Tracking"
      },
      "is_new_structure": {
        "type": "bool",
        "description": "Flag indicating if the ad utilizes a new structure"
      },
      "is_aco": {
        "type": "bool",
        "description": "Flag indicating if Automated Creative Optimization is enabled"
      },
      "optimization_event": {
        "type": "string",
        "description": "Event being optimized for"
      },
      "catalog_id": {
        "type": "string",
        "description": "Product Catalog ID"
      },
      "product_set_id": {
        "type": "string",
        "description": "Product Set ID"
      },
      "sku_ids": {
        "type": "array",
        "description": "SKU IDs for Products"
      },
      "domain": {
        "type": "string",
        "description": "Domain for the Ad"
      },
      "display_name": {
        "type": "string",
        "description": "Display Name shown in the Ad"
      },
      "profile_image_url": {
        "type": "string",
        "description": "URL for Profile Image"
      },
      "app_name": {
        "type": "string",
        "description": "Name of the App being promoted"
      },
      "tracking_app_id": {
        "type": "string",
        "description": "App ID for Tracking"
      },
      "identity_id": {
        "type": "string",
        "description": "Identity ID"
      },
      "identity_type": {
        "type": "string",
        "description": "Type of Identity"
      },
      "page_id": {
        "type": "string",
        "description": "TikTok Page ID"
      },
      "tiktok_item_id": {
        "type": "string",
        "description": "TikTok Item ID"
      },
      "disclaimer_type": {
        "type": "string",
        "description": "Type of Disclaimer"
      },
      "disclaimer_text": {
        "type": "string",
        "description": "Disclaimer Text"
      },
      "utm_params": {
        "type": "object",
        "description": "UTM Parameters"
      }
    }
  },

  "ad_insights": {
    "title": "Ad Insights",
    "description": "TikTok Ad Insights Metrics",
    "uniqueKeys": ["ad_id", "stat_time_day"],
    "fields": {
      "ad_id": {
        "type": "string",
        "description": "Ad ID",
        'GoogleSheetsFormat': '@'
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID",
        'GoogleSheetsFormat': '@'
      },
      "campaign_id": {
        "type": "string",
        "description": "Campaign ID",
        'GoogleSheetsFormat': '@'
      },
      "adgroup_id": {
        "type": "string",
        "description": "Ad Group ID",
        'GoogleSheetsFormat': '@'
      },
      "stat_time_day": {
        "type": "datetime",
        "description": "Statistics Date"
      },
      "date_start": {
        "type": "datetime",
        "description": "Start Date"
      },
      "date_end": {
        "type": "datetime",
        "description": "End Date"
      },
      "impressions": {
        "type": "int32",
        "description": "Impressions"
      },
      "clicks": {
        "type": "int32",
        "description": "Clicks"
      },
      "cost": {
        "type": "float",
        "description": "Cost"
      },
      "ctr": {
        "type": "float",
        "description": "Click-Through Rate"
      },
      "conversion": {
        "type": "int32",
        "description": "Conversions"
      },
      "cost_per_conversion": {
        "type": "float",
        "description": "Cost Per Conversion"
      },
      "conversion_rate": {
        "type": "float",
        "description": "Conversion Rate"
      },
      "reach": {
        "type": "int32",
        "description": "Reach"
      },
      "engagement": {
        "type": "int32",
        "description": "Engagement"
      },
      "video_views": {
        "type": "int32",
        "description": "Video Views"
      },
      "video_watched_2s": {
        "type": "int32",
        "description": "2s Video Views"
      },
      "video_watched_6s": {
        "type": "int32",
        "description": "6s Video Views"
      },
      "video_completion": {
        "type": "int32",
        "description": "Video Completion"
      },
      "spend": {
        "type": "float",
        "description": "Spend"
      },
      "cpc": {
        "type": "float",
        "description": "Cost per click"
      },
      "cpm": {
        "type": "float",
        "description": "Cost per thousand impressions"
      },
      "frequency": {
        "type": "float",
        "description": "Frequency of occurrence"
      },
      "video_play_actions": {
        "type": "int32",
        "description": "Number of video plays"
      },
      "video_views_p25": {
        "type": "int32",
        "description": "Video views at 25% completion"
      },
      "video_views_p50": {
        "type": "int32",
        "description": "Video views at 50% completion"
      },
      "video_views_p75": {
        "type": "int32",
        "description": "Video views at 75% completion"
      },
      "video_views_p100": {
        "type": "int32",
        "description": "Video views at 100% completion"
      },
      "profile_visits": {
        "type": "int32",
        "description": "Profile visits"
      },
      "likes": {
        "type": "int32",
        "description": "Likes count"
      },
      "comments": {
        "type": "int32",
        "description": "Comments count"
      },
      "shares": {
        "type": "int32",
        "description": "Shares count"
      },
      "follows": {
        "type": "int32",
        "description": "Follows count"
      },
      "real_time_conversion": {
        "type": "int32",
        "description": "Real-time conversions"
      },
      "real_time_cost_per_conversion": {
        "type": "float",
        "description": "Cost per conversion in real-time"
      },
      "real_time_conversion_rate": {
        "type": "float",
        "description": "Real-time conversion rate"
      },
      "result": {
        "type": "int32",
        "description": "Number of results"
      },
      "cost_per_result": {
        "type": "float",
        "description": "Cost per result"
      }
    }
  },

  "audiences": {
    "title": "Audiences",
    "description": "TikTok Custom Audiences",
    "uniqueKeys": ["audience_id"],
    "fields": {
      "audience_id": {
        "type": "string",
        "description": "Unique identifier for the audience",
        'GoogleSheetsFormat': '@'
      },
      "advertiser_id": {
        "type": "string",
        "description": "Advertiser ID",
        'GoogleSheetsFormat': '@'
      },
      "name": {
        "type": "string",
        "description": "Name of the audience"
      },
      "audience_type": {
        "type": "string",
        "description": "Type of audience (e.g., demographic, interest-based)"
      },
      "cover_num": {
        "type": "int32",
        "description": "Number of audience members covered"
      },
      "create_time": {
        "type": "datetime",
        "description": "Timestamp indicating when the audience was created"
      },
      "is_valid": {
        "type": "bool",
        "description": "Flag indicating if the audience data is valid"
      },
      "is_expiring": {
        "type": "bool",
        "description": "Flag indicating if the audience data is expiring soon"
      },
      "expired_time": {
        "type": "datetime",
        "description": "Timestamp indicating when the audience data expires"
      }
    }
  }
}; 