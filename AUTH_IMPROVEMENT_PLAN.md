# Authentication & Session Management Improvement Plan

## Overview
This plan outlines improvements to authentication flow, session management, and UX for BlitzPhoto.

## Current State Analysis

### Backend
- ✅ Access token: 15 minutes expiration
- ✅ Refresh token: 7 days expiration (meets 2+ days requirement)
- ✅ Token refresh endpoint exists
- ✅ JWT validation working

### Frontend Issues
- ❌ No route protection - anyone can access any page
- ❌ No automatic token refresh before expiration
- ❌ Basic login/register UI (gray theme)
- ❌ Header shows on login/register pages
- ❌ No redirect if already authenticated
- ❌ Token expiration only handled on API errors
- ❌ No proactive token refresh

## Proposed Improvements

### 1. Backend Changes

#### Token Expiration Adjustments
- **Access Token**: Increase from 15 minutes to **1 hour** (better UX, still secure)
- **Refresh Token**: Keep at **7 days** (already meets requirement)
- **Location**: `backend/src/main/resources/application.yml`

```yaml
blitzphoto:
  security:
    jwt:
      expiration-ms: 3600000  # 1 hour (was 15 minutes)
      refresh-expiration-ms: 604800000  # 7 days (unchanged)
```

### 2. Frontend Architecture Changes

#### A. Route Protection System
Create a `ProtectedRoute` component that:
- Checks authentication status
- Redirects to `/login` if not authenticated
- Preserves intended destination for post-login redirect
- Shows loading state during auth check

#### B. Layout Separation
- **AuthLayout**: Clean layout for login/register (no header, full-screen)
- **MainLayout**: Layout with header for authenticated pages
- **PublicRoute**: For login/register - redirects to `/` if already authenticated

#### C. Token Management Improvements
- **Proactive Refresh**: Refresh token 5 minutes before expiration
- **Token Expiration Check**: Check on app load and route changes
- **Automatic Redirect**: Redirect to login when refresh token expires
- **Better Error Handling**: Clear error messages for expired sessions

### 3. UI/UX Improvements

#### A. Modern Login/Signup Pages
**Design Theme:**
- **Gradient Background**: Purple to blue gradient (matching brand colors)
- **Glassmorphism Cards**: Frosted glass effect for forms
- **Smooth Animations**: Framer Motion transitions
- **Color Scheme**: 
  - Primary: Indigo (#4f46e5)
  - Secondary: Purple (#9333ea)
  - Accent: Sky Blue (#0ea5e9)

**Features:**
- Toggle between Login/Signup on same page (optional)
- Password strength indicator
- Show/hide password toggle
- Real-time form validation
- Loading states with spinners
- Success animations
- Error messages with icons
- "Remember me" checkbox (optional)

#### B. User Experience Enhancements
- **Auto-redirect**: If logged in, redirect from `/login` to `/`
- **Preserve Intent**: Remember where user wanted to go before login
- **Session Indicator**: Show "Session expires in X hours" (optional)
- **Smooth Transitions**: Page transitions when auth state changes
- **Toast Notifications**: For login/logout success

### 4. Implementation Details

#### File Structure
```
web/src/
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx      # Route guard
│   │   ├── PublicRoute.tsx         # Redirect if authenticated
│   │   ├── LoginForm.tsx           # Login form component
│   │   ├── SignupForm.tsx          # Signup form component
│   │   └── AuthLayout.tsx          # Layout for auth pages
│   └── layout/
│       ├── MainLayout.tsx          # Layout for authenticated pages
│       └── Header.tsx              # (existing, update)
├── hooks/
│   ├── useAuth.tsx                 # (existing, enhance)
│   ├── useTokenRefresh.tsx         # NEW: Proactive token refresh
│   └── useSessionCheck.tsx         # NEW: Session validation
├── pages/
│   ├── LoginPage.tsx               # Redesign
│   ├── RegisterPage.tsx            # Redesign
│   └── AuthPage.tsx                # NEW: Combined auth page (optional)
└── lib/
    └── axios.ts                    # (existing, enhance)
```

#### Key Components

**1. ProtectedRoute Component**
```typescript
// Checks auth, redirects if needed, preserves destination
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>
```

**2. Token Refresh Hook**
```typescript
// Automatically refreshes token 5 min before expiration
useTokenRefresh();
```

**3. Session Check Hook**
```typescript
// Validates session on mount and route changes
useSessionCheck();
```

### 5. Flow Diagrams

#### Login Flow
```
User visits /login
  ↓
Check if already authenticated
  ↓ (Yes) → Redirect to /
  ↓ (No)
Show login form
  ↓
User submits credentials
  ↓
API call → Success
  ↓
Store tokens (localStorage + Zustand)
  ↓
Redirect to intended destination or /
```

#### Protected Route Flow
```
User visits protected route
  ↓
Check authentication status
  ↓ (Not authenticated)
  → Store intended destination
  → Redirect to /login
  ↓ (Authenticated)
Check token expiration
  ↓ (Expired/Expiring soon)
  → Attempt refresh
  ↓ (Refresh fails)
  → Clear auth → Redirect to /login
  ↓ (Valid)
Render protected content
```

#### Token Refresh Flow
```
App loads / Route changes
  ↓
Check access token expiration
  ↓ (Expires in < 5 minutes)
  → Call refresh endpoint
  ↓ (Success)
  → Update tokens
  ↓ (Failure)
  → Clear auth → Redirect to /login
```

### 6. UX Improvements Checklist

#### Login/Signup Pages
- [ ] Modern gradient background
- [ ] Glassmorphism card design
- [ ] Smooth animations
- [ ] Password strength indicator
- [ ] Show/hide password toggle
- [ ] Real-time validation
- [ ] Loading states
- [ ] Error messages with icons
- [ ] Success animations
- [ ] Responsive design
- [ ] Dark mode support (optional)

#### Session Management
- [ ] Proactive token refresh
- [ ] Session expiration warnings (optional)
- [ ] Smooth redirects
- [ ] Preserve navigation intent
- [ ] Clear error messages
- [ ] Loading states during auth checks

#### General UX
- [ ] Toast notifications
- [ ] Smooth page transitions
- [ ] Auto-redirect if already logged in
- [ ] Remember me functionality (optional)
- [ ] Better error handling
- [ ] Accessibility improvements

### 7. Color Scheme

**Primary Colors:**
- Indigo: `#4f46e5` (Primary)
- Purple: `#9333ea` (Secondary)
- Sky Blue: `#0ea5e9` (Accent)

**Gradient Background:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Or */
background: linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #0ea5e9 100%);
```

**Glassmorphism:**
```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
```

### 8. Implementation Priority

#### Phase 1: Core Functionality (High Priority)
1. ✅ ProtectedRoute component
2. ✅ PublicRoute component
3. ✅ Layout separation (AuthLayout vs MainLayout)
4. ✅ Token refresh hook
5. ✅ Session check hook
6. ✅ Update routing

#### Phase 2: UI Redesign (High Priority)
1. ✅ Redesign LoginPage
2. ✅ Redesign RegisterPage
3. ✅ Add animations
4. ✅ Improve form validation
5. ✅ Add password toggle

#### Phase 3: UX Enhancements (Medium Priority)
1. ✅ Proactive token refresh
2. ✅ Better error handling
3. ✅ Toast notifications
4. ✅ Preserve navigation intent
5. ✅ Auto-redirect improvements

#### Phase 4: Polish (Low Priority)
1. ⏳ Password strength indicator
2. ⏳ Remember me checkbox
3. ⏳ Session expiration warnings
4. ⏳ Dark mode support

### 9. Testing Checklist

- [ ] Protected routes redirect when not authenticated
- [ ] Login redirects to intended destination
- [ ] Token refresh works automatically
- [ ] Expired tokens redirect to login
- [ ] Already authenticated users can't access login/register
- [ ] Logout clears session properly
- [ ] Session persists across page refreshes
- [ ] Multiple tabs stay in sync (optional)

### 10. Backend Configuration

**Update `application.yml`:**
```yaml
blitzphoto:
  security:
    jwt:
      expiration-ms: 3600000  # 1 hour (improved from 15 min)
      refresh-expiration-ms: 604800000  # 7 days (unchanged)
```

## Summary

This plan provides:
1. ✅ **Secure session management** (2+ days via refresh token)
2. ✅ **Better UX** (proactive refresh, smooth redirects)
3. ✅ **Modern UI** (gradient theme, glassmorphism)
4. ✅ **Route protection** (proper auth guards)
5. ✅ **Improved error handling** (clear messages, proper redirects)

The implementation will create a polished, secure, and user-friendly authentication experience.

