To receive data from the FacebookMarketing source, please make a copy of the file ["Facebook Marketing. Template"](https://docs.google.com/spreadsheets/d/1OgpGMnQqUpS23rmOyA2gTVO2FK48oPS7tJGBp9NYJy4/copy). 

Fill in the required information:
- Start date
- Account IDs
- Fields

Data import begins on the selected **start date**. Note that selecting a long date range may prevent data from downloading due to large data volume.

![Facebook Start Date](/src/Integrations/FacebookMarketing/res/fb_startdate.png)

**Account ID** can be found on the Account Overview page in Meta AdsManager. 

![Facebook Account ID](/src/Integrations/FacebookMarketing/res/fb_accountid.png)

Copy and paste the ID: 

![Account ID](/src/Integrations/FacebookMarketing/res/fb_pasteid.png)

Some fields are already pre-filled. The **Fields** tab allows you to select additional fields to include by checking the corresponding checkboxes. 

![Facebook Fileds](/src/Integrations/FacebookMarketing/res/fb_fields.png)

Then, press *OWOX -> Manage credentials*. 

![Facebook Credentials](/src/Integrations/FacebookMarketing/res/fb_credentials.png)

Add your Access Token received by this tutorial: [**How to obtain the access token for the Facebook connector**](https://github.com/OWOX/js-data-connectors/blob/main/src/Integrations/FacebookMarketing/CREDENTIALS.md)

![Facebook Token](/src/Integrations/FacebookMarketing/res/fb_token.png)

Press OK and then, press *OWOX -> Import New Data*.

![Facebook Import Data](/src/Integrations/FacebookMarketing/res/fb_import.png)

The import process is complete when the Log data displays **"Import is finished"**. Your data will be available in new tabs labeled with the corresponding data point names (e.g., *ad-account*, *ad-campaign*).

![Facebook Finished](/src/Integrations/FacebookMarketing/res/fb_success.png)

To include more data, select the relevant checkboxes on the Fields tab, then click OWOX > Import New Data.