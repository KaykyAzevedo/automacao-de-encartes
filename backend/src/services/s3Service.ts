import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { env } from "../config/env";
import { AppError } from "../lib/errors";
import { nomeArquivoSeguro } from "../lib/arquivo";

// So instanciado quando STORAGE_MODE=s3 de fato usa a funcao abaixo;
// sem isso, importar este arquivo falharia mesmo em modo local.
let cliente: S3Client | null = null;

function clienteS3(): S3Client {
  if (!env.aws.region || !env.aws.accessKeyId || !env.aws.secretAccessKey) {
    throw new AppError(
      500,
      "STORAGE_MODE=s3 mas as credenciais AWS não estão configuradas"
    );
  }
  cliente ??= new S3Client({
    region: env.aws.region,
    credentials: {
      accessKeyId: env.aws.accessKeyId,
      secretAccessKey: env.aws.secretAccessKey,
    },
  });
  return cliente;
}

// Recebe o arquivo em memoria (buffer) e o caminho dentro do bucket
// onde ele deve ser salvo (ex.: "produtos", "logos"). Retorna a URL
// publica do objeto.
export async function uploadToS3(
  buffer: Buffer,
  mimetype: string,
  pasta: string
): Promise<string> {
  if (!env.aws.bucket) {
    throw new AppError(500, "AWS_S3_BUCKET não configurado");
  }

  const key = `${pasta}/${nomeArquivoSeguro(mimetype)}`;

  await clienteS3().send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
      // o bucket precisa de uma bucket policy liberando s3:GetObject
      // publico; ACL de objeto sozinha nao basta em buckets criados
      // depois de 2023, que vem com Block Public Access ligado
    })
  );

  return `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}`;
}
