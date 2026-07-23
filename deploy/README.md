# คู่มือ Deploy GRANT ONLINE

Runbook หลักสำหรับ production ปัจจุบัน: Next.js รันบน Linux host ที่ `127.0.0.1:3000`, MySQL/Redis รันด้วย `docker-compose.prod.yml` และ Nginx รับ traffic จาก Cloudflare

## สถาปัตยกรรม

```text
ผู้ใช้ → Cloudflare → Nginx :443 → Next.js :3000
                                      ├─ MySQL :3307 (loopback)
                                      ├─ Redis :6379 (loopback)
                                      └─ storage/ (persistent disk)
```

ไฟล์ compose ไม่มี service ของ Next.js จึงต้องใช้ systemd หรือ process manager อื่นดูแล `npm start` แยกต่างหาก

## สิ่งที่ต้องเตรียม

- Linux server, DNS domain และสิทธิ์ sudo
- Node.js 22 LTS, npm, Docker Engine, Docker Compose plugin และ Nginx
- Cloudflare DNS proxy กับ Origin Certificate โดยใช้ SSL mode `Full (strict)`
- RAM อย่างน้อยประมาณ 5 GB ตาม limit MySQL 3.5 GB รวมแอปและ service อื่น
- พื้นที่ถาวรสำหรับ Docker volumes และ `storage/`

## Environment variables

คัดลอก `.env.example` เป็น `.env`, เปลี่ยนทุก placeholder และห้าม commit secret

```bash
cp .env.example .env
chmod 600 .env
```

| ตัวแปร | Production | หน้าที่ |
| --- | --- | --- |
| `NODE_ENV` | บังคับ | ต้องเป็น `production` |
| `PORT` | แนะนำ | port แอป ค่าใช้งานปัจจุบัน `3000` |
| `AUTH_URL` | บังคับ | HTTPS origin จริง; ใช้สร้างลิงก์รีเซ็ตรหัสผ่าน |
| `AUTH_SECRET` | บังคับ | secret สำรองสำหรับ token |
| `AUTH_ACCESS_TOKEN_SECRET` | แนะนำอย่างยิ่ง | ลงนาม access token; fallback ไป `AUTH_SECRET` |
| `PASSRESET_TOKEN_SECRET` | บังคับ | ลงนาม token รีเซ็ตรหัสผ่าน |
| `FILE_TOKEN_SECRET` | แนะนำอย่างยิ่ง | ลงนาม URL ไฟล์; fallback ไป `AUTH_SECRET` |
| `DATABASE_URL` | บังคับ | connection string ของ Prisma/MySQL |
| `REDIS_URL` | แนะนำอย่างยิ่ง | cache, session cache และ distributed rate limit; ถ้าไม่ตั้ง health จะรายงาน `disabled` |
| `SMTP_HOST/PORT/SECURE/USER/PASS` | บังคับเมื่อใช้ reset password | SMTP transport |
| `FILE_DELETION_RECONCILIATION_ENABLED` | ไม่บังคับ | ค่าอื่นนอกจาก `false` เปิด worker ทุก 60 วินาทีใน production |
| `FILE_DELETION_RECONCILIATION_SECRET` | บังคับเมื่อเรียก job ผ่าน API | Bearer token สำหรับ `POST /api/internal/file-deletions` |
| `MYSQL_*` | บังคับกับ compose | สร้าง database/user ครั้งแรก ต้องตรงกับ `DATABASE_URL` |

สร้าง secret แต่ละตัวแยกกันด้วย `openssl rand -base64 48` ห้ามใส่ secret ใน `NEXT_PUBLIC_*` และอย่าเปลี่ยน signing secret โดยไม่มีแผน invalidate session/link เดิม

> ค่า `MYSQL_*` มีผลตอนสร้าง data volume ครั้งแรก การแก้ env ภายหลังไม่เปลี่ยน credential ในฐานข้อมูลเดิม

## ติดตั้งครั้งแรก

ตัวอย่างสมมติ source อยู่ที่ `/opt/grant_online` และ service รันด้วย user `grant-online`

```bash
cd /opt/grant_online
npm ci
docker compose -f docker-compose.prod.yml up -d mysql redis
docker compose -f docker-compose.prod.yml ps
npx prisma generate
npx prisma migrate deploy
npm run build
```

ฐานข้อมูลใหม่สามารถเพิ่มรายการโครงการตั้งต้นแบบ idempotent ได้ด้วย:

```bash
npx --yes tsx prisma/seed-programs.ts
```

อย่าใช้ `prisma db push` กับ production; repository นี้มี migration history และต้องใช้ `prisma migrate deploy`

## Persistent storage

แอปเก็บไฟล์ใต้ `storage/attachments`, `storage/documents`, `storage/reports` และ `storage/tmp` โดยอิง current working directory

```bash
sudo mkdir -p /opt/grant_online/storage/{attachments,documents,reports,tmp}
sudo chown -R grant-online:grant-online /opt/grant_online/storage
sudo chmod -R u=rwX,g=rX,o= /opt/grant_online/storage
```

หากสลับ release directory ต้องใช้ shared persistent path แล้ว symlink `storage/` เข้ามา ห้ามสร้าง storage ใหม่ทุก release

## รันด้วย systemd

สร้าง `/etc/systemd/system/grant-online.service`:

```ini
[Unit]
Description=GRANT ONLINE Next.js
After=network-online.target docker.service
Wants=network-online.target
Requires=docker.service

[Service]
Type=simple
User=grant-online
Group=grant-online
WorkingDirectory=/opt/grant_online
Environment=NODE_ENV=production
EnvironmentFile=/opt/grant_online/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=5
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
```

ตรวจ path ของ npm ด้วย `command -v npm` แล้วแก้ `ExecStart` ให้ตรง ก่อนสั่ง:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now grant-online
sudo systemctl status grant-online
journalctl -u grant-online -n 100 --no-pager
```

Worker ลบไฟล์เริ่มใน production process โดยอัตโนมัติ หากมีหลาย app instances ให้ปิด worker ที่ web instances แล้วเรียก internal endpoint จาก scheduler เพียงชุดเดียว

## Nginx และ Cloudflare

ทำตาม [nginx/README.md](nginx/README.md) และใช้ [nginx/grant_online.conf](nginx/grant_online.conf) โดยแก้ `server_name`, certificate paths, upstream และตรวจ Cloudflare IP ranges ล่าสุด

แอปรับไฟล์สูงสุด 15 MB แต่ Nginx ตั้ง `client_max_body_size 20m` เพื่อเผื่อ multipart overhead

## ตรวจสอบหลัง deploy

```bash
curl -I http://127.0.0.1:3000
curl -fsS http://127.0.0.1:3000/api/health/redis
curl -I https://your-domain.example
sudo nginx -t
docker compose -f docker-compose.prod.yml ps
```

ทดสอบสมัคร/เข้าสู่ระบบ, refresh/logout, forgot password, สร้างเอกสาร, upload/preview/download/delete และ restart service แล้วเปิดไฟล์เดิมได้

## อัปเดต release

สำรองฐานข้อมูลและ `storage/` ก่อน แล้วจึง:

```bash
cd /opt/grant_online
git pull --ff-only
npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
sudo systemctl restart grant-online
```

ตรวจ health และ critical flow ซ้ำทุกครั้ง Migration ต้องรองรับช่วงที่โค้ดเก่า/ใหม่อาจทำงานคาบเกี่ยวกันตามแผน release

## Backup

สำรอง MySQL และ `storage/` เป็นชุดที่สัมพันธ์กัน รวมทั้งเก็บ `.env` และ Origin Certificate ใน secret backup ที่เข้ารหัส ต้องทดสอบ restore จนเปิดเอกสารจากระบบได้จริงเป็นระยะ

## Troubleshooting

| อาการ | จุดตรวจ |
| --- | --- |
| `502 Bad Gateway` | systemd status, port 3000 และ Nginx upstream |
| Redis health เป็น 503 | `REDIS_URL`, container health และ app log |
| Prisma ต่อไม่ได้ | `DATABASE_URL`, port 3307, credential และ container health |
| เปิดไฟล์ไม่ได้ | `WorkingDirectory`, permission และ persistent `storage/` |
| reset password ผิด | SMTP variables และ `AUTH_URL` |
| `413 Request Entity Too Large` | Nginx body limit; app limit คือ 15 MB |
| login production ไม่ได้ | HTTPS, proxy headers, secrets และเวลาเครื่อง |

## เอกสารที่เกี่ยวข้อง

- [Nginx setup](nginx/README.md)
- [Cloudflare Origin SSL](nginx-cloudflare-origin-ssl.md)
- [Cloudflare Free Plan Security](cloudflare-free-plan-security.md)
- [Client IP trust boundary ADR](../docs/adr/0001-client-ip-trust-boundary-for-rate-limits.md)
