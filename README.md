TODO :
- email me route (use same service a personal app), when auth is implemented email to the currently logged in user
- Styles
- Error toasts to communicate the particular errors
- download as pdf route
- Some sort of cache to hold latest transcript/summary for each videoId? Try redis service?
- Host


Challenges Faced :
I wanted to use the offical google apis but I would need extra permissions to download captions despite them being publically available.
I resorted to using a 3rd party scraping library instead.