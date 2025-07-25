import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@owox/ui/components/accordion';
import { Separator } from '@owox/ui/components/separator';
import { ExternalAnchor } from '@owox/ui/components/common/external-anchor';

/**
 * Accordion with step-by-step instructions for AccessKeyId.
 */
export default function AthenaAccessKeyIdDescription() {
  return (
    <Accordion variant='common' type='single' collapsible>
      <AccordionItem value='athena-access-key-id-details'>
        <AccordionTrigger>How do I get my AWS Access Key ID?</AccordionTrigger>
        <AccordionContent>
          <p className='mb-2'>
            Before accessing your AWS Access Key ID, make sure you have a user or role with the
            necessary permissions to use Athena and Glue in your AWS account.
          </p>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>
              Go to{' '}
              <ExternalAnchor
                className='underline'
                href='https://console.aws.amazon.com/iam/home#/users'
              >
                IAM Users
              </ExternalAnchor>{' '}
              or{' '}
              <ExternalAnchor
                className='underline'
                href='https://console.aws.amazon.com/iam/home#/roles'
              >
                IAM Roles
              </ExternalAnchor>{' '}
              in the AWS Console.
            </li>
            <li>Either choose an existing user/role or create a new one.</li>
            <li>
              In the <strong>Permissions</strong> tab, attach the following policies:
              <ul className='mt-2 ml-4 list-inside list-disc space-y-1'>
                <li>
                  <code className='text-sm font-semibold'>AmazonAthenaFullAccess</code>
                </li>
                <li>
                  <code className='text-sm font-semibold'>AWSGlueFullAccess</code>
                </li>
                <li>
                  <code className='text-sm font-semibold'>AmazonS3FullAccess</code>
                </li>
              </ul>
            </li>
            <li>
              After setting up permissions, continue with the steps below to create or find the
              access keys.
            </li>
          </ol>
          <Separator className='my-4' />
          <p className='mb-2'>
            The Access Key ID is part of your AWS credentials needed to connect and authenticate.
          </p>
          <p className='mb-2'>Here's how to find or create an Access Key ID:</p>
          <ol className='list-inside list-decimal space-y-2 text-sm'>
            <li>
              Open{' '}
              <ExternalAnchor
                className='underline'
                href='https://console.aws.amazon.com/iam/home#/security_credentials'
              >
                the AWS IAM Security Credentials page
              </ExternalAnchor>
              .
            </li>
            <li>
              Under <strong>Access keys</strong>, find your existing keys or create a new access
              key.
            </li>
            <li>
              When you create a new key, download and securely store the Access Key ID and Secret
              Access Key.
            </li>
          </ol>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
