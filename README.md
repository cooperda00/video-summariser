# Video Summariser

Take any Youtube URL and generate a text summary of it, providing it has English captions.  

Contact me if you would like to use the app.

[Video Demo](https://www.loom.com/share/4c708599f1eb45e29edb2433fc9e0eec)

## Features
- Robust Youtube URL validation
- Returns transcript + summary
- Summaries and transcripts cached with redis
- Auth with Clerk
- Option to send email with summary
- Option to download as PDF
- PWA for saving to homescreen

## Challenges Faced / Decisions Made:
- I wanted to use the offical google apis but I would need extra permissions to download captions despite them being publically available. I resorted to using a 3rd party scraping library instead.
- The multitude of valid Youtube url formats called for some testing to nail down a function. ChatGPT helped with the regex.
- Was having issues with puppeteer hanging so chose to use an older 3rd library instead for generating pdfs.
- Netlify functions have a max 10s run time on free plan so I chose to use Vercel to host (60s free)
- Vercel has some issues with the pdf gen lib so choosing to use an api instead with free tier