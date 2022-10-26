import dotenv from 'dotenv'
import { setTiers, getPatronIdsByTier, getPatronEmail, getCampaignId } from './patreon_drive_api_runner.js'
import { checkPatreonVsDriveAccounts, getChildIdsArray, getDirIdArrayByName, getFileNameArray } from './google_drive_api_wrapper.js'
import { rewardAccessCoordination, setRewardDirectoryAccess, tierAccessCoordination } from './tier_based_access.js'

dotenv.config()

/*
* sets google drive permissions for a particular user at a particular tier
*/
async function coordinateDrivePermissions(TIER_NUM, emails, TIER_DIRS_LIST, REWARD_DIR_IDS) {
    try {
        // set reward directories for this tier
        const ACCESSIBLE_DIRS = await setRewardDirectoryAccess(TIER_NUM, TIER_DIRS_LIST, REWARD_DIR_IDS)

        // set drive permissions for each patron belonging to this tier
        for (let i = 0; i < emails.length; i++) {
            tierAccessCoordination(TIER_NUM, emails[i], TIER_DIRS_LIST, true)
            rewardAccessCoordination(emails[i], ACCESSIBLE_DIRS, REWARD_DIR_IDS, false)
        }

        // remove access for former Patrons
        if (emails.length > 0) {
            await checkPatreonVsDriveAccounts(emails, TIER_DIRS_LIST)
            await checkPatreonVsDriveAccounts(emails, REWARD_DIR_IDS)
        }
    } catch (error) {
        console.error(error.message);
    }
}

async function patreonToGoogleDrive() {
    try {
        // get tier info
        const TIER_PARENT_DIR_ID = await getDirIdArrayByName(process.env.DRIVE_TIERS_DIR_NAME)
        const TIER_DIR_IDS = await getChildIdsArray(TIER_PARENT_DIR_ID)
        const TIER_DIR_NAMES = await getFileNameArray(TIER_DIR_IDS)
        const PATREON_TIER_MAP = await setTiers(TIER_DIR_NAMES)
        const PATREON_CAMPAIGN_ID = await getCampaignId()
        
        // get reward directories info
        const REWARD_PARENT_DIR_ID = await getDirIdArrayByName(process.env.DRIVE_REWARDS_DIR_NAME)
        const REWARD_DIR_IDS = await getChildIdsArray(REWARD_PARENT_DIR_ID)

        // set drive permissions for each tier
        for (let i = 0; i < PATREON_TIER_MAP.size; i++) {
            const TIER_MEMBER_IDS = await getPatronIdsByTier(PATREON_TIER_MAP.get(i).id, PATREON_CAMPAIGN_ID)
            const EMAIL_ADDRESSES = await getPatronEmail(TIER_MEMBER_IDS, PATREON_CAMPAIGN_ID)
            await coordinateDrivePermissions(PATREON_TIER_MAP.get(i).title, EMAIL_ADDRESSES, TIER_DIR_IDS, REWARD_DIR_IDS)
        }
    } catch (error) {
        console.error(error.message);
    }
}

await patreonToGoogleDrive()