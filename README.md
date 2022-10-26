# Patreon to Google Drive
PATREON_TO_DRIVE is a multi-API wrapper that provides a simple way to automate managing Patron access to Google Drive directories and files.

[Patreon API docs](https://docs.patreon.com/#introduction)

[Google Drive API docs](https://developers.google.com/drive/api/v3/reference)

# Quick Start
(use `.env_temp` to add environment variables using the parameters you gather below. Change filename to `.env` to use the environment variables)
## Patreon API Setup
[Create/Get Patreon API Variable](https://www.patreon.com/portal/registration/register-clients)
Filling out the fields in "Create Client" will result in creating; 
- `PATREON_ACCESS_TOKEN`

## Google Drive API Setup
[Create/Get Google Drive API Variables](https://developers.google.com/workspace/guides/get-started)
Following all steps provided in the link will result in creating; 
- `DRIVE_CLIENT_ID`
- `DRIVE_CLIENT_SECRET`
- `DRIVE_REFRESH_TOKEN`
- 
[This is an excellent video guide](https://www.youtube.com/watch?v=1y0-IfRW114)

## Google Drive Patreon Directory Setup
Create two folders and assign their names to the following environment variables;
- `DRIVE_REWARDS_DIR_NAME`
- `DRIVE_TIERS_DIR_NAME`

Add various reward directories to the `DRIVE_REWARDS_DIR_NAME` directory. Add tier directories to `DRIVE_TIERS_DIR_NAME` matching the tier names defined in your Patreon page. Finally, create shorcuts of your reward directories and place them in the tiers they belong to (the same shortcut in multiple tiers is expected).

```
ex.

DRIVE_REWARDS_DIR_NAME=Rewards | ex. path -> GoogleDrive/Rewards/reward[n]_name/{files}

DRIVE_TIERS_DIR_NAME=Tiers | ex. path -> GoogleDrive/Tiers/tier[n]_name/{reward[n]_name_shorcut(s)}
``` 
##### note: these directories don't have to be placed in your Drive's root directory
#
## Usage
```
node ./main.js
```
# FAQ
- What happens if a patron doesn't have a drive associated email account?
  
  In cases where a patron doesn't have their email account attached to Google Drive, they will receive an email notifying them that a directory has been shared with them, but upon attempting to access the directory they will be notified they need a Google account to view the contents. This is the main reason I developed the Patreon-to-Dropbox program as it doesn't have this limitation. If you're set on utilizing Google Drive, I recommend you notify potential patrons upfront, and recommend that if an already subscribed patron doesn't have a Google account that they get one and change their Patreon account email to use their new Google account.
# Troubleshooting
- Verify the Tier names you're referencing match EXACTLY between Patreon and Google Drive
```
ex. (Good) 
Patreon Tier 1 = My First Tier
Google Drive Tier 1 = My First Tier

ex. (Bad) 
Patreon Tier 1 = My First Tier
Google Drive Tier 1 = my first tier
```

- Google Drive doesn't completely delete files/directories upon being called to `remove`. Emptying the trash is necessary to completely remove files/directories.

- If you see an `invalid_grant` error, that could be related to a bad refresh token, could need to regenerate the token in [Oauth 2.0 Playground](https://developers.google.com/oauthplayground)

#
## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
