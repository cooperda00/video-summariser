TODO :
- Styles
- Auth : allow login with email/password but not signup
- Validate link on fe / be (share logic), ensure that it follows a youtube regex and has a video id
- email me route (use same service a personal app), when auth is implemented email to the currently logged in user
- download as pdf route
- Some sort of cache to hold latest transcript/summary for each videoId? Try redis service?
- Stream the result instead of pure request / response
- Host
- Error toasts to communicate the particular errors

Challenges Faced :
I wanted to use the offical google apis but I would need extra permissions to download captions despite them being publically available.
I resorted to using a 3rd party scraping library instead.