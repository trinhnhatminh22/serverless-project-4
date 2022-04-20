import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import { createLogger } from '../utils/logger'

const logger = createLogger('auth')

// TODO: Implement the fileStogare logic
export class AttachmentUtils {
    
    constructor(
        private readonly s3: S3 = createS3Client(),
        private readonly s3BucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
    }

    async getUploadUrl(todoId: string): Promise<string> {
        logger.info(`Get presigned URL for TODO ${todoId} with bucket ${this.s3BucketName}`)
        const url =this.s3.getSignedUrl('putObject', {
            Bucket: this.s3BucketName,
            Key: todoId,
            Expires: parseInt(this.urlExpiration)
        })
        return url;
    }

    getAttachmentUrl(todoId: string): string {
        logger.info(`Get attachment URL for TODO ${todoId} on bucket ${this.s3BucketName}`)
        return `https://${this.s3BucketName}.s3.amazonaws.com/${todoId}`;
    }
}

function createS3Client() : S3 {
    
    const s3 = new AWS.S3({
        signatureVersion: 'v4'
    });
    return s3;
}