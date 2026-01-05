# Prisma + Supabase Setup Guide

## Environment Variables

Add the following to your `.env.local` file:

```env
# Supabase Configuration (Optional - if using Supabase client directly)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Prisma Database Connection (Required)
# Get this from Supabase Dashboard -> Settings -> Database -> Connection string
# Use the "Transaction" connection string with pgbouncer for serverless
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Direct connection URL (for migrations)
# Use the "Session" connection string  
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

## Setup Steps

### 1. Configure Database URL

1. Go to your Supabase Dashboard
2. Navigate to **Settings → Database**
3. Copy the **Connection string** (URI format)
4. Paste it as `DATABASE_URL` in your `.env.local`

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Push Schema to Database

```bash
npx prisma db push
```

### 4. (Optional) Seed Initial Data

```bash
npx prisma db seed
```

### 5. View Database with Prisma Studio

```bash
npx prisma studio
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users` | GET, POST | List/Create users |
| `/api/users/[id]` | GET, PUT, DELETE | User operations |
| `/api/letters` | GET, POST | List/Create letters |
| `/api/letters/[id]` | GET, PUT, DELETE | Letter operations |
| `/api/letters/[id]/sign` | POST | Sign a letter |
| `/api/events` | GET, POST | List/Create events |
| `/api/events/[id]` | GET, PUT, DELETE | Event operations |
| `/api/events/[id]/claims` | GET, POST | Certificate claims |
| `/api/logs` | GET, POST | Activity logs |
| `/api/signatures` | GET | List signatures |
| `/api/verify/[id]` | GET | Verify document |
| `/api/stats` | GET | Dashboard statistics |
| `/api/auth/login` | POST | User login |

## File Structure

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   └── login/route.ts
│       ├── events/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── claims/route.ts
│       ├── letters/
│       │   ├── route.ts
│       │   └── [id]/
│       │       ├── route.ts
│       │       └── sign/route.ts
│       ├── logs/route.ts
│       ├── signatures/route.ts
│       ├── stats/route.ts
│       ├── users/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── verify/
│           └── [letterId]/route.ts
└── lib/
    ├── prisma.ts      # Prisma client singleton
    └── supabase.ts    # Supabase client (optional)

prisma/
└── schema.prisma      # Database schema
```
