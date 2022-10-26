import { coordinatePermissions, coordinateRestrictions, checkPatreonVsDriveAccounts, getFileNameArray, getChildIdsArray, checkRewardDirAccessibility, getDirIdArrayByName } from './google_drive_api_wrapper.js'

/*
* Gives either permission or restriction to tiers based on list of directories
*/
export async function tierAccessCoordination(tier_num, email, DIR_LIST, notify) {
    try {
        await coordinatePermissions(email, DIR_LIST[tier_num - 1], notify)
        var grantedDirs = DIR_LIST[tier_num - 1]

        for (let i = 0; i < DIR_LIST.length; i++) {
            if (!grantedDirs.includes(DIR_LIST[i])) {
                await coordinateRestrictions(email, DIR_LIST[i])
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* gives permission to list of reward directories
*/
export async function rewardAccessCoordination(email, ACCESSIBLE_DIRS, REWARD_DIRS, notify) {
    try {
        var grantedDirs = []
        for (let i = 0; i < ACCESSIBLE_DIRS.length; i++) {
            await coordinatePermissions(email, ACCESSIBLE_DIRS[i], notify)
            grantedDirs = ACCESSIBLE_DIRS[i]
        }

        for (let i = 0; i < REWARD_DIRS.length; i++) {
            if (!grantedDirs.includes(REWARD_DIRS[i])) {
                await coordinateRestrictions(email, REWARD_DIRS[i])
            }
        }
    } catch (error) {
        console.error(error.message);
    }
}

/*
* sets google drive permissions for a particular user at a particular tier
*/
export async function setRewardDirectoryAccess(TIER_NUM, TIER_DIRS_LIST, REWARD_DIR_IDS) {
    try {
        const CHILD_IDS = await getChildIdsArray(TIER_DIRS_LIST[TIER_NUM - 1])
        const REWARD_DIR_NAMES = await getFileNameArray(CHILD_IDS)

        var accessibleDirs = []
        var count = 0
        for (let i = 0; i < REWARD_DIR_IDS.length; i++) {
            if (await checkRewardDirAccessibility(REWARD_DIR_IDS[i], REWARD_DIR_NAMES)) {
                accessibleDirs[count] = REWARD_DIR_IDS[i]
                count++
            }
        }
        return accessibleDirs
    } catch (error) {
        console.error(error.message);
    }
}
