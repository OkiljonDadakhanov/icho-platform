# IChO 2026 Platform Setup Guide

## Environment Configuration

### 1. Create `.env.local` file

Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

**For production**, update it to your production API URL:
```env
NEXT_PUBLIC_API_URL=https://api.icho2026.org/api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

## Common Issues and Solutions

### CORS Error on Login Page

**Problem**: "Failed to load countries" error with CORS error in console.

**Solutions**:

1. **Ensure API server is running**: Make sure your backend API server is running on the configured port (default: 8000).

2. **Check API URL**: Verify that `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend API URL.

3. **Backend CORS Configuration**: Ensure your backend API has CORS configured to allow requests from `http://localhost:3000` (or your frontend URL).

   Example Django CORS settings:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "http://localhost:3000",
   ]
   ```

4. **Restart Dev Server**: After creating/updating `.env.local`, restart your Next.js dev server:
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

### TypeScript Errors

If you see TypeScript errors about missing modules:

1. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```

2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### API Connection Issues

- Verify the API server is accessible at the configured URL
- Check network connectivity
- Verify firewall settings
- Check API server logs for errors

## Project Structure

- `app/` - Next.js app router pages
- `components/` - Reusable UI components
- `lib/` - Utilities, API client, and services
- `public/` - Static assets
- `.env.local` - Environment variables (create this file)

## Development

The platform uses:
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** components

## Support

For issues or questions, contact the development team.

