## TODO :
- Error toasts to communicate the particular errors
- Styles
- Host

## Challenges Faced / Decisions Made:
I wanted to use the offical google apis but I would need extra permissions to download captions despite them being publically available. I resorted to using a 3rd party scraping library instead.

The multitude of valid Youtube url formats called for some testing to nail down a function. ChatGPT helped with the regex.

Was having issues with puppeteer hanging so chose to use an older 3rd library instead.