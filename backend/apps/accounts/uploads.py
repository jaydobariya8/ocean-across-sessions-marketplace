import boto3
import uuid
from botocore.exceptions import ClientError
from django.conf import settings


def get_s3_client():
    return boto3.client(
        's3',
        endpoint_url=settings.AWS_S3_ENDPOINT_URL,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    )


def ensure_bucket():
    client = get_s3_client()
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    try:
        client.head_bucket(Bucket=bucket)
    except ClientError:
        client.create_bucket(Bucket=bucket)
        client.put_bucket_policy(
            Bucket=bucket,
            Policy=f'{{"Version":"2012-10-17","Statement":[{{"Effect":"Allow","Principal":"*","Action":"s3:GetObject","Resource":"arn:aws:s3:::{bucket}/*"}}]}}'
        )


def upload_file(file_obj, prefix: str, content_type: str) -> str:
    """Upload file to MinIO, return public URL."""
    client = get_s3_client()
    bucket = settings.AWS_STORAGE_BUCKET_NAME
    ext = content_type.split('/')[-1] if '/' in content_type else 'bin'
    key = f"{prefix}/{uuid.uuid4().hex}.{ext}"

    client.upload_fileobj(
        file_obj,
        bucket,
        key,
        ExtraArgs={'ContentType': content_type},
    )

    endpoint = settings.AWS_S3_ENDPOINT_URL.replace('minio:9000', 'localhost:9000')
    return f"{endpoint}/{bucket}/{key}"
