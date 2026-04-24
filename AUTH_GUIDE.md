# 🔐 Authentication System Guide

## Overview

This finance dashboard uses **NextAuth.js with JWT-based authentication** featuring:

- ✅ **30-day persistent login** - Users stay logged in for 30 days
- ✅ **Auto-refreshing tokens** - Token expiry resets on each visit
- ✅ **No Prisma session storage** - Pure JWT strategy for performance
- ✅ **Client & Server auth** - `useSession()` for client, `auth()` for server

---

## 🔑 Key Features

### 1. 30-Day Token Expiry

- Tokens are issued with a 30-day expiration
- On each request, the token is automatically refreshed
- Token expiry extends to 30 days from the current time

### 2. Session Strategy

- **Strategy**: JWT (not database sessions)
- **Max Age**: 30 days (2,592,000 seconds)
- **Auto Refresh**: Triggered on middleware and every auth check

### 3. Token Content

The JWT token contains:

```json
{
  "id": "user_uuid",
  "email": "user@example.com",
  "name": "User Name",
  "username": "username",
  "is_admin": false,
  "iat": 1234567890,
  "exp": 1234567890 + 30 days
}
```

---

## 📱 Client-Side Authentication

### Using `useSession` Hook (Client Components)

Import directly from `next-auth/react`:

```typescript
// Example: Client Component
'use client';
import { useSession } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Not authenticated</div>;

  return <h1>Welcome, {session.user.email}</h1>;
}
```

### Session Status Values

- `"loading"` - Session is being checked
- `"authenticated"` - User is logged in
- `"unauthenticated"` - User is not logged in

### Access Session Data

```typescript
'use client';
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();

  // Get user info directly from session
  const userId = session?.user?.id;
  const email = session?.user?.email;
  const isAdmin = session?.user?.is_admin;
  const username = session?.user?.username;

  return <div>User ID: {userId}</div>;
}
```

### Example: Protected Component with Auth Check

```typescript
'use client';
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedFeature() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  if (status === "loading") return <div>Authenticating...</div>;
  if (!session) return null;

  return <div>User: {session.user.email}</div>;
}
```

---

## 🖥️ Server-Side Authentication

### Using `auth()` Function (Server Components & API Routes)

Import directly from `@/lib/auth`:

```typescript
// In a Server Component (default behavior)
import { auth } from "@/lib/auth";

export default async function ServerComponent() {
  const session = await auth();

  if (!session?.user?.id) {
    return <div>Please log in</div>;
  }

  return <h1>Hello {session.user.name}</h1>;
}
```

### API Route Pattern

```typescript
// app/api/transactions/route.ts
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();

  // Check authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use session.user.id to fetch user-specific data
  const data = await db.transaction.findMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json(data);
}
```

### Admin-Only Routes

```typescript
export async function GET() {
  const session = await auth();

  // Check admin status
  if (!session?.user?.is_admin) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 },
    );
  }

  // Admin-only logic
}
```

### Redirect Non-Authenticated Users (Server Component)

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  // Page content
  return <div>Protected dashboard</div>;
}
```

---

## 🔄 Token Refresh Flow

### How Auto-Refresh Works

1. **Initial Login**
   - User enters credentials
   - JWT token created with `exp = now + 30 days`
   - Token stored in NextAuth session

2. **Middleware Check** (Every Request)
   - Middleware runs on all requests
   - Calls `auth()` in JWT callback
   - Token refresh logic checks if `exp < now + 15 days`

3. **Auto-Refresh Trigger**
   - If token nearing expiry, extend to `now + 30 days`
   - User doesn't need to re-login
   - 30-day timer restarts

4. **Client-Side Check**
   - `useSession()` automatically refreshes on route changes
   - Component re-renders with updated session

### Refresh Timings

- **Full expiry**: 30 days from issue
- **Refresh triggered**: After 15 days (configurable via `updateAge`)
- **Behavior**: Transparent to user - no logout

---

## 🔐 Sign-In Flow

```typescript
import { signIn } from "@/lib/auth";

// In your sign-in page
const result = await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  redirect: false,
});

if (result.ok) {
  // Token created, 30-day session started
  redirect("/dashboard");
}
```

---

## 🚪 Sign-Out Flow

```typescript
import { signOut } from "@/lib/auth";

// Clear token and session
await signOut({ redirect: false });

// Or redirect after sign-out
await signOut({ redirect: true, redirectUrl: "/sign-in" });
```

---

## 📋 Session Data Structure

### In Client Components (useSession)

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    image?: string;
    is_admin: boolean;
    username: string;
  };
}
```

### In Server (auth())

Same structure as client.

---

## ✅ Best Practices

### 1. Always Check Auth Status

**Client:**

```typescript
if (status === "loading") return <Skeleton />;
if (!session) return <div>Not logged in</div>;
```

**Server:**

```typescript
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 2. Use User ID from Session

```typescript
const userId = session.user.id;
const transactions = await db.transaction.findMany({
  where: { userId }, // Filter by authenticated user
});
```

### 3. Protect Sensitive Operations

```typescript
// Admin-only endpoint
if (!session?.user?.is_admin) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

### 4. Handle Session Changes

```typescript
useEffect(() => {
  if (session?.user?.id) {
    // User logged in, initialize data
  }
}, [session?.user?.id]);
```

---

## 🔧 Configuration Files

### `src/lib/auth.ts`

- NextAuth configuration
- JWT strategy with 30-day expiry
- Token refresh callbacks
- Credentials provider

### `middleware.ts`

- Runs on every request
- Auto-refreshes tokens
- Protects routes

---

## 🚀 Usage Summary

### Quick Start: Protected API Route

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Your logic here using session.user.id

  return NextResponse.json({ success: true });
}
```

### Quick Start: Protected Page

```typescript
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in");
  }

  return <div>Welcome {session.user.email}</div>;
}
```

### Quick Start: Client Component with Auth

```typescript
'use client';
import { useSession } from "next-auth/react";

export default function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;
  if (!session) return <div>Please sign in</div>;

  return <div>Hello {session.user.email}</div>;
}
```

---

## 📚 Files Modified

- ✅ `src/lib/auth.ts` - 30-day JWT config with auto-refresh
- ✅ `middleware.ts` - Token refresh on every request

---

## 🎯 Token Expiry Timeline

```
Day 0: User logs in
└─ Token expires: Day 30
└─ Refresh triggered: Day 15

Day 5: User visits app
└─ Token refreshed
└─ New expiry: Day 35
└─ Refresh triggered: Day 20

Day 20: User visits app again
└─ Token refreshed
└─ New expiry: Day 50
└─ Refresh triggered: Day 35

...continues as long as user visits within 30 days...
```

**Result**: Users who visit daily never need to re-login!

---

## ❓ FAQ

**Q: How often does the token refresh?**
A: On every middleware request. Automatically triggered if nearing expiry.

**Q: What if user doesn't visit for 30 days?**
A: Token expires, user redirected to login page.

**Q: Is the session stored in a database?**
A: No, only JWT tokens. All auth info is in the token.

**Q: Can admins have different session duration?**
A: Yes, modify `THIRTY_DAYS_IN_SECONDS` constant in `src/lib/auth.ts` per role.

**Q: Does this work across multiple tabs?**
A: Yes, NextAuth syncs across browser tabs automatically.

---

## 🔗 Related Files

- NextAuth Docs: https://next-auth.js.org/
- JWT Strategy: https://next-auth.js.org/configuration/options#jwt
- Middleware: https://next-auth.js.org/configuration/nextjs#middleware
