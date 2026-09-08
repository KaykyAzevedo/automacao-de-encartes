# Ativar o storage em S3

O upload funciona sem isso: com `STORAGE_MODE=local` (padrão), os
arquivos são salvos em `backend/uploads/` e servidos pelo próprio
backend. Siga este guia só quando quiser as fotos na nuvem.

## 1. Criar o bucket

No [console S3](https://s3.console.aws.amazon.com/s3/home), **Create
bucket**. Nome único globalmente (ex.: `encarte-gerador-fotos`), região
mais próxima (`sa-east-1` = São Paulo).

Em **Block Public Access**, desmarque **Block all public access** —
sem isso a bucket policy abaixo não tem efeito e as fotos não abrem.

## 2. Aplicar a política de leitura pública

Aba **Permissions** → **Bucket policy** → cole o conteúdo de
[`s3-bucket-policy.json`](./s3-bucket-policy.json), trocando
`SEU_BUCKET_AQUI` pelo nome do bucket.

Isso libera **apenas leitura** (`GetObject`) para qualquer um — é o
que faz a URL da foto abrir num `<img>`. Escrever no bucket continua
exigindo a credencial IAM do passo 4.

## 3. Aplicar o CORS

Mesma aba, **Cross-origin resource sharing (CORS)** → cole
[`s3-cors.json`](./s3-cors.json).

Troca `http://localhost:3000` pelo domínio real quando o app for
publicado — sem isso o navegador bloqueia o upload direto do frontend
para o S3 (upload via presigned URL, não implementado nesta etapa;
hoje o upload passa pelo backend, que não sofre CORS).

## 4. Criar a credencial de acesso

**IAM** → **Users** → **Create user**, sem console access. Em
**Permissions**, anexe uma política inline restrita ao bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::SEU_BUCKET_AQUI/*"
    }
  ]
}
```

Evite usar uma chave de administrador aqui — essa política já é
suficiente para o `uploadToS3`.

Em **Security credentials** do usuário criado, **Create access key**
→ tipo *Application running outside AWS*. Copie o **Access key ID** e
o **Secret access key** na hora; o secret não aparece de novo depois.

## 5. Configurar o backend

Em `backend/.env`:

```
STORAGE_MODE=s3
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=<access key id>
AWS_SECRET_ACCESS_KEY=<secret access key>
AWS_S3_BUCKET=<nome do bucket>
```

Reinicie o backend. O mesmo endpoint `POST /api/upload` passa a salvar
no bucket em vez do disco local — nada muda no frontend.

**Nunca cole a secret access key no chat com o assistente.** Ela dá
permissão de escrita no bucket; se vazar, alguém pode subir arquivo
arbitrário lá. Cole direto no `.env`, que já está no `.gitignore`.
