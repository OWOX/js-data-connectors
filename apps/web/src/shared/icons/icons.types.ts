import { type AwsAthenaIcon } from './aws-athena-icon';
import { type GoogleBigQueryIcon } from './google-bigquery-icon';
import { type GitHubIcon } from './github-icon';
import { type GoogleSheetsIcon } from './google-sheets-icon';
import { type ODataIcon } from './odata-icon';
import { type LookerStudioIcon } from './looker-studio-icon';
import { type SnowflakeIcon } from './snowflake-icon';
import { type DatabricksIcon } from './databricks-icon';
import { type AwsRedshiftIcon } from './aws-redshift-icon';
import { type AzureSynapseIcon } from './azure-synapse-icon';
import { type RawBase64Icon } from './raw-base64-icon';
import { type LucideIcon } from 'lucide-react';

export type LocalIcon =
  | typeof AwsAthenaIcon
  | typeof GoogleBigQueryIcon
  | typeof GitHubIcon
  | typeof GoogleSheetsIcon
  | typeof ODataIcon
  | typeof LookerStudioIcon
  | typeof SnowflakeIcon
  | typeof DatabricksIcon
  | typeof AwsRedshiftIcon
  | typeof AzureSynapseIcon
  | typeof RawBase64Icon;
export type AppIcon = LucideIcon | LocalIcon;
