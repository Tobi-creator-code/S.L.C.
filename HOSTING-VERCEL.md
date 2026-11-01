# Putting SLC live on Vercel

This site needs PHP and PostgreSQL, so it runs on Vercel's **Container runtime** (Beta): Vercel builds `Dockerfile.vercel`, which holds nginx and PHP, and serves it. The database and logins live outside Vercel, on Neon and Upstash.

Important: Vercel's free **Hobby** plan is meant for personal, non-commercial projects. This site sells ads, so check Vercel's terms; a business site may need the Pro plan.

## Steps

1. **GitHub.** Make a **private** repository and upload everything in this folder (about 63 files, under the 100-file limit). Check that `.gitignore` and `.dockerignore` arrived; if not, create them with *Add file > Create new file*.
2. **Neon.** Create a project (Europe, Frankfurt). Click Connect, turn Connection pooling off, copy the `postgresql://...` string. In the SQL Editor run all of `database/schema.sql`, then all of `database/live_seed.sql`.
3. **Upstash.** Create a Redis database (Frankfurt). Copy the address that starts with `rediss://`. Logins are stored here, because Vercel containers are replaced whenever they go idle.
4. **Paystack.** Copy the test secret key (`sk_test_...`).
5. **Secret key.** In Windows PowerShell:
   `$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)`
   Save the result somewhere safe.
6. **Vercel.** Sign up with GitHub. **Add New > Project**, import your repository. Framework Preset should say **Container**; if it shows something else, change it to Container. Open **Environment Variables** and add:
   - `SLC_DATABASE_URL` = the Neon string
   - `SLC_REDIS_URL` = the Upstash address
   - `PAYSTACK_SECRET_KEY` = your Paystack key
   - `SLC_APP_KEY` = the key from step 5
   - `SLC_APP_SALT` = any long random text
   - `SLC_PAY_EXPIRY_MINUTES` = `15`
   - `SLC_AUTO_APPROVE` = `0`
   Do not set `PORT` (the container already listens on port 80, which Vercel expects). Click **Deploy**.
7. **Paystack webhook.** Set it to `https://YOUR-PROJECT.vercel.app/api/pay_webhook.php`.
8. **Admin accounts.** In Vercel > Settings > Environment Variables add `SLC_ADMIN_CODE` with a long secret code of your own (at least 12 characters, for example three random words and some numbers), and redeploy. Then open `https://YOUR-PROJECT.vercel.app/admin.html`, click **Create admin account**, and enter your email, a password of at least 12 characters, and that code. You are signed in straight away. Admins sign in later with just email and password.
   - Anyone who knows the code and finds the page can create an admin account, so keep the code private. When your admins are created, **delete `SLC_ADMIN_CODE` in Vercel and redeploy**; that switches admin sign-up off. Add it back only when you need another admin.
9. **Test** before telling students: sign up, log out, log in, post an ad, pay with the test key, approve it in `/admin.html`. Then swap in the live `sk_live_...` key and redeploy.

## Notes

- Vercel scales the container down after about 5 minutes without visitors. The next visit has to start it again, so it can be slow.
- Not live yet: posts, chats, friends and notifications still show example people; real-time and ID scanning are off (IDs go to manual review).
- Vercel Beta features can change. If the Container preset gives trouble, the same project also runs on Render (ask for the Render version).

## Turning on the ID scanner (separate free service on Render)

The scanner (`ocr/` folder) reads the student's ID picture, checks the typed name and school appear on it, and forgets the picture. It cannot run on Vercel's free setup, so it runs as its own small service.

1. Upload the updated project to GitHub again (same repository; the `ocr` folder is new).
2. On render.com sign up with GitHub, then **New > Web Service**, pick your repository.
3. Set **Root Directory** to `ocr`, **Language/Runtime** to **Docker**, **Region** to Frankfurt, **Instance Type** to **Free**.
4. Under Environment Variables add `SLC_INTERNAL_SECRET` with a long random value (the PowerShell command from step 5 works; at least 24 characters). Set **Health Check Path** to `/health`. Click **Create Web Service**.
5. When it is Live, open `https://YOUR-OCR-NAME.onrender.com/health`. You should see `{"ok":true}`.
6. In Vercel > Settings > Environment Variables add `SLC_OCR_URL` = that address (no slash at the end) and `SLC_INTERNAL_SECRET` = the same secret. Redeploy.
7. Sign up with a test account and a picture of an ID.

The free scanner sleeps after 15 minutes without use. The sign-up page wakes it as soon as the student reaches the ID step, but the first scan can still take up to a minute.

What the scanner can and cannot do: it says "match" when the typed name and the school (or an admission number) are found on the picture, and "review" otherwise. It cannot tell a real ID from a fake or from someone else's.

## Verifying students (admin page)

Open `/admin.html`, sign in, and click the **Students** tab.
- **Waiting** lists every student who is not verified yet, oldest first, with their school, department, admission year, email and what the ID check said.
- **Verify** marks the student as verified.
- **Decline and delete** signs the student out and deletes their account. An open page notices within about a minute (or as soon as they come back to the tab), and their next action fails at once. Their ads are switched off and their contact details removed. Payment records are kept for your accounts. They can sign up again with the same email, and will appear in Waiting again.
- **Verified** lists students you have verified.

Verification is a label for you; the site does not yet limit what unverified students can do.

## Uploading a new version to your existing Vercel project

1. Unzip `slc-vercel-upload.zip` into a new folder.
2. Open your repository on GitHub. Click **Add file > Upload files**.
3. Open the unzipped folder and select everything inside it (the files and the folders, not the folder itself). Drag them onto the GitHub page. Files with the same name are replaced, and new ones are added.
4. Wait until every file shows as uploaded, then click **Commit changes** (leave "Commit directly to the main branch" ticked).
5. Vercel notices the change and builds by itself. Open your project in Vercel and wait for **Deployments** to show **Ready** (a few minutes).
6. No database change is needed for this version.
7. Test: sign up a test student, open `/admin.html`, go to Students, and try Verify and Decline.

If Vercel does not start a build, open **Deployments**, find the latest one, and use **Redeploy**. If the upload fails, check that you did not select more than 100 files at once; upload the folders one at a time.
