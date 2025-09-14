// AWS Configuration
// Replace these with your actual AWS credentials and settings

export const AWS_CONFIG = {
  region: 'us-east-1', // Change to your preferred region
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_ACCESS_KEY_ID',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_SECRET_ACCESS_KEY',
};

export const S3_CONFIG = {
  bucketName: process.env.S3_BUCKET_NAME || 'crypto-wallet-uploads',
  folder: 'deposit-proofs/',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
};

// Instructions for setting up AWS S3:
/*
1. Create an AWS account at https://aws.amazon.com/
2. Go to IAM (Identity and Access Management)
3. Create a new user with programmatic access
4. Attach the AmazonS3FullAccess policy (or create a custom policy with limited permissions)
5. Save the Access Key ID and Secret Access Key
6. Create an S3 bucket with a unique name
7. Update the configuration above with your credentials and bucket name
8. For production, use environment variables instead of hardcoding credentials

Example IAM Policy for S3 access:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
*/
