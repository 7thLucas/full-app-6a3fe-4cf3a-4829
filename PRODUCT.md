# PostPilot — Product Overview

## What It Is
PostPilot is an automated social media scheduling and product-promotion app built for store owners. Store owners upload their product catalog, connect their social media accounts, set a daily posting time, and the app automatically rotates through products — publishing one post per day to every connected platform at the scheduled time. Zero daily effort required after setup.

## Target Users
- E-commerce and retail store owners
- Small business owners who sell products online
- Non-technical users who want hands-off social media promotion

## Brand & Tone
- Name: PostPilot
- Tone: Calm, clean, approachable, professional
- Anti-references: Nothing cluttered, nothing developer-facing, nothing that feels like a dashboard for engineers
- Strategic principle: Make automation feel effortless and trustworthy

## Core MVP Features

### 1. Product Catalog
CRUD UI to add, edit, and delete products. Each product has:
- Name
- Image (upload)
- Description
- Price
- Purchase link

### 2. Platform Connections
OAuth connect/disconnect for:
- Instagram
- Facebook
- Twitter/X
- TikTok
- Pinterest
- LinkedIn

Show connected/disconnected status per platform. Mock OAuth flow is acceptable for MVP.

### 3. Rotation Scheduler
- Time picker UI to set the daily posting time
- Products are queued in rotation order
- App auto-selects the next product in the queue each day

### 4. Automated Publishing Engine
- Background job / cron-style scheduler
- Fires at the set time, picks the next product in rotation, posts to all connected platforms
- Handles success/failure per platform

### 5. Post Preview
- Preview card showing how the next scheduled post will look
- Displays: product image, auto-generated caption (product name + description snippet + price + purchase link)

### 6. Posting History & Logs
- Table/list of all posts sent
- Columns: product name, platforms posted to, timestamp, success/fail status

## User Flow

### Onboarding
1. Connect at least one social platform
2. Add at least one product
3. Set a daily posting time
4. Done — app runs automatically from here

### Daily Usage
- App fires automatically at scheduled time
- User can check posting history anytime
- User can add/edit products or adjust schedule as needed
