import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { Readable } from 'stream'
import multer from 'multer'

type MulterFile = Express.Multer.File

export const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.AWS_BUCKET_NAME!

export async function uploadToS3(
  file: MulterFile,
  folder: string,
  userId: string
): Promise<string> {
  const extension = file.originalname.split('.').pop()
  const key = `${folder}/${userId}.${extension}`

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: BUCKET,
      Key: key,
      Body: Readable.from(file.buffer),
      ContentType: file.mimetype,
    },
  })

  await upload.done()

  return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

export async function deleteFromS3(url: string): Promise<void> {
  const key = url.split('.amazonaws.com/')[1]
  if (!key) return

  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}